chrome.browserAction.onClicked.addListener((tab)=>{
    chrome.windows.create({'url': 'popup.html', 'type': 'popup', 'width': 500, 'height':500}, function(window) {
    });
});