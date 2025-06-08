import '../Runners/index.ts'
import {assertEquals} from 'jsr:@std/assert'
import {ConfigAuth} from '../../lib/Objects/Data/Config/ConfigAuth.ts'
import {ConfigTest, ConfigTestSub} from '../../lib/Objects/Data/Config/ConfigTest.ts'
import {DataUtils} from '../../lib/Objects/Data/DataUtils.ts'
import {EnlistData} from '../../lib/Objects/Data/EnlistData.ts'
import {PresetTest} from '../../lib/Objects/Data/Preset/PresetTest.ts'
import DatabaseHelper from '../Helpers/DatabaseHelper.ts'
import TestUtils from '../Utils/TestUtils.ts'

Deno.test('init', async () => {
    EnlistData.run()
    await TestUtils.resetDatabases()
    DatabaseHelper.isTesting = true
})

Deno.test('simple data reinstantiation', () => {
    const data = new ConfigAuth()
    data.username = 'HELLO'
    data.passwordSalt = 'SALT'
    data.passwordHash = 'THE_HASH'
    const json = JSON.stringify(data)
    const data2 = new ConfigAuth()
    data2.__apply(JSON.parse(json), false)
    assertEquals(data, data2)
})

Deno.test('complex data reinstantiation', () => {
    const data = new ConfigTest()
    const preset = new PresetTest()
    preset.value = 'A test is ongoing!'
    const presetKey = DatabaseHelper.saveMain(preset) ?? ''
    const presetId = DatabaseHelper.loadId(PresetTest.ref.build(), presetKey)

    data.singleReference = presetId
    data.singleString = 'ThisIsNotSub'
    DatabaseHelper.saveMain(data) // TODO: This can explode when tests are run in batch, but fine solo... ?

    const data2 = DatabaseHelper.loadMain<ConfigTest>(new ConfigTest(), false)
    const data3 = DatabaseHelper.loadMain<ConfigTest>(new ConfigTest(), true)
    assertEquals(data, data2)
    assertEquals(data2.singleReference, presetId)
    const preset2 = DataUtils.ensureData(data3.singleReference)
    assertEquals(preset, preset2)
})

Deno.test('shut down', ()=>{
    DatabaseHelper.closeConnection()
})