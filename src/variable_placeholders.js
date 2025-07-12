import registerEdit from './edits'
import {Emitter} from './emitter';

import {
    DefaultContext,
    DefaultVariables,
} from './molang_data'
import { forEachInput, Data } from './input_structure';

function getShortKey(key) {
    return key.replace(/^variable\./g, 'v.').replace(/^context\./g, 'c.').replace(/^query\./g, 'q.');
}

export function updateVariablePlaceholderList(list) {
    list.splice(0, Infinity);

    // Collect molang strings
    let molang_strings = [];
    forEachInput((input) => {
        if (input.type != 'molang') return;
        if (input.value instanceof Array) {
            for (let string of input.value) {
                molang_strings.push(string);
            }

        } else if (typeof input.value == 'string') {
            molang_strings.push(input.value);
        }
    })
    let handleEventSubpart = (event) => {
        if (event.expression) molang_strings.push(event.expression);
        if (event.particle_effect?.pre_effect_expression) {
            molang_strings.push(event.particle_effect.pre_effect_expression);
        }
        if (event.sequence) {
            event.sequence.forEach(handleEventSubpart);
        }
        if (event.randomize) {
            event.randomize.forEach(handleEventSubpart);
        }
    }
    for (let entry of Data.events.events.events) {
        handleEventSubpart(entry.event);
    }

    // Process data
    let variable_ids = new Set();
    let predefined = new Set();
    for (let string of molang_strings) {
        if (typeof string != 'string') continue;
        let string_lower_case = string.toLowerCase();
        let matches = string_lower_case.match(/(v|variable|c|context|q|query)\.[\w.]+\b/g);
        if (!matches) continue;
        for (let match of matches) {
            let key = match.replace(/^v\./, 'variable.').replace(/^c\./, 'context.').replace(/^q\./, 'query.');
            let key_short = getShortKey(key);
            variable_ids.add(key);
            let assign_regex = new RegExp(`(${key.replace('.', '\\.')}|${key_short.replace('.', '\\.')})\\s*=[^=]`, 'g');
            if (string.match(assign_regex)) {
                predefined.add(key);
            }
        }
    }
    for (let id of variable_ids) {
        if (DefaultVariables.find(v => ('variable.'+v) == id) || DefaultContext.find(v => ('context.'+v) == id)) continue;
        let key_short = getShortKey(id);
        if (Emitter.config.curves[id] || Emitter.config.curves[key_short]) continue;
        if (predefined.has(id)) continue;
        list.push(id);
    }
}
export function bakePlaceholderVariable(key, value) {
    let key_short = getShortKey(key);
    let regex = new RegExp(`\\b(${key.replace('.', '\\.')}|${key_short.replace('.', '\\.')})\\b`, 'g');
    function update(string) {
        if (typeof string != 'string') return string;
        return string.replace(regex, value);
    }
    forEachInput((input) => {
        if (input.type != 'molang') return;
        if (input.value instanceof Array) {
            input.set(input.value.map(update));
        } else {
            input.set(update(input.value));
        }
    })
    registerEdit('bake placeholder variables')
}
