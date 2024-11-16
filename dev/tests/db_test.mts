import {assert, assertEquals} from 'jsr:@std/assert'
import Log, {EEasyDebugLogLevel} from '../../bot/EasyTSUtils/Log.mts'
import DataBaseHelper, {IDataBaseItem} from '../../bot/Helpers/DataBaseHelper.mts'
import DataBaseHelper_OLD from '../../bot/Helpers/DataBaseHelper_OLD.mts'
import {IDictionary} from '../../bot/Interfaces/igeneral.mts'
import {ActionAudio, ActionCustom, ActionOBS, ConfigController, ConfigMain, ConfigSpeech, DataEntries, EnlistData, PresetAudioChannel} from '../../lib-shared/index.mts'

Deno.test('init', () => {
    EnlistData.run()
    Deno.removeSync('./_user/db/test_old.sqlite')
    Deno.removeSync('./_user/db/test.sqlite')
    DataBaseHelper.isTesting = true
    Log.setOptions({
        logLevel: EEasyDebugLogLevel.Warning,
        stackLevel: EEasyDebugLogLevel.Warning,
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
        await a.saveMain(new ConfigMain())
        s.saveMain(new ConfigMain())
    })
    await t.step('load single', async () => {
        const configMain_a = await a.loadMain(new ConfigMain())
        const configMain_s = s.loadMain(new ConfigMain())
        assert(configMain_a)
        assert(configMain_s)
        assertEquals(configMain_s, configMain_a)
    })
    await t.step('save main & delete', async()=>{
        const instance = new ConfigController()
        const savedKey = s.saveMain(instance)
        assert(savedKey)
        const success = s.delete(instance, s.OBJECT_MAIN_KEY)
        assert(success)
        const item = s.loadItem(instance, s.OBJECT_MAIN_KEY)
        assert(item === undefined)
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
    await t.step('load by ID', async () => {
        const a_item = await a.loadById(1)
        assert(a_item)
        const s_item = s.loadById(1)
        assert(s_item)
        assertEquals(a_item, s_item)
    })
    await t.step('fill sub items', async () => {
        // Create presets and load the row IDs for them
        const ckey = 'Child'
        const preset = new PresetAudioChannel()
        preset.channel = 100
        const a_ckey = await a.save(preset, ckey)
        const s_ckey = s.save(preset, ckey)
        assert(a_ckey)
        assert(s_ckey)
        assertEquals(ckey, a_ckey)
        assertEquals(ckey, s_ckey)
        assertEquals(a_ckey, s_ckey)
        const a_cid = await a.loadID(preset.__getClass(), a_ckey)
        const s_cid = s.loadID(preset.__getClass(), a_ckey)
        assert(a_cid)
        assert(s_cid)

        // We don't test the async library, because it will use the new AbstractData and try to populate from the wrong database, thus failing.
        const pkey = 'Parent'
        const parent = new ActionAudio()
        parent.channel = s_cid
        const s_pkey = s.save(parent, pkey)

        // Check so it saved and that the object fills properly with the right item
        assert(s_pkey)
        const s_item = DataBaseHelper.loadItem(parent, s_pkey, undefined, true)
        const id = ((s_item?.filledData?.channel) as DataEntries<PresetAudioChannel>|undefined)?.dataSingle?.id
        assert(id)
        assertEquals(s_item?.data?.channel, id)
    })
    await t.step('get next key', async () => {
        const childInstance = new ActionCustom()

        await a.saveMain(new ConfigSpeech())
        await a.save(childInstance, `${a.OBJECT_MAIN_KEY} Custom`)
        const a_p = await a.loadItem(new ConfigSpeech(), a.OBJECT_MAIN_KEY)
        assert(a_p)
        const a_key = await a.getNextKey(childInstance.__getClass(), a_p?.id ?? 0, true)
        assert(a_key)

        s.saveMain(new ConfigSpeech())
        s.save(childInstance, `${s.OBJECT_MAIN_KEY} Custom`)
        const s_p = s.loadItem(new ConfigSpeech(), s.OBJECT_MAIN_KEY)
        assert(s_p)
        const s_key = s.getNextKey(childInstance.__getClass(), s_p?.id ?? 0, true)
        assert(s_key)

        assertEquals(a_key, s_key)
    })
    await t.step('get row IDs with labels', async () => {

    })
    await t.step('classes with counts using wildcard', async () => {

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