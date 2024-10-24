import MainController from './Classes/MainController.mts'

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

    await MainController.init()
}
