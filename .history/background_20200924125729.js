chrome.browserAction.onClicked.addListener((tab)=>{
    chrome.windows.create({'url': 'popup.html', 'type': 'popup', 'width': 500, 'heigth':500}, function(window) {
    });
});