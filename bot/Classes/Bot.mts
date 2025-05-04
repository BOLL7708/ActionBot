import {EnlistData, SettingTest} from '../../lib/index.mts'
import Log from '../../lib/SharedUtils/Log.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'

export default class Bot {
    static readonly TAG = this.name
    static init() {
        EnlistData.run()

        Log.i(this.TAG, 'Bot initialized', Bot.name)


        const item = new SettingTest('Test me!', 101, true)
        const key = DatabaseHelper.save(item, 'Yes')
        const item2 = DatabaseHelper.loadItem(new SettingTest(), key, undefined, true)
        const item3 = DatabaseHelper.loadById(item2.id)
        Log.d(this.TAG, 'DONE', {in: item, out: item2.data, byId: item3.data})
    }
}