<template>
    <div id="molang_sheet" class="dialog" style="display: none;">
        <h1>MoLang Sheet</h1>
        <h3>Variables</h3>
        <ul>
            <li><code>variable.emitter_lifetime</code> Lifetime of the emitter</li>
            <li><code>variable.emitter_age</code> Age of the emitter</li>
            <li><code>variable.emitter_random_1</code> Random number between 0 and 1, constant per emitter loop</li>
            <li><code>variable.emitter_random_2</code> Random number</li>
            <li><code>variable.emitter_random_3</code> Random number</li>
            <li><code>variable.emitter_random_4</code> Random number</li>
            <li><code>variable.particle_lifetime</code> Lifetime of the particle</li>
            <li><code>variable.particle_age</code> Age of the particle</li>
            <li><code>variable.particle_random_1</code> Random number between 0 and 1, constant per particle</li>
            <li><code>variable.particle_random_2</code> Random number</li>
            <li><code>variable.particle_random_3</code> Random number</li>
            <li><code>variable.particle_random_4</code> Random number</li>
            <li><code>variable.entity_scale</code> Scale of the attached entity</li>
        </ul>
        <h3>Math Operations</h3>
        <ul>
            <li><code>Math.abs(n)</code> Returns the positive value of n.</li>
            <li><code>Math.sin(n)</code> Sine in degrees</li>
            <li><code>Math.cos(n)</code> Cosine in degrees</li>
            <li><code>Math.exp(n)</code> Calculates e to the nth power</li>
            <li><code>Math.ln(n)</code> Natural logarithm of n</li>
            <li><code>Math.pow(a, n)</code> Elevates a to the nth power</li>
            <li><code>Math.sqrt(n)</code> Returns the suare root of n.</li>
            <li><code>Math.random(a, b)</code> Random number between a and b</li>
            <li><code>Math.ceil(n)</code> Round n up to nearest integral number</li>
            <li><code>Math.round(n)</code> Round n to nearest integral number</li>
            <li><code>Math.trunc(n)</code> Round n towards zero</li>
            <li><code>Math.floor(n)</code> Round n down to nearest integral number</li>
            <li><code>Math.mod(a, b)</code> Returns the remainder of a/b.</li>
            <li><code>Math.min(n)</code> Return lowest value of a or b</li>
            <li><code>Math.max(n)</code> Return highest value of a or b</li>
            <li><code>Math.clamp(n, min, max)</code> Clamp n to between min and max inclusive</li>
            <li><code>Math.lerp(a, b, p)</code> Lerp between a and b using p (number between 0 and 1)</li>
            <li><code>Math.lerprotate(a, b, v)</code> Lerp the shortest direction around a circle from a degrees to b degrees via v.</li>
        </ul>
        <a href="https://bedrock.dev/1.12.0.0/1.12.0.4/MoLang">Full MoLang Documentation</a>
    </div>
</template>

<script>
export default {
    name: 'molang-dialog'
}
</script>

<style scoped>
	.dialog {
		position: absolute;
		margin-left: calc(50% - 400px);
		width: 800px;
		top: 20px;
		background-color: #ar(--color-background);
		box-shadow: 1px 1px 12px black;
		z-index: 50;
	}
	.dialog h3 {
		padding: 20px 0 5px 0;
	}
	#molang_sheet {
		padding: 20px 40px;
		overflow-y: scroll;
		bottom: 20px;
	}
</style>