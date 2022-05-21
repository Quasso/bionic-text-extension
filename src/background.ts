const DEBUG = true;
const DEFAULT_LOG_PREFIX = "[Bionic Reader Extension: BG]";

enum ITypesBG {
    log,
    action
}

/**
 *
 * @param message [string] the message to log
 * @param prefix [string] optional: a prefix to use instead of the default
 */
function smartLog(message: string, prefix?: string) {
    if (DEBUG) {
        console.log((prefix || DEFAULT_LOG_PREFIX) + ' ' + message);
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
            files: ['content-script.js']
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
            smartLog(`Received message from tab with address: ${sender.tab.url}`, request.prefix);
        }

        switch (request.type) {
            case ITypesBG.action:
                smartLog('do action!')
                break;
            case ITypesBG.log:
                smartLog(request.message, request.prefix);
                break;
        }
    }
);