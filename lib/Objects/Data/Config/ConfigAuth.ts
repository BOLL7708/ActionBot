import {AbstractData} from '../../AbstractData.ts'
import {Purpose, About, Enlist} from '../../Decorators.ts'
import {DataMap} from '../../DataMap.ts'

@Enlist()
@Purpose('Authentication for the bot.')
export class ConfigAuth extends AbstractData {
    @About('The username used for authentication.')
    username: string = ''

    @About('The hash of the password used for authentication.')
    passwordHash: string = ''

    @About('The salt used for the password hash.')
    passwordSalt: string = ''
}