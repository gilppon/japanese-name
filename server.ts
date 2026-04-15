import sharp from "sharp";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { generateHanko, generateLore, generateKamon, generateKamonExplanation } from "./services/geminiService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Hanko Generation (Server Side)
  app.post("/api/generate-hanko", async (req, res) => {
    try {
      const { kanji, font, meaning } = req.body;
      const base64Data = await generateHanko(kanji, font, meaning);
      
      const inputBuffer = Buffer.from(base64Data, "base64");
        
      const metadata = await sharp(inputBuffer).metadata();
      const width = metadata.width || 1024;
      const height = metadata.height || 1024;

      // AUTHENTIC HANKO PIPELINE:
      // 1. Create a high-contrast alpha mask from the red channel (best for vermilion ink)
      // 2. Negate so white background becomes transparent and ink becomes opaque
      // 3. Apply the mask to a solid traditional Vermilion (#D50500)
      const alphaBuffer = await sharp(inputBuffer)
        .extractChannel('red') // Red channel is brightest in vermilion, best for mask contrast
        .negate()              // Ink becomes light (opaque), Background becomes dark (transparent)
        .linear(1.5, -50)      // Boost contrast to ensure white paper is 100% removed
        .toBuffer();

      const finalBuffer = await sharp({
        create: {
          width: width,
          height: height,
          channels: 3,
          background: "#D50500" // Official Traditional Vermilion
        }
      })
      .joinChannel(alphaBuffer)
      .png()
      .toBuffer();

      res.json({ hankoData: `data:image/png;base64,${finalBuffer.toString("base64")}` });
    } catch (error: any) {
      console.error("Hanko error:", error);
      res.status(500).json({ error: "Failed to generate hanko" });
    }
  });

  // Lore Generation (Server Side)
  app.post("/api/generate-lore", async (req, res) => {
    try {
      const { kanji, meaning, birthday, personality, gender, locale } = req.body;
      const loreText = await generateLore(kanji, meaning, birthday, personality, gender, locale);
      res.json({ loreText });
    } catch (error: any) {
      console.error("Lore error:", error);
      res.status(500).json({ error: "Failed to generate lore" });
    }
  });

  // Kamon Generation (Server Side)
  app.post("/api/generate-kamon", async (req, res) => {
    try {
      const { meaning } = req.body;
      const kamonData = await generateKamon(meaning);
      res.json({ kamonData });
    } catch (error: any) {
      console.error("Kamon error:", error);
      res.status(500).json({ error: "Failed to generate kamon" });
    }
  });

  // Kamon Explanation Generation (Server Side)
  app.post("/api/generate-kamon-explanation", async (req, res) => {
    try {
      const { kamonBase64, meaning, locale } = req.body;
      const explanation = await generateKamonExplanation(kamonBase64, meaning, locale);
      res.json({ explanation });
    } catch (error: any) {
      console.error("Kamon explanation error:", error);
      res.status(500).json({ error: "Failed to generate kamon explanation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
