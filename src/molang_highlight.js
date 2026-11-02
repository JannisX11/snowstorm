import Prism from 'prismjs/components/prism-core';
import Languages from "./languages";

export function highlightMolang(code) {
    return Prism.highlight(code, Languages.molang);
}