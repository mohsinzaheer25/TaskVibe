function openPopup() {
    chrome.windows.getLastFocused({ populate: true }, (window) => {
        if (window.focused) {
            chrome.action.openPopup();
        }
    });
}

// Open popup every 2 minutes
chrome.alarms.create('openPopup', { periodInMinutes: 2 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'openPopup') {
        openPopup();
    }
});

// Open popup when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    openPopup();
});