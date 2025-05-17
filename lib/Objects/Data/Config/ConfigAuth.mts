import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class ConfigAuth extends AbstractData {
    constructor(
        public username: string = '',
        public passwordHash: string = '',
        public passwordSalt: string = ''
    ) {
        super()
    }

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigAuth(),
            description: 'Authentication for the bot.',
            documentation: {
                username: 'The username used for authentication.',
                passwordHash: 'The hash of the password used for authentication.',
                passwordSalt: 'The salt used for the password hash.'
            }
        })
    }
}