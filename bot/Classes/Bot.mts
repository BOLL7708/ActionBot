import { ConfigAuth, ConfigServer } from '../../lib/index.mts'
import Log, { ELogLevel } from '../../lib/SharedUtils/Log.mts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.mts'
import ErrorCodes from '../Constants/ErrorCodes.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'
import HttpHandler from '../Server/HttpHandler.mts'
import WebSocketHandler from '../Server/WebSocketHandler.ts'
import { promptSecret } from 'jsr:@std/cli'
import exit = Deno.exit

type TPromptOptions = {
    message: string
    defaultValue?: string
    verifyNumber?: boolean
    isPassword?: boolean
}

export default class Bot {
    static readonly TAG = this.name
    static async init(): Promise<void> {
        const printTitle = (title: string) => {
            console.log(`%c\n${title}`, 'text-decoration: underline;')
        }
        const printError = (message: string) => {
            console.log(`%c${message}`, 'color: red;')
        }
        const promptUntilOk = ({
            message,
            defaultValue,
            verifyNumber = false,
            isPassword = false
        }: TPromptOptions) => {
            let value = ''
            while (value.length == 0) {
                value = isPassword
                    ? promptSecret(message, defaultValue) ?? ''
                    : prompt(message, defaultValue) ?? ''
                if (verifyNumber) {
                    const number = ValueUtils.ensureNumber(value, 0)
                    if (number <= 0) {
                        printError('The value must be a number greater than 0.')
                        value = ''
                    }
                } else if (value.length == 0) {
                    printError('The value cannot be empty, please try again.')
                }
            }
            return value
        }


        console.log('%c╔══════════════════════════════╗', 'color: red;')
        console.log('%c║   ╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔╗ ╔═╗╔╦╗  ║', 'color: orange;')
        console.log('%c║   ╠═╣║   ║ ║║ ║║║║╠╩╗║ ║ ║   ║', 'color: yellow;')
        console.log('%c║   ╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝╚═╝ ╩   ║', 'color: green;')
        console.log('%c╚══════════════════════════════╝', 'color: cyan;')
        console.log('%c Thank your for using ActionBot', 'color: blue;')
        console.log('%c  From: https://actionbot.app/`', 'color: violet;')
        const auth = DatabaseHelper.loadMain(new ConfigAuth())
        const server = DatabaseHelper.loadMain(new ConfigServer())
        const authNotSet = ValueUtils.isEmpty(auth.username) ||
            ValueUtils.isEmpty(auth.passwordHash) ||
            ValueUtils.isEmpty(auth.passwordSalt)
        const setupInvoked = Deno.args.includes('--setup') || Deno.args.includes('-s')
        if (authNotSet || setupInvoked) {
            printTitle('Setup')
            console.log('Some setup is still needed before the bot is ready to use.')

            printTitle('Authentication')
            console.log('Please provide a username and password for this bot instance.')
            console.log('This is used to authenticate when accessing bot features.')
            const username = promptUntilOk({message: '  Username:'})
            const password = promptUntilOk({message: '  Password:', isPassword: true})
            const salt = ValueUtils.generateSalt()
            auth.username = username
            auth.passwordHash = await ValueUtils.hashPassword(password, salt, true)
            auth.passwordSalt = ValueUtils.encodeBytes(salt, true)
            DatabaseHelper.saveMain(auth)

            printTitle('Hosting')
            console.log('Optionally change the ports for the server components.')
            const newHttpPort = promptUntilOk({message: '  HTTP Port:', defaultValue: '8080', verifyNumber: true})
            const newWebSocketPort = promptUntilOk({message: '  WebSocket Port:', defaultValue: '7712', verifyNumber: true})
            if (!ValueUtils.isBlank(newHttpPort)) server.httpPort = parseInt(newHttpPort)
            if (!ValueUtils.isBlank(newWebSocketPort)) server.webSocketPort = parseInt(newWebSocketPort)
            const key = DatabaseHelper.saveMain(server)
            if (!ValueUtils.isBlank(key)) {
                printTitle('Setup Complete')
                console.log('Server configuration was successfully saved to the database.')
                console.log('To change these values in the future, rerun the setup. (-s, --setup)')
            } else {
                printError('Unable to save server configuration to database for unknown reasons. Terminating.')
                exit(ErrorCodes.COULD_NOT_SAVE_CONFIG)
            }
        }

        // Launch servers
        printTitle('Servers')
        console.log('Hosting is done on 0.0.0.0 which means any host or interface.')
        Log.setLogLevel(ELogLevel.Warning)
        const http = new HttpHandler()
        const ws = new WebSocketHandler()
    }
}
