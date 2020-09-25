chrome.browserAction.onClicked.addListener((tab)=>{
    chrome.windows.create({'url': 'popup.html', 'type': 'popup', 'width': 380, 'height':280}, function(window) {
    });
});

chrome.browserAction.setTitle({
    title:'Open a Scanner'
});