import Log from '../EasyTSUtils/Log.mts'

export default class DataFileUtils {
    private static readonly TAG = this.name

    static writeData(path: string, data: any): boolean {
        try {
            Deno.writeFileSync(path, data)
            return true
        } catch(e) {
            Log.e(this.TAG, 'Failed to write file with data', e)
        }
        return false
    }
    static writeText(path: string, text: string): boolean {
        try {
            Deno.writeTextFileSync(path, text)
            return true
        } catch(e) {
            Log.e(this.TAG, 'Failed to write file with text', e)
        }
        return false
    }
    static appendText(path: string, text: string): boolean {
        try {
            Deno.writeTextFileSync(path, text, {append: true})
            return true
        } catch(e) {
            Log.e(this.TAG, 'Failed to append file with text', e)
        }
        return false
    }
    static readData<T>(path: string): T|string|undefined {
        const textDecoder = new TextDecoder()
        let text = ''
        try {
            const fileData = Deno.readFileSync(path)
            text = textDecoder.decode(fileData)
        } catch(e) {
            Log.e(this.TAG, 'Failed to read file with data', e)
        }
        if(!text.trim().length) return undefined

        let data: any
        try {
            data = JSON.parse(text)
            return data as T
        } catch(e) {
            Log.w(this.TAG, 'Failed to parse data from file', e)
        }
        return text
    }
}


// region Data Constants & Classes
export class AuthData {
    hash: string = ''
}
export class DBData {
    host: string = ''
    port: number = 0
    username: string = ''
    password: string = ''
    database: string = ''
}
export class GitVersion {
    current: number = 0
}
export class MigrationData {
    ok: boolean = false
    count: number = 0
    id: number = 0
}
export class MigrationVersion {
    version: number = 0
}
// endregion