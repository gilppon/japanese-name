/**
 * hankoCanvasProcessor.ts
 * 
 * 서버의 sharp 라이브러리가 하던 버밀리언(#D50500) 인장 합성을
 * 브라우저의 HTML5 Canvas API로 100% 동일하게 처리합니다.
 * 
 * 파이프라인:
 *   1. Base64 이미지 → Canvas에 로드
 *   2. 픽셀 단위로 Red 채널 마스킹
 *   3. 밝은 부분(배경) → 투명(Alpha=0)
 *   4. 어두운 부분(인주) → 정확한 버밀리언(#D50500) 색상으로 대체
 *   5. 최종 결과를 PNG data:URL로 반환
 */

// Official Traditional Vermilion - 서버의 sharp 설정과 동일
const VERMILION = { r: 213, g: 5, b: 0 }; // #D50500

/**
 * raw base64 이미지를 받아 투명 배경의 버밀리언 도장 PNG로 변환합니다.
 * 서버의 sharp 파이프라인과 100% 동일한 결과를 생성합니다.
 * 
 * @param rawBase64 - Gemini API에서 반환한 원본 base64 이미지 (data:URL 접두사 없이)
 * @returns data:image/png;base64,... 형식의 최종 도장 이미지
 */
export async function processHankoImage(rawBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // 1. 원본 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0);

        // 2. 모든 픽셀 데이터 추출
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data; // [R, G, B, A, R, G, B, A, ...]

        // 3. 픽셀 단위 변환 (sharp의 extractChannel('red') → negate → linear(1.5, -50) 과 동일)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          // const g = data[i + 1];
          // const b = data[i + 2];

          // sharp 파이프라인 재현:
          //   Step 1: extractChannel('red') → Red 채널 값만 추출
          //   Step 2: negate() → 255 - r
          //   Step 3: linear(1.5, -50) → (255 - r) * 1.5 - 50
          const negated = 255 - r;
          const alpha = Math.round(Math.max(0, Math.min(255, negated * 1.5 - 50)));

          // 최종: 모든 픽셀을 버밀리언 색상으로, 알파만 마스크 적용
          data[i]     = VERMILION.r;  // R
          data[i + 1] = VERMILION.g;  // G
          data[i + 2] = VERMILION.b;  // B
          data[i + 3] = alpha;        // A (투명도)
        }

        // 4. 변환된 데이터를 캔버스에 다시 쓰기
        ctx.putImageData(imageData, 0, 0);

        // 5. PNG data:URL로 반환
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for Canvas processing'));

    // base64 문자열에 접두사가 없으면 추가
    if (rawBase64.startsWith('data:')) {
      img.src = rawBase64;
    } else {
      img.src = `data:image/png;base64,${rawBase64}`;
    }
  });
}
