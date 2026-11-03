import * as THREE from 'three';
import minecraft_block_texture from '../assets/minecraft_block.png'
import minecraft_player_texture from '../assets/player_skin.png'

type ArrayVector3 = [number, number, number];
type ArrayVector4 = [number, number, number, number];
interface PreviewModelCubeTemplateFace { uv: ArrayVector4, rotation?: number, shade?: number }
interface PreviewModelCubeTemplate {
	position?: ArrayVector3
	size?: ArrayVector3
	origin?: ArrayVector3
	rotation?: ArrayVector3
	faces?: {
		north?: PreviewModelCubeTemplateFace
		east?: PreviewModelCubeTemplateFace
		west?: PreviewModelCubeTemplateFace
		south?: PreviewModelCubeTemplateFace
		up?: PreviewModelCubeTemplateFace
		down?: PreviewModelCubeTemplateFace
	}
}
const CUBE_FACES = ['east', 'west', 'up', 'down', 'south', 'north'];
const CUBE_FACE_SHADES = {
	north: 0.8,
	south: 0.8,
	east: 0.64,
	west: 0.64,
	up: 1,
	down: 0.5,
}
function createCuboid(cube: PreviewModelCubeTemplate, material: THREE.Material, texture_size: [number, number]) {
    let mesh = new THREE.Mesh(new THREE.BoxGeometry(cube.size[0], cube.size[1], cube.size[2]), material)
    if (cube.origin) {
        mesh.position.set(cube.origin[0], cube.origin[1], cube.origin[2])
        mesh.geometry.translate(-cube.origin[0], -cube.origin[1], -cube.origin[2])
    }
    mesh.geometry.translate(cube.position[0] + cube.size[0]/2, cube.position[1] + cube.size[1]/2, cube.position[2] + cube.size[2]/2)
    if (cube.rotation) {
        mesh.rotation.fromArray(cube.rotation.map(deg => Math.degToRad(deg)));
    }
    mesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(24 * 3).fill(0.3), 3));

    let getUVArray = (face: PreviewModelCubeTemplateFace) => {
        let arr = [
            [face.uv[0]/texture_size[0], 1-(face.uv[1]/texture_size[1])],
            [face.uv[2]/texture_size[0], 1-(face.uv[1]/texture_size[1])],
            [face.uv[0]/texture_size[0], 1-(face.uv[3]/texture_size[1])],
            [face.uv[2]/texture_size[0], 1-(face.uv[3]/texture_size[1])]
        ]
        let rot = (face.rotation+0)
        while (rot > 0) {
            let a = arr[0];
            arr[0] = arr[2];
            arr[2] = arr[3];
            arr[3] = arr[1];
            arr[1] = a;
            rot = rot-90;
        }
        return arr;
    }

    let indices: number[] = [];
    // @ts-expect-error
    mesh.geometry.faces = [];
    mesh.geometry.clearGroups();
    CUBE_FACES.forEach((fkey, i) => {
        if (cube.faces[fkey as keyof typeof cube.faces]) {
            indices.push(0 + i*4, 2 + i*4, 1 + i*4, 2 + i*4, 3 + i*4, 1 + i*4);
            // @ts-expect-error
            mesh.geometry.faces.push(fkey)
        }
    })
    mesh.geometry.setIndex(indices);

    let uv_attr = mesh.geometry.attributes.uv as any;
    for (let fkey in cube.faces) {
        let face = cube.faces[fkey as keyof typeof cube.faces];
        let uv_array = getUVArray(face);
        let fIndex = 0;
        switch(fkey) {
            case 'north':   fIndex = 10;	break;
            case 'east':	fIndex = 0;		break;
            case 'south':   fIndex = 8;		break;
            case 'west':	fIndex = 2;		break;
            case 'up':		fIndex = 4;		break;
            case 'down':	fIndex = 6;		break;
        }
        uv_attr.array.set(uv_array[0], fIndex*4 + 0);  //0,1
        uv_attr.array.set(uv_array[1], fIndex*4 + 2);  //1,1
        uv_attr.array.set(uv_array[2], fIndex*4 + 4);  //0,0
        uv_attr.array.set(uv_array[3], fIndex*4 + 6);  //1,0
        
        let shade = face.shade ?? CUBE_FACE_SHADES[fkey as keyof typeof CUBE_FACE_SHADES];
        for (let i = 0; i < 4; i++) {
            mesh.geometry.attributes.color.setXYZ((fIndex * 2 + i), shade, shade, shade);
        }
    }
    uv_attr.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;
    return mesh;
}

