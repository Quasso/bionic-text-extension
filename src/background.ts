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

enum StorageKind {
    is_active = "isActive"
}

declare interface StorageObject {
    isActive?: boolean;
    exists?: boolean;
}

const storageSet = (value: boolean | string, kind: StorageKind) => {
    let STORAGE_OBJ: StorageObject;

    switch (kind) {
        case StorageKind.is_active:
            STORAGE_OBJ = {
                isActive: value as boolean
            }
            break;
    }
    chrome.storage.local.set(STORAGE_OBJ, () => {
        // smartLog(`Set key '${key}' and value '${value}'`);
        smartLog(`Set storage object: ${STORAGE_OBJ}`);
    });
}

const storageGet = (key: string): Promise<StorageObject> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([`${key}`], (value: StorageObject) => {
            smartLog('Val is:');
            console.log(value);
            if (Object.entries(value).length > 0) {
                smartLog(`Got key '${key}' with value '${value}'`);
                smartLog('Val is (sanity check #2):');
                console.log(value);
                resolve(value);
            } else {
                smartLog(`No matching value for the key ${key}`);
                resolve({ isActive: false, exists: false });
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
    chrome.storage.local.clear().then(() => {
        smartLog('Initialised successfully.');
    });
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

const formatKey = (url: string): string => {
    const cleanUrl = url.replace(/[^a-zA-Z0-9-]/g, '');
    return STORAGE_PREFIX + cleanUrl;
}


const handleAction = (action: string): Promise<StorageObject> => {
    return new Promise((resolve, reject) => {
        switch (action) {
            case 'checkPageInit':
                const key = StorageKind.is_active;
                storageGet(key)
                    .then((value) => {
                        if (value) {
                            console.log('Sending response with val...');
                            console.log('Confirm value immediately before send:');
                            console.log(value);
                            resolve(value);
                        } else {
                            resolve({ isActive: false });
                        }
                    }, (err) => {
                        console.log('Get storage failed:', err);
                        reject(err);
                    });
                break;
            default:
                reject(false);
                break;
        }
    });
}


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
            case ITypesBG.store_create:
                if (request.details.value) {
                    if (request.details.action == 'setPageInit') {
                        storageSet(request.details.value, StorageKind.is_active);
                    }
                }
                break;
            case ITypesBG.store_read:
                smartLog('Reading from the local store for the extension. Details:');
                console.log(request.details);
                smartLog('Action:');
                console.log(request.details.action);
                handleAction(request.details.action).then((value: StorageObject) => {
                    console.log(value);
                    sendResponse(value);
                });
                break;
        }
    }
);