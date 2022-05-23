let CS_LOG_PREFIX = "[BRE: contentScript via background]";
let isActive = false;
let isInit = false;

const HYPHEN = "-";
const DBL_HYPHEN_A = "--";
const DBL_HYPHEN_B = "—";

let originalParagraphValues: Array<string> = [];
let bionicParagraphValues: Array<string> = [];

let wordIndex: number = 0, paragraphIndex: number = 0;

enum ITypesCS {
    log,
    action,
    notify
}

/**
 *
 * Send Message
 *
 * @description helper function to communicate with background.js primarily. Send a message to another part of the extension
 * @param message [string] the message to log (if any)
 * @param type [ITypesCS] the type of event we're sending
 */
function sendMessage(message: string, type?: ITypesCS) {
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
function advancedParseString(word: string): boolean | string {
    const containsDoubleHyphenA = word.indexOf(DBL_HYPHEN_A);
    const containsDoubleHyphenB = word.indexOf(DBL_HYPHEN_B);

    const advancedParseString = word.indexOf(HYPHEN);

    if (containsDoubleHyphenA > 0) {
        sendMessage(`This word contains a standard double hyphen ${word}!`);
        let words = word.split(DBL_HYPHEN_A);
        return bionicWord(words[0]) + DBL_HYPHEN_A + bionicWord(words[1]);
    } else if (containsDoubleHyphenB > 0) {
        sendMessage(`This word contains a conjoined double hyphen ${word}!`);
        let words = word.split(DBL_HYPHEN_B);
        return bionicWord(words[0]) + DBL_HYPHEN_B + bionicWord(words[1]);
    } else if (advancedParseString > 0) {
        sendMessage(`This word contains one hyphen ${word}!`);
        let words = word.split(HYPHEN);
        return bionicWord(words[0]) + HYPHEN + bionicWord(words[1]);
    } else if (word.length == 1) {
        // one-letter words are always bold
        return `<b>${word}</b>`;
    } else {
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
function bionicWord(word: string): string {
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
 * @param str [string] a string of continuous characters derived by splitting " " on page text
 * @returns [string] the fully parsed HTML to correctly show the bionic text (inc. special parsing functionality for edge cases)
 */
function parseString(str: string): string {
    // sendMessage(`Parsing word ${word}`);
    const advancedParse = advancedParseString(str);
    if (!advancedParse) {
        return bionicWord(str);
    } else {
        return advancedParse as string;
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
function parseBionic(paragraph: Element) {
    let paragraphBionic: string = '';

    if (paragraph['textContent'] != null) {
        const words: Array<string> = paragraph.textContent.split(" ");

        words.forEach((word: string) => {
            let formattedWordHTML = '';
            formattedWordHTML = parseString(word);
            paragraphBionic += ' ' + formattedWordHTML;
            wordIndex++;
        });

        originalParagraphValues.push(paragraph.textContent as string);
        bionicParagraphValues.push(paragraphBionic as string);

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
function convertPageText(paragraphs: NodeListOf<Element>) {
    paragraphs.forEach((paragraph: Element) => {
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
    const paragraphs: NodeListOf<Element> = document.querySelectorAll('body p');
    sendMessage(`There are ${paragraphs.length} paragraphs to parse.`);
    sendMessage(`Is init? ${isInit}`);
    if (!isInit) {
        convertPageText(paragraphs);
    } else {
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