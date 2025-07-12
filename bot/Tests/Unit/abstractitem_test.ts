import {assertEquals} from '@std/assert'
import {ConfigTest} from '../../../lib/Objects/Item/Config/ConfigTest.ts'
import Log, {ELogLevel} from '../../../lib/SharedUtils/Log.ts'
import Test from '../../Utils/Test.ts'

Test.run('init', () => {
    Log.setLogLevel(ELogLevel.Verbose)
    Test.truncateData()
})

Test.run('Apply values', () => {
    Test.truncateData()

    const config = new ConfigTest()
    config.singleString = 'a string'
    assertEquals(config.singleString, 'a string')
    config.__apply({singleString: 'new string'})
    assertEquals(config.singleString, 'new string')
    config.__apply({singleString: 100})
    assertEquals(config.singleString, '100')
})