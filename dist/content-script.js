/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/

let CS_LOG_PREFIX = "[BRE: contentScript via background]";
let isActive = false;
let isInit = false;
const HYPHEN = "-";
const DBL_HYPHEN = "--";
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
 * Send Message
 *
 * @description helper function to communicate with background.js primarily. Send a message to another part of the extension
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
 * Contains Hyphen
 *
 * @description some "words" are actually two words conjoined by hyphens, this auto-detects that and handles parsing correctly
 * @param word [string] a string of continuous characters derived by splitting " " on page text
 * @returns [boolean | string] false if not present, string with correctly formatted text if it does
 */
function containsHyphen(word) {
    const containsDoubleHyphen = word.indexOf(DBL_HYPHEN);
    const containsHyphen = word.indexOf(HYPHEN);
    if (containsDoubleHyphen > 0) {
        sendMessage(`This word contains a double hyphen ${word}!`);
        let words = word.split(DBL_HYPHEN);
        return bionicWord(words[0]) + DBL_HYPHEN + bionicWord(words[1]);
    }
    else if (containsHyphen > 0) {
        sendMessage(`This word contains one hyphen ${word}!`);
        let words = word.split(HYPHEN);
        return bionicWord(words[0]) + HYPHEN + bionicWord(words[1]);
    }
    else {
        return false;
    }
}
/**
 *
 * Bionic Word
 *
 * @description create the processed "bionic" equivalent of the text, wrapped with <b> tags on the "bionic" part
 * which is also enforced with embedded CSS to ensure font-weight is applied over page styling
 * @param word [string] a string of continuous characters derived by splitting " " on page text
 * @returns [string] the processed text as HTML
 */
function bionicWord(word) {
    const mid = Math.floor(word.length / 2);
    const bionicSlice = word.slice(0, mid);
    const remainder = word.slice(mid);
    const formattedWordHTML = `<b>${bionicSlice}</b>${remainder}`;
    return formattedWordHTML;
}
/**
 *
 * Parse Word
 *
 * @param word [string] a string of continuous characters derived by splitting " " on page text
 * @returns [string] the fully parsed HTML to correctly show the bionic text (inc. special parsing functionality for edge cases)
 */
function parseWord(word) {
    // sendMessage(`Parsing word ${word}`);
    const advancedParse = containsHyphen(word);
    if (!advancedParse) {
        return bionicWord(word);
    }
    else {
        return advancedParse;
    }
}
/**
 *
 * Parse Bionic
 *
 * @description is able to receive any given HTML element (in reality it should always be a paragraph)
 * and takes the "textContent", breaks it up by spaces (" ") and then parses each word and wraps
 * the "Bionic" parts in <b> tags which have additional CSS to enforce the emphasis.
 * @param paragraph [Element || HTMLParagraphElement] any given <p></p> element from a matching page
 *
 */
function parseBionic(paragraph) {
    let paragraphBionic = '';
    if (paragraph['textContent'] != null) {
        const words = paragraph.textContent.split(" ");
        words.forEach((word) => {
            let formattedWordHTML = '';
            formattedWordHTML = parseWord(word);
            paragraphBionic += ' ' + formattedWordHTML;
            wordIndex++;
        });
        originalParagraphValues.push(paragraph.textContent);
        bionicParagraphValues.push(paragraphBionic);
        // sendMessage('Completed a paragraph...');
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