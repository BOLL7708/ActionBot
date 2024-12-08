import Log from '../../../SharedUtils/Log.mts'
import {AbstractData} from '../AbstractData.mts'

export abstract class AbstractTrigger extends AbstractData {
    /**
     * This is used to register the trigger in the bot. This is filled by Runners.
     * @param eventKey The key for the event we are registering for.
     */
    // deno-lint-ignore require-await
    async register(eventKey: string): Promise<void> {
        Log.w(this.__getClass(), `Register not implemented for Trigger: ${eventKey}`)
    }
}