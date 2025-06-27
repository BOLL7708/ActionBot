import Sqlite from '../Database/Sqlite.ts'

export default class TestUtils {
    /**
     * Reset all data to make tests more predictable
     */
    static async resetDatabases(): Promise<void> {
        let doneOld = false
        let count = 0
        while (!doneOld) {
            try {
                Deno.removeSync('../_user/db/test_old.sqlite')
                doneOld = true
            } catch (e: any) {
                if (e.name !== 'NotFound') {
                    console.warn('Unable to delete test_old.sqlite', e.name)
                }
            }
            if (++count > 5) doneOld = true
            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            })
        }

        const db = Sqlite.get(true)
        await Promise.all([
            new Promise((resolve) => {
                db.kill()
                setTimeout(resolve, 100)
            }),
            new Promise((resolve) => {
                try {
                    Deno.removeSync('../_user/db/test.sqlite')
                } catch (e: any) {
                    if (e.name !== 'NotFound') {
                        console.warn('Unable to delete test.sqlite', e.name)
                    }
                }
                setTimeout(resolve, 100)
            }),
            new Promise((resolve) => {
                db.reconnect()
                setTimeout(resolve, 100)
            })
        ])
    }

    static truncateDatabase(): boolean {
        const db = Sqlite.get(true)
        const truncated = !!db.queryRun({query: 'DELETE FROM json_store WHERE 1;'})
        const reset = !!db.queryRun({query: "UPDATE sqlite_sequence SET seq = (SELECT MAX(row_id) FROM json_store) WHERE name='json_store';"})
        return truncated && reset
    }
}
