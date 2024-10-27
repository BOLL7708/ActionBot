import { IS_BROWSER } from '$fresh/runtime.ts'
import BrowserUtils from '../../web_old/Client/BrowserUtils.mts'

export default class AuthUtils {
    static async checkIfAuthed(): Promise<boolean> {
        if(!IS_BROWSER) return true // TODO: Fake positive

        const response = await fetch('_auth.php', {
            headers: {Authorization: BrowserUtils.getAuth()}
        })
        return response.ok
    }
}