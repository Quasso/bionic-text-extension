import { Actions, DEBUG, DEFAULT_LOG_PREFIX, MessageTypes, StorageKind, StorageObject, STORAGE_PREFIX, VERBOSE } from "./interfaces";

/**
 *
 * Smart Log
 *
 * @description helps with logging out stuff to the console of the background worker in Chrome
 * @param message [string] the message to log
 * @param prefix [string] optional: a prefix to use instead of the default
 * @param verbose [boolean] optional: if true, require VERBOSE to be set
 */
const smartLog = (message: string, prefix?: string, verbose: boolean = false) => {
    if ((DEBUG && !verbose) || (DEBUG && verbose && VERBOSE)) {
        console.log((prefix || DEFAULT_LOG_PREFIX) + ' ' + message);
    }
}

/**
 *
 * Send Notification
 *
 * @param message [string] the message to display in the notification
 */
const sendNotification = (message: string) => {
    const ts = Date.now();

    smartLog(`Generating notification with '${message}' at ${ts}...`);

    const NOTIFICATION_OPTIONS: any = {
        type: "basic",
        title: "Bionic Reader Extension",
        message,
        iconUrl: chrome.runtime.getURL("assets/compiled/icon-128.png")
    };

    chrome.notifications.create(NOTIFICATION_OPTIONS);
}

/**
 *
 * Detect once the extension has loaded and log for dev purposes
 *
 */
chrome.runtime.onInstalled.addListener(async () => {
    smartLog('Initialised successfully.');
});

/**
 *
 * onClicked handler for contentScript
 *
 * @description listen for the user clicking the extension's icon
 */
chrome.action.onClicked.addListener((tab) => {
    if (tab) {
        smartLog('Event onClick registered. Executing script...');
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
 * @description for bi-directional communication from the contentScript once running
 */
chrome.runtime.onMessage.addListener(
    (request, sender) => {
        if (sender['tab'] && sender['tab']['url']) {
            smartLog(`Received message from tab with address: ${sender.tab.url}`, request.prefix, true);
        }

        switch (request.type) {
            case MessageTypes.log:
                smartLog(request.message, request.prefix);
                break;
            case MessageTypes.notify:
                sendNotification(request.message);
                break;
        }
    }
);