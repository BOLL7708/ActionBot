import { ConfigImageEditorFontSettings, ConfigImageEditorOutline, ConfigImageEditorRect } from '../../../lib-shared/index.mts'
import Utils from '../../Utils/Utils.mts'
import {ITwitchMessageData} from '../Api/Twitch.mts'

export default class ImageEditor {
    constructor() {
    }

    // region Init

    /**
     * Will load an image URL and cache the result using ImageHelper.
     * Do not call this inside ImageHelper, as it could cause an infinite loop.
     * @param url
     * @returns Promise with boolean if image was successfully loaded
     */
    async loadUrl(url: string):Promise<boolean> {
        return true
    }
    /**
     * Loads an image from a base64 data URL
     * @param dataUrl
     * @returns
     */
    async loadDataUrl(dataUrl: string): Promise<boolean> {
        return true
    }

    /**
     * Will initiate an empty canvas of the given size.
     * @param width
     * @param height
     */
    initiateEmptyCanvas(width: number, height: number) {
    }

    // endregion

    // region Output
    getDataUrl(type: string = 'image/png', quality: number = 1): string {
        return ''
    }
    getData(type: string = 'image/png', quality: number = 1): string {
        return ''
    }
    // endregion

    // region Convenience
    static async convertPngDataUrlToJpegBlobForDiscord(pngDataUrl: string, quality: number = 0.85): Promise<Blob> {
        return Utils.b64toBlob('', 'image/jpeg')
    }
    // endregion

    // region Drawing
    async drawImage(
        imageData: string,
        rect: ConfigImageEditorRect,
        radius: number = 0,
        outlines: ConfigImageEditorOutline[] = []
    ): Promise<boolean> {
        return true
    }

    async drawText(
        text: string,
        rect: ConfigImageEditorRect,
        font: ConfigImageEditorFontSettings
    ) {
    }

    private constructRoundedRectangle(context: any|null, rect: ConfigImageEditorRect, cornerRadius: number, margin: number = 0) {
    }

    /**
     * Draw the background grahphics for the custom notification.
     * @param rect
     * @param cornerRadius
     * @param color
     * @param outline
     */
    drawBackground(rect: ConfigImageEditorRect, cornerRadius: number, color: string, outline?: ConfigImageEditorOutline) {
    }

    /**
     * Will construct a Twitch message on the text canvas including Twitch and unicode emojis.
     * Initially based on: https://github.com/jeppevinkel/twitch-logger/blob/48f6feb4ed4d3085c089acafb02bf5357a07d895/src/modules/emoteCanvas.ts#L5
     * - Extended to have ellipsizing of both lines and the whole text box.
     * - Fixed a bug where it gets the wrong word length from unicode emojis.
     * @param messageData What comes from chat callbacks
     * @param rect Where the text should be contained
     * @param font Font settings
     */
    async buildTwitchText(messageData: ITwitchMessageData, rect: ConfigImageEditorRect, font: ConfigImageEditorFontSettings): Promise<ITwitchTextResult> {
        // Return values
        const result: ITwitchTextResult = {
            firstRowWidth: 0,
            rowsDrawn: 1,
            pixelHeight: 0,
            ellipsized: false,
            writtenChars: 0
        }
        return result
    }

    drawBuiltTwitchText(rect: ConfigImageEditorRect) {
    }
    // endregion
}

interface ITwitchTextResult {
    firstRowWidth: number
    rowsDrawn: number
    pixelHeight: number
    ellipsized: boolean
    writtenChars: number
}