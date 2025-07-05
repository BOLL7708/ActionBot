import JsonStore from '../Database/JsonStore.ts'

export default class TestUtils {
    static truncateDatabase(): boolean {
        JsonStore.isTesting = true
        return JsonStore.deleteAll()
    }
}
