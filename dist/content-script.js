/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/

let CS_LOG_PREFIX = "[BRE: contentScript via background]";
let isActive = false;
let isInit = false;
let originalParagraphValues;
let bionicParagraphValues;
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
    !type ? type = ITypesCS.log : console.log('Nothing to see here');
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type }, (response) => {
        if (response) {
            console.log(response);
        }
    });
}
function parseBionic(paragraph) {
    let paragraphBionic = '';
    if (paragraph['textContent'] != null) {
        const words = paragraph.textContent.split(" ");
        sendMessage('Processing paragraph...');
        words.forEach((word, index) => {
            let formattedWordHTML = '';
            const mid = Math.floor(word.length / 2);
            const bioPart = word.slice(0, mid);
            const remainder = word.slice(mid);
            formattedWordHTML = `<b>${bioPart}</b>${remainder}`;
            paragraphBionic += ' ' + formattedWordHTML;
            sendMessage(`Processed word ${index}...`);
        });
        // originalParagraphValues.push(paragraph.textContent as string);
        // bionicParagraphValues.push(paragraphBionic as string);
        sendMessage('Completed a paragraph!');
        return paragraphBionic;
    }
}
function toggleBionic() {
    sendMessage('Toggling bionic...', ITypesCS.log);
}
function convertPageText(paragraphs) {
    paragraphs.forEach((paragraph) => {
        sendMessage('Handling paragraph...', ITypesCS.log);
        parseBionic(paragraph);
    });
    isInit = true;
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
    sendMessage(`There are ${paragraphs.length} paragraphs to parse.`);
    if (!isInit) {
        convertPageText(paragraphs);
    }
    else {
        toggleBionic();
    }
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