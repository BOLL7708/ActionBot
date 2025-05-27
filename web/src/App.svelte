<script lang="ts">
    import actionbotLogo from '../public/actionbot_logo.svg'
    import AppButton from './Components/AppButton.svelte'
</script>

<main>
    <div>
        <a href="https://actionbot.app" target="_blank" rel="noreferrer">
            <img src={actionbotLogo} class="logo" alt="ActionBot Logo"/>
        </a>
    </div>
    <h1>ActionBot</h1>
    <div>
        <AppButton buttonText="Setup"></AppButton>
        <AppButton buttonText="Editor"></AppButton>
        <AppButton buttonText="Dashboard"></AppButton>
        <AppButton buttonText="Presenter"></AppButton>
    </div>
    <div>
        <p>The idea here is that these buttons will lead to individual SPAs, which all run Svelte.</p>
        <p>This page should show a login form and then redirect to Setup if authentication is missing.</p>
        <p>After auth and setup, every other component should be accessible.</p>
    </div>
</main>

<style>
    h1 {
        font-family: "Tourney", sans-serif;
        font-weight: normal;
        margin-bottom: 1em;
    }
    .logo {
        height: 16em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #fff);
    }
</style>
