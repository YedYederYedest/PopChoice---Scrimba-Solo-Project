import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("frontend")); // Serve your frontend static files

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Search Movies by Title using TMDB API
async function searchMovies(title) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error searching movies on TMDB:", error);
    return [];
  }
}

// Generate AI Movie Recommendation using Gemini AI
async function generateRecommendation(favoriteMovie, storyline, tone, releaseType) {
  try {
    const prompt = `
      The user has provided the following movie preferences:
      - Favorite Movie: "${favoriteMovie}"
      - Preferred Storyline: "${storyline}"
      - Desired Tone: "${tone}"
      - Release Type: "${releaseType}"

      Recommend EXACTLY ONE movie title that matches these criteria best.
      Format your response strictly as:
      Title: <movie title>
      Reason: <1-2 sentences explaining why this matches>
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const lines = text.split("\n");

    const suggestedTitle = lines.find((l) => l.startsWith("Title:"))?.replace("Title:", "").trim() || "";
    const reason = lines.find((l) => l.startsWith("Reason:"))?.replace("Reason:", "").trim() || "";

    return { suggestedTitle, reason };
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return { suggestedTitle: "", reason: "Could not generate recommendation." };
  }
}

// Endpoint to handle movie recommendation requests
app.post("/search-movies", async (req, res) => {
  const { favoriteMovie, storyline, tone, releaseType } = req.body;

  if (!favoriteMovie || !storyline || !tone || !releaseType) {
    return res.status(400).json({ error: "Missing required fields in request body." });
  }

  try {
    // 1. Get AI Title + Explanation
    const { suggestedTitle, reason } = await generateRecommendation(
      favoriteMovie,
      storyline,
      tone,
      releaseType
    );

    if (!suggestedTitle) {
      return res.status(404).json({ error: "CURRENTLY NOT CONNECTED TO THE KEYS OR SOMETHING." });
    }

    // 2. Fetch TMDB details for that suggested title
    const tmdbResults = await searchMovies(suggestedTitle);
    const movie = tmdbResults && tmdbResults.length > 0 ? tmdbResults[0] : null;

    if (!movie) {
      return res.json({
        title: suggestedTitle,
        posterPath: null,
        releaseDate: "Unknown",
        overview: "No further details found on TMDB.",
        explanation: reason,
      });
    }

    // 3. Return full response
    res.json({
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      explanation: reason,
    });
  } catch (error) {
    console.error("Error in /search-movies endpoint:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});