document.addEventListener('DOMContentLoaded', () => {
    loadWatchlist();

    // --- Movie Runtime Calculator Logic ---
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const resultDiv = document.getElementById('calcResult');
            let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
            
            if (watchlist.length === 0) {
                resultDiv.textContent = 'Your watchlist is empty! Save some movies first.';
                resultDiv.style.color = '#ef4444'; // Red for empty warning
                return;
            }

            let totalMinutes = 0;
            watchlist.forEach(movie => {
                if (movie.runtime && movie.runtime !== 'N/A') {
                    const match = movie.runtime.match(/(\d+)/);
                    if (match) {
                        totalMinutes += parseInt(match[1]);
                    }
                }
            });

            resultDiv.style.color = '#34d399'; // Mint green for success result
            const totalHours = (totalMinutes / 60).toFixed(1);
            resultDiv.textContent = `📊 Total Marathon Time: ${totalMinutes} mins (${totalHours} hrs) for ${watchlist.length} saved movie(s)`;
        });
    }
});

function loadWatchlist() {
    const listEl = document.getElementById('watchlistTable');
    if (!listEl) return;

    let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
    listEl.innerHTML = '';

    if (watchlist.length === 0) {
        listEl.innerHTML = '<li>No saved movies in your watchlist yet. Search and save some from the search page!</li>';
        return;
    }

    // Inside watchlist.js - updated rendering loop
    watchlist.forEach((movie, index) => {
        const li = document.createElement('li');
        const posterSrc = (movie.poster && movie.poster !== "N/A") ? movie.poster : "https://via.placeholder.com/50x75?text=No+Image";
        
        // Check if the movie has a 'watched' property (defaults to false)
        const isWatched = movie.watched || false;

        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${posterSrc}" width="50" height="75" alt="Poster" style="object-fit: cover; border-radius: 4px;">
                <div>
                    <strong style="font-size: 1.05rem; color: #fff; text-decoration: ${isWatched ? 'line-through' : 'none'};">${movie.title}</strong><br>
                    <span style="color: #6b7280; font-size: 0.9rem;">${movie.genre} | ⏱️ ${movie.runtime || 'N/A'}</span><br>
                    <span style="font-size: 0.8rem; color: ${isWatched ? '#34d399' : '#fbbf24'};">
                        Status: ${isWatched ? '✅ Watched' : '⏳ To Watch'}
                    </span>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <!-- UPDATE BUTTON -->
                <button onclick="toggleWatchStatus(${index})" style="background-color: ${isWatched ? '#4b5563' : '#10b981'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    ${isWatched ? 'Mark Unwatched' : 'Mark Watched'}
                </button>
                <!-- DELETE BUTTON -->
                <button onclick="deleteMovie(${index})" style="background-color: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

window.deleteMovie = function(index) {
    let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
    watchlist.splice(index, 1);
    localStorage.setItem('myWatchlist', JSON.stringify(watchlist));
    loadWatchlist();
};

// --- UPDATE OPERATION ---
window.toggleWatchStatus = function(index) {
    let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];
    
    // Toggle the 'watched' boolean property of the specific movie object
    watchlist[index].watched = !watchlist[index].watched;
    
    // Save the updated array back to localStorage (Update operation)
    localStorage.setItem('myWatchlist', JSON.stringify(watchlist));
    
    // Reload the list to reflect the changes visually
    loadWatchlist();
};