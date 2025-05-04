import {INumberDictionary} from '../../../Types/Dictionary.mts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.mts'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../../Options/OptionTwitch.mts'
import {AbstractData, DataEntries} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {EventTest} from '../Event/EventTest.mts'
import {AbstractAction} from './AbstractAction.mts'
import {SettingTest} from '../Setting/SettingTest.mts'

export class ActionTest extends AbstractAction {
    trigger = new ActionSystemTrigger()
    toggle = new ActionSystemToggle()

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionTest(),
            tag: '🤖',
            description: 'Trigger or change state of things, propagating input.',
            documentation: {
                trigger: 'Things to trigger.',
                toggle: 'Things to toggle.',
            }
        })
    }
}
export class ActionSystemTrigger extends AbstractData {
    interval: number = 0
    systemActionEntries: number[] = []
    systemActionEntries_use = OptionEntryUsage.All
    commandEntries: string[] = []
    commandEntries_use = OptionEntryUsage.All
    eventEntries: number[]|DataEntries<EventTest> = []
    eventEntries_use = OptionEntryUsage.All
    matchedEventEntries: INumberDictionary|DataEntries<EventTest> = {}
    matchedEventEntries_caseSensitive = false
    matchedEventEntries_isRegex = false
    userEventEntries: ActionSystemUserEvent[] = []

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemTrigger(),
            documentation: {
                interval: 'Set the trigger entries to be triggered at an interval in seconds to space things out in time.',
                systemActionEntries: 'Trigger system features that are not separate actions.',
                commandEntries: 'Command(s) to trigger.',
                eventEntries: 'Event(s) to trigger.',
                matchedEventEntries: 'Events to trigger that matches user inputs. Add one with the key * to use as default if no match. Regex is supported if you enable it.',
                userEventEntries: 'Events to trigger for specific users. Add one with no selected user to have it act as the default if there is no match.'
            },
            instructions: {
                matchedEventEntries: 'If you use regex here, no need to surround it in slashes, only add what to match, a straight forward method is to use <code>.*</code> as a wildcard.'
            },
            types: {
                systemActionEntries: OptionSystemActionType.ref,
                systemActionEntries_use: OptionEntryUsage.ref,
                commandEntries: 'string',
                commandEntries_use: OptionEntryUsage.ref,
                eventEntries: EventTest.ref.id.build(),
                eventEntries_use: OptionEntryUsage.ref,
                matchedEventEntries: EventTest.ref.id.build(),
                userEventEntries: ActionSystemUserEvent.ref.build()
            }
        })
    }
}
export class ActionSystemToggle extends AbstractData {
    rewardStates: ActionSystemRewardState[] = []
    rewardStatesForEvents: ActionSystemRewardStateForEvent[] = []

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemToggle(),
            documentation: {
                rewardStates: 'Set the states for a number of rewards.',
                rewardStatesForEvents: 'Set the states for a number of rewards in events.'
            },
            types: {
                rewardStates: ActionSystemRewardState.ref.build(),
                rewardStatesForEvents: ActionSystemRewardStateForEvent.ref.build()
            }
        })
    }
}
export class ActionSystemRewardState extends AbstractData {
    reward: number|DataEntries<SettingTest> = 0
    reward_visible = OptionTwitchRewardVisible.NoChange
    reward_usable = OptionTwitchRewardUsable.NoChange

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemRewardState(),
            documentation: {
                reward: 'The reward to update, if it should be visible and/or redeemable.'
            },
            types: {
                reward: SettingTest.ref.id.label.build(),
                reward_visible: OptionTwitchRewardVisible.ref,
                reward_usable: OptionTwitchRewardUsable.ref
            }
        })
    }
}
export class ActionSystemRewardStateForEvent extends AbstractData {
    event: number|DataEntries<EventTest> = 0
    event_visible = OptionTwitchRewardVisible.Visible
    event_usable = OptionTwitchRewardUsable.Enabled

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemRewardStateForEvent(),
            documentation: {
                event: 'The event to look for a reward to update in, if it should be visible and/or redeemable.'
            },
            types: {
                event: EventTest.ref.id.build(),
                event_visible: OptionTwitchRewardVisible.ref,
                event_usable: OptionTwitchRewardUsable.ref
            }
        })
    }
}
export class ActionSystemUserEvent extends AbstractData {
    user: number|DataEntries<SettingTest> = 0
    event: number|DataEntries<EventTest> = 0

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemUserEvent(),
            documentation: {
                event: 'Trigger this event for a specific user.'
            },
            types: {
                user: SettingTest.ref.id.label.build(),
                event: EventTest.ref.id.build()
            }
        })
    }
}