import {Database} from '@db/sqlite'
import Chalk from '../../lib-core/Constants/Chalk.mts'
import {IDatabaseRow} from '../Helpers/DataBaseHelper.mts'
import {IDictionary} from '../Interfaces/igeneral.mts'

export default class DatabaseSingleton {
    private static _instance: DatabaseSingleton

    /**
     * Will fetch a connected DB instance.
     */
    static get(isTest: boolean = false): DatabaseSingleton {
        if (!this._instance || !this._instance._db.open) {
            this._instance = new DatabaseSingleton(isTest)
        }
        return this._instance
    }

    // region Lifecycle
    private readonly _dbPath: string
    private _db: Database

    private constructor(isTest: boolean = false) {
        const dir = './_user/db'
        Deno.mkdirSync(dir, {recursive: true})
        const file = isTest ? 'test.sqlite' : 'main.sqlite'
        this._dbPath = `${dir}/${file}`
        this._db = this.create(this._dbPath)
    }

    private create(filePath: string): Database {
        const db = new Database(filePath, {
            int64: true,
            unsafeConcurrency: true
        })
        if (db.open) {
            const version = db.prepare('select sqlite_version()').value<[string]>()
            console.log(Chalk.data(`Database connected: ${Chalk.text(filePath)}, SQLite driver version:`, Chalk.text(version?.pop())))

            // Check if table exists
            const tableName = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=:name').value({name: 'json_store'})
            if (!tableName) {
                const sqlBuffer = Deno.readFileSync('./dev/sql/0.sql')
                const sqlStr = new TextDecoder().decode(sqlBuffer)
                db.run(sqlStr)
                console.log(Chalk.data('Table not found, ran import.'))
            } else {
                console.log(Chalk.data('Table exists:'), Chalk.text(tableName?.pop()))
            }
        } else {
            console.warn(Chalk.data('Unable to initialize or connect to database!'))
        }
        return db
    }

    /**
     *
     */
    reconnect() {
        this.kill()
        this._db = this.create(this._dbPath)
    }

    /**
     * Terminate the DB connection.
     */
    kill() {
        this._db.close()
    }

    /**
     * Check if the DB is connected.
     */
    test(): boolean {
        return this._db.open && !!this.queryValue({query: 'SELECT 1;'})
    }

    // endregion

    // region Query
    /**
     * Runs something without selecting anything in the table.
     * @param options
     */
    queryRun(options: IDatabaseQuery): number | object | undefined {
        try {
            return this._db.prepare(options.query).run(options.params)
        } catch (e) {
            console.error(Chalk.error(e), options)
        }
    }

    /**
     * Returns a single row.
     * @param options
     */
    queryGet(options: IDatabaseQuery): IDatabaseRow | undefined {
        try {
            return this._db.prepare(options.query).get(options.params)
        } catch (e) {
            console.error(Chalk.error(e), options)
        }
    }

    /**
     * Returns a collection of rows.
     * @param options
     */
    queryAll(options: IDatabaseQuery): IDatabaseRow[] | undefined {
        try {
            return this._db.prepare(options.query).all(options.params)
        } catch (e) {
            console.error(Chalk.error(e), options)
        }
    }

    /**
     * Used specifically to load things not in the main table, thus it's generic.
     * @param options
     */
    queryValue<T>(options: IDatabaseQuery): T | undefined {
        try {
            const arr = this._db.prepare(options.query).value<T[]>(options.params)
            if (arr) return arr.pop()
        } catch (e) {
            console.error(Chalk.error(e), options)
        }
    }

    // endregion
}

export type TDatabaseQueryInput = null | undefined | number | bigint | string | boolean | Date | Uint8Array | {} | []

export interface IDatabaseQuery {
    query: string
    params?: IDictionary<TDatabaseQueryInput>
}