import Constants from '../../../Classes/Constants.ts'
import {Enlist} from '../../Decorators.ts'
import {IAbstractNodeHandle} from '../AbstractNode.ts'
import {AbstractTrigger} from './AbstractTrigger.ts'

@Enlist()
export class TriggerFlow extends AbstractTrigger {
    __nodeTopHandles(): IAbstractNodeHandle[] {
        return []
    }
    __nodeBottomHandles(): IAbstractNodeHandle[] {
        return [{
            type: Constants.nodeHandleIds.activate
        },{
            type: Constants.nodeHandleIds.image
        }]
    }
    __nodeText(): string {
        return 'Data summary...'
    }
}