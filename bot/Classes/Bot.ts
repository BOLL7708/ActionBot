import {promptSecret} from 'jsr:@std/cli'
import * as path from 'jsr:@std/path'
import Constants from '../../lib/Classes/Constants.ts'
import {ConfigAuth, ConfigServer} from '../../lib/index.ts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.ts'
import ErrorCodes from '../Constants/ErrorCodes.ts'
import ItemStore from '../Database/ItemStore.ts'
import FileUtils from '../DenoUtils/FileUtils.ts'
import Modules from '../Singletons/Modules.ts'
import Session from './Session.ts'
import exit = Deno.exit

type TPromptOptions = {
    message: string
    defaultValue?: string
    validator?: TPromptValidator
    isPassword?: boolean
}

type TPromptValidator =
    | 'none'
    | 'str_not_blank'
    | 'number_lt_zero'
    | 'writable_dir'

export default class Bot {
    static readonly #tag = this.name

    static async init(): Promise<void> {
        const printTitle = (title: string) => {
            console.log(`%c\n${title}`, 'text-decoration: underline;')
        }
        const printLines = (...lines: string[] | string[][]) => {
            for (const line of lines) {
                if (Array.isArray(line)) {
                    console.log(...line)
                } else {
                    console.log(line)
                }
            }
        }
        const printError = (message: string) => {
            console.log(`%c${message}`, 'color: red;')
        }
        const promptUntilOk = ({
                                   message,
                                   defaultValue,
                                   validator = 'str_not_blank',
                                   isPassword = false
                               }: TPromptOptions) => {
            let value = ''
            while (value.length == 0) {
                value = isPassword
                    ? promptSecret(message) ?? ''
                    : prompt(message, defaultValue) ?? ''
                switch (validator) {
                    case 'str_not_blank': {
                        if (ValueUtils.isBlank(value)) {
                            printError('The value cannot be empty, please try again.')
                            value = ''
                        }
                        break
                    }
                    case 'number_lt_zero': {
                        const number = ValueUtils.ensureNumber(value, 0)
                        if (number <= 0) {
                            printError('The value must be a number greater than 0.')
                            value = ''
                        }
                        break
                    }
                    case 'writable_dir': {
                        const dirSuccess = FileUtils.ensureDir(value)
                        if (!dirSuccess) {
                            printError('Directory path could not be created or read, check permissions.')
                            value = ''
                            break
                        }
                        const filepath = path.join(value, 'testfile')
                        const writeSuccess = FileUtils.writeText(filepath, 'test')
                        if (!writeSuccess) {
                            printError('Could not write to the provided path, check permissions.')
                            value = ''
                            break
                        } else FileUtils.remove(filepath)
                    }
                }
            }
            return value
        }

        printLines(
            [''],
            ['%c╔══════════════════════════════╗', 'color: red;'],
            ['%c║   ╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔╗ ╔═╗╔╦╗  ║', 'color: orange;'],
            ['%c║   ╠═╣║   ║ ║║ ║║║║╠╩╗║ ║ ║   ║', 'color: yellow;'],
            ['%c║   ╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝╚═╝ ╩   ║', 'color: green;'],
            ['%c╚══════════════════════════════╝', 'color: cyan;'],
            ['%c Thanks for choosing ActionBot', 'color: blue;'],
            ['%c  From: https://actionbot.app`', 'color: violet;']
        )

        const cfgPath = '../_cfg/userdatapath'
        let userDataPath = FileUtils.readText(cfgPath)
        if (!ValueUtils.isNotBlank(userDataPath)) {
            printTitle('User Data')
            printLines(
                'Please provide the preferred path for user data,',
                'this includes databases and uploaded files.',
                'This can be an absolute or relative path.',
                ''
            )
            userDataPath = promptUntilOk({
                message: 'Path:',
                defaultValue: '../_user',
                validator: 'writable_dir'
            })
            FileUtils.writeText(cfgPath, userDataPath)
            FileUtils.copy('./ReadMe/CFG.md', path.join(path.dirname(cfgPath), 'README.md'))
            FileUtils.copy('./ReadMe/USER.md', path.join(userDataPath, 'README.md'))
            Session.databaseDirectory = userDataPath
        } else {
            Session.databaseDirectory = userDataPath
        }

        const auth = ItemStore.do.loadMain(ConfigAuth) // TODO: <- This initializes the DB
        const server = ItemStore.do.loadMain(ConfigServer)
        let didDoSetup: boolean = false
        let authOK = 0
        let serverOK = 0

        const setupInvoked = Deno.args.includes('--setup') || Deno.args.includes('-s')
        if (!ValueUtils.isObjectFilled(auth) || setupInvoked) { // TODO: We should check everything separately and not just auth, in case people terminated mid-flow.
            printTitle('Authentication')
            printLines(
                'Please provide a username and password for this bot instance,',
                'these will be used to authenticate the web components.',
                ''
            )
            const username = promptUntilOk({
                message: 'Username:'
            })
            const password = promptUntilOk({
                message: 'Password:', isPassword: true
            })
            const salt = ValueUtils.generateSalt()
            auth.username = username
            auth.passwordHash = await ValueUtils.hashPassword(password, salt, true)
            auth.passwordSalt = ValueUtils.encodeBytes(salt, true)
            authOK = ItemStore.do.saveMain(auth)
            didDoSetup = true
        }

        if (!ValueUtils.isObjectFilled(server) || setupInvoked) {
            printTitle('Hosting')
            printLines(
                'If needed, change the ports for the server components.',
                ''
            )
            const newHttpPort = promptUntilOk({
                message: 'HTTP Port:',
                defaultValue: `${Constants.defaultPorts.http}`,
                validator: 'number_lt_zero'
            })
            const newWebSocketPort = promptUntilOk({
                message: 'WebSocket Port:',
                defaultValue: `${Constants.defaultPorts.webSocket}`,
                validator: 'number_lt_zero'
            })
            if (!ValueUtils.isBlank(newHttpPort)) server.httpPort = parseInt(newHttpPort)
            if (!ValueUtils.isBlank(newWebSocketPort)) server.webSocketPort = parseInt(newWebSocketPort)
            serverOK = ItemStore.do.saveMain(server)
            didDoSetup = true
        }

        if (didDoSetup) {
            if (authOK && serverOK) {
                printTitle('Setup Complete')
                printLines(
                    'Configuration was successfully saved to the database.',
                    'To redo the setup, run the bot with the setup launch parameter: -s, --setup'
                )
            } else {
                printError('Unable to save configuration to database for unknown reasons. Terminating.')
                exit(ErrorCodes.COULD_NOT_SAVE_CONFIG)
            }
        }

        // Launch servers
        printTitle('Servers')
        printLines(
            'Hosting on 0.0.0.0 which means any host or interface.',
            `Ports used: HTTP = ${server.httpPort}, WebSocket = ${server.webSocketPort}`
        )
        Modules.get() // TODO: Make this possible to reboot, we should be able to do a soft reboot of the entire bot, hopefully.

        // Log.setLogLevel(ELogLevel.Debug)
    }
}
