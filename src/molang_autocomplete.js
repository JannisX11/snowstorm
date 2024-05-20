import Data, { forEachInput } from "./input_structure";

import {
    RootTokens,
    MolangQueries,
    MolangQueryLabels,
    DefaultContext,
    DefaultVariables,
    MathFunctions,
    MathFunctionLabels
} from './molang_data'

function getAllMolangExpressions() {
    let expressions = [];
    function scanInput(input) {
        let value = input.value;
        if (value instanceof Array) {
            value.forEach(content => {
                if (typeof content == 'string' && content) {
                    expressions.safePush(content)
                }
            })
        } else if (typeof value == 'string' && value) {
            expressions.safePush(value)
        }
    }
    forEachInput(scanInput)
    Data.variables.curves.curves.forEach(curve => {
        for (let key in curve.inputs) {
            scanInput(curve.inputs[key]);
        }
    })

    return expressions;
}
function getProjectVariables(current) {
    let set = new Set();
    let expressions = getAllMolangExpressions();
    expressions.forEach(exp => {
        if (!exp) return;
        let matches = exp.match(/(v|variable)\.\w+/gi);
        if (!matches) return;
        matches.forEach(match => {
            let name = match.substring(match.indexOf('.')+1);
            if (name !== current) set.add(name);
        })
    })
    return set;
}

function containsInOrder(string, search) {
    let index = 0;
    for (let char of search) {
        find = string.substring(index).indexOf(char);
        if (find == -1) return false;
        index += find + 1;
    }
    return true;
}

function filterAndSortList(list, match, blacklist, labels) {
    let result = list.filter(f => f.startsWith(match));
    list.forEach(f => {
        if (!result.includes(f) && containsInOrder(f, match)) result.push(f);
    })
    if (blacklist) blacklist.forEach(black => result.remove(black));
    return result.map(text => {return {text, label: labels && labels[text], overlap: match.length}})
}

export default function getAutocompleteData(text, position, type) {
    let beginning = text.substring(0, position).split(/[^a-zA-Z0-9_.]\.*/g).at(-1);
    if (!beginning) return [];

    beginning = beginning.toLowerCase();
    if (beginning.includes('.')) {
        let [namespace, dir] = beginning.split('.');
        if (namespace == 'math') {
            return filterAndSortList(MathFunctions, dir, null, MathFunctionLabels);
        }
        if (namespace == 'query' || namespace == 'q') {
            return filterAndSortList(MolangQueries, dir, type !== 'controller' && ['all_animations_finished', 'any_animation_finished'], MolangQueryLabels);
        }
        if (namespace == 'temp' || namespace == 't') {
            let temps = text.match(/([^a-z]|^)t(emp)?\.\w+/gi);
            if (temps) {
                temps = temps.map(t => t.split('.')[1]);
                temps = temps.filter((t, i) => t !== dir && temps.indexOf(t) === i);
                return filterAndSortList(temps, dir);
            }
        }
        if (namespace == 'context' || namespace == 'c') {
            return filterAndSortList(DefaultContext, dir);
        }
        if (namespace == 'variable' || namespace == 'v') {
            let options = [...getProjectVariables(dir)];
            options.safePush(...DefaultVariables);
            return filterAndSortList(options, dir);
        }
    } else {
        let root_tokens = RootTokens.slice();
        return filterAndSortList(root_tokens, beginning, null);
    }
    return [];
}
