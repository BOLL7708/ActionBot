import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Description('Universal behavior type for entry lists.')
export class OptionEntryUsage extends AbstractOption {
    @Documentation('Will only use the first value.')
    static readonly First = 0

    @Documentation('Will only use the last value.')
    static readonly Last = 100

    @Documentation('Will use all values.')
    static readonly All = 200

    @Documentation('Will pick one value at random.')
    static readonly OneRandom = 400

    @Documentation('Will shuffle and use all values.')
    static readonly AllRandom = 500

    @Documentation('Will use the the value on the index from the event behavior.')
    static readonly OneByIndex = 600

    @Documentation('Will use the value on the looped index from the event behavior.')
    static readonly OneByIndexOnLoop = 700

}