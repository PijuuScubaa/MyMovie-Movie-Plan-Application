document.addEventListener('DOMContentLoaded', () => {
    
    // --- TASK 2 & 6: API Integration & DOM Manipulation ---
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const query = document.getElementById('movieInput').value.trim();
            const errorDiv = document.getElementById('apiError');
            const resultCard = document.getElementById('resultCard');
            const displayDiv = document.getElementById('movieDisplay');
            const suggestionDiv = document.getElementById('suggestionBox');
            const actionContainer = document.getElementById('actionContainer');
            
            errorDiv.textContent = '';
            displayDiv.innerHTML = '';
            suggestionDiv.innerHTML = '';
            actionContainer.innerHTML = '';

            if (!query) {
                errorDiv.textContent = 'Please enter a valid movie title.';
                resultCard.style.display = 'none';
                return;
            }
            
            // Fetch movie data from OMDB API
            try {
                const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=trilogy`);
                const data = await response.json();

                // response handling for no results
                if (data.Response === 'False') {
                    errorDiv.textContent = 'No movie results found. Try another title!';
                    resultCard.style.display = 'none';
                    return;
                }

                resultCard.style.display = 'block';

                displayDiv.innerHTML = `
                    <div style="display: flex; gap: 20px; align-items: flex-start;">
                        <img src="${(data.Poster && data.Poster !== 'N/A') ? data.Poster : 'https://via.placeholder.com/100x150?text=No+Image'}" width="100" height="150" alt="Poster" style="border-radius: 4px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/100x150?text=Error'">
                        <div>
                            <h3>${data.Title} (${data.Year})</h3>
                            <p><strong>Genre:</strong> ${data.Genre}</p>
                            <p><strong>Director:</strong> ${data.Director}</p>
                            <p><strong>Runtime:</strong> ${data.Runtime}</p>
                        </div>
                    </div>
                `;

                const saveBtn = document.createElement('button');
                saveBtn.textContent = '⭐ Save to Watchlist';
                saveBtn.style.backgroundColor = '#10b981';
                // Pass data.Runtime into the save function
                saveBtn.addEventListener('click', () => {
                    saveToWatchlist(data.Title, data.Genre, data.Poster, data.Runtime);
                });
                actionContainer.appendChild(saveBtn);

                let suggestion = '';
                const genre = data.Genre.toLowerCase();
                
                if (genre.includes('action')) {
                    suggestion = '💡 Suggestion: Great choice for an action night! Pair it with popcorn and high-energy snacks.';
                } else if (genre.includes('comedy')) {
                    suggestion = '💡 Suggestion: Comedy movie detected! Perfect choice to lift your mood with friends.';
                } else if (genre.includes('drama')) {
                    suggestion = '💡 Suggestion: Deep drama movie. Make sure to keep tissues handy!';
                } else {
                    suggestion = '💡 Suggestion: Excellent pick! Enjoy your cinematic experience.';
                }
                suggestionDiv.textContent = suggestion;

            } catch (error) {
                errorDiv.textContent = 'Failed to connect to the movie API. Check your internet connection.';
                resultCard.style.display = 'none';
            }
        });
    }

    // --- TASK 3: Interactive Genre Dropdown Suggestion Logic ---
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const mood = document.getElementById('moodSelect').value;
            const minRating = parseFloat(document.getElementById('minRatingInput').value) || 0;
            const maxTime = parseInt(document.getElementById('maxTimeInput').value) || 999;
            const suggestionBox = document.getElementById('categorySuggestionBox');
            
            suggestionBox.innerHTML = '';

            if (!mood) {
                suggestionBox.style.display = 'block';
                suggestionBox.innerHTML = '<p style="color: red;">Please select a mood first!</p>';
                return;
            }

            suggestionBox.style.display = 'block';
            suggestionBox.innerHTML = '<p>Evaluating custom conditions...</p>';

            // --- CONDITION 1: Switch statement converts mood to genre/candidate pool ---
            let candidateMovies = [];
            switch (mood) {
                case 'happy':
                    candidateMovies = ['Superbad', 'The Hangover', 'Step Brothers'];
                    break;
                case 'excited':
                    candidateMovies = ['Mad Max Fury Road', 'John Wick', 'Gladiator'];
                    break;
                case 'relaxed':
                    candidateMovies = ['The Notebook', 'Forrest Gump', 'The Pursuit of Happyness'];
                    break;
                default:
                    candidateMovies = ['Inception'];
                    break;
            }

            // Retrieve current watchlist for duplication check (Condition 4)
            let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
            let selectedMovieData = null;
            let snackTip = '🍿 Recommended Pairing: Classic cinema snacks.';

            // Loop through candidates to test conditions
            for (let title of candidateMovies) {
                try {
                    const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=trilogy`);
                    const movieData = await response.json();

                    if (movieData.Response === 'True') {
                        const rating = parseFloat(movieData.imdbRating) || 0;
                        const runtimeMatch = movieData.Runtime ? movieData.Runtime.match(/(\d+)/) : null;
                        const runtimeMins = runtimeMatch ? parseInt(runtimeMatch[1]) : 0;
                        
                        // Check if already in watchlist (Condition 4)
                        const inWatchlist = watchlist.some(m => m.title.toLowerCase() === movieData.Title.toLowerCase());

                        // --- CONDITION 2 & 3 & 4 Filters ---
                        const passesRating = rating >= minRating;
                        const passesTime = runtimeMins <= maxTime;

                        if (passesRating && passesTime && !inWatchlist) {
                            selectedMovieData = movieData;
                            break; // Found the best matching movie!
                        }
                    }
                } catch (err) {
                    console.error("API fetch error", err);
                }
            }

            // --- CONDITION 5: Fallback message if no suitable movie found ---
            if (!selectedMovieData) {
                suggestionBox.innerHTML = `
                    <div style="background: #fd0808a2; color: #0f0e0e; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0;"><strong>⚠️ No suitable movie found!</strong></p>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Try changing your genre, lowering the minimum rating, or increasing your available time.</p>
                    </div>
                `;
                return;
            }

            // Display the successful filtered recommendation
            const posterUrl = (selectedMovieData.Poster && selectedMovieData.Poster !== 'N/A') ? selectedMovieData.Poster : 'https://via.placeholder.com/70x100?text=No+Image';

            suggestionBox.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
                    <img src="${posterUrl}" width="70" height="100" alt="Poster" style="border-radius: 4px; object-fit: cover;">
                    <div>
                        <p style="margin: 0 0 5px 0; color: #fff;">🎬 Recommended: <strong>${selectedMovieData.Title} (${selectedMovieData.Year})</strong></p>
                        <p style="margin: 0 0 3px 0; font-size: 0.85rem; color: #fbbf24;">⭐ Rating: ${selectedMovieData.imdbRating} | ⏱️ Runtime: ${selectedMovieData.Runtime}</p>
                        <p style="font-size: 0.85rem; color: #9ca3af; margin: 0;">${snackTip}</p>
                    </div>
                </div>
            `;
        });
    }
});

// Helper function to save API movie along with its runtime to Local Storage
function saveToWatchlist(title, genre, poster, runtime) {
    let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
    
    const exists = watchlist.some(movie => movie.title.toLowerCase() === title.toLowerCase());
    if (exists) {
        alert(`"${title}" is already in your watchlist!`);
        return;
    }

    watchlist.push({ title, genre, poster, runtime });
    localStorage.setItem('myWatchlist', JSON.stringify(watchlist));
    alert(`Success! "${title}" has been saved to your watchlist.`);
}