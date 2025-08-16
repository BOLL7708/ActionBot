export default class SvelteUtils {
    static tag(url: string): string {
        return new URL(url).pathname.split('/').pop() ?? url
    }
}