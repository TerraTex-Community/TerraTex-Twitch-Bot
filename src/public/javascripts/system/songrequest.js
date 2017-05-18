let firstSong = true;

class SongRequest {
    static init() {
        $("#srqSkipSong").click(SongRequest.loadNextSong);
        $("#srqBlacklistSong").click(SongRequest.blacklistSong);
        $("#srqBlacklistRequester").click(SongRequest.blacklistRequester);
        $("#srqSaveSong").click(SongRequest.saveSong);

        g_socket.on("sr_setSongInPlayer", (data) => {
            SongRequest.playNextSong(data.id);
            $("#songTitle").html(data.title);
            $("#songRequester").html(data.requester);
        });

        setTimeout(SongRequest.loadNextSong, 1500);
    }

    static loadNextSong() {
        g_socket.emit("sr_getNextSong");
    }

    static playNextSong(id) {
        if (player) {
            player.loadVideoById({videoId: id});
            if (firstSong) {
                firstSong = false;
                player.stopVideo();
            }
        }
    }

    /**
     * @todo
     */
    static blacklistSong() {

    }

    /**
     * @todo
     */
    static blacklistRequester() {

    }

    /**
     * @todo
     */
    static saveSong() {
    }
}
