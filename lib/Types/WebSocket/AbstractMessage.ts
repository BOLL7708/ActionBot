import Log from '../../SharedUtils/Log.mts'
import ValueUtils from '../../SharedUtils/ValueUtils.mts'

export default abstract class AbstractMessage {
    public constructor(input?: string | Record<string, any>) {
        if (typeof input === 'string') {
            input = ValueUtils.safeJsonParse<Record<string, any>>(input)
        }
        if (ValueUtils.isObject(input)) {
            for (const key of Object.keys(input)) {
                // Don't use properties that could be null or undefined
                if(input[key] === null || input[key] === undefined) {
                    Log.w(this.constructor.name, `${key}: Null or undefined is ignored`)
                    continue
                }

                // Basic type
                const thisType = typeof (this.constructor.prototype as any)[key]
                const inputType = typeof input[key]

                // Arrays, which are pretty much untyped, but I guess we'll accept them.
                const thisIsArray = Array.isArray((this as any)[key])
                const inputIsArray = Array.isArray(input[key])

                // Skip objects as these should be simple messages
                if(inputType === 'object' && !inputIsArray) {
                    Log.w(this.constructor.name, `${key}: Type ${inputType} is not supported`)
                    continue
                }

                // Apply input to this instance
                if((thisIsArray && inputIsArray) || !thisIsArray && thisType === inputType) {
                    (this as any)[key] = input[key]
                } else {
                    Log.w(this.constructor.name, `${key}: Type ${inputType} did not match ${thisType}`)
                }
            }
        }
    }
}