import { Scene } from "./emitter";
import { IO } from "./util";
import vscode from "./vscode_extension";

export const EventSubEffects = {};
const SubEffectEditors = {};
const EmptyFile = {
	"format_version": "1.10.0",
	"particle_effect": {
		"description": {
			"identifier": "",
			"basic_render_parameters": {
				"texture": ""
			}
		},
		"components": {}
	}
};

export async function loadEventSubEffect() {
	let json = await new Promise(resolve => {
        IO.import({
            extensions: ['json']
        }, (files) => {
            if (files[0]) {
                resolve(JSON.parse(files[0].content));
            } else {
                resolve();
            }
        })
    });
    let identifier = json?.particle_effect?.description?.identifier || '';
    if (!EventSubEffects[identifier]) EventSubEffects[identifier] = {};
    EventSubEffects[identifier].json = json;
    delete Scene.child_configs[identifier]
    return identifier;
}
export async function createEventSubEffect(identifier) {
    if (!EventSubEffects[identifier]) EventSubEffects[identifier] = {};
    let json = JSON.parse(JSON.stringify(EmptyFile));
    json.particle_effect.description.identifier = identifier;
    EventSubEffects[identifier].json = json;
    delete Scene.child_configs[identifier];
    return identifier;
}

export async function loadEventSubEffectTexture(identifier) {
	let image_url = await new Promise(resolve => {
        IO.import({
            readtype: 'image',
            extensions: ['png']
        }, (files) => {
            if (files[0]) {
                resolve(files[0].content);
            } else {
                resolve();
            }
        })
    });
    if (!EventSubEffects[identifier]) EventSubEffects[identifier] = {};
    EventSubEffects[identifier].texture = image_url;
    
    if (Scene.child_configs[identifier]) {
        Scene.child_configs[identifier].updateTexture();
    }
}

window.addEventListener('focus', (e) => {
    for (let identifier in SubEffectEditors) {
        SubEffectEditors[identifier].updateConfig();
    }
});

class SubEffectEditor {
    constructor(identifier, editor_tab) {
        this.identifier = identifier;
        this.editor_tab = editor_tab;
    }
    updateConfig() {
        let json = JSON.parse(this.editor_tab.generateFileForParentEffect());
        let texture = this.editor_tab.getTextureForParentEffect();
        EventSubEffects[this.identifier].json = json;
        EventSubEffects[this.identifier].texture = texture;
        delete Scene.child_configs[this.identifier];

        let sub_data = this.editor_tab.getSubEffectDataForParentEffect();
        for (let identifier in sub_data) {
            if (SubEffectEditors[identifier]) continue;

            if (!EventSubEffects[identifier]) EventSubEffects[identifier] = {};
            EventSubEffects[identifier].json = JSON.parse(sub_data[identifier].json);
            EventSubEffects[identifier].texture = sub_data[identifier].texture;
            delete Scene.child_configs[identifier];
        }
    }
}

export function editEventSubEffect(identifier) {
    if (vscode) {
        vscode.postMessage({
            type: 'open_particle_file_tab',
            identifier
        });
    } else {
        let editor = SubEffectEditors[identifier];
        if (editor && editor.closed == false) {
            editor.editor_tab.focus();
        } else {
            let {json, texture} = EventSubEffects[identifier];
            let editor_tab = window.open(location.href);
            if (!editor_tab) return;
            setTimeout(() => {
                editor_tab.loadFileFromParentEffect(JSON.stringify(json), texture);
            }, 500);
            SubEffectEditors[identifier] = new SubEffectEditor(identifier, editor_tab);
        }
    }
}

window.getSubEffectDataForParentEffect = function() {
	let data = {};
    for (let identifier in EventSubEffects) {
        let {json, texture} = EventSubEffects[identifier];
        data[identifier] = {
            json: JSON.stringify(json),
            texture
        }
    }
    return data;
}

window.EventSubEffects = EventSubEffects;
window.SubEffectEditors = SubEffectEditors;
