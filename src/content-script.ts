let CS_LOG_PREFIX = "[BRE: contentScript via background]";
let isActive = false;
let isInit = false;

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
 * Helper function to communicate with background.js primarily
 *
 * @description Send a message to another part of the extension
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

function containsHyphen(word: string) {
    const containsDoubleHyphen = word.indexOf('--');
    if (containsDoubleHyphen > 0) {
        sendMessage(`This word contains a double hyphen ${word}!`);
    }
    const containsHyphen = word.indexOf('-');
    if (containsHyphen > 0) {
        sendMessage(`This word contains one hyphen ${word}!`);
    }
}


function parseWord(word: string): string {
    containsHyphen(word);
    const mid = Math.floor(word.length / 2);
    const bionicSlice = word.slice(0, mid);
    const remainder = word.slice(mid);

    const formattedWordHTML = `<b>${bionicSlice}</b>${remainder}`;
    return formattedWordHTML;
}

// TODO: make this more customisable with themes?
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

        words.forEach((word: string, index: number) => {
            let formattedWordHTML = '';

            paragraphBionic += ' ' + formattedWordHTML;
            wordIndex++;
        });

        originalParagraphValues.push(paragraph.textContent as string);
        bionicParagraphValues.push(paragraphBionic as string);

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