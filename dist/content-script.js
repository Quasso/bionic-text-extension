/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content-script.ts":
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ITypes = void 0;
let CS_LOG_PREFIX = "[Bionic Reader Extension: CS via BG]";
var ITypes;
(function (ITypes) {
    ITypes[ITypes["log"] = 0] = "log";
    ITypes[ITypes["action"] = 1] = "action";
})(ITypes = exports.ITypes || (exports.ITypes = {}));
function sendMessage(message, type) {
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type }, (response) => {
        if (response) {
            console.log(response);
        }
    });
}
function initContentScript() {
    sendMessage("Content script initialised!", ITypes.log);
    const paragraphs = document.querySelectorAll('body p');
    paragraphs.forEach((paragraph) => {
        sendMessage(paragraph.innerHTML.toString() || 'null', ITypes.action);
    });
}
initContentScript();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/content-script.ts"](0, __webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=content-script.js.map