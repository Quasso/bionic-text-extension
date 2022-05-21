let CS_LOG_PREFIX = "[Bionic Reader Extension: CS]";
const DEBUG_CS = true;

function smartLogCS(message: string) {
    if (DEBUG_CS) {
        console.debug(CS_LOG_PREFIX + ' ' + message);
    }
}

function initContentScript() {
    smartLogCS("Content script initialised!");
    console.log('test')
}

initContentScript();