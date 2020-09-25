let marketwatchData;
var r = new XMLHttpRequest();
r.open('GET', 'https://www.marketwatch.com/investing/stock/udhi/profile', false);
r.send(null);
if (r.status == 200) { 
    marketwatchData = r.responseText;
}

marketwatchData = marketwatchData.substring(marketwatchData.lastIndexOf('id="maincontent"') + 1, marketwatchData.lastIndexOf('id="below"')).replace(/\n|\t| {2,}/g,'');
let marketwatchCompanyDescription = marketwatchData.substring(marketwatchData.lastIndexOf('class=/"full/"><p>') + 1, marketwatchData.lastIndexOf('</p>'));
console.log(`marketwatchCompanyDescription:`,marketwatchCompanyDescription);
