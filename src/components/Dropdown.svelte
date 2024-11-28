<script lang="ts">
    // TODO probably stylize this
    export let id = '';
    export let label = '';
    export let options: string[] = [];
</script>

<div id={id} class="container">
    <label for={id}>{label}</label>
    <select name={id}>
        {#each options as option}
            <option value={option}>{option}</option>
        {/each}
    </select>
</div>