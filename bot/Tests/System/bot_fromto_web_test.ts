/*
Simulate being the webpage which loads data from the bot and reinstantiates it, edits data and saves it, deletes data.
 */

import JsonStore from '../../Database/JsonStore.ts'
import Modules from '../../Singletons/Modules.ts'
import Test from '../../Utils/Test.ts'

Test.run('init', async () => {
    Test.truncateData()

    // This will create account data and set the servers to use test ports.
    await Test.initializeData()

    // Boot up HTTP and WS server
    Modules.get()

    // region The tests

    // TODO: Do stuff

    // endregion

    // Terminate HTTP and WS server, and close database.
    Modules.get().http.stop()
    await Modules.get().ws.stop()
    JsonStore.closeConnection()
})