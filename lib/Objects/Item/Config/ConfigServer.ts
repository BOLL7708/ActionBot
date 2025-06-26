import {About, Enlist, Purpose} from '../../Decorators.ts'
import {AbstractConfig} from './AbstractConfig.ts'

@Enlist()
@Purpose('Change ports and other settings for server components.')
export class ConfigServer extends AbstractConfig {
    @About('The port that the HTTP server is hosted on, this provides all static HTML documents as well as assets and data files.')
    httpPort: number = 8080

    @About('The port that the WebSocket server is hosted on, this provides live events and database connections.')
    webSocketPort: number = 7712
}