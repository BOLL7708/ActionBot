import {AbstractData} from '../../../lib/Objects/Data/AbstractData.js'

AbstractData.prototype.__applyAsync = async function(
    instanceOrParsedJson: object = {},
    replaceIdsWithItems: boolean
): Promise<void> {
    const gen = AbstractData.__applyGenerator(
        this,
        instanceOrParsedJson,
        replaceIdsWithItems
    )
    let result = gen.next()
    while(!result.done) {
        const id = parseInt(`${result.value.id}`)
        result = gen.next( id > 0 ? await SomeAsyncManner.loadById(result.value.id) : undefined)
    }
}