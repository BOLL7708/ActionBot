<!--
 @component
 This tag will verify that the user is authenticated and if so display the child components.
 If the user is not authenticated, it will instead show a login form.
-->
<script lang="ts">
    import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
    import Authentication, {type TAuthenticationCallback, type TAuthenticationStatus} from '../Classes/Authentication.js'
    import Constants from '../Classes/Constants.js'
    import StorageHelper from '../Classes/StorageHelper.js'

    let {children} = $props<{ children?: () => any }>()
    let port = $state(Constants.DEFAULT_WS_PORT)
    let username = $state(StorageHelper.get('usr-name') ?? '')
    let password = $state('')
    let disabled = $state(false)
    let hasTriedToVerify = $state(false)
    let isAuthorized = $state(false)
    let message = $state('')
    let messageColor = $state('transparent')

    const authCallback: TAuthenticationCallback = (status: TAuthenticationStatus) => {
        isAuthorized = false
        message = ''
        messageColor = 'transparent'
        switch(status) {
            case 'ok':
                isAuthorized = true
                message = ''
                break
            case 'bot-connection-error':
            case 'failed-fetching-salt':
                message = 'Could not connect to the bot, please ensure that it is running, retry or reload the page.'
                messageColor = '#f004'
                break
            case 'bot-authentication-timeout':
                message = 'Authentication failed, credentials were likely faulty, please try again.'
                messageColor = '#f804'
                break
            case 'missing-credentials':
                message = hasTriedToVerify
                    ? 'The credentials were faulty, please try again.'
                    : 'No credentials were found, please sign in.'
                break
        }
        hasTriedToVerify = true
        disabled = false
    }

    const onsubmit = (event: SubmitEvent) => {
        message = 'Loading...'
        messageColor = 'transparent'
        disabled = true
        event.preventDefault()
        Authentication.login(port, username, password, authCallback)
    }

    Authentication.verify(authCallback)
</script>
{#if hasTriedToVerify}
    {#if isAuthorized}
        {@render children()}
    {:else }
        {#if ValueUtils.isNotBlank(message)}
            <p class="statusMessage" style="background-color: {messageColor};">{message}</p>
        {/if}
        <form {onsubmit}>
            <fieldset {disabled} class="card">
                <h2>Connect & Sign In</h2>
                <label>Bot WebSocket port: <input type="number" placeholder="Port" required bind:value={port}/></label>
                <label>Username: <input type="text"
                                        placeholder="Username"
                                        autocomplete="username"
                                        required
                                        bind:value={username}/>
                </label>
                <label>Password: <input type="password"
                                        placeholder="Password"
                                        autocomplete="current-password"
                                        required
                                        bind:value={password}/>
                </label>
                <button type="submit">Sign In</button>
            </fieldset>
        </form>
    {/if}
{/if}
<style>
    fieldset {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }


    input[type=number] {
        max-width: 4em;
    }
    .statusMessage {
        padding: .5em;
        border-radius: .5em;
    }
</style>