import Sqlite from '../Database/Sqlite.ts'

export default class TestUtils {
    static truncateDatabase(): boolean {
        const db = Sqlite.get(true)
        const truncated = !!db.queryRun({query: 'DELETE FROM json_store WHERE 1;'})
        const reset = !!db.queryRun({query: "UPDATE sqlite_sequence SET seq = (SELECT MAX(row_id) FROM json_store) WHERE name='json_store';"})
        return truncated && reset
    }
}
