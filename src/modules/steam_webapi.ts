/**
 * These are calls to the Steam Web API to fetch various kinds of data. 
 * Keep in mind that the combined rates for these requests should not surpass the rate limit.
 * The current rate limit is 100k calls/24h, as mentioned her: https://steamcommunity.com/dev/apiterms
 */
class SteamWebApi {
    private static _profileTag: string
    static async getPlayerSummary(): Promise<ISteamWebApiPlayerSummaryData|null> {
        const encodedUrl = this.getEncodedUrl('ISteamUser/GetPlayerSummaries/v0002')
        const response: ISteamWebApiPlayerSummaries = await fetch(`./proxy.php?url=${encodedUrl}`)
            .then(response => response.json())
        if(response != null) {
            const player = response.response.players[0] ?? null
            if(player) {
                // Remove trailing slash and pop off the tag.
                this._profileTag = player.profileurl.replace(/\/$/, '').split('/').pop()
            }
            return player
        } else {
            console.warn(`SteamWebApi: Failed to get player summary`)
        }
        return null
    }
    static async getProfileTag(): Promise<string> {
        if(!this._profileTag) await this.getPlayerSummary()
        return new Promise((resolve, reject) => { resolve(this._profileTag) })
    }

    // TODO: Check to see if we have full response definitions in the online docs and create interfaces.
    static async getAchievements(appId: string): Promise<ISteamWebApiPlayerAchievementData[]> {
        const id = Utils.numberFromAppId(appId)
        if(!isNaN(id)) {
            const encodedUrl = this.getEncodedUrl('ISteamUserStats/GetPlayerAchievements/v0001', id)
            const response: ISteamWebApiPlayerAchievements = await fetch(`./proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                return response.playerstats.achievements ?? []
            } else {
                console.warn(`SteamWebApi: Failed to get achievements for ${appId}`)
            }
        } return null
    }

    static _gameSchemas: Record<number, ISteamWebApiGameSchema> = {}
    static async getGameSchema(appId: string): Promise<ISteamWebApiGameSchema> {
        const id = Utils.numberFromAppId(appId)
        if(this._gameSchemas[id]) return this._gameSchemas[id]
        if(!isNaN(id)) {
            const encodedUrl = this.getEncodedUrl('ISteamUserStats/GetSchemaForGame/v0002/', id)
            const response: ISteamWebApiGameSchema = await fetch(`./proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                this._gameSchemas[id] = response
                return response
            } else {
                console.warn(`SteamWebApi: Failed to get game schema for ${appId}`)
            }
        } return null
    }

    static _globalAchievementStats: Record<number, IStreamWebApiGlobalAchievementData[]> = {}
    static async getGlobalAchievementStats(appId: string): Promise<IStreamWebApiGlobalAchievementData[]> {
        const id = Utils.numberFromAppId(appId)
        if(this._globalAchievementStats[id]) return this._globalAchievementStats[id]
        if(!isNaN(id)) {
            const encodedUrl = this.getEncodedUrl('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/', id)
            const response: IStreamWebApiGlobalAchievementStats = await fetch(`./proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                const achievements = response.achievementpercentages?.achievements ?? []
                this._globalAchievementStats[id] = achievements
                return achievements
            } else {
                console.warn(`SteamWebApi: Failed to get game schema for ${appId}`)
            }
        } return null
    }

    private static getEncodedUrl(interfaceMethodVersion: string, appId?: number): string {
        var urlObj = new URL(`https://api.steampowered.com/${interfaceMethodVersion}`)
        urlObj.searchParams.append('key', Config.credentials.SteamWebAPIKey)
        urlObj.searchParams.append('steamid', Config.credentials.SteamUserID)
        urlObj.searchParams.append('steamids', Config.credentials.SteamUserID)
        if(appId) urlObj.searchParams.append('appid', appId.toString())
        if(appId) urlObj.searchParams.append('gameid', appId.toString())
        return btoa(urlObj.toString())
    }
}