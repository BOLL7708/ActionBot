import '../../Runners/index.ts'
import {assertEquals} from 'jsr:@std/assert'
import {ConfigAuth, ConfigTest, PresetTest} from '../../../lib/index.ts'
import ItemStore from '../../Database/ItemStore.ts'
import JsonStore from '../../Database/JsonStore.ts'
import TestUtils from '../../Utils/TestUtils.ts'

Deno.test('init', () => {
    TestUtils.truncateDatabase()
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
    const presetId = ItemStore.do.saveMain(preset) ?? ''

    data.singleReference = presetId
    data.singleString = 'ThisIsNotSub'
    ItemStore.do.saveMain(data)

    const data2 = ItemStore.do.loadMain<ConfigTest>(ConfigTest)
    assertEquals(data, data2)
    assertEquals(data2.singleReference, presetId)
    const preset2 = new PresetTest()
    preset2.__apply(data2.__children()[presetId])
    assertEquals(preset, preset2)
})

Deno.test('shut down', () => {
    JsonStore.closeConnection()
})