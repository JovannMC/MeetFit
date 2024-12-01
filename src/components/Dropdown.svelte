<script lang="ts">
    let { id, label, options, selected, onChange } = $props();
</script>

<div id={id}>
    <label for={id}>{label}</label>
    <select name={id} bind:value={selected} onchange={() => onChange(selected)}>
        {#each options as option}
            <option value={option}>{option}</option>
        {/each}
    </select>
</div>