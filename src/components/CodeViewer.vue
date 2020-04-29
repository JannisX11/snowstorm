<template>
    <main id="code" class="code">
        <div class="menu">
            <a onclick="selectText('code');document.execCommand('copy');">Copy</a>
        </div>
        <pre class=" lang-json"><code id="code"></code></pre>
    </main>
</template>

<script>
export default {
    name: 'code-viewer'
}
</script>

<style scoped>
	main#code {
		background-color: #21282f;
	}
	main#code pre {
		background-color: var(--color-background);
		box-shadow: 0 0 10px black;
		user-select: text;
		max-width: 1000px;
		margin-left: auto;
		margin-right: auto;
		overflow-y: auto;
		max-height: calc(100% - 60px);
	}
	main#code .menu {
		color: #ccc;
		font-size: 14pt;
	}
	main#code .menu a {
		cursor: default;
		padding: 3px;
		margin: 0 20px; 
		display: inline-block;
	}
	main#code .menu a:hover {
		color: white !important;
	}
	main#code .menu label {
		float: right;
		font-size: 0.9em;
		opacity: 0.8;
		padding-top: 3px;
	}
</style>