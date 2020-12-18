<template>
    <dialog id="warnings" class="dialog">
        <div class="tool close_button" @click="$emit('close')"><i class="unicode_icon">{{'\u2A09'}}</i></div>
        <h2>Warnings</h2>
        <div class="scrollable">
            There are {{ errors.length }} warning {{ errors.length == 1 ? 'note' : 'notes'}}:
            <ul>
                <li class="warning" v-for="(error, index) in errors" :key="index">
                    {{ error.text }}
                </li>
            </ul>
        </div>
    </dialog>
</template>

<script>

import {Config} from './../emitter'

const errors = [];

function validate() {
    errors.splice(0, errors.length);


    if (
        (Config.particle_appearance_material != 'particles_blend') && (
            (Config.particle_color_mode == 'static' && Config.particle_color_static.length == 9 && Config.particle_color_static.substr(-2) != 'FF') ||
            (Config.particle_color_mode == 'expression' && ['', '1', '1.0'].includes(Config.particle_color_expression[3]))
        )
    ) {
        errors.push({text: `The effect attempts to use opacity but the material is not set to 'Blend'`})
    }


    return errors;
}


export default {
    name: 'warning-dialog',
    data() {return {
        errors
    }}
}
export {validate}

</script>

<style scoped>
	.scrollable {
		overflow-y: scroll;
    }
    li.warning {
        list-style: inside;
        padding: 10px;
        color: var(--yellow);
    }
</style>