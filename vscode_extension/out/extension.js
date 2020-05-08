"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snowstormEditor_1 = require("./snowstormEditor");
function activate(context) {
    // Register our custom editor provider
    context.subscriptions.push(snowstormEditor_1.SnowstormEditorProvider.register(context));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map