/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/

let CS_LOG_PREFIX = "[BRE: contentScript via background]";
let isActive = false;
let isInit = false;
let originalParagraphValues = [];
let bionicParagraphValues = [];
let wordIndex = 0, paragraphIndex = 0;
var ITypesCS;
(function (ITypesCS) {
    ITypesCS[ITypesCS["log"] = 0] = "log";
    ITypesCS[ITypesCS["action"] = 1] = "action";
    ITypesCS[ITypesCS["notify"] = 2] = "notify";
})(ITypesCS || (ITypesCS = {}));
/**
 *
 * Helper function to communicate with background.js primarily
 *
 * @description Send a message to another part of the extension
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
/**
 *
 * Parse Bionic
 *
 * @description is able to receive any given HTML element (in reality it should always be a paragraph)
 * and takes the "textContent", breaks it up by spaces (" ") and then
 * @param paragraph [Element || HTMLParagraphElement] any given <p></p> element from a matching page
 *
 */
function parseBionic(paragraph) {
    let paragraphBionic = '';
    if (paragraph['textContent'] != null) {
        const words = paragraph.textContent.split(" ");
        words.forEach((word, index) => {
            let formattedWordHTML = '';
            const mid = Math.floor(word.length / 2);
            const bionicSlice = word.slice(0, mid);
            const remainder = word.slice(mid);
            formattedWordHTML = `<b>${bionicSlice}</b>${remainder}`;
            paragraphBionic += ' ' + formattedWordHTML;
            wordIndex++;
        });
        originalParagraphValues.push(paragraph.textContent);
        bionicParagraphValues.push(paragraphBionic);
        sendMessage('Completed a paragraph...');
        paragraph.innerHTML = paragraphBionic;
        sendMessage('DOM updated successfully.');
    }
    paragraphIndex++;
}
function toggleBionic() {
    sendMessage('Toggling bionic...');
}
/**
 *
 * Convert Page Text
 *
 * @description accepts an array of HTML elements and iterates over them to run the parser
 * @param paragraphs [NodeListOf<Element | HTMLParagraphElement] a list of elements on a matching page with the <p> tag!
 */
function convertPageText(paragraphs) {
    paragraphs.forEach((paragraph) => {
        sendMessage('Handling paragraph...');
        parseBionic(paragraph);
    });
    sendMessage(`Automatically processed ${paragraphIndex} paragraphs and ${wordIndex} words!`, ITypesCS.notify);
    isInit = true;
}
/**
 *
 * Auto-grab Paragraphs on a matching page
 *
 * @description: this is a rudimentary function which uses very little intelligence to grab all paragraph text
 * so that it can be parsed/formatted!
 *
 */
function autoGrabParagraphs() {
    const paragraphs = document.querySelectorAll('body p');
    sendMessage(`There are ${paragraphs.length} paragraphs to parse.`);
    sendMessage(`Is init? ${isInit}`);
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
 * @description: embeds into the active page to perform DOM interactions, allowing us to modify article text etc
 *
 */
function initContentScript() {
    sendMessage("Content script initialised!");
    autoGrabParagraphs();
}
// this will only happen on pages matching the content-scripts "matches" list of URLs for now
initContentScript();

/******/ })()
;
//# sourceMappingURL=content-script.js.map