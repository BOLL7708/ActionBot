import Constants from '../../../Classes/Constants.ts'
import {Enlist} from '../../Decorators.ts'
import {IAbstractNodeHandle} from '../AbstractNode.ts'
import {AbstractAction} from './AbstractAction.ts'

@Enlist()
export class ActionFlow extends AbstractAction {
    __nodeTopHandles(): IAbstractNodeHandle[] {
        return [
            {
                type: Constants.nodeHandleIds.activate
            },
            {
                type: Constants.nodeHandleIds.image
            }
        ]
    }
    __nodeBottomHandles(): IAbstractNodeHandle[] {
        return [{
            type: Constants.nodeHandleIds.activate
        }]
    }
    __nodeText(): string {
        return 'Data summary...'
    }
}