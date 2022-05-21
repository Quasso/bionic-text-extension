/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/

let CS_LOG_PREFIX = "[Bionic Reader Extension: CS via BG]";
var ITypesCS;
(function (ITypesCS) {
    ITypesCS[ITypesCS["log"] = 0] = "log";
    ITypesCS[ITypesCS["action"] = 1] = "action";
})(ITypesCS || (ITypesCS = {}));
function sendMessage(message, type) {
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type }, (response) => {
        if (response) {
            console.log(response);
        }
    });
}
function initContentScript() {
    sendMessage("Content script initialised!", ITypesCS.log);
}
function autoGrabParagraphs() {
    const paragraphs = document.querySelectorAll('body p');
    paragraphs.forEach((paragraph) => {
        sendMessage(paragraph.innerHTML.toString() || 'null', ITypesCS.log);
    });
}
initContentScript();

/******/ })()
;
//# sourceMappingURL=content-script.js.map