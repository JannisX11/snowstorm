import { loadFile } from './import'
import { strFromU8, strToU8, zlibSync, unzlibSync } from "fflate"
import Data from './input_structure'

/**
 * Share a particle by encoding it within the url
 * @param {any} particle 
 * @param {Uint8Array} texture 
 */
export async function shareParticle(particle, texture) {
    const url = new URL(window.location.href)

    url.searchParams.set(
        'loadParticle',
        btoa(
            strFromU8(
                zlibSync(strToU8(JSON.stringify(particle), true), {
                    level: 9,
                }),
                true
            )
        )
    )
    if(texture !== null) {
        url.searchParams.set(
            'loadParticleTexture', 
            btoa(
                strFromU8(
                    zlibSync(texture, {
                        level: 9,
                    }),
                    true
                )
            )
        )
    }
        
    await navigator
        .share({
            title: particle.particle_effect.description.identifier ?? 'Unknown',
            text: 'View this particle with Snowstorm',
            url: url.href,
        })
        .catch(() => {})
}

/**
 * Upon starting Snowstorm, try to load particle data from the url
 */
export async function loadFromUrl() {
    const url = new URLSearchParams(window.location.search)

    if (url.has('loadParticle')) {
        const compressed = strToU8(atob(url.get('loadParticle')), true)
        const decompressed = unzlibSync(compressed)
        const particle = JSON.parse(strFromU8(decompressed))
        
        loadFile(particle, false)
    }

    if(url.has('loadParticleTexture')) {
        const compressed = strToU8(atob(url.get('loadParticleTexture')), true)
        const decompressed = unzlibSync(compressed)
        const texture = decompressed

        const imageInput = Data.particle.texture.inputs.image
        imageInput.change(texture)
    }
}