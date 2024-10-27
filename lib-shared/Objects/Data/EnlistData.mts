import Chalk from '../../../lib-core/Constants/Chalk.mts'
import * as index from '../../index.mts'
import {AbstractData} from './AbstractData.mts'

/**
 * This class exists to enlist the classes that can be stored in the database in a map.
 * The map is then used to re-instantiate the classes when retrieved from the database as JSON.
 * If a class is not enlisted here, it will not be re-instantiated, and thus throw an error.
 */
export class EnlistData {
    static run() {
        const enlisted: string[] = []
        const cannotEnlist: string[] = []
        const cannotInstantiate: string[] = []
        for(const [groupClass, clazz] of Object.entries(index)) {
            const constructor = clazz as { new(): AbstractData }
            try {
                const instance = new constructor()
                if(typeof instance.enlist === 'function') {
                    instance.enlist()
                    enlisted.push(groupClass)
                } else {
                    cannotEnlist.push(groupClass)
                }
            } catch(e) {
                cannotInstantiate.push(groupClass)
            }
        }
        console.log(Chalk.data('Enlisting of Data Objects result:'), {
            ok: enlisted.length,
            no_method: cannotEnlist.length,
            no_constructor: cannotInstantiate.length
        })
    }
}