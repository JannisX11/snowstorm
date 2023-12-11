import vscode from "./vscode_extension";

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
    return result.map(text => {
        return {
            text: text.replace(/\.(png|tga)$/, ''),//.includes('.') ? text : text+'/',
            label: text,
            overlap: match.length
        }
    })
}

let directory_cache = {};
let known_directories = {
    '': ['textures'],
    'textures': [
        'particle',
        'entity',
        'blocks',
        'items',
        'flame_atlas.png',
    ],
    'textures/particle': [
        'particles.png',
        'campfire_smoke.png',
        'sculk_charge_pop.png',
        'sculk_charge.png',
        'sculk_soul.png',
        'shriek.png',
        'sonic_explosion.png',
        'soul.png',
        'vibration_signal.png',
    ]
};

export default function getPathAutocompleteData(text, position, type) {
    let beginning = text.substring(0, position);
    if (!beginning) return [];

    beginning = beginning.toLowerCase();
    let folders = beginning.split('/');
    let current = folders.at(-1);
    let base_path = folders.slice(0, -1).join('/');
    console.log({folders, base_path, current, beginning, known_directories, directory_cache})

    if (directory_cache[base_path]) return filterAndSortList(directory_cache[base_path], current, null);
    
    if (vscode) {
        vscode.postMessage({
            type: 'texture_autocomplete',
            path: base_path
        });
        directory_cache[base_path] = [];
        
        return new Promise(resolve => {
            function update(event) {
                console.log('message', event.data)
                if (event.data.type == 'texture_autocomplete') {
                    window.removeEventListener('message', update);
                    directory_cache[base_path] = event.data.list;
                    resolve(filterAndSortList(directory_cache[base_path], current, null));
                }
            }
            window.addEventListener('message', update, false);
        });
    }

    if (known_directories[base_path]) {
        return filterAndSortList(known_directories[base_path], current, null);
    }
    return [];
}
