import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('The correction applied to the origin.')
export class OptionMoveVRSpaceCorrection extends AbstractOption {
    @Documentation('The play space, allows X, Y and Z to be aligned to the place space.')
    static playSpace = 'PlaySpace'

    @Documentation('The HMD, will angle the offsets to your absolute headset orientation.')
    static hmd = 'Hmd'

    @Documentation('The HMD yaw, useful to angle offsets along the horizontal direction you are looking.')
    static hmdYaw = 'HmdYaw'

    @Documentation('The HMD pitch, will angle the offsets vertically with your headset.')
    static hmdPitch = 'HmdPitch'
}