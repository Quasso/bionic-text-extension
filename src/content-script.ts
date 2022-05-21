let CS_LOG_PREFIX = "[Bionic Reader Extension: CS via BG]";

enum ITypesCS {
    log,
    action
}

/**
 *
 * Send a message to another part of the extension
 *
 * @param message [string] the message to log (if any)
 * @param type [ITypesCS] the type of event we're sending
 */
function sendMessage(message: string, type: ITypesCS) {
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type }, (response) => {
        if (response) {
            console.log(response);
        }
    });
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
    paragraphs.forEach((paragraph: any) => {
        sendMessage(paragraph.innerHTML.toString() || 'null', ITypesCS.log);
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