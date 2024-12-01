import { ActionSign, ConfigSign } from '../../../lib/index.mts'
import Color from '../../Constants/ColorConstants.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'
import Utils from '../../Utils/Utils.mts'

export default class Sign {
    private _queue: ActionSign[] = []
    private _queueLoopHandle: number|any = 0 // TODO: Transitional node fix
    private _isVisible: boolean = false
    private _config: ConfigSign = new ConfigSign()

    constructor() {
        this.init().then()
        this.startQueueLoop()
    }

    private async init() {
        this._config = await DatabaseHelper.loadMain(new ConfigSign())
    }

    private setVisible(visible: boolean) {
        this._config.direction = this._config.direction.toLowerCase()
        const offsetX = visible ? '0' : `-${this._config.sizeWidth}px`
        const offsetY = visible ? '0' : `-${this._config.sizeHeight}px`
    }

    private startQueueLoop() {
        this._queueLoopHandle = setInterval(this.tryShowNext.bind(this), 500)
    }

    enqueueSign(action: ActionSign) {
        if(action.title.length == 0 && action.imageSrc.length == 0 && action.subtitle.length == 0) {
            Utils.log(
                `Could not enqueue sign, config incomplete: ${JSON.stringify(action)}`,
                Color.Red
            )
        } else this._queue.push(action)
    }

    tryShowNext() {
        if(this._isVisible) return
        const config = this._queue.shift()
        if(config == undefined) return // The queue is empty
        this.show(config)
    }

    private show(config: ActionSign) {
        this._isVisible = true
    }
}