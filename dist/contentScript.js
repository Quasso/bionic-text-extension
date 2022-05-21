/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/

let CS_LOG_PREFIX = "[Bionic Reader Extension: CS]";
function smartLogCS(message) {
    if (debug) {
        console.debug(CS_LOG_PREFIX + ' ' + message);
    }
}
function initContentScript() {
    smartLogCS("Content script initialised!");
    console.log('test');
}
initContentScript();

/******/ })()
;
//# sourceMappingURL=contentScript.js.map