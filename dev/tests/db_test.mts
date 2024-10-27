import { assertEquals } from 'jsr:@std/assert'
import { delay } from 'jsr:@std/async'
import DataBaseHelper from '../../bot/Helpers/DataBaseHelper.mts'

Deno.test('simple test', () => {
   Deno.removeSync('./_user/db/test.sqlite')
   DataBaseHelper.isTesting = true
   const data = JSON.stringify({ testData: true, testValue: 101 })
   DataBaseHelper.saveJson(data, 'TestClass', 'TestKey')



   const x = 1 + 2
   assertEquals(x, 3)
})

Deno.test('async test', async () => {
   const x = 1 + 2
   await delay(100)
   assertEquals(x, 3)
})

// Deno.test({
//    name: 'read file test',
//    permissions: { read: true },
//    fn: () => {
//       const data = Deno.readTextFileSync('./somefile.txt')
//       assertEquals(data, 'expected content')
//    },
// })
