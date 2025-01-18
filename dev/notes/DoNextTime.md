# 2025-01-11
* __DONE__: We finally have a live websocket connection between the BotController and the Vue Presenter.
  * __TODO__: Figure out the format of the messages we want to send to the Presenter, there is a types class for this already: `./lib/Types/WebSocket/Presenter.mts`
  * __TODO__: Port the existing AudioPlayer to work in Vue in the Presenter.
    * It needs to support channels and queueing, but that should in theory already exist.
  * __TODO__: Get TTS hooked up to use the Presenter, this to have the same features as the initial Streaming Widget.

# 2025-01-17
* I've decided I won't be streaming again until I use _this bot_, so what would be required for me to be comfortable doing that?
  1. Get Twurple working, we need a Twitch connection for Twitch Chat, and not the old one.
  2. From that chat connection, hook up the TTS with the WIP Presenter, and Chat logging using Discord.JS.
     * The Presenter will start out with just having audio player support for TTS.
     * The chat logs should be split on stream session, and be posts in a forum channel. Maybe optionally, but this feature should exist.
* I keep thinking about secure transport, worry about that later. SSL, TSL, mTSL.