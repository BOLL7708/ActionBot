import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

export class ActionChat extends BaseDataObject {
    entries: string[] = []
    entries_use = EnumEntryUsage.First
    register() {
        DataObjectMap.addRootInstance(
            new ActionChat(),
            'Send message(s) to Twitch chat.',
            {},
            {
                entries: 'string',
                entries_use: EnumEntryUsage.ref()
            }
        )
    }
}