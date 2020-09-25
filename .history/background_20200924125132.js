chrome.browserAction.onClicked.addListener((tab)=>{
    chrome.windows.create({'url': 'popup.html', 'type': 'popup', 'state': "minimized"}, function(window) {
    });
});