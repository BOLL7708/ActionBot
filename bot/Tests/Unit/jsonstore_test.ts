import {assertFalse} from 'jsr:@std/assert/false'
import {assert, assertEquals} from 'jsr:@std/assert'
import '../../../lib/index.ts'
import {ConfigExample, ConfigTest, PresetTest} from '../../../lib/index.ts'
import Log, {ELogLevel} from '../../../lib/SharedUtils/Log.ts'
import JsonStoreHelper from '../../Helpers/JsonStoreHelper.ts'
import TestUtils from '../../Utils/TestUtils.ts'

Deno.test('init', () => {
    Log.setLogLevel(ELogLevel.Verbose)
    JsonStoreHelper.isTesting = true
})

Deno.test('single save & load with key, check values', () => {
    TestUtils.truncateDatabase()
    const mainConfigTest = JsonStoreHelper.loadJsonByGroupAndKey(ConfigTest.name, JsonStoreHelper.OBJECT_MAIN_KEY)
    assertEquals(mainConfigTest, [])
    const config = new ConfigTest()
    config.singleNumber = 1024
    config.singleString = 'We are testing'
    const json_blob = JSON.stringify(config)
    assert(json_blob.length > 0)
    assert(!!JsonStoreHelper.saveJson({
        group_key: JsonStoreHelper.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: json_blob,
        parent_id: null
    }))
    const result = JsonStoreHelper.loadJsonByGroupAndKey(ConfigTest.name, JsonStoreHelper.OBJECT_MAIN_KEY)
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
        const id = JsonStoreHelper.saveJson({
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
        const id = JsonStoreHelper.saveJson({
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
    assertEquals(0, JsonStoreHelper.loadJsonByGroupAndKey(ConfigExample.name, configKeys)?.length)
    assertEquals(configKeys.length, JsonStoreHelper.loadJsonByGroupAndKey(ConfigTest.name, configKeys)?.length)
    assertEquals(Math.floor(configKeys.length / 2), JsonStoreHelper.loadJsonByGroupAndKey(ConfigTest.name, configKeys.slice(0, configKeys.length / 2))?.length)
    // Ids
    assertEquals(0, JsonStoreHelper.loadJsonByRowId(configIds, 1)?.length)
    assertEquals(configIds.length, JsonStoreHelper.loadJsonByRowId(configIds)?.length)
    assertEquals(Math.floor(configIds.length / 2), JsonStoreHelper.loadJsonByRowId(configIds.slice(0, configIds.length / 2))?.length)

    // Keys
    assertEquals(0, JsonStoreHelper.loadJsonByGroupAndKey(ConfigTest.name, otherKeys)?.length)
    assertEquals(otherKeys.length, JsonStoreHelper.loadJsonByGroupAndKey(ConfigExample.name, otherKeys)?.length)
    assertEquals(Math.floor(otherKeys.length / 2), JsonStoreHelper.loadJsonByGroupAndKey(ConfigExample.name, otherKeys.slice(0, otherKeys.length / 2))?.length)
    // Ids
    assertEquals(0, JsonStoreHelper.loadJsonByRowId(otherIds, 1)?.length)
    assertEquals(otherIds.length, JsonStoreHelper.loadJsonByRowId(otherIds)?.length)
    assertEquals(Math.floor(otherIds.length / 2), JsonStoreHelper.loadJsonByRowId(otherIds.slice(0, otherIds.length / 2))?.length)

    // Delete
    assertEquals(configKeys.length, JsonStoreHelper.deleteJsonByGroupAndKey(ConfigTest.name, configKeys))
    assertEquals(0, JsonStoreHelper.loadJsonByGroupAndKey(ConfigTest.name, configKeys)?.length)
    assertEquals(otherIds.length, JsonStoreHelper.deleteJsonById(otherIds))
    assertEquals(0, JsonStoreHelper.loadJsonByRowId(otherIds)?.length)
})

Deno.test('parent id, associate child and cascade delete', () => {
    TestUtils.truncateDatabase()
    const parent = new ConfigTest()
    const parent_id = JsonStoreHelper.saveJson({
        group_key: JsonStoreHelper.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
        parent_id: null
    })
    assert(parent_id)
    const child = new PresetTest()
    const child_id = JsonStoreHelper.saveJson({
        group_key: null,
        group_class: PresetTest.name,
        json_blob: JSON.stringify(child),
        parent_id
    })
    assert(child_id)
    parent.singleReference = child_id
    assert(JsonStoreHelper.saveJson({
        group_key: JsonStoreHelper.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
        parent_id: null,
        row_id: parent_id
    }))

    const child_json = JsonStoreHelper.loadJsonByRowId(child_id, parent_id)
    assertEquals(child_json?.[0].row_id, child_id)
    assertEquals(child_json?.[0].parent_id, parent_id)
    assertEquals(child_json?.[0].group_key, null)

    const parent_json = JsonStoreHelper.loadJsonByRowId(parent_id)
    assertEquals(parent_json?.[0].row_id, parent_id)
    assertEquals(parent_json?.[0].parent_id, null)
    assertEquals(parent_json?.[0].group_key, JsonStoreHelper.OBJECT_MAIN_KEY)

    assert(JsonStoreHelper.deleteJsonById(parent_id)) // Cascade delete
    assertFalse(JsonStoreHelper.loadJsonByRowId(parent_id)?.length)
    assertFalse(JsonStoreHelper.loadJsonByRowId(child_id)?.length)
})

Deno.test('convenience actions', () => {
    TestUtils.truncateDatabase()
    const child = new PresetTest()
    child.value = 'Testing'
    const childId = JsonStoreHelper.saveJson({
        group_key: 'GlobalPreset',
        group_class: PresetTest.name,
        json_blob: JSON.stringify(child),
        parent_id: null
    })
    const parent = new ConfigTest()
    parent.singleReference = childId
    const parentId = JsonStoreHelper.saveJson({
        group_key: 'Parent',
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
        parent_id: null
    })
    const result = JsonStoreHelper.loadJsonAndItemsByGroupAndKey(ConfigTest.name, 'Parent')
    assertEquals(Object.keys(result).length, 2)

    // TODO: Is this enough, more?
})

Deno.test('deinit', () => {
    JsonStoreHelper.closeConnection()
})