import '../Runners/index.ts' // This is required so the prototypes get extended.
import {assert, assertEquals} from 'jsr:@std/assert'
import {
    AbstractItem,
    ActionTest,
    ConfigExample,
    ConfigTest,
    DataEntries,
    EnlistData,
    EventTest,
    IDatabaseItem,
    PresetTest,
    SettingTest,
    TriggerTest
} from '../../lib/index.ts'
import ItemStore from '../Database/ItemStore.ts'
import JsonStore from '../Database/JsonStore.ts'
import TestUtils from '../Utils/TestUtils.ts'

Deno.test('init', async () => {
    EnlistData.run()
    await TestUtils.resetDatabases()
    JsonStore.isTesting = true
})

Deno.test('save & load', async (t) => {
    const db = ItemStore
    await t.step('save single', async () => {
        await TestUtils.resetDatabases()
        db.saveMain(new SettingTest())
    })
    await t.step('load single', async () => {
        await TestUtils.resetDatabases()
        const settingTest = db.loadMain(SettingTest)
        assert(settingTest)
        assertEquals(settingTest, new SettingTest())
    })
    await t.step('save main & delete', async () => {
        await TestUtils.resetDatabases()
        const instance = new ConfigTest()
        const savedKey = db.saveMain(instance)
        assert(savedKey)
        const success = JsonStore.deleteByGroupAndKey(ConfigTest.name, JsonStore.OBJECT_MAIN_KEY)
        assert(success)
        const item = JsonStore.loadByGroupAndKey(ConfigTest.name, JsonStore.OBJECT_MAIN_KEY)
        assert(item === undefined)
    })
    await t.step('save & load multi', async () => {
        await TestUtils.resetDatabases()
        const c = 10
        const saveMe = new ActionTest()
        for (let i = 0; i < c; i++) {
            JsonStore.save({
                group_class: ActionTest.name,
                group_key: `actionSystem-${i}`,
                json_blob: JSON.stringify(saveMe),
                parent_id: null
            })
        }
        const all = db.loadAll(new ActionTest())
        const keys = Object.keys(all ?? {})
        assertEquals(keys.length, c)
        const allKeys = [
            'actionSystem-0',
            'actionSystem-1',
            'actionSystem-2',
            'actionSystem-3',
            'actionSystem-4',
            'actionSystem-5',
            'actionSystem-6',
            'actionSystem-7',
            'actionSystem-8',
            'actionSystem-9'
        ]
        assertEquals(allKeys, keys)
    })
    await t.step('update key', async () => {
        await TestUtils.resetDatabases()
        const key1 = 'FirstKey', key2 = 'SecondKey'
        db.save(new ActionTest(), key1)
        let result = db.load(new ActionTest(), key1)
        assert(result)
        db.save(new ActionTest(), key1, key2)
        result = db.load(new ActionTest(), key2)
        assert(result)
    })
    await t.step('load by ID', async () => {
        await TestUtils.resetDatabases()
        const original = new SettingTest('Testing', 100, true)
        const key = db.saveMain(original)
        const id = db.loadId(original.__getClass(), `${key}`)
        const item = db.loadById(id)
        assert(item)
        const compareWithThis: IDatabaseItem<AbstractItem> = {
            class: 'SettingTest',
            data: original,
            filledData: original,
            id: 1,
            key: 'Main',
            pid: null
        }
        assertEquals(compareWithThis, item)
    })
    await t.step('fill sub items', async () => {
        await TestUtils.resetDatabases()
        // Create presets and load the row IDs for them
        const childKey = 'Child'
        const setting = new SettingTest()
        setting.numberValue = 100
        const savedChildKey = db.save(setting, childKey)
        assert(savedChildKey)
        assertEquals(childKey, savedChildKey)
        assertEquals(childKey, savedChildKey)
        const childId = db.loadId(setting.__getClass(), savedChildKey)
        assert(childId)

        const parentKey = 'Parent'
        const parent = new TriggerTest()
        parent.setting = childId
        const savedParentKey = db.save(parent, parentKey)

        // Check so it saved and that the object fills properly with the right item
        assert(savedParentKey)
        const item = ItemStore.loadItem(parent, parentKey, undefined, true)
        const id = ((item?.filledData?.setting) as DataEntries<PresetTest> | undefined)?.dataSingle?.id
        assert(id)
        assertEquals(item?.data?.setting, id)
    })
    await t.step('get next key', async () => {
        await TestUtils.resetDatabases()
        const childInstance = new ActionTest()

        db.saveMain(new ConfigTest())
        db.save(childInstance, `${db.OBJECT_MAIN_KEY} Test`)
        const s_p = db.loadItem(new ConfigTest(), db.OBJECT_MAIN_KEY)
        assert(s_p)
        const s_key = db.getNextKey(childInstance.__getClass(), s_p?.id ?? 0, true)
        assert(s_key)
        assertEquals({ key: 'Main Test 1' }, s_key)
    })
    await t.step('get row IDs with labels', async () => {
        await TestUtils.resetDatabases()
        const parent = new ConfigTest()
        const parentKey = 'ParentForLabels'
        db.save(parent, parentKey)
        const s_pid = db.loadId(parent.__getClass(), parentKey)

        const c = 10
        const saveMe = new SettingTest()
        for (let i = 0; i < c; i++) {
            saveMe.stringValue = `UseMeAsLabel-${i}`
            db.save(saveMe, `settingTest-${i}`, undefined, i < 5 ? undefined : s_pid)
        }
        const clazz = saveMe.__getClass()

        let pidCount = 0
        let pidNullCount = 0
        const s_res = db.loadIdsWithLabelForClass(clazz)
        for (const [id, row] of Object.entries(s_res)) {
            assert(parseInt(id))
            assert(row.key.startsWith('settingTest-'))
            assert(row.label.length == 0)
            if (row.pid == null) pidNullCount++
            else pidCount++
        }
        assert(pidCount == 5)
        assert(pidNullCount == 5)

        pidCount = 0
        pidNullCount = 0
        const s_resl = db.loadIdsWithLabelForClass(clazz, 'stringValue', undefined)
        for (const [id, row] of Object.entries(s_resl)) {
            assert(parseInt(id))
            assert(row.key.startsWith('settingTest-'))
            assert(row.label.startsWith('UseMeAsLabel-'))
            if (row.pid == null) pidNullCount++
            else pidCount++
        }
        assert(pidCount == 5)
        assert(pidNullCount == 5)

        pidCount = 0
        pidNullCount = 0
        const s_resp = db.loadIdsWithLabelForClass(clazz, 'stringValue', s_pid)
        for (const [id, row] of Object.entries(s_resp)) {
            assert(parseInt(id))
            assert(row.key.startsWith('settingTest-'))
            assert(row.label.startsWith('UseMeAsLabel-'))
            if (row.pid == null) pidNullCount++
            else if (row.pid == s_pid) pidCount++
        }
        assert(pidCount == 5)
        assert(pidNullCount == 5)
    })
    await t.step('classes with counts using wildcard', async () => {
        await TestUtils.resetDatabases()
        // Prepare
        const count = 10
        for (let i = 0; i < count; i++) {
            db.save(new ConfigExample(), `Key${i}`)
            db.save(new ConfigTest(), `Key${i}`)
        }
        const clazz = new ConfigExample().__getClass()

        // Just list counts on absolute match
        const s_result = db.loadClassesWithCounts(clazz)
        assert(s_result)
        assertEquals(s_result[clazz], 10)
        assertEquals(
            {
                ConfigExample: 10
            },
            s_result
        )

        // List with wildcard
        const like = 'Config*'
        const s_result2 = db.loadClassesWithCounts(like)
        assert(s_result2)
        assertEquals(Object.keys(s_result2).length, 2)
        assertEquals(
            {
                ConfigExample: 10,
                ConfigTest: 10
            },
            s_result2
        )

        // Filter on parent, old lib cannot do this, not sure if actually used
        const parent = new ConfigTest()
        const parentKey = 'ParentForCounts'
        const childKey = 'ChildForCounts'

        db.save(parent, parentKey)
        const parentId = db.loadId(parent.__getClass(), parentKey)
        assert(parentId)
        db.save(new ConfigExample(), childKey, undefined, parentId)
        const s_result3 = db.loadClassesWithCounts(clazz, parentId)
        assertEquals(s_result3, { [clazz]: 1 })
    })
    await t.step('Load ID classes', () => {
        const s_key1 = db.saveMain(new ConfigTest())
        const s_key2 = db.saveMain(new ActionTest())
        const s_key3 = db.saveMain(new EventTest())
        const s_id1 = db.loadId(ConfigTest.name, s_key1 ?? '')
        const s_id2 = db.loadId(ActionTest.name, s_key2 ?? '')
        const s_id3 = db.loadId(EventTest.name, s_key3 ?? '')
        const s_classes = db.loadIdClasses([s_id1, s_id2, s_id3])
        assertEquals(
            [
                'ActionTest',
                'ConfigTest',
                'EventTest'
            ],
            Object.values(s_classes).sort()
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
    JsonStore.closeConnection()
})
