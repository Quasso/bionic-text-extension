const DEBUG = true;
const ADV_DEBUG = false;
const DEFAULT_LOG_PREFIX = "[BRE: background]";

enum ITypesBG {
    log,
    action,
    notify
}

/**
 *
 * Smart Log
 *
 * @description helps with logging out stuff to the console of the background worker in Chrome
 * @param message [string] the message to log
 * @param prefix [string] optional: a prefix to use instead of the default
 */
function smartLog(message: string, prefix?: string, advOnly: boolean = false) {
    if ((DEBUG && !advOnly) || (DEBUG && advOnly && ADV_DEBUG)) {
        console.log((prefix || DEFAULT_LOG_PREFIX) + ' ' + message);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    smartLog('Initialised successfully.');
    sendNotification('test');
});

/**
 *
 * Send Notification
 *
 * @param message [string] the message to display in the notification
 */
function sendNotification(message: string) {
    const ts = Date.now();

    smartLog(`Generating notification with '${message}' at ${ts}...`);

    let notifyOptions: any = {
        type: "basic",
        title: "Bionic Reader Extension",
        message,
        iconUrl: chrome.runtime.getURL("assets/compiled/bio-128.png")
    };

    smartLog(notifyOptions);

    chrome.notifications.create(notifyOptions);
}

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
            smartLog(`Received message from tab with address: ${sender.tab.url}`, request.prefix, true);
        }

        switch (request.type) {
            case ITypesBG.action:
                // trigger a function or something
                break;
            case ITypesBG.log:
                smartLog(request.message, request.prefix);
                break;
            case ITypesBG.notify:
                sendNotification(request.message);
                break;
        }
    }
);