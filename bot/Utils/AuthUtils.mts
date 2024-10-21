import BrowserUtils from '../../web_old/Client/BrowserUtils.mts'

export default class AuthUtils {
    static async checkIfAuthed(): Promise<boolean> {
        const response = await fetch('_auth.php', {
            headers: {Authorization: BrowserUtils.getAuth()}
        })
        return response.ok
    }
}