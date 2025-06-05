<!--
 @component
 This tag will verify that the user is authenticated and if so display the child components.
 If the user is not authenticated, it will instead show a login form.
-->
<script lang="ts">
    import Authentication from '../Classes/Authentication.mjs'
    import Constants from '../Classes/Constants.mjs'
    import StorageHelper from '../Classes/StorageHelper.mjs'

    let {children} = $props<{ children?: () => any }>()
    let port = $state(Constants.DEFAULT_WS_PORT)
    let username = $state(StorageHelper.get('usr-name') ?? '')
    let password = $state('')
    let disabled = $state(false)
    let hasTriedToVerify = $state(false)
    let isAuthorized = $state(false)

    const authCallback = (ok: boolean) => {
        hasTriedToVerify = true
        isAuthorized = ok
        disabled = false
    }

    const onsubmit = (event: SubmitEvent) => {
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
        <form {onsubmit}>
            <h2>Connect & Sign In</h2>
            <fieldset {disabled}>
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
        max-width: 20em;
        margin: 0 auto;
        border: none;
    }

    input {
        padding: 0.5em;
        font-size: 1em;
        border: 1px solid #ccc;
        border-radius: 0.5em;
        background-color: transparent;
        color: white;
    }

    input[type="number"] {
        max-width: 4em;
    }
</style>