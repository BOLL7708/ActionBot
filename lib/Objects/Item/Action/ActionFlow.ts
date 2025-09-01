import Constants from '../../../Classes/Constants.ts'
import {Enlist, HandleIn, HandleOut, Primitive} from '../../Decorators.ts'
import {AbstractAction} from './AbstractAction.ts'

@Enlist()
@HandleIn({id: 1, type: Constants.nodeHandleTypes.activate})
@HandleIn({id: 2, type: Constants.nodeHandleTypes.image})
@HandleOut({id: 1, type: Constants.nodeHandleTypes.activate})
export class ActionFlow extends AbstractAction {
    @Primitive
    testValue: string = 'testValue'

    __nodeText(): string {
        return `TV: ${this.testValue}`
    }
}