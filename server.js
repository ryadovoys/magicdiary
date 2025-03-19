import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini
const genAI = new GoogleGenerativeAI('AIzaSyArUd4ohZyNHfkjKVICB3Lw3Zp88OrzUdk');

app.post('/api/analyze-drawing', async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ 
        error: 'No image data provided',
        message: "Your magical drawing speaks volumes. What other secrets will you share?" 
      });
    }

    // Remove data URL prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

    // Get the model - using gemini-1.5-pro for better vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Create prompt
    const prompt = "What do you see in this drawing? Respond with a short, magical message as if you're a mystical notebook. Keep it under 30 words and make it whimsical and enchanting.";

    // Format the request according to the latest documentation
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("Successful response:", text);
    res.json({ message: text });
  } catch (error) {
    console.error('Error analyzing drawing:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: `Failed to analyze drawing: ${error.message}`,
      message: "Your magical drawing speaks volumes. What other secrets will you share?" 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});