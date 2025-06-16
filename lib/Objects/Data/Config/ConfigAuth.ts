import {AbstractData} from '../AbstractData.ts'
import {Description, Documentation, Enlist} from '../../Decorators.ts'
import {DataMap} from '../../DataMap.ts'

@Enlist()
@Description('Authentication for the bot.')
export class ConfigAuth extends AbstractData {
    @Documentation('The username used for authentication.')
    username: string = ''

    @Documentation('The hash of the password used for authentication.')
    passwordHash: string = ''

    @Documentation('The salt used for the password hash.')
    passwordSalt: string = ''
}