import GoogleTTS from '../Classes/Api/GoogleTTS.mts'
import OBS from '../Classes/Api/OBS.mts'
import OpenVR2WS from '../Classes/Api/OpenVR2WS.mts'
import Pipe from '../Classes/Api/Pipe.mts'
import Relay from '../Classes/Api/Relay.mts'
import SuperScreenShotterVR from '../Classes/Api/SuperScreenShotterVR.mts'
import Twitch from '../Classes/Api/Twitch.mts'
import TwitchEventSub from '../Classes/Api/TwitchEventSub.mts'
import StreamDeckRelay from '../Classes/Data/StreamDeckRelay.mts'
import AudioPlayer from '../Classes/Placeholder/AudioPlayer.mts'
import Sign from '../Classes/Placeholder/Sign.mts'
import HttpHandler from '../Server/HttpHandler.mts'
import WebSocketHandler from '../Server/WebSocketHandler.mts'

/**
 * Contains instances of various modules
 */
export default class ModulesSingleton {
    private static _instance: ModulesSingleton;
    private constructor() {}
    public static getInstance(): ModulesSingleton {
        if (!this._instance) this._instance = new ModulesSingleton();
        return this._instance;
    }
    // region Servers
    public http = new HttpHandler()
    public ws = new WebSocketHandler()
    // endregion

    // endregion
}