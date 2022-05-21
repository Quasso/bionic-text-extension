/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/

let CS_LOG_PREFIX = "[Bionic Reader Extension: CS via BG]";
const DEBUG_CS = true;
function sendMessage(message) {
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX }, (response) => {
        if (response) {
            console.log(response);
        }
    });
}
function initContentScript() {
    sendMessage("Content script initialised!");
}
initContentScript();

/******/ })()
;
//# sourceMappingURL=contentScript.js.map