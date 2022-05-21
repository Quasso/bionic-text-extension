let CS_LOG_PREFIX = "[Bionic Reader Extension: CS via BG]";

export enum ITypes {
    log,
    action
}

function sendMessage(message: string, type: ITypes) {
    chrome.runtime.sendMessage({ message, prefix: CS_LOG_PREFIX, type }, (response) => {
        if (response) {
            console.log(response);
        }
    });
}

function initContentScript() {
    sendMessage("Content script initialised!", ITypes.log);
    const paragraphs = document.querySelectorAll('body p');
    paragraphs.forEach((paragraph: any) => {
        sendMessage(paragraph.innerHTML.toString() || 'null', ITypes.action);
    });
}

initContentScript();