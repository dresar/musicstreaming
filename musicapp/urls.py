from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search, name='search'),
    path('playlists/', views.playlists, name='playlists'),
    path('playlists/create/', views.create_playlist, name='create_playlist'),
    path('playlists/<int:playlist_id>/', views.playlist_detail, name='playlist_detail'),
    path('add-to-playlist/<int:song_id>/<int:playlist_id>/', views.add_to_playlist, name='add_to_playlist'),
    path('favorites/', views.favorites, name='favorites'),
    path('toggle-favorite/<int:song_id>/', views.toggle_favorite, name='toggle_favorite'),
    path('register/', views.register, name='register'),
    path('artist/<int:artist_id>/', views.artist_detail, name='artist_detail'),
    path('album/<int:album_id>/', views.album_detail, name='album_detail'),
]