import Constants from '../../../Classes/Constants.ts'
import {Enlist, HandleOut} from '../../Decorators.ts'
import {AbstractTrigger} from './AbstractTrigger.ts'

@Enlist()
@HandleOut({id: 1, type: Constants.nodeHandleTypes.activate})
@HandleOut({id: 2, type: Constants.nodeHandleTypes.image})
export class TriggerFlow extends AbstractTrigger {
    __nodeText(): string {
        return 'Data summary...'
    }
}