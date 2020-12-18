import Input from './input'
import {bbuid} from './util'
import registerEdit from './edits'

export default class Gradient extends Input {
    constructor(...args) {
        super(...args)
        this.default_value = [
            {percent: 0, color: '#ffffffff', id: bbuid(8)},
            {percent: 100, color: '#000000ff', id: bbuid(8)}
        ]
        if (!this.value.length) this.value.splice(0, 0, ...this.default_value)
        this.selected = this.value[0];
    }
    change(e, node) {
		this.selected.color = e.hex8;
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
            let color = '#' + point.color.substr(7, 2) + point.color.substr(1, 6);
            obj[time] = color;
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
            color: '#ffffffff'
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