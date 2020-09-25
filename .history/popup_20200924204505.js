let marketwatchData;
var r = new XMLHttpRequest();
r.open('GET', 'https://www.marketwatch.com/investing/stock/udhi/profile', false);
r.send(null);
if (r.status == 200) { 
    marketwatchData = r.responseText;
}
marketwatchData = marketwatchData.split('id="maincontent"').pop().split('id="below"')[0].replace(/\n|\t| {2,}/g,'');
let marketwatchCompanyDescription = marketwatchData.split('"full"> <p>').pop().split('</p>')[0];
console.log(`marketwatchCompanyDescription:`,marketwatchCompanyDescription);
