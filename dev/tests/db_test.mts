import {assert, assertEquals} from 'jsr:@std/assert'
import Log, {EEasyDebugLogLevel} from '../../bot/EasyTSUtils/Log.mts'
import DatabaseHelper, {IDatabaseItem} from '../../bot/Helpers/DatabaseHelper.mts'
import DataBaseHelper_OLD, {IDataBaseListItems, type IDataBaseListItem} from '../../bot/Helpers/DataBaseHelper_OLD.mts'
import {IDictionary} from '../../bot/Interfaces/igeneral.mts'
import DatabaseSingleton from '../../bot/Singletons/DatabaseSingleton.mts'
import {ActionAudio, ActionChat, ActionCustom, ActionLabel, ConfigController, ConfigMain, ConfigSpeech, DataEntries, EnlistData, EventDefault, PresetAudioChannel} from '../../lib-shared/index.mts'

Deno.test('init', async () => {
    EnlistData.run()
    await resetDatabases()
    DatabaseHelper.isTesting = true
    Log.setOptions({
        logLevel: EEasyDebugLogLevel.Warning,
        stackLevel: EEasyDebugLogLevel.Warning,
        useColors: true,
        capitalizeTag: false,
        tagPrefix: '[',
        tagPostfix: '] '
    })
})

/**
 * Reset all data to make tests more predictable
 */
