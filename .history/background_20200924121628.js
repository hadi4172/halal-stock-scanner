chrome.browserAction.onClicked.addListener((tab)=>{
    chrome.windows.create({'url': 'redirect.html', 'type': 'popup'}, function(window) {
    });
});