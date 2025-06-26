import {About, Enlist, Purpose} from '../../Decorators.ts'
import {AbstractConfig} from './AbstractConfig.ts'

@Enlist()
@Purpose('Authentication for the bot.')
export class ConfigAuth extends AbstractConfig {
    @About('The username used for authentication.')
    username: string = ''

    @About('The hash of the password used for authentication.')
    passwordHash: string = ''

    @About('The salt used for the password hash.')
    passwordSalt: string = ''
}