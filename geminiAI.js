import {GoogleGemini} from "@google/gemini";
const gemini = new GoogleGemini({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-1.5",
});

const prompt = "Write a short story about a robot learning to love.";

const result = await gemini.generateText(prompt);
console.log(result.responseText);