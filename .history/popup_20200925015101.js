let symbol = "UDHI";
let mktwatchProfile;
let mktwatchFinancials;
let reutersData;
let ychartsData;

var r = new XMLHttpRequest();
r.open('GET', `https://www.marketwatch.com/investing/stock/${symbol}/profile`, false);
r.send(null);
if (r.status == 200) {
    mktwatchProfile = minifyHTML(r.responseText);
}
r.open('GET', `https://www.marketwatch.com/investing/stock/${symbol}/financials/balance-sheet`, false);
r.send(null);
if (r.status == 200) {
    mktwatchFinancials = minifyHTML(r.responseText);
}
r.open('GET', `https://in.reuters.com/finance/stocks/company-profile/${symbol}`, false);
r.send(null);
if (r.status == 200) {
    reutersData = minifyHTML(r.responseText);
}
r.open('GET', `https://ycharts.com/companies/${symbol}/multichart`, false);
r.send(null);
if (r.status == 200) {
    ychartsData = minifyHTML(r.responseText);
}

mktwatchProfile = substringBetween(mktwatchProfile, 'id="maincontent"', 'id="below"');
let mktwatchDesc = substringBetween(mktwatchProfile, 'class="full"><p>', '</p>');
let sector = substringBetween(mktwatchProfile, 'Sector</p><p class="data lastcolumn">', '</p>');
let debtToAsset = substringBetween(mktwatchProfile, 'Total Debt to Total Assets</p><p class="data lastcolumn">', '</p>');
let cash = substringBetween(substringBetween(mktwatchFinancials,'Cash &amp; Short Term Investments</td>', '<td class="miniGraphCell">'),'<td class="valueCell">','</td>',true);
let receivables = substringBetween(substringBetween(mktwatchFinancials,'Total Accounts Receivable</td>', '<td class="miniGraphCell">'),'<td class="valueCell">','</td>',true);
let totalAssets = substringBetween(substringBetween(mktwatchFinancials,'</a> Total Assets</td>', '<td class="miniGraphCell">'),'<td class="valueCell">','</td>',true);
let reutersDesc = substringBetween(reutersData, 'Full Description</a></h3></div><div class="moduleBody"><p>', '</p><div class="moreLink">');
let market = substringBetween(ychartsData, 'class="symbol-trade-time">', '</span>');

console.log(`mktwatchDesc:`, mktwatchDesc);
console.log(`sector:`, sector);
console.log(`debtToAsset:`, debtToAsset);
console.log(`cash:`,cash);
console.log(`reutersData:`, reutersData);

function getNumberValue(string) {
    let number;
    let million = false, billion = false, negative = false;
    if (string.includes("M")) {
      string = string.replace(/M/g, "");
      million = true
    } else if (string.includes("B")) {
      string = string.replace(/B/g, "");
      billion = true;
    }
    if (string.includes("(")) {
      string = string.replace(/\(|\)/g, "");
      negative = true
    }
    if (string.includes(",")) {
      string = string.replace(/,/g, '.');
    }
    if(string === "-"){
        string = 0;
    }
    number = parseFloat(string);
    if (million) {
      number *= 1000000;
    } else if (billion) {
      number *= 1000000000;
    }
    if (negative) {
      number = -number;
    }
    return number;
  }

function substringBetween(s, a, b, last = false) {
    let p = (last ? s.lastIndexOf(a) : s.indexOf(a)) + a.length;
    let f = s.indexOf(b, p);
    if ((p - a.length === -1) || f === -1) return "Error"
    return s.substring(p, f);
}
function minifyHTML(string) {
    return string.replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2');
}

//Full Description</a></h3></div><div class="moduleBody"><p>