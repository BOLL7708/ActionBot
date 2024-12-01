export default class BrowserUtils {
    /**
     * Load image into element with promise
     */
    static makeImage(urlOrData: string): Promise<any|null> {
        return new Promise((resolve, reject) => {
            resolve(null)
        })
    }

    static getElement<T>(id: string): T|undefined {
        return undefined
    }

    static getAuth(): string {
        return ''
    }
    static getAuthInit(additionalHeaders: HeadersInit = {}): RequestInit {
        return {
            headers: {Authorization: '', ...additionalHeaders}
        }
    }

    static clearAuth(): void {
    }

    static getCurrentPath(): string {
        return ''
    }

    static async writeToClipboard(data: any|undefined): Promise<boolean> {
        return true
    }

    static async readFromClipboard(parseJson: boolean = false): Promise<any|undefined> {
        return undefined
    }

    static setUrlParam(pairs: { [param: string]: string }) {
    }
}
