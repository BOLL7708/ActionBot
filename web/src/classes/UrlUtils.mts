export default class UrlUtils {
    static getParams(): URLSearchParams {
        const queryString = window.location.search
        return new URLSearchParams(queryString)
    }

    static getFragment(): string {
        return window.location.hash
    }
}