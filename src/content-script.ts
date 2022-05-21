let CS_LOG_PREFIX = "[Bionic Reader Extension: CS]";
const DEBUG_CS = true;

function sendMessage(message: string) {
    chrome.runtime.sendMessage({ message, CS_LOG_PREFIX }, (response) => {
        if (response) {
            console.log(response);
        }
    });

}

function initContentScript() {
    sendMessage("hello");
    sendMessage("Content script initialised!");
}

initContentScript();