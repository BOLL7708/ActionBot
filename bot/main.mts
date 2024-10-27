import Chalk from '../lib-core/Constants/Chalk.mts'
import {ActionAudio, ConfigMain, EnlistData} from '../lib-shared/index.mts'
import MainController from './Classes/MainController.mts'
import DataBaseHelper from './Helpers/DataBaseHelper.mts'
import DbSingleton from './Singletons/DbSingleton.mts'

/**
 * Will initialize the bot backend component, this is run by the server.
 */
export async function bot() {
   // await AssetsHelper.getAll()
   // const files= await AssetsHelper.get('assets/hydrate/', ['.png'])
   // console.log('Files', files)
   // const prep= await AssetsHelper.preparePathsForUse(['assets/dot*', 'assets/snack/*.png'])
   // console.log('Prep', prep)

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
   EnlistData.run()
   console.log(Chalk.client('Random ID generation'), db.queryValue<string>({query: 'SELECT lower(hex(randomblob(18))) as hex;'}))
   const instance = new ConfigMain()
   const groupClass = ConfigMain.name
   const groupKey = 'MySpecialKey'
   // TODO: Switch saveJson and loadJson to save/load item
   console.log(Chalk.client('Create'), DataBaseHelper.saveJson(JSON.stringify(instance), groupClass, groupKey))
   console.log(Chalk.client('Update'), DataBaseHelper.saveJson(JSON.stringify(instance), groupClass, groupKey+2))
   // console.log('Update item', DataBaseHelper.saveJson('Will throw an error', '', null))
   console.log(Chalk.client('Load group'), DataBaseHelper.loadJson(groupClass)?.length)
   console.log(Chalk.client('Load item'), DataBaseHelper.loadJson(groupClass, groupKey)?.length)
   console.log(Chalk.client('Delete item'), DataBaseHelper.delete(instance, groupKey))
   console.log(Chalk.client('Delete item'), DataBaseHelper.delete(instance, groupKey))
   console.log(Chalk.client('Load item'), DataBaseHelper.loadJson(groupClass, groupKey)?.length)

   // region Category
   console.log(Chalk.client('Load item'), DataBaseHelper.loadJson(groupClass, groupKey)?.length)
   console.log(Chalk.client('Create'), DataBaseHelper.saveJson('{"category": 1}', groupClass, groupKey))
   console.log(Chalk.client('Load item'), DataBaseHelper.loadJson(groupClass, groupKey)?.length)
   console.log(Chalk.client('Delete Category'), DataBaseHelper.deleteCategory(1))
   console.log(Chalk.client('Load item'), DataBaseHelper.loadJson(groupClass, groupKey)?.length)
   // endregion

   console.log(Chalk.client('Search'), DataBaseHelper.search(groupKey).length)

   // TODO: Make comprehensive tests in Deno.test() later when things aren't erroring out due to browser features and broken imports.

   let s = 0, d = 0, intervals = []
   for(let i = 0; i<100; i++) {
      s = performance.now()
      DataBaseHelper.loadJson(ActionAudio.name)
      d = performance.now()-s
      d = performance.now()-s
      intervals.push(d)
   }
   console.log(
      'Average query time:',
      ((intervals.reduce((a, b) => a + b, 0) / intervals.length)*1000).toFixed(2),
      'microseconds'
   )

   await MainController.init()
}
