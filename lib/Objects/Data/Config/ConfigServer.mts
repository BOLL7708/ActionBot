import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class ConfigServer extends AbstractData {
    httpPort: number = 8080
    webSocketPort: number = 7712

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigServer(),
            description: 'Change ports and other settings for server components.',
            documentation: {
                httpPort: 'The port that the HTTP server is hosted on, this provides all static HTML documents as well as assets and data files.',
                webSocketPort: 'The port that the WebSocket server is hosted on, this provides live events and database connections.',
            }
        })
    }
}