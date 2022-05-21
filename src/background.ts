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


chrome.action.onClicked.addListener((tab) => {
    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id || -1 },
            files: ['contentScript.js']
        });
    }
});
