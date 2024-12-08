export type TTwitchEventSubEventStatus =
    'FULFILLED'
    | 'UNFULFILLED'
    | 'CANCELED'

/**
 * @link https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchannel_points_custom_reward_redemptionadd
 * @link https://dev.twitch.tv/docs/eventsub/eventsub-reference/#channel-points-custom-reward-redemption-add-event
 */
export interface ITwitchEventSubEventRedemption {
    id: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    user_id: string
    user_login: string
    user_name: string
    user_input: string
    status: TTwitchEventSubEventStatus,
    reward: {
        id: string
        title: string
        cost: number
        prompt: string
    },
    redeemed_at: string
}