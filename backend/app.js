import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("frontend"));

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Search Movies by Title using TMDB
async function searchMovies(title) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        title
      )}`
    );

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB Error:", error);
    return [];
  }
}

// Generate AI Recommendation using OpenAI
async function generateRecommendation(
  favoriteMovie,
  storyline,
  tone,
  releaseType
) {
  try {
    const prompt = `
The user has these preferences:

Favorite Movie: ${favoriteMovie}
Preferred Storyline: ${storyline}
Desired Tone: ${tone}
Release Type: ${releaseType}

Recommend EXACTLY ONE movie.

Return ONLY valid JSON:

{
  "title": "Movie Title",
  "reason": "1-2 sentence explanation."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a movie recommendation assistant. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      suggestedTitle: result.title,
      reason: result.reason,
    };
  } catch (error) {
    console.error("OpenAI Error:", error);

    return {
      suggestedTitle: "",
      reason: "Could not generate recommendation.",
    };
  }
}

// Endpoint
app.post("/search-movies", async (req, res) => {
  const { favoriteMovie, storyline, tone, releaseType } = req.body;

  if (!favoriteMovie || !storyline || !tone || !releaseType) {
    return res.status(400).json({
      error: "Missing required fields.",
    });
  }

  try {
    // Get AI Recommendation
    const { suggestedTitle, reason } = await generateRecommendation(
      favoriteMovie,
      storyline,
      tone,
      releaseType
    );

    console.log("Suggested:", suggestedTitle);

    if (!suggestedTitle) {
      return res.status(500).json({
        error: "Could not generate recommendation.",
      });
    }

    // Search TMDB
    const tmdbResults = await searchMovies(suggestedTitle);

    const movie =
      tmdbResults.length > 0
        ? tmdbResults[0]
        : null;

    if (!movie) {
      return res.json({
        title: suggestedTitle,
        posterPath: null,
        releaseDate: "Unknown",
        overview: "No information found on TMDB.",
        explanation: reason,
      });
    }

    // Return Movie
    res.json({
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      explanation: reason,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});