export function createReferenceBlock() {
    let cube_texture = new THREE.TextureLoader().load(minecraft_block_texture);
    cube_texture.magFilter = THREE.NearestFilter;
    cube_texture.minFilter = THREE.NearestFilter;
    let cube_material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        map: cube_texture,
    });
    const minecraft_block = createCuboid({
        size: [1, 1, 1],
        position: [-0.5, -1.004, -0.5],
        faces: {
            east: { uv: [0, 16, 16, 32]},
            west: { uv: [0, 16, 16, 32]},
            up: { uv: [0, 0, 16, 16]},
            down: { uv:  [16, 16, 32, 32]},
            north: { uv:  [0, 16, 16, 32]},
            south: { uv:  [0, 16, 16, 32]},
        }
    }, cube_material, [32, 32]);
    return minecraft_block;
}

const PLAYER_GEO: PreviewModelCubeTemplate[] =  [
    {
        // "Head
        "position": [-4, 24, -4],
        "size": [8, 8, 8],
        "faces": {
            "north": {"uv": [8, 8, 16, 16]},
            "east": {"uv": [0, 8, 8, 16]},
            "south": {"uv": [24, 8, 32, 16]},
            "west": {"uv": [16, 8, 24, 16]},
            "up": {"uv": [16, 8, 8, 0]},
            "down": {"uv": [24, 0, 16, 8]}
        }
    },
    {
        // Hat Layer
        "position": [-4.5, 23.5, -4.5],
        "size": [9, 9, 9],
        "faces": {
            "north": {"uv": [40, 8, 48, 16]},
            "east": {"uv": [32, 8, 40, 16]},
            "south": {"uv": [56, 8, 64, 16]},
            "west": {"uv": [48, 8, 56, 16]},
            "up": {"uv": [48, 8, 40, 0]},
            "down": {"uv": [56, 0, 48, 8]}
        }
    },
    {
        // "Body
        "position": [-4, 12, -2],
        "size": [8, 12, 4],
        "faces": {
            "north": {"uv": [20, 20, 28, 32]},
            "east": {"uv": [16, 20, 20, 32]},
            "south": {"uv": [32, 20, 40, 32]},
            "west": {"uv": [28, 20, 32, 32]},
            "up": {"uv": [28, 20, 20, 16]},
            "down": {"uv": [36, 16, 28, 20]}
        }
    },
    {
        // Body Layer
        "position": [-4.25, 11.75, -2.25],
        "size": [8.5, 12.5, 4.5],
        "faces": {
            "north": {"uv": [20, 36, 28, 48]},
            "east": {"uv": [16, 36, 20, 48]},
            "south": {"uv": [32, 36, 40, 48]},
            "west": {"uv": [28, 36, 32, 48]},
            "up": {"uv": [28, 36, 20, 32]},
            "down": {"uv": [36, 32, 28, 36]}
        }
    },


    // ======= Wide Arms
    {
        // Right Arm
        "position": [4, 12, -2],
        "size": [4, 12, 4],
        "origin": [5, 22, 0],
        "rotation": [15, 0, 0],
        "faces": {
            "north": {"uv": [44, 20, 48, 32]},
            "east": {"uv": [40, 20, 44, 32]},
            "south": {"uv": [52, 20, 56, 32]},
            "west": {"uv": [48, 20, 52, 32]},
            "up": {"uv": [48, 20, 44, 16]},
            "down": {"uv": [52, 16, 48, 20]}
        }
    },
    {
        // Arm Layer
        "position": [3.75, 11.75, -2.25],
        "size": [4.5, 12.5, 4.5],
        "origin": [5, 22, 0],
        "rotation": [15, 0, 0],
        "faces": {
            "north": {"uv": [44, 36, 48, 48]},
            "east": {"uv": [40, 36, 44, 48]},
            "south": {"uv": [52, 36, 56, 48]},
            "west": {"uv": [48, 36, 52, 48]},
            "up": {"uv": [48, 36, 44, 32]},
            "down": {"uv": [52, 32, 48, 36]}
        }
    },
    {
        // Left Arm
        "position": [-8, 12, -2],
        "size": [4, 12, 4],
        "origin": [-5, 22, 0],
        "rotation": [1, 0, -3],
        "faces": {
            "north": {"uv": [36, 52, 40, 64]},
            "east": {"uv": [32, 52, 36, 64]},
            "south": {"uv": [44, 52, 48, 64]},
            "west": {"uv": [40, 52, 44, 64]},
            "up": {"uv": [40, 52, 36, 48]},
            "down": {"uv": [44, 48, 40, 52]}
        }
    },
    {
        // Arm Layer
        "position": [-8.25, 11.75, -2.25],
        "size": [4.5, 12.5, 4.5],
        "origin": [-5, 22, 0],
        "rotation": [1, 0, -3],
        "faces": {
            "north": {"uv": [52, 52, 56, 64]},
            "east": {"uv": [48, 52, 52, 64]},
            "south": {"uv": [60, 52, 64, 64]},
            "west": {"uv": [56, 52, 60, 64]},
            "up": {"uv": [56, 52, 52, 48]},
            "down": {"uv": [60, 48, 56, 52]}
        }
    },

    {
        // Right Leg
        "position": [-0.1, 0, -2],
        "size": [4, 12, 4],
        "faces": {
            "north": {"uv": [4, 20, 8, 32]},
            "east": {"uv": [0, 20, 4, 32]},
            "south": {"uv": [12, 20, 16, 32]},
            "west": {"uv": [8, 20, 12, 32]},
            "up": {"uv": [8, 20, 4, 16]},
            "down": {"uv": [12, 16, 8, 20]}
        }
    },
    {
        // Leg Layer
        "position": [-0.35, -0.25, -2.25],
        "size": [4.5, 12.5, 4.5],
        "faces": {
            "north": {"uv": [4, 36, 8, 48]},
            "east": {"uv": [0, 36, 4, 48]},
            "south": {"uv": [12, 36, 16, 48]},
            "west": {"uv": [8, 36, 12, 48]},
            "up": {"uv": [8, 36, 4, 32]},
            "down": {"uv": [12, 32, 8, 36]}
        }
    },
    {
        // Left Leg
        "position": [-3.9, 0, -2],
        "size": [4, 12, 4],
        "faces": {
            "north": {"uv": [20, 52, 24, 64]},
            "east": {"uv": [16, 52, 20, 64]},
            "south": {"uv": [28, 52, 32, 64]},
            "west": {"uv": [24, 52, 28, 64]},
            "up": {"uv": [24, 52, 20, 48]},
            "down": {"uv": [28, 48, 24, 52]}
        }
    },
    {
        // Leg Layer
        "position": [-4.15, -0.25, -2.25],
        "size": [4.5, 12.5, 4.5],
        "faces": {
            "north": {"uv": [4, 52, 8, 64]},
            "east": {"uv": [0, 52, 4, 64]},
            "south": {"uv": [12, 52, 16, 64]},
            "west": {"uv": [8, 52, 12, 64]},
            "up": {"uv": [8, 52, 4, 48]},
            "down": {"uv": [12, 48, 8, 52]}
        }
    }
]
export function createReferencePlayer() {
    let cube_texture = new THREE.TextureLoader().load(minecraft_player_texture);
    cube_texture.magFilter = THREE.NearestFilter;
    cube_texture.minFilter = THREE.NearestFilter;
    let cube_material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        map: cube_texture,
        side: THREE.DoubleSide,
        alphaTest: 0.05
    });
    const minecraft_player = new THREE.Object3D();
    for (let template of PLAYER_GEO) {
        let cube = createCuboid(template, cube_material, [64, 64]);
        minecraft_player.add(cube);
    }
    const scale = (30/32) / 16;
    minecraft_player.scale.set(scale, scale, scale);
    return minecraft_player;
}