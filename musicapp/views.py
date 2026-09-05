from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
import requests
import json
from .models import Song, Playlist, Favorite
from .forms import UserRegisterForm

def home(request):
    """Home page view with search form and trending songs"""
    trending_songs = []
    # Get trending songs from Deezer API
    try:
        response = requests.get('https://api.deezer.com/chart/0/tracks?limit=10')
        if response.status_code == 200:
            data = response.json()
            trending_songs = data.get('data', [])
    except Exception as e:
        print(f"Error fetching trending songs: {e}")
    
    return render(request, 'musicapp/home.html', {'trending_songs': trending_songs})

@csrf_exempt
def search(request):
    """Search for songs using Deezer API"""
    if request.method == 'POST':
        query = request.POST.get('query', '')
        if query:
            try:
                response = requests.get(f'https://api.deezer.com/search?q={query}')
                if response.status_code == 200:
                    return JsonResponse(response.json())
                else:
                    return JsonResponse({'error': 'Failed to fetch data from Deezer API'}, status=500)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def add_to_playlist(request, song_id, playlist_id):
    """Add a song to a playlist"""
    if request.method == 'POST':
        # Get or create the song from Deezer API
        try:
            response = requests.get(f'https://api.deezer.com/track/{song_id}')
            if response.status_code == 200:
                song_data = response.json()
                song, created = Song.objects.get_or_create(
                    deezer_id=song_data['id'],
                    defaults={
                        'title': song_data['title'],
                        'artist': song_data['artist']['name'],
                        'album': song_data['album']['title'],
                        'duration': song_data['duration'],
                        'preview_url': song_data['preview'],
                        'album_cover': song_data['album']['cover_medium'],
                    }
                )
                
                playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
                playlist.songs.add(song)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'error': 'Failed to fetch song data'}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def toggle_favorite(request, song_id):
    """Toggle a song as favorite"""
    if request.method == 'POST':
        try:
            response = requests.get(f'https://api.deezer.com/track/{song_id}')
            if response.status_code == 200:
                song_data = response.json()
                song, created = Song.objects.get_or_create(
                    deezer_id=song_data['id'],
                    defaults={
                        'title': song_data['title'],
                        'artist': song_data['artist']['name'],
                        'album': song_data['album']['title'],
                        'duration': song_data['duration'],
                        'preview_url': song_data['preview'],
                        'album_cover': song_data['album']['cover_medium'],
                    }
                )
                
                favorite, created = Favorite.objects.get_or_create(user=request.user, song=song)
                if not created:  # If it already existed, then remove it
                    favorite.delete()
                    return JsonResponse({'success': True, 'action': 'removed'})
                return JsonResponse({'success': True, 'action': 'added'})
            else:
                return JsonResponse({'error': 'Failed to fetch song data'}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def playlists(request):
    """View all playlists for the current user"""
    user_playlists = Playlist.objects.filter(user=request.user)
    return render(request, 'musicapp/playlists.html', {'playlists': user_playlists})

@login_required
def create_playlist(request):
    """Create a new playlist"""
    if request.method == 'POST':
        name = request.POST.get('name')
        if name:
            playlist = Playlist.objects.create(name=name, user=request.user)
            messages.success(request, f'Playlist "{name}" created successfully!')
            return redirect('playlist_detail', playlist_id=playlist.id)
    return redirect('playlists')

@login_required
def playlist_detail(request, playlist_id):
    """View details of a specific playlist"""
    playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
    return render(request, 'musicapp/playlist_detail.html', {'playlist': playlist})

@login_required
def favorites(request):
    """View all favorite songs for the current user"""
    user_favorites = Favorite.objects.filter(user=request.user)
    return render(request, 'musicapp/favorites.html', {'favorites': user_favorites})

def register(request):
    """Register a new user"""
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now log in.')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'musicapp/register.html', {'form': form})

def artist_detail(request, artist_id):
    """View details of a specific artist"""
    try:
        response = requests.get(f'https://api.deezer.com/artist/{artist_id}')
        if response.status_code == 200:
            artist_data = response.json()
            
            # Get artist's top tracks
            tracks_response = requests.get(f'https://api.deezer.com/artist/{artist_id}/top?limit=20')
            tracks = []
            if tracks_response.status_code == 200:
                tracks = tracks_response.json().get('data', [])
                
            return render(request, 'musicapp/artist_detail.html', {
                'artist': artist_data,
                'tracks': tracks
            })
        else:
            messages.error(request, 'Failed to fetch artist data')
            return redirect('home')
    except Exception as e:
        messages.error(request, f'Error: {str(e)}')
        return redirect('home')

def album_detail(request, album_id):
    """View details of a specific album"""
    try:
        response = requests.get(f'https://api.deezer.com/album/{album_id}')
        if response.status_code == 200:
            album_data = response.json()
            
            # Fetch more albums from the same artist
            artist_response = requests.get(f'https://api.deezer.com/artist/{album_data["artist"]["id"]}/albums?limit=5')
            related_albums = []
            if artist_response.status_code == 200:
                related_albums = artist_response.json().get('data', [])
            
            return render(request, 'musicapp/album_detail.html', {
                'album': album_data,
                'related_albums': related_albums
            })
        else:
            messages.error(request, 'Failed to fetch album data')
            return redirect('home')
    except Exception as e:
        messages.error(request, f'Error: {str(e)}')
        return redirect('home')


def handler404(request, exception):
    """Custom 404 error handler"""
    return render(request, '404.html', status=404)

def handler500(request):
    """Custom 500 error handler"""
    return render(request, '500.html', status=500)
