import '../../Runners/index.ts'
import {assertEquals} from 'jsr:@std/assert'
import {ConfigAuth, ConfigTest, PresetTest} from '../../../lib/index.ts'
import ItemStore from '../../Database/ItemStore.ts'
import JsonStore from '../../Database/JsonStore.ts'
import Test from '../../Utils/Test.ts'

Test.run('init', () => {
    Test.truncateData()
})

Test.run('simple data reinstantiation', () => {
    const data = new ConfigAuth()
    data.username = 'HELLO'
    data.passwordSalt = 'SALT'
    data.passwordHash = 'THE_HASH'
    const json = JSON.stringify(data)
    const data2 = new ConfigAuth()
    data2.__apply(JSON.parse(json))
    assertEquals(data, data2)
})

Test.run('complex data reinstantiation', () => {
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

Test.run('shut down', () => {
    JsonStore.closeConnection()
})