/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content-script.ts ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DELIMITERS": () => (/* binding */ DELIMITERS)
/* harmony export */ });
let CS_LOG_PREFIX = "[BRE: c-s via background]";
let isActive = false;
let isInit = false;
let STATUS = {
    active: false,
    init: false
};
const DELIMITERS = {
    HYPHEN: "-",
    DBL_HYPHEN_A: "--",
    DBL_HYPHEN_B: "—",
    SPACE: " "
};
let originalParagraphValues = [];
let bionicParagraphValues = [];
let wordIndex = 0, paragraphIndex = 0;
var ITypesCS;
(function (ITypesCS) {
    ITypesCS[ITypesCS["log"] = 0] = "log";
    ITypesCS[ITypesCS["action"] = 1] = "action";
    ITypesCS[ITypesCS["notify"] = 2] = "notify";
})(ITypesCS || (ITypesCS = {}));
;
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
 * Advanced Parse String
 *
 * @description some "words" are actually two words conjoined by hyphens, this auto-detects that and handles parsing correctly
 * @param word [string] a string of continuous characters derived by splitting " " on page text
 * @returns [boolean | string] false if not present, string with correctly formatted text if it does
 */
function advancedParseString(word) {
    const containsDoubleHyphenA = word.indexOf(DELIMITERS.DBL_HYPHEN_A);
    const containsDoubleHyphenB = word.indexOf(DELIMITERS.DBL_HYPHEN_B);
    const advancedParseString = word.indexOf(DELIMITERS.HYPHEN);
    if (containsDoubleHyphenA > 0) {
        sendMessage(`This word contains a standard double hyphen ${word}!`);
        let words = word.split(DELIMITERS.DBL_HYPHEN_A);
        return bionicWord(words[0]) + DELIMITERS.DBL_HYPHEN_A + bionicWord(words[1]);
    }
    else if (containsDoubleHyphenB > 0) {
        sendMessage(`This word contains a conjoined double hyphen ${word}!`);
        let words = word.split(DELIMITERS.DBL_HYPHEN_B);
        return bionicWord(words[0]) + DELIMITERS.DBL_HYPHEN_B + bionicWord(words[1]);
    }
    else if (advancedParseString > 0) {
        sendMessage(`This word contains one hyphen ${word}!`);
        let words = word.split(DELIMITERS.HYPHEN);
        return bionicWord(words[0]) + DELIMITERS.HYPHEN + bionicWord(words[1]);
    }
    else if (word.length == 1) {
        // one-letter words are always bold
        return `<b>${word}</b>`;
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
 * Parse String
 *
 * @description some basic logic to parse strings according to their contents
 * @param str [string] a string of continuous characters derived by splitting " " on page text
 * @returns [string] the fully parsed HTML to correctly show the bionic text (inc. special parsing functionality for edge cases)
 */
function parseString(str) {
    // sendMessage(`Parsing word ${word}`);
    const advancedParse = advancedParseString(str);
    if (!advancedParse) {
        return bionicWord(str);
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
            formattedWordHTML = parseString(word);
            paragraphBionic += ' ' + formattedWordHTML;
            wordIndex++;
        });
        originalParagraphValues.push(paragraph.textContent);
        bionicParagraphValues.push(paragraphBionic);
        paragraph.innerHTML = paragraphBionic;
        sendMessage(`Completed parsing paragraph ${wordIndex} DOM updated successfully.`);
    }
    paragraphIndex++;
}
function toggleBionic() {
    sendMessage('Toggling bionic...', ITypesCS.notify);
}
/**
 *
 * Convert Page Text
 *
 * @description accepts an array of HTML elements and iterates over them to run the parser
 * @param paragraphs [NodeListOf<Element | HTMLParagraphElement] a list of elements on a matching page with the <p> tag!
 */
function convertPageText(paragraphs) {
    wordIndex = 0, paragraphIndex = 0;
    paragraphs.forEach((paragraph) => {
        sendMessage('Handling paragraph...');
        parseBionic(paragraph);
    });
    sendMessage(`Automatically processed ${paragraphIndex} paragraphs and ${wordIndex} words!`, ITypesCS.notify);
    STATUS.init = true;
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
    sendMessage(`Is init? ${STATUS.init}`);
    if (!STATUS.init) {
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