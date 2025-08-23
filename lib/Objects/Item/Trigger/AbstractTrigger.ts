import Log from '../../../SharedUtils/Log.ts'
import {AbstractItem} from '../../AbstractItem.ts'
import {AbstractNode} from '../AbstractNode.ts'

export abstract class AbstractTrigger extends AbstractNode {
    __nodeColor(): string {
        return 'blue'
    }

    __nodeTitle(): string {
        return this.constructor.name // TODO: Make this use a GROUP KEY as well if it exists. If the item was made global.
    }

    /**
     * This is used to register the trigger in the bot. This is filled by Runners.
     * @param eventKey The key for the event we are registering for.
     */
    // deno-lint-ignore require-await
    async register(eventKey: string): Promise<void> {
        Log.w(this.constructor.name, `Register not implemented for Trigger: ${eventKey}`)
    }
}