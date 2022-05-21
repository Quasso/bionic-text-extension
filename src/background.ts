const DEBUG = true;
const DEFAULT_LOG_PREFIX = "[Bionic Reader Extension: BG]";

function smartLog(message: string, prefix?: string) {
    if (DEBUG) {
        console.log(prefix || DEFAULT_LOG_PREFIX + ' ' + message);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    smartLog('Initialised successfully.');
});

/**
 *
 * onClicked handler for contentScript
 *
 * Description: Listen for the user clicking the extension's icon
 */
chrome.action.onClicked.addListener((tab) => {
    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id || -1 },
            files: ['contentScript.js']
        });
    }
});

/**
 *
 * onMessage handler
 *
 * Description: for bi-directional communication from the contentScript once running
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (sender.tab) {
            smartLog(`Received message from tab with address: ${sender.tab.url}`);
        }
        smartLog(request.message);
    }
);