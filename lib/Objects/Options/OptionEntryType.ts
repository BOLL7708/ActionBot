import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('Universal behavior type for entry lists.')
export class OptionEntryUsage extends AbstractOption {
    @About('Will only use the first value.')
    static readonly First = 0

    @About('Will only use the last value.')
    static readonly Last = 100

    @About('Will use all values.')
    static readonly All = 200

    @About('Will pick one value at random.')
    static readonly OneRandom = 400

    @About('Will shuffle and use all values.')
    static readonly AllRandom = 500

    @About('Will use the the value on the index from the event behavior.')
    static readonly OneByIndex = 600

    @About('Will use the value on the looped index from the event behavior.')
    static readonly OneByIndexOnLoop = 700

}