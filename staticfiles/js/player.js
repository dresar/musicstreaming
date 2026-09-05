// Music Player Functionality
let currentSong = null;
let audioPlayer = new Audio();
let isPlaying = false;
let currentPlaylist = [];
let currentIndex = 0;

// Initialize player
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for player controls
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPrevious);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', playNext);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            setVolume(this.value);
        });
    }
    
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            const percent = e.offsetX / this.offsetWidth;
            seekTo(percent * audioPlayer.duration);
        });
    }
    
    // Set up audio player event listeners
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNext);
    audioPlayer.addEventListener('loadedmetadata', function() {
        if (totalTimeEl) {
            totalTimeEl.textContent = formatTime(audioPlayer.duration);
        }
    });
    
    // Set initial volume
    audioPlayer.volume = 0.7;
    if (volumeSlider) {
        volumeSlider.value = audioPlayer.volume;
    }
});

// Play a song
function playSong(song) {
    if (!song || !song.previewUrl) {
        console.error('Invalid song or missing preview URL');
        return;
    }
    
    // Update current song
    currentSong = song;
    
    // Update audio source
    audioPlayer.src = song.previewUrl;
    audioPlayer.load();
    
    // Play the song
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            updatePlayerUI();
        })
        .catch(error => {
            console.error('Error playing song:', error);
        });
    
    // Update player UI
    updatePlayerUI();
    
    // Show player if hidden
    const playerContainer = document.getElementById('player-container');
    if (playerContainer) {
        playerContainer.classList.remove('hidden');
    }
}

// Toggle play/pause
function togglePlayPause() {
    if (!currentSong) return;
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
            })
            .catch(error => {
                console.error('Error playing song:', error);
            });
    }
    
    updatePlayerUI();
}

// Play next song
function playNext() {
    if (currentPlaylist.length === 0) return;
    
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[currentIndex]);
}

// Play previous song
function playPrevious() {
    if (currentPlaylist.length === 0) return;
    
    currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[currentIndex]);
}

// Set volume
function setVolume(value) {
    audioPlayer.volume = value;
    
    // Update volume icon
    const volumeIcon = document.getElementById('volume-icon');
    if (volumeIcon) {
        if (value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (value < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
}

// Seek to position
function seekTo(time) {
    if (!isNaN(time)) {
        audioPlayer.currentTime = time;
    }
}

// Update progress bar
function updateProgress() {
    const progressBar = document.getElementById('progress-bar-fill');
    const currentTimeEl = document.getElementById('current-time');
    
    if (progressBar) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percent}%`;
    }
    
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
}

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Update player UI
function updatePlayerUI() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const albumCover = document.getElementById('album-cover');
    
    if (playPauseIcon) {
        playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
    
    if (currentSong) {
        if (songTitle) {
            songTitle.textContent = currentSong.title;
        }
        
        if (songArtist) {
            songArtist.textContent = currentSong.artist;
        }
        
        if (albumCover) {
            albumCover.src = currentSong.albumCover;
            albumCover.alt = `${currentSong.title} by ${currentSong.artist}`;
        }
    }
}

// Add to favorites
function toggleFavorite(songId) {
    fetch(`/toggle-favorite/${songId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update heart icon
        const heartIcons = document.querySelectorAll(`.favorite-icon-${songId}`);
        heartIcons.forEach(icon => {
            if (data.is_favorite) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.classList.add('text-red-500');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.classList.remove('text-red-500');
            }
        });
    })
    .catch(error => console.error('Error:', error));
}

// Add to playlist
function addToPlaylist(songId, playlistId) {
    fetch(`/add-to-playlist/${songId}/${playlistId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Song added to playlist!');
        } else {
            alert('Song already in playlist or error occurred.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchLoading = document.getElementById('search-loading');
    
    if (!searchInput || !searchResults) return;
    
    const query = searchInput.value.trim();
    if (query === '') return;
    
    // Show loading indicator
    if (searchLoading) {
        searchLoading.classList.remove('hidden');
    }
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    // Fetch search results
    fetch(`/search/?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            if (searchLoading) {
                searchLoading.classList.add('hidden');
            }
            
            if (data.length === 0) {
                searchResults.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-600">No results found for "${query}"</p>
                    </div>
                `;
                return;
            }
            
            // Build results HTML
            let resultsHTML = '';
            data.forEach(song => {
                resultsHTML += `
                    <div class="flex items-center p-3 border-b hover:bg-gray-50">
                        <img src="${song.album.cover_small}" alt="${song.title}" class="w-12 h-12 object-cover rounded mr-3">
                        <div class="flex-grow">
                            <h3 class="font-medium">${song.title}</h3>
                            <p class="text-sm text-gray-600">${song.artist.name}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="playSong({id: '${song.id}', title: '${song.title.replace(/'/g, "\\'")}',' artist: '${song.artist.name.replace(/'/g, "\\'")}',' albumCover: '${song.album.cover_medium}', previewUrl: '${song.preview}' })" 
                                    class="text-primary hover:text-opacity-80 transition">
                                <i class="fas fa-play"></i>
                            </button>
                            <button onclick="toggleFavorite('${song.id}')" class="favorite-icon-${song.id} text-gray-400 hover:text-red-500 transition">
                                <i class="${song.is_favorite ? 'fas text-red-500' : 'far'} fa-heart"></i>
                            </button>
                            <div class="relative group">
                                <button class="text-gray-400 hover:text-gray-600 transition">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                    ${song.playlists.map(playlist => `
                                        <button onclick="addToPlaylist('${song.id}', '${playlist.id}')" 
                                                class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                                            ${playlist.name}
                                        </button>
                                    `).join('')}
                                    ${song.playlists.length === 0 ? '<div class="px-4 py-2 text-gray-500">No playlists yet</div>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            searchResults.innerHTML = resultsHTML;
        })
        .catch(error => {
            console.error('Error:', error);
            // Hide loading indicator
            if (searchLoading) {
                searchLoading.classList.add('hidden');
            }
            searchResults.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-500">An error occurred while searching. Please try again.</p>
                </div>
            `;
        });
}