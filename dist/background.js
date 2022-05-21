/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/

const DEBUG_BG = true;
const BG_LOG_PREFIX = "[Bionic Reader Extension: BG]";
function smartLogBG(message) {
    if (DEBUG_BG) {
        console.log(BG_LOG_PREFIX + ' ' + message);
    }
}
chrome.runtime.onInstalled.addListener(() => {
    smartLogBG('Initialised successfully.');
});
chrome.action.onClicked.addListener((tab) => {
    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id || -1 },
            files: ['contentScript.js']
        });
    }
});
// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//         target: { tabId: tab.id || -1 },
//         files: ['contentScript.js']
//     });
// });

/******/ })()
;
//# sourceMappingURL=background.js.map