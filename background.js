chrome.browserAction.onClicked.addListener((tab) => {
    chrome.windows.create({ 'url': 'popup.html', 'type': 'popup', 'width': 420, 'height': 280 }, function (window) {
    });
});

chrome.browserAction.setTitle({
    title: 'Open a Scanner'
});

let filters = "gay|lgbt|nightclub|cabaret|bar|mortgage|wine|military|defense|cannabi|alcohol|weapon|meat|pork|bank|gambling|insurance|tobacco|adult|sex|bonds|movie|shows|streaming|music|food|real estate investment|financial services|equity investment|beverage|general retailer|casino|marijuana";

chrome.storage.sync.get(['firstAcess', 'version1p2p7'], function (arg) {
    if (typeof arg.firstAcess === 'undefined') {
        chrome.storage.sync.set({firstAcess:false});
        setDefaultVariables();
    }

    console.log(`arg.version1p2p7:`,arg.version1p2p7);
    if (typeof arg.version1p2p7 === 'undefined') {
        chrome.storage.sync.set({
            version1p2p7:false,
            filters:filters,
            isBatchMode:false
        });
    }
});

function setDefaultVariables(){
    chrome.storage.sync.set({
        fontSize:11,
        darkMode:true,
        market:"US",
        totalDebtToAssetsMax:33.33,
        cashAndReceivablesToAssetsMax:80,
        filters:filters,
        isBatchMode:false
    });
}
