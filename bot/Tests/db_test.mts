import '../Runners/index.mts' // This is required so the prototypes get extended.
import {assert, assertEquals} from 'jsr:@std/assert'
import {ActionAudio, ActionChat, ActionCustom, ActionLabel, ConfigController, ConfigMain, ConfigSpeech, DataEntries, EnlistData, EventDefault, PresetAudioChannel} from '../../lib/index.mts'
import Log, {EEasyDebugLogLevel} from '../../lib/SharedUtils/Log.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'
import DatabaseSingleton from '../Singletons/DatabaseSingleton.mts'

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

    const db = DatabaseSingleton.get(true)
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

Deno.test('save & load', async (t) => {
    const s = DatabaseHelper
    await t.step('save single', async () => {
        await resetDatabases()
        s.saveMain(new ConfigMain())
    })
    await t.step('load single', async () => {
        await resetDatabases()
        const configMain_s = s.loadMain(new ConfigMain())
        assert(configMain_s)
        assertEquals(configMain_s, new ConfigMain())
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
            s.save(saveMe, `actionCustom-${i}`)
        }
        const all_s = s.loadAll(new ActionCustom())
        const keys = Object.keys(all_s ?? {})
        assertEquals(keys.length, c)
        const all = [
            'actionCustom-0',
            'actionCustom-1',
            'actionCustom-2',
            'actionCustom-3',
            'actionCustom-4',
            'actionCustom-5',
            'actionCustom-6',
            'actionCustom-7',
            'actionCustom-8',
            'actionCustom-9'
        ]
        assertEquals(all, keys)
    })
    await t.step('update key', async () => {
        await resetDatabases()
        const key1 = 'FirstKey', key2 = 'SecondKey'
        s.save(new ActionCustom(), key1)
        let r_s = s.load(new ActionCustom(), key1)
        assert(r_s)
        s.save(new ActionCustom(), key1, key2)
        r_s = s.load(new ActionCustom(), key2)
        assert(r_s)
    })
    await t.step('load by ID', async () => {
        await resetDatabases()
        s.saveMain(new ConfigMain())
        const s_item = s.loadById(1)
        assert(s_item)
        assertEquals({
            class: 'ConfigMain',
            data: new ConfigMain(),
            filledData: new ConfigMain(),
            id: 1,
            key: 'Main',
            pid: null
        }, s_item)
    })
    await t.step('fill sub items', async () => {
        await resetDatabases()
        // Create presets and load the row IDs for them
        const ckey = 'Child'
        const preset = new PresetAudioChannel()
        preset.channel = 100
        const s_ckey = s.save(preset, ckey)
        assert(s_ckey)
        assertEquals(ckey, s_ckey)
        assertEquals(ckey, s_ckey)
        const s_cid = s.loadId(preset.__getClass(), s_ckey)
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

        s.saveMain(new ConfigSpeech())
        s.save(childInstance, `${s.OBJECT_MAIN_KEY} Custom`)
        const s_p = s.loadItem(new ConfigSpeech(), s.OBJECT_MAIN_KEY)
        assert(s_p)
        const s_key = s.getNextKey(childInstance.__getClass(), s_p?.id ?? 0, true)
        assert(s_key)
        assertEquals({key: 'Main Custom 1'}, s_key)
    })
    await t.step('get row IDs with labels', async () => {
        await resetDatabases()
        const parent = new ConfigSpeech()
        const parentKey = 'ParentForLabels'
        s.save(parent, parentKey)
        const s_pid = s.loadId(parent.__getClass(), parentKey)

        const c = 10
        const saveMe = new ActionLabel()
        for (let i = 0; i < c; i++) {
            saveMe.fileName = `UseMeAsLabel-${i}`
            s.save(saveMe, `actionLabel-${i}`, undefined, i < 5 ? undefined : s_pid)
        }
        const clazz = saveMe.__getClass()

        let pidCount = 0
        let pidNullCount = 0
        const s_res = s.loadIdsWithLabelForClass(clazz)
        for(const [id, row] of Object.entries(s_res)) {
            assert(parseInt(id))
            assert(row.key.startsWith('actionLabel-'))
            assert(row.label.length == 0)
            if(row.pid == null) pidNullCount++
            else pidCount++
        }
        assert(pidCount == 5)
        assert(pidNullCount == 5)

        pidCount = 0
        pidNullCount = 0
        const s_resl = s.loadIdsWithLabelForClass(clazz, 'fileName', undefined)
        for(const [id, row] of Object.entries(s_resl)) {
            assert(parseInt(id))
            assert(row.key.startsWith('actionLabel-'))
            assert(row.label.startsWith('UseMeAsLabel-'))
            if(row.pid == null) pidNullCount++
            else pidCount++
        }
        assert(pidCount == 5)
        assert(pidNullCount == 5)

        pidCount = 0
        pidNullCount = 0
        const s_resp = s.loadIdsWithLabelForClass(clazz, 'fileName', s_pid)
        for(const [id, row] of Object.entries(s_resp)) {
            assert(parseInt(id))
            assert(row.key.startsWith('actionLabel-'))
            assert(row.label.startsWith('UseMeAsLabel-'))
            if(row.pid == null) pidNullCount++
            else if(row.pid == s_pid) pidCount++
        }
        assert(pidCount == 5)
        assert(pidNullCount == 5)
    })
    await t.step('classes with counts using wildcard', async () => {
        await resetDatabases()
        // Prepare
        const count = 10
        for (let i = 0; i < count; i++) {
            s.save(new ActionCustom(), `Key${i}`)
            s.save(new ActionChat(), `Key${i}`)
        }
        const clazz = new ActionCustom().__getClass()

        // Just list counts on absolute match
        const s_result = s.loadClassesWithCounts(clazz)
        assert(s_result)
        assertEquals(s_result[clazz], 10)
        assertEquals(
            {
                ActionCustom: 10
            },
            s_result
        )

        // List with wildcard
        const like = 'Action*'
        const s_result2 = s.loadClassesWithCounts(like)
        assert(s_result2)
        assertEquals(Object.keys(s_result2).length, 2)
        assertEquals(
            {
                ActionChat: 10,
                ActionCustom: 10
            },
            s_result2
        )

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
        const s_key1 = s.saveMain(new ConfigController())
        const s_key2 = s.saveMain(new ActionCustom())
        const s_key3 = s.saveMain(new EventDefault())
        const s_id1 = s.loadId(ConfigController.name, s_key1 ?? '')
        const s_id2 = s.loadId(ActionCustom.name, s_key2 ?? '')
        const s_id3 = s.loadId(EventDefault.name, s_key3 ?? '')
        const s_classes = s.loadIdClasses([s_id1, s_id2, s_id3])
        assertEquals(
            [
                'ConfigController',
                'ActionCustom',
                'EventDefault'
            ],
            Object.values(s_classes)
        )
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