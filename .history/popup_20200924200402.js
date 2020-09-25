let marketwatchData;
var r = new XMLHttpRequest();
r.open('GET', 'https://www.marketwatch.com/investing/stock/udhi/profile', false);
r.send(null);
if (r.status == 200) { 
    marketwatchData = r.responseText;
}

marketwatchData = substringBetween(marketwatchData,'id="maincontent"','id="below"').replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2');
let marketwatchCompanyDescription = substringBetween(marketwatchData,'class="full"><p>','</p>');

console.log(`marketwatchCompanyDescription:`,marketwatchCompanyDescription);

function substringBetween(s, a, b) {
    var p = s.indexOf(a) + a.length;
    return s.substring(p, s.indexOf(b, p));
}