import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function fetchPopularMovies() 
{
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching popular movies:", error);
        return null
    }
}

export async function searchMovies(query)
{
    try
    {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.results;
    } catch (error)
    {
        console.error("Error searching movies:", error);
        return null
    }
}

