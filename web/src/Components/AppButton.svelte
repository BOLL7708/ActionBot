<script lang="ts">
    let {buttonText = 'Button'} = $props();
</script>
<button>{buttonText}</button>
<style>
    button {
        border: 4px double white;
        background: transparent;
        padding: 0 1em;
        font-size: 2em;
        color: white;
        border-radius: 2em;
        cursor: pointer;
        transition: background-color 0.3s ease;
        font-weight: normal;
    }

    button:hover {
        background-color: #ffffff40;
    }
</style>