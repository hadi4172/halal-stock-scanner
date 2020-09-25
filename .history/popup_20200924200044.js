let marketwatchData;
var r = new XMLHttpRequest();
r.open('GET', 'https://www.marketwatch.com/investing/stock/udhi/profile', false);
r.send(null);
if (r.status == 200) { 
    marketwatchData = r.responseText;
}

marketwatchData = substringBetween(marketwatchData,'id="maincontent"','id="below"');
// let marketwatchCompanyDescription = substringBetween(marketwatchData,'"full"><p>','p><');

console.log(`marketwatchCompanyDescription:`,marketwatchData);

function substringBetween(s, a, b) {
    var p = s.indexOf(a) + a.length;
    return s.substring(p, s.indexOf(b, p));
}