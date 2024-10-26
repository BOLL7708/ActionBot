import {db} from 'https://jsr.io/@std/media-types/1.0.3/_db.ts'
import {ActionAudio, ConfigSign} from '../lib/index.mts'
import MainController from './Classes/MainController.mts'
import chalk from 'chalk'
import DataBaseHelper from './Helpers/DataBaseHelper.mts'
import DbSingleton from './Singletons/DbSingleton.mts'

/**
 * Will initialize the bot backend component, this is run by the server.
 */
export async function bot() {
   console.log('Running bot!')
   // await AssetsHelper.getAll()
   // const files= await AssetsHelper.get('assets/hydrate/', ['.png'])
   // console.log('Files', files)
   // const prep= await AssetsHelper.preparePathsForUse(['assets/dot*', 'assets/snack/*.png'])
   // console.log('Prep', prep)
   console.log(
      chalk.blue(
         'This runs',
         chalk.yellow('the whole thing,'),
         'things added here will be executed.',
      ),
   )

   const isTesting = true
   DataBaseHelper.isTesting = isTesting
   const db = DbSingleton.get(isTesting)
   /*
   console.log('Test', db.test(), 'should be true', db.queryValue({query: 'SELECT 1;'}))
   let s = 0, d = 0, intervals = []

   for(let i = 0; i<10; i++) {
      s = performance.now()
      db.queryRun({
         query: 'SELECT * FROM json_store WHERE group_class = :grp;',
         params: { grp: ActionAudio.name }
      })
      d = performance.now()-s
      d = performance.now()-s
      intervals.push(d)
   }
   console.log('Intervals from running the same query 1000 times', intervals)
   console.log(db.queryRun({query: 'SELECT 1;'}), 'should be zero as no rows were affected.')
   console.log(DataBaseHelper.loadJson(
      ActionAudio.name
   )?.length)
    */
   console.log('Random ID generation', db.queryValue<string>({query: 'SELECT lower(hex(randomblob(18))) as hex;'}))
   const fakeClass = 'ConfigFakeTest'
   const fakeKey = 'MySpecialKey'
   console.log('Update item', DataBaseHelper.saveJson('{fakeData: true}', fakeClass, fakeKey))
   console.log('Load group', DataBaseHelper.loadJson(fakeClass)?.length)
   console.log('Load item', DataBaseHelper.loadJson(fakeClass, fakeKey)?.length)

   // TODO: Make comprehensive tests in Deno.test() later when things aren't erroring out due to browser features and broken imports.

   await MainController.init()
}
