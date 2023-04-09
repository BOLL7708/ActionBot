import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

export class ActionRemoteCommand extends BaseDataObject {
    entries: string[] = []
    entriesType = EnumEntryUsage.All
}

DataObjectMap.addRootInstance(
    new ActionRemoteCommand(),
    'Send remote command(s) to the remote command channel.',
    {},
    {
        entries: 'string',
        entriesType: EnumEntryUsage.ref()
    }
)