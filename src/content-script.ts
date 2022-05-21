let CS_LOG_PREFIX = "[Bionic Reader Extension: CS]";
const DEBUG_CS = true;

function sendMessage(message: string) {
    chrome.runtime.sendMessage({ message, CS_LOG_PREFIX }, (response) => {
        console.log(response.farewell);
    });

}

function initContentScript() {
    sendMessage("Content script initialised!");
}

initContentScript();