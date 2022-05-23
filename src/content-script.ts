let CS_LOG_PREFIX = "[BRE: c-s via background]";

declare interface BionicReaderStatuses {
    active: boolean;
    init: boolean;
}

let STATUS: BionicReaderStatuses = {
    active: false,
    init: false
};

export const DELIMITERS = {
    HYPHEN: "-",
    DBL_HYPHEN_A: "--",
    DBL_HYPHEN_B: "—",
    SPACE: " "
};

let originalParagraphValues: Array<string> = [];
let bionicParagraphValues: Array<string> = [];

let wordIndex: number = 0, paragraphIndex: number = 0;

enum ITypesCS {
    log,
    action,
    notify,
    store,
    store_create,
    store_read
};

/**
 *
 * Send Message
 *
 * @description helper const to =  communicate with background.js primarily. Send a message to another part of the extensio=>n
 * @param message [string] the message to log (if any)
 * @param type [ITypesCS] the type of event we're sending
 */
const sendMessage = (message: string, type?: ITypesCS, details?: any) => {
    !type ? type = ITypesCS.log : console.log('Nothing to see here');

    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type, details }, (response) => {
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
const advancedParseString = (word: string): boolean | string => {
    // Two different characters tend to cover the double hyphenation online
    const containsDoubleHyphenA = word.indexOf(DELIMITERS.DBL_HYPHEN_A);
    const containsDoubleHyphenB = word.indexOf(DELIMITERS.DBL_HYPHEN_B);
    // Just plain ol' hyphens baby
    const containsHyphen = word.indexOf(DELIMITERS.HYPHEN);

    if (containsDoubleHyphenA > 0) {
        sendMessage(`This word contains a standard double hyphen ${word}!`);
        let words = word.split(DELIMITERS.DBL_HYPHEN_A);
        return bionicWord(words[0]) + DELIMITERS.DBL_HYPHEN_A + bionicWord(words[1]);
    } else if (containsDoubleHyphenB > 0) {
        sendMessage(`This word contains a conjoined double hyphen ${word}!`);
        let words = word.split(DELIMITERS.DBL_HYPHEN_B);
        return bionicWord(words[0]) + DELIMITERS.DBL_HYPHEN_B + bionicWord(words[1]);
    } else if (containsHyphen > 0) {
        sendMessage(`This word contains one hyphen ${word}!`);
        let words = word.split(DELIMITERS.HYPHEN);
        return bionicWord(words[0]) + DELIMITERS.HYPHEN + bionicWord(words[1]);
    } else {
        return false;
    }
}

const makeBold = (word: string): string => {
    return `<b>${word}</b>`
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
const bionicWord = (word: string): string => {
    const mid = Math.floor(word.length / 2);
    const bionicSlice = word.slice(0, mid);
    const remainder = word.slice(mid);

    switch (word.length) {
        case 0:
            // empty string...
            return word;
        case 1:
            // one-letter words are always bold, and the normal formula
            // does not easily play with that so this is a simple
            // solution
            return makeBold(word);
        default:
            const formattedWordHTML = `${makeBold(bionicSlice)}${remainder}`;
            return formattedWordHTML;
    }
}

/**
 *
 * Parse String
 *
 * @description some basic logic to parse strings according to their contents
 * @param str [string] a string of continuous characters derived by splitting " " on page text
 * @returns [string] the fully parsed HTML to correctly show the bionic text (inc. special parsing const lity =  for edge cases=>)
 */
const parseString = (str: string): string => {
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
const parseBionic = (paragraph: Element) => {
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

        paragraph.innerHTML = paragraphBionic;
        sendMessage(`Completed parsing paragraph ${paragraphIndex} DOM updated successfully.`);
    }
    paragraphIndex++;
}

const toggleBionic = () => {
    sendMessage(`Toggling bionic state from '${STATUS.active}'...`, ITypesCS.notify);
}

/**
 *
 * Convert Page Text
 *
 * @description accepts an array of HTML elements and iterates over them to run the parser
 * @param paragraphs [NodeListOf<Element | HTMLParagraphElement] a list of elements on a matching page with the <p> tag!
 */
const convertPageText = (paragraphs: NodeListOf<Element>) => {
    wordIndex = 0, paragraphIndex = 0;

    paragraphs.forEach((paragraph: Element) => {
        sendMessage('Handling paragraph...');
        parseBionic(paragraph);
    });
    sendMessage(`Automatically processed ${paragraphIndex} paragraphs and ${wordIndex} words!`, ITypesCS.notify);
    STATUS.init = true;
    sendMessage('Parsed all content on this page', ITypesCS.store_create,
        {
            isInit: true,
            key: 'GET_SENDER_TAB'
        });
}

/**
 *
 * Auto-grab Paragraphs on a matching page
 *
 * @description: this is a rudimentary const which =  uses very little intelligence to grab all paragraph tex=>t
 * so that it can be parsed/formatted!
 *
 */
const autoGrabParagraphs = () => {
    const paragraphs: NodeListOf<Element> = document.querySelectorAll('body p');
    sendMessage(`There are ${paragraphs.length} paragraphs to parse.`);
    sendMessage(`Check if already loaded on this page`, ITypesCS.store_read, {
        action: 'checkPageInit',
        expectResponse: true
    });
    sendMessage(`Is init? ${STATUS.init}`);
    if (!STATUS.init) {
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
const initContentScript = () => {
    sendMessage("Content script initialised!");
    autoGrabParagraphs();
}

// this will only happen on pages matching the content-scripts "matches" list of URLs for now
initContentScript();