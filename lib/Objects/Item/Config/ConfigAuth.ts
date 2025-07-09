import {About, Enlist, Primitive, Purpose} from '../../Decorators.ts'
import {AbstractConfig} from './AbstractConfig.ts'

@Enlist()
@Purpose('Authentication for the bot.')
export class ConfigAuth extends AbstractConfig {
    @About('The username used for authentication.')
    @Primitive
    username: string = ''

    @About('The hash of the password used for authentication.')
    @Primitive
    passwordHash: string = ''

    @About('The salt used for the password hash.')
    @Primitive
    passwordSalt: string = ''
}