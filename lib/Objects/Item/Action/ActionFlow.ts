import Constants from '../../../Classes/Constants.ts'
import {Enlist, HandleIn, HandleOut} from '../../Decorators.ts'
import {AbstractAction} from './AbstractAction.ts'

@Enlist()
@HandleIn({id: 1, type: Constants.nodeHandleTypes.activate})
@HandleIn({id: 2, type: Constants.nodeHandleTypes.image})
@HandleOut({id: 1, type: Constants.nodeHandleTypes.activate})
export class ActionFlow extends AbstractAction {
    __nodeText(): string {
        return 'Data summary...'
    }
}