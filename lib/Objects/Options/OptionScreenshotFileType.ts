import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('File type for OBS screenshots.')
export class OptionScreenshotFileType extends AbstractOption {
    @Documentation('Portable Network Graphics')
    static readonly PNG = 'png'

    @Documentation('JPEG')
    static readonly JPG = 'jpg'
}