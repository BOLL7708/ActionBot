import Log from '../../../SharedUtils/Log.ts'
import {AbstractData} from '../AbstractData.ts'

export abstract class AbstractTrigger extends AbstractData {
    /**
     * This is used to register the trigger in the bot. This is filled by Runners.
     * @param eventKey The key for the event we are registering for.
     */
    // deno-lint-ignore require-await
    async register(eventKey: string): Promise<void> {
        Log.w(this.constructor.name, `Register not implemented for Trigger: ${eventKey}`)
    }
}