import {AbstractData} from '../AbstractData.ts'
import {DataMap} from '../DataMap.ts'

export class ConfigServer extends AbstractData {
    constructor(
        public httpPort: number = 8080,
        public webSocketPort: number = 7712
    ) {
        super()
    }

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