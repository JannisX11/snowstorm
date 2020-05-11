import Input from './input'
import {bbuid} from './util'
import tinycolor from 'tinycolor2'
import * as THREE from 'three'
import registerEdit from './edits'

export default class Gradient extends Input {
    constructor(...args) {
        super(...args)
        this.default_value = [
            {percent: 0, color: '#ffffff', id: bbuid(8)},
            {percent: 100, color: '#000000', id: bbuid(8)}
        ]
        if (!this.value.length) this.value.splice(0, 0, ...this.default_value)
        this.selected = this.value[0];
    }
    calculate(percent) {

        let index = 0;
        this.value.forEach((point, i) => {
            if (point.percent <= percent) index = i;
        });
        if (this.value[index] && !this.value[index+1]) {
            var color = this.value[index].color;

        } else if (!this.value[index] && this.value[index+1]) {
            var color = this.value[index+1].color;

        } else if (this.value[index] && this.value[index+1]) {
            // Interpolate
            var mix = (percent - this.value[index].percent) / (this.value[index+1].percent - this.value[index].percent)
            var color = tinycolor.mix(this.value[index].color, this.value[index+1].color, mix*100).toHexString()

        } else {
            var color = '#ffffff'
        }
        return new THREE.Color(color);
    }
    change(e, node) {
		this.selected.color = e.hex;
        let is_sliding = node && node.parentNode.querySelector(':active')
        if (!is_sliding) registerEdit('change gradient')
        return this;
    }
    reset() {
        this.value.splice(0, Infinity, ...this.default_value)
        this.selected = this.value[0];
        return this;
    }
    sortValues() {
        this.value.sort((a, b) => a.percent - b.percent)
        return this;
    }
    export(range) {
        let obj = {};
        this.value.forEach(point => {
            let time = (point.percent / 100) * range
            time = time.toString()
            if (time.search(/\./) < 0) time += '.0'
            obj[time] = point.color
        })
        return obj;
    }
    registerEdit() {
        registerEdit('update gradient')
        return this;
    }
    addPoint() {
        this.value.push({
            percent: 50,
            color: '#ffffff'
        })
        this.selected = this.value[this.value.length-1];
        this.sortValues()
        registerEdit('add gradient point')
        return this;
    }
    removePoint() {
        if (this.value.length > 2) {
            let i = this.value.remove(this.selected)
            this.selected = this.value[Math.clamp(i-1, 0, this.value.length-1)]
            registerEdit('remove gradient point')
        }
        return this;
    }
}