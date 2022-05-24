const DEBUG = true;
const VERBOSE = false;
const DEFAULT_LOG_PREFIX = "[BRE: background]";
const STORAGE_PREFIX = 'breStatus-';

enum ITypesBG {
    log,
    action,
    notify,
    store,
    store_create,
    store_read
}

const storageSet = (key: string, value: string) => {
    const STORAGE_OBJ = { key: value };
    chrome.storage.local.set(STORAGE_OBJ, () => {
        smartLog(`Setting key '${key}' and value '${value}'`);
    });
}

const storageGet = (key: string): Promise<any | boolean> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([`${key}`], (value) => {
            if (value) {
                smartLog(`Got key '${key}' with value '${value}'`);
                resolve(value);
            } else {
                smartLog(`No matching value for the key ${key}`);
                reject(value);
            }
        });
    });

}


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
chrome.runtime.onInstalled.addListener(() => {
    smartLog('Initialised successfully.');
    // chrome.browserAction.setIcon({
    //     path: chrome.runtime.getURL("assets/compiled/bio-128.png")
    // });
});

/**
 *
 * onClicked handler for contentScript
 *
 * Description: Listen for the user clicking the extension's icon
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
 * Description: for bi-directional communication from the contentScript once running
 */
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
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
            case ITypesBG.store_create:
                if (request.details.isInit) {
                    if (request.details.key == 'GET_SENDER_TAB' && sender.tab) {
                        storageSet(STORAGE_PREFIX + sender.tab.url as string, request.details.value);
                    } else {
                        storageSet(request.details.key, request.details.isInit);
                    }
                    smartLog('Initialised. Storage set.');
                }
                break;
            case ITypesBG.store_read:
                smartLog('Should try to read from store...');
                let value;
                if (sender.tab && sender.tab.url && request.details.action === 'checkPageInit') {
                    smartLog(`Storage pref: ${STORAGE_PREFIX} Sender tab url: ${sender.tab.url}`);
                    value = storageGet(STORAGE_PREFIX + sender.tab.url as string);
                } else {
                    value = storageGet(request.details.key);
                }
                if (value) {
                    console.log(value);
                }
                break;
        }
    }
);