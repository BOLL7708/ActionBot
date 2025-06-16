import {Description, Documentation} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'
import {OptionsMap} from '../OptionsMap.ts'

@Description('Will affect how the actions of this event are timed.')
export class OptionEventRun extends AbstractOption {
    @Documentation('Will run the actions immediately when the event is triggered.')
    static readonly immediately = 0

    @Documentation('Will run the actions a set delay after the previous actions.')
    static readonly msAfterPrevious = 1

    @Documentation('Will run the actions a set time after the event was triggered.')
    static readonly msAfterStart = 2
}