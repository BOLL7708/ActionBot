import {AbstractData} from '../../AbstractData.ts'
import {Description, Documentation, Enlist} from '../../Decorators.ts'

@Enlist()
@Description('Change ports and other settings for server components.')
export class ConfigServer extends AbstractData {
    @Documentation('The port that the HTTP server is hosted on, this provides all static HTML documents as well as assets and data files.')
    httpPort: number = 8080

    @Documentation('The port that the WebSocket server is hosted on, this provides live events and database connections.')
    webSocketPort: number = 7712
}