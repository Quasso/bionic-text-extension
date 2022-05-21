let CS_LOG_PREFIX = "[Bionic Reader Extension: CS]";

function smartLogCS(message: string) {
    if (debug) {
        console.debug(CS_LOG_PREFIX + ' ' + message);
    }
}

function initContentScript() {
    smartLogCS("Content script initialised!");
    console.log('test')
}

initContentScript();