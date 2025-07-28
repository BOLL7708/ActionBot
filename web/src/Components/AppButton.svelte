<script lang="ts">
    let {text, hash} = $props<{
        text: string
        hash: string
    }>();
    const onclick = () => {
        const url = new URL(window.location.href)
        url.hash = hash
        window.open(url)
    }
</script>
<button class="primary" {onclick}>{text}</button>
<style>

</style>