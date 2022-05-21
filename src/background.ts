const debug = true;
let BG_LOG_PREFIX = "[Bionic Reader Extension: BG]";

function smartLogBG(message: string) {
    if (debug) {
        console.debug(BG_LOG_PREFIX + ' ' + message);
    }
}

function selectArticle() {
    smartLogBG('Attempting to auto-select the text to transform...');
}

selectArticle();