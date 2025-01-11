# 2025-01-11
* __DONE__: We finally have a live websocket connection between the BotController and the Vue Presenter.
  * __TODO__: Figure out the format of the messages we want to send to the Presenter, there is a types class for this already: `./lib/Types/WebSocket/Presenter.mts`
  * __TODO__: Port the existing AudioPlayer to work in Vue in the Presenter.
    * It needs to support channels and queueing, but that should in theory already exist.
  * __TODO__: Get TTS hooked up to use the Presenter, this to have the same features as the initial Streaming Widget.