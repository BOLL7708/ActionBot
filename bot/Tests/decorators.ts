import '../../lib/index.ts'
import ItemHelper from '../../lib/Classes/ItemHelper.ts'
import {ConfigTest} from '../../lib/Objects/Item/Config/ConfigTest.ts'
import {ItemMap} from '../../lib/Objects/ItemMap.ts'
import Log, {ELogLevel} from '../../lib/SharedUtils/Log.ts'
import DatabaseHelper from '../Helpers/DatabaseHelper.ts'

Deno.test('init', () => {
    Log.setLogLevel(ELogLevel.Verbose)
})

Deno.test('metadata', () => {
    // console.log(ItemMap.get(ConfigTest.name))


})