import Log from '../../../lib/SharedUtils/Log.mjs'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mjs'

export type TStorageKey =
    | 'usr-name'
    | 'pwd-hash'
    | 'ws-port'

export default class StorageHelper {
    private static readonly _prefix = 'actionbot'

    private static buildKey(key: TStorageKey): string {
        return `${this._prefix}-${key}`
    }

    static getJson<T>(key: TStorageKey): T | undefined {
        const itemStr = this.get(key)
        if (!itemStr) return
        return ValueUtils.safeJsonParse<T>(itemStr)
    }

    static setJson<T>(key: TStorageKey, value: T): boolean {
        try {
            const itemStr = JSON.stringify(value)
            this.set(key, itemStr)
            return true
        } catch (e) {
            Log.e(this.name, `Failed to stringify JSON for key "${key}":`, e)
        }
        return false
    }

    static get(key: TStorageKey): string | undefined {
        return localStorage.getItem(this.buildKey(key)) ?? undefined
    }

    static set(key: TStorageKey, value: string): void {
        localStorage.setItem(this.buildKey(key), value)
    }

    static remove(key: TStorageKey): void {
        localStorage.removeItem(this.buildKey(key))
    }

    static clear(): void {
        localStorage.clear()
    }
}