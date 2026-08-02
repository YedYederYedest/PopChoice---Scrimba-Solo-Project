document.addEventListener("DOMContentLoaded", () => {
  const questionView = document.getElementById("question-view");
  const outputView = document.getElementById("output-view");
  const submitButton = document.getElementById("submit-button");
  const restartButton = document.getElementById("restart-button");
  const movieTitle = document.getElementById("movie-title");
  const moviePoster = document.getElementById("movie-poster");
  const movieExplanation = document.getElementById("movie-explanation");
  const movieDetails = document.getElementById("movie-details");

  let selectedStory = "";
  let selectedTone = "";
  let selectedReleaseType = "";
  let selectedGenre = "";

  // Helper to handle button selections
  const addHighlight = (className, setVariable) => {
    const buttons = document.querySelectorAll(className);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("bg-yellow-500", "text-white"));
        button.classList.add("bg-yellow-500", "text-white");
        setVariable(button.getAttribute("data-genre") || button.textContent.trim());
      });
    });
  };

  addHighlight(".storyline-option", (value) => (selectedStory = value));
  addHighlight(".tone-option", (value) => (selectedTone = value));
  addHighlight(".release-option", (value) => (selectedReleaseType = value));
  addHighlight(".genre-option", (value) => (selectedGenre = value));

  submitButton.addEventListener("click", async () => {
    const favoriteMovie = document.getElementById("favorite-movie").value.trim();

    if (!favoriteMovie || !selectedStory || !selectedTone || !selectedReleaseType || !selectedGenre) {
      alert("Please fill in all fields and make selections.");
      return;
    }

    // Show loading state
    questionView.classList.add("hidden");
    outputView.classList.remove("hidden");
    movieTitle.textContent = "Finding your movie...";
    movieExplanation.textContent = "Consulting the AI oracle...";
    moviePoster.src = "";
    movieDetails.innerHTML = "";

    try {
      const response = await fetch("/search-movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favoriteMovie,
          storyline: selectedStory,
          tone: selectedTone,
          releaseType: selectedReleaseType,
          genre: selectedGenre,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        movieTitle.textContent = data.title;
        moviePoster.src = data.posterPath
          ? `https://image.tmdb.org/t/p/w500${data.posterPath}`
          : "https://via.placeholder.com/500x750?text=No+Poster";
        movieExplanation.textContent = data.explanation;
        movieDetails.innerHTML = `
          <p><strong>Release Date:</strong> ${data.releaseDate || "N/A"}</p>
          <p><strong>Overview:</strong> ${data.overview || "N/A"}</p>
        `;
      } else {
        movieTitle.textContent = "Error";
        movieExplanation.textContent = data.error || "An error occurred while fetching recommendation.";
      }
    } catch (error) {
      console.error("Error spotted:", error);
      movieTitle.textContent = "Error";
      movieExplanation.textContent = "Failed to connect to backend server.";
    }
  });

  restartButton.addEventListener("click", () => {
    questionView.classList.remove("hidden");
    outputView.classList.add("hidden");
    document.querySelectorAll(".storyline-option, .tone-option, .release-option, .genre-option").forEach((button) => {
      button.classList.remove("bg-yellow-500", "text-white");
    });
    document.getElementById("favorite-movie").value = "";
    selectedStory = "";
    selectedTone = "";
    selectedReleaseType = "";
    selectedGenre = "";
  });
});