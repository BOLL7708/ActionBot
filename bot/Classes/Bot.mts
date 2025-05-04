import {ConfigExample, ConfigExampleSub, EnlistData, OptionEntryUsage} from '../../lib/index.mts'
import Log from '../../lib/SharedUtils/Log.mts'

export default class Bot {
    static readonly TAG = this.name
    static init() {
        Log.i(this.TAG, 'Bot initialized', Bot.name)

        EnlistData.run()

        const ce = new ConfigExample(
            true,
            123,
            50,
            'Hello world',
            'Hello secret world',
            '/what/is/this',
            new ConfigExampleSub(
                'Hello sub world',
                100,
                OptionEntryUsage.All
            ),
            100,
            100,
            100,
            OptionEntryUsage.All,
            [true, false, true],
            OptionEntryUsage.All,
            [1, 2, 3],
            ['Hello', 'World'],
            ['Hello', 'World', ''],
            ['Hello', 'Secret', 'World'],
            [new ConfigExampleSub(
                'Hello sub world again',
            100,
                OptionEntryUsage.AllRandom
            )]
        )
        Log.v(this.TAG, 'Config example:', ce)
        Log.v(this.TAG, 'Config example:', JSON.stringify(ce, null, 2))
    }
}