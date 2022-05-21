let active = false;
const debug = true;
const LOG_PREFIX = "[Bionic Reader Extension]";

function smartLog(message: string) {
    if (debug) {
        console.debug(LOG_PREFIX + ' ' + message);
    }
}

function selectArticle() {
    smartLog('Attempting to auto-select the text to transform...');
}