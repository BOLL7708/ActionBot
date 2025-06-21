import {assert, assertEquals} from '@std/assert'
import '../../lib/index.ts'
import {assertFalse} from '@std/assert/false'
import {ConfigExample} from '../../lib/Objects/Data/Config/ConfigExample.ts'
import {ConfigTest} from '../../lib/Objects/Data/Config/ConfigTest.ts'
import {PresetTest} from '../../lib/Objects/Data/Preset/PresetTest.ts'
import Log, {ELogLevel} from '../../lib/SharedUtils/Log.ts'
import DatabaseHelper from '../Helpers/DatabaseHelper.ts'
import TestUtils from '../Utils/TestUtils.ts'

Deno.test('init', () => {
    Log.setLogLevel(ELogLevel.Verbose)
    DatabaseHelper.isTesting = true
})

Deno.test('single save & load with key, check values', () => {
    TestUtils.truncateDatabase()
    const mainConfigTest = DatabaseHelper.loadJsonByGroup(ConfigTest.name, DatabaseHelper.OBJECT_MAIN_KEY)
    assertEquals(mainConfigTest, [])
    const config = new ConfigTest()
    config.singleNumber = 1024
    config.singleString = 'We are testing'
    const json_blob = JSON.stringify(config)
    assert(json_blob.length > 0)
    assert(!!DatabaseHelper.saveJson({
        group_key: DatabaseHelper.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: json_blob,
        parent_id: null
    }))
    const result = DatabaseHelper.loadJsonByGroup(ConfigTest.name, DatabaseHelper.OBJECT_MAIN_KEY)
    const loadedJson = result?.[0].json_blob ?? ''
    assertEquals(json_blob, loadedJson)
    const remadeItem = new ConfigTest().__apply(loadedJson)
    assertEquals(config, remadeItem)
    assertEquals(remadeItem.singleNumber, config.singleNumber)
    assertEquals(remadeItem.singleString, config.singleString)
})
Deno.test('save & load many with keys and IDs, test failure cases, delete', () => {
    TestUtils.truncateDatabase()
    const config = new ConfigTest()
    const configKeys: string[] = []
    const configIds: number[] = []
    for (let i = 0; i < 10; i++) {
        config.singleNumber = i
        const key = `Testing-${i}`
        configKeys.push(key)
        const id = DatabaseHelper.saveJson({
            group_key: key,
            group_class: ConfigTest.name,
            json_blob: JSON.stringify(config),
            parent_id: null
        })
        assert(id)
        configIds.push(id)
    }
    const other = new ConfigExample()
    const otherKeys: string[] = []
    const otherIds: number[] = []
    for (let i = 0; i < 5; i++) {
        config.singleNumber = i
        const key = `Other-${i}`
        otherKeys.push(key)
        const id = DatabaseHelper.saveJson({
            group_key: `Other-${i}`,
            group_class: ConfigExample.name,
            json_blob: JSON.stringify(other),
            parent_id: null
        })
        assert(id)
        otherIds.push(id)
    }

    // Select
    // Keys
    assertEquals(0, DatabaseHelper.loadJsonByGroup(ConfigExample.name, configKeys)?.length)
    assertEquals(configKeys.length, DatabaseHelper.loadJsonByGroup(ConfigTest.name, configKeys)?.length)
    assertEquals(Math.floor(configKeys.length / 2), DatabaseHelper.loadJsonByGroup(ConfigTest.name, configKeys.slice(0, configKeys.length / 2))?.length)
    // Ids
    assertEquals(0, DatabaseHelper.loadJsonByRowId(configIds, 1)?.length)
    assertEquals(configIds.length, DatabaseHelper.loadJsonByRowId(configIds)?.length)
    assertEquals(Math.floor(configIds.length / 2), DatabaseHelper.loadJsonByRowId(configIds.slice(0, configIds.length / 2))?.length)

    // Keys
    assertEquals(0, DatabaseHelper.loadJsonByGroup(ConfigTest.name, otherKeys)?.length)
    assertEquals(otherKeys.length, DatabaseHelper.loadJsonByGroup(ConfigExample.name, otherKeys)?.length)
    assertEquals(Math.floor(otherKeys.length / 2), DatabaseHelper.loadJsonByGroup(ConfigExample.name, otherKeys.slice(0, otherKeys.length / 2))?.length)
    // Ids
    assertEquals(0, DatabaseHelper.loadJsonByRowId(otherIds, 1)?.length)
    assertEquals(otherIds.length, DatabaseHelper.loadJsonByRowId(otherIds)?.length)
    assertEquals(Math.floor(otherIds.length / 2), DatabaseHelper.loadJsonByRowId(otherIds.slice(0, otherIds.length / 2))?.length)

    // Delete
    assertEquals(configKeys.length, DatabaseHelper.deleteJsonByGroup(ConfigTest.name, configKeys))
    assertEquals(0, DatabaseHelper.loadJsonByGroup(ConfigTest.name, configKeys)?.length)
    assertEquals(otherIds.length, DatabaseHelper.deleteJsonById(otherIds))
    assertEquals(0, DatabaseHelper.loadJsonByRowId(otherIds)?.length)
})

Deno.test('parent id, associate child and cascade delete', () => {
    TestUtils.truncateDatabase()
    const parent = new ConfigTest()
    const parent_id = DatabaseHelper.saveJson({
        group_key: DatabaseHelper.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
        parent_id: null
    })
    assert(parent_id)
    const child = new PresetTest()
    const child_id = DatabaseHelper.saveJson({
        group_key: null,
        group_class: PresetTest.name,
        json_blob: JSON.stringify(child),
        parent_id
    })
    assert(child_id)
    parent.singleReference = child_id
    assert(DatabaseHelper.saveJson({
        group_key: DatabaseHelper.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
        parent_id: null,
        row_id: parent_id
    }))

    const child_json = DatabaseHelper.loadJsonByRowId(child_id, parent_id)
    assertEquals(child_json?.[0].row_id, child_id)
    assertEquals(child_json?.[0].parent_id, parent_id)
    assertEquals(child_json?.[0].group_key, null)

    const parent_json = DatabaseHelper.loadJsonByRowId(parent_id)
    assertEquals(parent_json?.[0].row_id, parent_id)
    assertEquals(parent_json?.[0].parent_id, null)
    assertEquals(parent_json?.[0].group_key, DatabaseHelper.OBJECT_MAIN_KEY)

    assert(DatabaseHelper.deleteJsonById(parent_id)) // Cascade delete
    assertFalse(DatabaseHelper.loadJsonByRowId(parent_id)?.length)
    assertFalse(DatabaseHelper.loadJsonByRowId(child_id)?.length)
})

// Deno.test('', () => {
//     TestUtils.truncateDatabase()
// })

Deno.test('deinit', () => {
    DatabaseHelper.closeConnection()
})