async function resetDatabases(): Promise<void> {
    let doneOld = false
    let count = 0
    while (!doneOld) {
        try {
            Deno.removeSync('./_user/db/test_old.sqlite')
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

    const db = DatabaseSingleton.get(true)
    await Promise.all([
        new Promise((resolve) => {
            db.kill()
            setTimeout(resolve, 100)
        }),
        new Promise((resolve) => {
            try {
                Deno.removeSync('./_user/db/test.sqlite')
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

function compareSets(
    a: IDictionary<IDatabaseItem<any>> | IDictionary<IDataBaseListItem> | undefined,
    b: IDictionary<IDatabaseItem<any>> | IDictionary<IDataBaseListItem> | undefined,
    skipKeys: boolean = false,
    sortBy: string | undefined = undefined
): void {
    if (a === undefined || b === undefined) return
    if (skipKeys && sortBy) {
        const sortValues = (a: any, b: any): number => {
            const aVal = `${a[sortBy]}`
            const bVal = `${b[sortBy]}`
            return aVal.localeCompare(bVal)
        }
        const aValues = Object.values(a).sort(sortValues)
        const bValues = Object.values(b).sort(sortValues)
        for (let i = 0; i < Object.keys(a).length; i++) {
            const item_a = aValues[i]
            const item_b = bValues[i]
            delete (item_a as any).id
            delete (item_b as any).id
            assertEquals(item_a, item_b)
        }
    } else {
        assertEquals(Object.keys(a), Object.keys(b))
        for (const [key, item_a] of Object.entries(a)) {
            const item_b = b[key]
            // Deleting ID as it is for some reason a mismatch, as the old code increments ID twice per row, interestingly enough.
            delete (item_a as any).id
            delete (item_b as any).id
            assertEquals(item_a, item_b)
        }
    }
}

Deno.test('save & load', async (t) => {
    const a = DataBaseHelper_OLD
    const s = DatabaseHelper
    await t.step('save single', async () => {
        await resetDatabases()
        await a.saveMain(new ConfigMain())
        s.saveMain(new ConfigMain())
    })
    await t.step('load single', async () => {
        await resetDatabases()
        const configMain_a = await a.loadMain(new ConfigMain())
        const configMain_s = s.loadMain(new ConfigMain())
        assert(configMain_a)
        assert(configMain_s)
        assertEquals(configMain_s, configMain_a)
    })
    await t.step('save main & delete', async () => {
        await resetDatabases()
        const instance = new ConfigController()
        const savedKey = s.saveMain(instance)
        assert(savedKey)
        const success = s.delete(instance, s.OBJECT_MAIN_KEY)
        assert(success)
        const item = s.loadItem(instance, s.OBJECT_MAIN_KEY)
        assert(item === undefined)
    })
    await t.step('save & load multi', async () => {
        await resetDatabases()
        const c = 10
        const saveMe = new ActionCustom()
        for (let i = 0; i < c; i++) {
            await a.save(saveMe, `actionCustom-${i}`)
            s.save(saveMe, `actionCustom-${i}`)
        }
        const all_a = await a.loadAll(new ActionCustom())
        assertEquals(Object.keys(all_a ?? {}).length, c)
        const all_s = s.loadAll(new ActionCustom())
        assertEquals(Object.keys(all_s ?? {}).length, c)
        compareSets(all_a, all_s)
    })
    await t.step('update key', async () => {
        await resetDatabases()
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
        await resetDatabases()
        await a.saveMain(new ConfigMain())
        const a_item = await a.loadById(1)
        assert(a_item)
        s.saveMain(new ConfigMain())
        const s_item = s.loadById(1)
        assert(s_item)
        assertEquals(a_item, s_item)
    })
    await t.step('fill sub items', async () => {
        await resetDatabases()
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
        const s_cid = s.loadId(preset.__getClass(), a_ckey)
        assert(a_cid)
        assert(s_cid)

        // We don't test the async library, because it will use the new AbstractData and try to populate from the wrong database, thus failing.
        const pkey = 'Parent'
        const parent = new ActionAudio()
        parent.channel = s_cid
        const s_pkey = s.save(parent, pkey)

        // Check so it saved and that the object fills properly with the right item
        assert(s_pkey)
        const s_item = DatabaseHelper.loadItem(parent, s_pkey, undefined, true)
        const id = ((s_item?.filledData?.channel) as DataEntries<PresetAudioChannel> | undefined)?.dataSingle?.id
        assert(id)
        assertEquals(s_item?.data?.channel, id)
    })
    await t.step('get next key', async () => {
        await resetDatabases()
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
        await resetDatabases()
        const parent = new ConfigSpeech()
        const parentKey = 'ParentForLabels'
        await a.save(parent, parentKey)
        s.save(parent, parentKey)
        const a_pid = await a.loadID(parent.__getClass(), parentKey)
        const s_pid = s.loadId(parent.__getClass(), parentKey)

        const c = 10
        const saveMe = new ActionLabel()
        for (let i = 0; i < c; i++) {
            saveMe.fileName = `UseMeAsLabel-${i}`
            await a.save(saveMe, `actionLabel-${i}`, undefined, i < 5 ? undefined : a_pid)
            s.save(saveMe, `actionLabel-${i}`, undefined, i < 5 ? undefined : s_pid)
        }
        const clazz = saveMe.__getClass()

        const a_res = await a.loadIDsWithLabelForClass(clazz)
        const s_res = s.loadIdsWithLabelForClass(clazz)
        compareSets(a_res as IDictionary<IDataBaseListItem>, s_res, true, 'key')

        const a_resl = await a.loadIDsWithLabelForClass(clazz, 'fileName', undefined)
        const s_resl = s.loadIdsWithLabelForClass(clazz, 'fileName', undefined)
        compareSets(a_resl as IDictionary<IDataBaseListItem>, s_resl, true, 'key')

        const a_resp = await a.loadIDsWithLabelForClass(clazz, 'fileName', a_pid)
        const s_resp = s.loadIdsWithLabelForClass(clazz, 'fileName', s_pid)
        compareSets(a_resp as IDictionary<IDataBaseListItem>, s_resp, true, 'key')
    })
    await t.step('classes with counts using wildcard', async () => {
        await resetDatabases()
        // Prepare
        const count = 10
        for (let i = 0; i < count; i++) {
            await a.save(new ActionCustom(), `Key${i}`)
            await a.save(new ActionChat(), `Key${i}`)
            s.save(new ActionCustom(), `Key${i}`)
            s.save(new ActionChat(), `Key${i}`)
        }
        const clazz = new ActionCustom().__getClass()

        // Just list counts on absolute match
        const a_result = await a.loadClassesWithCounts(clazz)
        assert(a_result)

        const s_result = s.loadClassesWithCounts(clazz)
        assert(s_result)

        assertEquals(a_result[clazz], 10)
        assertEquals(s_result[clazz], 10)
        assertEquals(a_result, s_result)

        // List with wildcard
        const like = 'Action*'
        const a_result2 = await a.loadClassesWithCounts(like)
        assert(a_result)

        const s_result2 = s.loadClassesWithCounts(like)
        assert(s_result2)

        assertEquals(Object.keys(a_result2).length, 2)
        assertEquals(Object.keys(s_result2).length, 2)
        assertEquals(a_result2, s_result2)

        // Filter on parent, old lib cannot do this, not sure if actually used
        const parent = new ConfigSpeech()
        const parentKey = 'ParentForCounts'
        const childKey = 'ChildForCounts'

        s.save(parent, parentKey)
        const s_pid = s.loadId(parent.__getClass(), parentKey)
        assert(s_pid)
        s.save(new ActionCustom(), childKey, undefined, s_pid)
        const s_result3 = s.loadClassesWithCounts(clazz, s_pid)
        assertEquals(s_result3, {[clazz]: 1})
    })
    await t.step('Load ID classes', async () => {
        const a_key1 = await a.saveMain(new ConfigController())
        const a_key2 = await a.saveMain(new ActionCustom())
        const a_key3 = await a.saveMain(new EventDefault())
        const a_id1 = await a.loadID(ConfigController.name, a_key1 ?? '')
        const a_id2 = await a.loadID(ActionCustom.name, a_key2 ?? '')
        const a_id3 = await a.loadID(EventDefault.name, a_key3 ?? '')
        const a_classes = await a.loadIDClasses([a_id1, a_id2, a_id3])

        const s_key1 = s.saveMain(new ConfigController())
        const s_key2 = s.saveMain(new ActionCustom())
        const s_key3 = s.saveMain(new EventDefault())
        const s_id1 = s.loadId(ConfigController.name, s_key1 ?? '')
        const s_id2 = s.loadId(ActionCustom.name, s_key2 ?? '')
        const s_id3 = s.loadId(EventDefault.name, s_key3 ?? '')
        const s_classes = s.loadIdClasses([s_id1, s_id2, s_id3])

        assertEquals(Object.values(a_classes), Object.values(s_classes))
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
    DatabaseHelper.closeConnection()
})