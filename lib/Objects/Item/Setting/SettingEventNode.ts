import {IDictionary, INumberDictionary} from '../../../SharedUtils/Dictionary.ts'
import {Enlist, Purpose, Value} from '../../Decorators.ts'
import {TPrimitives, Type} from '../../DecoratorType.ts'
import {AbstractSetting} from './AbstractSetting.ts'

@Enlist()
@Purpose('Contains node data for events used in the node editor.')
export default class SettingEventNode extends AbstractSetting {
    xPos: number = 0
    yPos: number = 0
    data: IDictionary<TPrimitives> = {} // TODO: Figure out what can go into data, normalize this.
}