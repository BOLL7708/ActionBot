export default class DomUtils {
    static setCookie(name: string, value: string, expiresInDays: number = 365, path: string = '/') {
        const d = new Date()
        d.setTime(d.getTime() + (expiresInDays * 24 * 60 * 60 * 1000))
        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=${path}`
    }
    static deleteCookie(name: string, path: string = '/') {
        const d = new Date(0)
        document.cookie = `${name}=; expires=${d.toUTCString()}; path=${path};`
    }

    static buildBearerAuth(apiKey: string, baseHeaders: Record<string, string> = {}): RequestInit {
        const headers = new Headers(baseHeaders)
        headers.set('Authorization', `Bearer ${apiKey}`)
        return {
            headers
        }
    }
}