import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('The type of screenshot to capture.')
export class OptionScreenshotType extends AbstractOption {
    @About('Will trigger a screenshot with SuperScreenShotterVR if VR is on, otherwise OBS will be used.')
    static readonly VRElseOBS = 0

    @About('Will trigger a screenshot with SuperScreenShotterVR of the currently running VR game.')
    static readonly SuperScreenShotterVR = 100

    @About('Will trigger a screenshot in OBS of a specific source.')
    static readonly OBSSource = 200
}