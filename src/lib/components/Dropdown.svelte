<script lang="ts">
	interface Props {
		id: string;
		label: string;
		options: string[];
		selected: string;
		onChange: (value: string) => void;
	}

	let { id, label, options, selected, onChange }: Props = $props();
</script>

<div {id}>
	<label for={id}>{label}</label>
	<select name={id} bind:value={selected} onchange={() => onChange(selected)}>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</div>
