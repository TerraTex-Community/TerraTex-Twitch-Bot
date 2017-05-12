class SongRequest {
    static init() {
        $("#srqSkipSong").click(SongRequest.loadNextSong);
        $("#srqBlacklistSong").click(SongRequest.blacklistSong);
        $("#srqBlacklistRequester").click(SongRequest.blacklistRequester);
        $("#srqSaveSong").click(SongRequest.saveSong);
    }

    /**
     * @todo
     */
    static loadNextSong() {
        SongRequest.playNextSong("-4yI-VEA8pw");
    }

    static playNextSong(id) {
        if (player) {
            player.loadVideoById({videoId: id});
        }
    }

    /**
     * @todo
     */
    static blacklistSong() {
        SongRequest.loadNextSong();
    }

    /**
     * @todo
     */
    static blacklistRequester() {
        SongRequest.loadNextSong();
    }

    /**
     * @todo
     */
    static saveSong() {
    }
}
