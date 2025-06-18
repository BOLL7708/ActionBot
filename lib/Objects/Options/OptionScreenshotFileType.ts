import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('File type for OBS screenshots.')
export class OptionScreenshotFileType extends AbstractOption {
    @About('Portable Network Graphics')
    static readonly PNG = 'png'

    @About('JPEG')
    static readonly JPG = 'jpg'
}