import '../../Runners/index.ts'
import {assertEquals} from 'jsr:@std/assert'
import {ConfigAuth, ConfigTest, PresetTest} from '../../../lib/index.ts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.ts'
import JsonStoreHelper from '../../Helpers/JsonStoreHelper.ts'
import TestUtils from '../../Utils/TestUtils.ts'

Deno.test('init', async () => {
    await TestUtils.resetDatabases()
    JsonStoreHelper.isTesting = true
})

Deno.test('simple data reinstantiation', () => {
    const data = new ConfigAuth()
    data.username = 'HELLO'
    data.passwordSalt = 'SALT'
    data.passwordHash = 'THE_HASH'
    const json = JSON.stringify(data)
    const data2 = new ConfigAuth()
    data2.__apply(JSON.parse(json))
    assertEquals(data, data2)
})

Deno.test('complex data reinstantiation', () => {
    const data = new ConfigTest()
    const preset = new PresetTest()
    preset.value = 'A test is ongoing!'
    const presetId = DatabaseHelper.saveMain(preset) ?? ''

    data.singleReference = presetId
    data.singleString = 'ThisIsNotSub'
    DatabaseHelper.saveMain(data) // TODO: This can explode when tests are run in batch, but fine solo... ?

    const data2 = DatabaseHelper.loadMain<ConfigTest>(ConfigTest)
    assertEquals(data, data2)
    assertEquals(data2.singleReference, presetId)
    const preset2 = new PresetTest()
    preset2.__apply(data2.__children()[presetId])
    assertEquals(preset, preset2)
})

Deno.test('shut down', () => {
    JsonStoreHelper.closeConnection()
})