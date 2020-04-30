import Input from './input'
import {bbuid} from './util'

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
    change(e) {
		this.selected.color = e.hex;
    }
    reset() {
        this.value.splice(0, Infinity, ...this.default_value)
        this.selected = this.value[0];
    }
    dragPoint(point, event1) {
        let scope = this;
        this.selected = point;
        let unlocked = false;
        let original_value = point.percent;
        function onDrag(event2) {
            let distance = event2.clientX - event1.clientX
            if (Math.abs(distance) > 4) unlocked = true;
            if (unlocked && event1.target.parentElement) {
                let width = event1.target.parentElement.clientWidth;
                let percent = original_value + (distance/width) * 100;
                point.percent = Math.clamp(Math.round(percent), 0, 100)
                scope.sortValues()
            }
        }
        function onDragEnd(event2) {
            document.removeEventListener('mousemove', onDrag)
            document.removeEventListener('mouseup', onDragEnd)
        }
        document.addEventListener('mousemove', onDrag)
        document.addEventListener('mouseup', onDragEnd)
    }
    sortValues() {
        this.value.sort((a, b) => a.percent - b.percent)
    }
    getCSSString(points) {
        let stations = ['to right']
        for (var point of points) {
            stations.push(`${point.color} ${point.percent}%`)
        }
        return `linear-gradient(${stations.join(', ')})`;
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
    addPoint() {
        this.value.push({
            percent: 50,
            color: '#ffffff'
        })
        this.selected = this.value[this.value.length-1];
        this.sortValues()
    }
    removePoint() {
        if (this.value.length > 2) {
            let i = this.value.remove(this.selected)
            this.selected = this.value[Math.clamp(i-1, 0, this.value.length-1)]
        }
    }
}