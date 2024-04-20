import AbstractAction from './AbstractAction.js'
import {OptionScreenshotType} from '../../Options/OptionScreenshotType.js'
import {DataEntries} from '../AbstractData.js'
import DataMap from '../DataMap.js'
import {PresetOBSSource} from '../Preset/PresetOBS.js'

export default class ActionScreenshot extends AbstractAction {
    screenshotType = OptionScreenshotType.VRElseOBS
    sourcePreset: number|DataEntries<PresetOBSSource> = 0
    delay: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionScreenshot(),
            tag: '📸',
            description: 'Trigger OBS or VR screenshots.',
            documentation: {
                screenshotType: 'The type of screenshot, OBS screenshots need the source preset to be set.',
                sourcePreset: 'OBS only, set this if you are capturing an OBS screenshot.',
                delay: 'A delay in seconds before triggering the screenshot.'
            },
            types: {
                screenshotType: OptionScreenshotType.ref,
                sourcePreset: PresetOBSSource.ref.id.build()
            }
        })
    }
}

/**
 * Reference data about a screenshot that is cached from triggering it until it is completed.
 */
export interface IScreenshotRequestData {
    /**
     * Key for the event that triggered the screenshot.
     */
    eventKey: string
    /**
     * Twitch user ID for the redeemer.
     */
    userId: number
    /**
     * Twitch username for the redeemer.
     */
    userName: string
    /**
     * Input from the Twitch reward redemption.
     */
    userInput: string
}