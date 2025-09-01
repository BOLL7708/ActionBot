<script lang="ts">
    import {fade} from 'svelte/transition'
    import actionbotLogo from '../public/actionbot_logo.svg'
    import StorageHelper from './Classes/StorageHelper.js'
    import AppButton from './Components/AppButton.svelte'
    import AuthBarrier from './Components/AuthBarrier.svelte'
</script>

<main transition:fade>
    <div class="logo-container">
        <img src={actionbotLogo} class="logo" alt="ActionBot Logo"/>
        <h1>ActionBot</h1>
    </div>
    <AuthBarrier>
        <div class="card">
            <div>
                <p>Signed in as: {StorageHelper.get('usr-name')}</p>
            </div>
            <div>
                <AppButton text="Setup" hash="setup"></AppButton>
                <AppButton text="Editor" hash="editor"></AppButton>
                <AppButton text="Events" hash="events"></AppButton>
                <AppButton text="Dashboard" hash="dashboard"></AppButton>
                <AppButton text="Presenter" hash="presenter"></AppButton>
            </div>
            <div>
                <p>The idea here is that these buttons will lead to individual SPAs, which all run Svelte.</p>
                <p>This page should show a login form and then redirect to Setup if authentication is missing.</p>
                <p>After auth and setup, every other component should be accessible.</p>
                <p>Access the <a href="https://actionbot.app" target="_blank" rel="noreferrer">official website</a>.</p>
            </div>
        </div>
    </AuthBarrier>
</main>

<style>
    .logo {
        margin-top: 1em;
        width: 16em;
        filter: var(--logo-filter)
    }

    main {
        text-align: center;
        display: flex;
        flex-direction: column;
        place-items: center;
    }

    h1 {
        font-size: 400%;
        margin: 0;
    }
</style>
