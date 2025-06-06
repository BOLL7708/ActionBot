<script lang="ts">
    let {children} = $props<{children: ()=>any}>()
</script>
<main>
    <header>
        <h1>{@render children()}</h1>
        <button>Test</button>
    </header>
</main>

<style>
    h1 {
        margin: 0;
        padding: 0;
    }
    header {
        background-color: var(--color-dark);
        padding: 1em;
        text-align: center;
        display: flex;
        flex-direction: row;
        place-items: center;
        position: sticky;
        top: 0;
    }
</style>