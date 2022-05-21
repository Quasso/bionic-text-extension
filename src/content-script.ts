let CS_LOG_PREFIX = "[Bionic Reader Extension: CS via BG]";
const DEBUG_CS = true;

function sendMessage(message: string) {
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX }, (response) => {
        if (response) {
            console.log(response);
        }
    });
}

function initContentScript() {
    sendMessage("Content script initialised!");
}

initContentScript();