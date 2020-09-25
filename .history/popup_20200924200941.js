let marketwatchData;
var r = new XMLHttpRequest();
r.open('GET', 'https://www.marketwatch.com/investing/stock/udhi/profile', false);
r.send(null);
if (r.status == 200) { 
    marketwatchData = r.responseText;
}
console.log(`marketwatchData:`,marketwatchData);
marketwatchData = marketwatchData.substring(marketwatchData.indexOf('id="blanket"') + 1);