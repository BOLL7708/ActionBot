import {AbstractData} from '../../lib/index.ts'
import DatabaseHelper from '../Helpers/DatabaseHelper.ts'

AbstractData.prototype.__apply = function(
    instanceOrParsedJson: object = {},
    replaceIdsWithItems: boolean
) {
    const gen = AbstractData.__applyGenerator(
        this,
        instanceOrParsedJson,
        replaceIdsWithItems
    )
    let result = gen.next()
    while(!result.done) {
        const id = parseInt(`${result.value.id}`)
        result = gen.next( id > 0 ? DatabaseHelper.loadById(result.value.id) : undefined)
    }
}