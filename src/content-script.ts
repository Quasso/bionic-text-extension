import { Actions, CS_LOG_PREFIX, Delimiters, MessageTypes, VERBOSE, BreClasses } from './interfaces';

// Initial values
let originalParagraphValues: Array<string> = [];
let bionicParagraphValues: Array<string> = [];
let wordIndex: number = 0, paragraphIndex: number = 0;

/**
 *
 * Send Message
 *
 * @description helper const to =  communicate with background.js primarily. Send a message to another part of the extension
 * @param message [string] the message to log (if any)
 * @param type [MessageTypes] the type of event we're sending
 * @param details [object] no specific typings exist for this yet but it's an object with keys
 */
const sendMessage = (message: string, type?: MessageTypes, details?: any): void => {
    !type ? type = MessageTypes.log : console.log('Nothing to see here');
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type, details });
}

/**
 *
 * Send Message and Await Response
 *
 * @description helper const to =  communicate with background.js primarily. Send a message to another part of the extension
 * and also wait to hear back from it. (Note: performance of response erratic & not clear why)
 * @param message [string] the message to log (if any)
 * @param type [MessageTypes] the type of event we're sending
 * @param details [object] no specific typings exist for this yet but it's an object with keys
 */
const sendMessageAndAwaitResponse = (message: string, type?: MessageTypes, details?: any): Promise<boolean | undefined> => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type, details }, function (response) {
            const exists: boolean = response.exists;
            sendMessage(`Response block triggered! With resp: ${response}`); //recursive baby!
            sendMessage(`Response was: ${response}`);
            if (response == undefined) {
                sendMessage("Response was undefined, need to sort this out...");
                reject(undefined);
            } else if (!exists) {
                sendMessage("Response was false, meaning the key did not have a value.");
                sendMessage(`Response was ${response}`);
                resolve(exists);
            } else if (exists) {
                console.log(response);
                sendMessage(`Response was ${response}`);
                resolve(exists);
            }
        });
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
    const containsDoubleHyphenA = word.indexOf(Delimiters.DBL_HYPHEN_A);
    const containsDoubleHyphenB = word.indexOf(Delimiters.DBL_HYPHEN_B);
    // Just plain ol' hyphens baby
    const containsHyphen = word.indexOf(Delimiters.HYPHEN);

    if (containsDoubleHyphenA > 0) {
        sendMessage(`This word contains a standard double hyphen ${word}!`);
        let words = word.split(Delimiters.DBL_HYPHEN_A);
        return bionicWord(words[0]) + Delimiters.DBL_HYPHEN_A + bionicWord(words[1]);
    } else if (containsDoubleHyphenB > 0) {
        sendMessage(`This word contains a conjoined double hyphen ${word}!`);
        let words = word.split(Delimiters.DBL_HYPHEN_B);
        return bionicWord(words[0]) + Delimiters.DBL_HYPHEN_B + bionicWord(words[1]);
    } else if (containsHyphen > 0) {
        sendMessage(`This word contains one hyphen ${word}!`);
        let words = word.split(Delimiters.HYPHEN);
        return bionicWord(words[0]) + Delimiters.HYPHEN + bionicWord(words[1]);
    } else {
        return false;
    }
}

const makeBold = (word: string): string => {
    return `<span class="${BreClasses.B_CLASS}">${word}</span>`
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
    if (VERBOSE) { sendMessage(`Parsing str ${str}`); }
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

/**
 *
 * Toggle Bionic
 *
 * @description based on the extension's current state, toggles a class
 * on the page body which effectively appears to revert the bionic
 * parsing, where in reality it only modifies the DOM on first
 * load/parse
 * @param isActive [boolean] whether or not bionic text is active
 */
const toggleBionic = (): void => {
    const body = document.querySelector('body');
    const bodyClasses = body?.classList;
    bodyClasses?.forEach((className: string) => {
        switch (className) {
            case BreClasses.CLASS_ACTIVE:
                body?.classList.add(BreClasses.CLASS_CUSTOM);
                sendMessage(`Bionic Text is enabled and has been set to custom style this page...`, MessageTypes.notify);
                break;
            case BreClasses.CLASS_CUSTOM:
                body?.classList.remove(BreClasses.CLASS_ACTIVE);
                body?.classList.remove(BreClasses.CLASS_CUSTOM);
                body?.classList.add(BreClasses.CLASS_INACTIVE);
                sendMessage(`Bionic Text has been disabled on this page...`, MessageTypes.notify);
                break;
            case BreClasses.CLASS_INACTIVE:
                body?.classList.remove(BreClasses.CLASS_INACTIVE);
                body?.classList.add(BreClasses.CLASS_ACTIVE);
                sendMessage(`Bionic Text has been enabled on this page...`, MessageTypes.notify);
                break;
        }
    });
}

const finaliseInit = () => {
    document.querySelector('body')?.classList.add(BreClasses.CLASS_INIT);
    document.querySelector('body')?.classList.add(BreClasses.CLASS_ACTIVE);
    sendMessage('Fully initialised & active.');
    // setTimeout(() => {
    //     const boldies = document.querySelectorAll(`.${BreClasses.B_CLASS}`);
    //     if (boldies.length <= 0) {
    //         // boldies detected!
    //     } else {
    //         // no boldies detected! Perhaps the page wiped updates...
    //         const paragraphs: NodeListOf<Element> = document.querySelectorAll('body p');
    //         convertPageText(paragraphs);
    //     }
    // }, 250);
}

const initialised = () => {
    sendMessage(`Automatically processed ${paragraphIndex} paragraphs and ${wordIndex} words!`, MessageTypes.notify);
    sendMessage(`Appending the class`);
    finaliseInit();
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
    initialised();
}

const checkInit = (): boolean => {
    return document.querySelector('body')?.classList.contains(BreClasses.CLASS_INIT) || false;
}

/**
 *
 * Auto-grab Paragraphs on a matching page
 *
 * @description: this is a rudimentary const which =  uses very little intelligence to grab all paragraph tex=>t
 * so that it can be parsed/formatted!
 *
 */
const autoGrabParagraphs = (): void => {
    const paragraphs: NodeListOf<Element> = document.querySelectorAll('body p');
    sendMessage(`Auto-grab <p> elements running. There are ${paragraphs.length} paragraphs to parse.`);
    const isInit = checkInit();
    sendMessage(`Is loaded? ${isInit}`);

    if (!isInit) {
        convertPageText(paragraphs);
    } else {
        // It's more efficient to simply toggle a class which prevents <b> elements from rendering bold once initialised!
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
const initContentScript = (): void => {
    sendMessage("Content script initialising...");
    autoGrabParagraphs();
}

// this will only happen on pages matching the content-scripts "matches" list of URLs for now
initContentScript();