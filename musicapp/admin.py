from django.contrib import admin
from .models import Song, Playlist, Favorite

# Register models to admin panel

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'album', 'deezer_id')
    search_fields = ('title', 'artist', 'album')
    list_filter = ('artist',)

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username')
    list_filter = ('created_at',)
    filter_horizontal = ('songs',)

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'song')
    search_fields = ('user__username', 'song__title')
    list_filter = ('user',)
