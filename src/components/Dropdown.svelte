<script lang="ts">
    // TODO probably stylize this
    export let id = '';
    export let label = '';
    export let options: string[] = [];
    export let selected = '';
</script>

<div id={id}>
    <label for={id}>{label}</label>
    <select name={id} value={selected}>
        {#each options as option}
            <option value={option}>{option}</option>
        {/each}
    </select>
</div>