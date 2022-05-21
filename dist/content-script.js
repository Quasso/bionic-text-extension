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
/**
 *
 * Send a message to another part of the extension
 *
 * @param message [string] the message to log (if any)
 * @param type [ITypesCS] the type of event we're sending
 */
function sendMessage(message, type) {
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type }, (response) => {
        if (response) {
            console.log(response);
        }
    });
}
function handleParagraph(para) {
    const words = para.textContent.split(" ");
    let newPara = '';
    words.forEach((word) => {
        const mid = Math.floor(word.length / 2);
        const bioPart = word.slice(0, mid);
        const remainder = word.slice(mid);
        const formattedWordHTML = `<b>${bioPart}</b>${remainder}`;
        newPara += ' ' + formattedWordHTML;
    });
    para.innerHTML = newPara;
}
/**
 *
 * Auto-grab Paragraphs on a matching page
 *
 * Description: this is a rudimentary function which uses very little intelligence to grab all paragraph text
 * so that it can be parsed/formatted!
 *
 */
function autoGrabParagraphs() {
    const paragraphs = document.querySelectorAll('body p');
    paragraphs.forEach((paragraph) => {
        sendMessage('Handling paragraph...', ITypesCS.log);
        handleParagraph(paragraph);
    });
}
/**
 *
 * Initialise the content-script
 *
 * Description: embeds into the active page to perform DOM interactions, allowing us to modify article text etc
 *
 */
function initContentScript() {
    sendMessage("Content script initialised!", ITypesCS.log);
    autoGrabParagraphs();
}
// this will only happen on pages matching the content-scripts "matches" list of URLs for now
initContentScript();

/******/ })()
;
//# sourceMappingURL=content-script.js.map