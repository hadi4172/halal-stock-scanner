chrome.browserAction.onClicked.addListener((tab) => {
    chrome.windows.create({ 'url': 'popup.html', 'type': 'popup', 'width': 420, 'height': 280 }, function (window) {
    });
});

chrome.browserAction.setTitle({
    title: 'Open a Scanner'
});

chrome.storage.sync.get('firstAcess', function (arg) {
    if (typeof arg.firstAcess === 'undefined') {
        chrome.storage.sync.set({firstAcess:false});
        setDefaultVariables();
    }
});

function setDefaultVariables(){
    chrome.storage.sync.set({
        fontSize:11,
        darkMode:true,
        market:"US",
        totalDebtToAssetsMax:33.33,
        cashAndReceivablesToAssetsMax:80
    });
}