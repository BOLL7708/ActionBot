import {assert, assertEquals} from 'jsr:@std/assert'
import Log, {EEasyDebugLogLevel} from '../../bot/EasyTSUtils/Log.mts'
import DataBaseHelper, {IDataBaseItem} from '../../bot/Helpers/DataBaseHelper.mts'
import DataBaseHelper_OLD from '../../bot/Helpers/DataBaseHelper_OLD.mts'
import {IDictionary} from '../../bot/Interfaces/igeneral.mts'
import {ActionCustom, ConfigMain, EnlistData} from '../../lib-shared/index.mts'

Deno.test('init', () => {
    EnlistData.run()
    Deno.removeSync('./_user/db/test_old.sqlite')
    Deno.removeSync('./_user/db/test.sqlite')
    DataBaseHelper.isTesting = true
    Log.setOptions({
        logLevel: EEasyDebugLogLevel.Warning,
        useColors: true,
        capitalizeTag: false,
        tagPrefix: '[',
        tagPostfix: '] '
    })
})

function compareSets(a: IDictionary<IDataBaseItem<any>>|undefined, b: IDictionary<IDataBaseItem<any>>|undefined): void {
    if(a === undefined || b === undefined) return
    assertEquals(Object.keys(a), Object.keys(b))
    for(const [key, item_a] of Object.entries(a)) {
        const item_b = b[key]
        // Deleting ID as it is for some reason a mismatch, as the old code increments ID twice per row, interestingly enough.
        delete (item_a as any).id
        delete (item_b as any).id
        assertEquals(item_a, item_b)
    }
}

Deno.test('save & load', async (t) => {
    const a = DataBaseHelper_OLD
    const s = DataBaseHelper
    await t.step('save single', async () => {
        await a.save(new ConfigMain(), DataBaseHelper.OBJECT_MAIN_KEY)
        s.save(new ConfigMain(), DataBaseHelper.OBJECT_MAIN_KEY)
    })
    await t.step('load single', async () => {
        const configMain_a = await a.load(new ConfigMain(), DataBaseHelper.OBJECT_MAIN_KEY)
        const configMain_s = s.load(new ConfigMain(), DataBaseHelper.OBJECT_MAIN_KEY)
        assert(configMain_a)
        assert(configMain_s)
        assertEquals(configMain_s, configMain_a)
    })
    await t.step('save multi', async () => {
        const saveMe = new ActionCustom()
        for (let i = 0; i < 10; i++) {
            await a.save(saveMe, `actionCustom-${i}`)
            s.save(saveMe, `actionCustom-${i}`)
        }
    })
    await t.step('load all', async () => {
        const c = 10
        const all_a = await a.loadAll(new ActionCustom())
        assertEquals(Object.keys(all_a ?? {}).length, c)
        const all_s = s.loadAll(new ActionCustom())
        assertEquals(Object.keys(all_s ?? {}).length, c)
        compareSets(all_a, all_s)
    })
    await t.step('update key', async () => {
        const key1 = 'FirstKey', key2 = 'SecondKey'
        await a.save(new ActionCustom(), key1)
        s.save(new ActionCustom(), key1)
        let r_a = await a.load(new ActionCustom(), key1)
        let r_s = s.load(new ActionCustom(), key1)
        assert(r_a)
        assert(r_s)
        await a.save(new ActionCustom(), key1, key2)
        s.save(new ActionCustom(), key1, key2)
        r_a = await a.load(new ActionCustom(), key2)
        r_s = s.load(new ActionCustom(), key2)
        assert(r_a)
        assert(r_s)
    })
    await t.step('hello', async () => {

    })
    await t.step('hello', async () => {

    })
    await t.step('hello', async () => {

    })
    await t.step('hello', async () => {

    })
})

// Deno.test({
//    name: 'read file test',
//    permissions: { read: true },
//    fn: () => {
//       const data = Deno.readTextFileSync('./somefile.txt')
//       assertEquals(data, 'expected content')
//    },
// })

Deno.test('close db', () => {
    DataBaseHelper.closeConnection()
})