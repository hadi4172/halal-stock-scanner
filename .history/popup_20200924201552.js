let symbol = "UDHI";
let mktwatchProfile;
let mktwatchFinancials;
let reutersData;
let ychartsData;

var r = new XMLHttpRequest();
r.open('GET', `https://www.marketwatch.com/investing/stock/bmo/profile`, false);
r.send(null);
if (r.status == 200) { 
    mktwatchProfile = r.responseText;
}
r.open('GET', `https://www.marketwatch.com/investing/stock/udhi/financials/balance-sheet`, false);
r.send(null);
if (r.status == 200) { 
    mktwatchFinancials = r.responseText;
}
r.open('GET', `https://in.reuters.com/finance/stocks/company-profile/UDHI.PK`, false);
r.send(null);
if (r.status == 200) { 
    reutersData = r.responseText;
}
r.open('GET', `https://ycharts.com/companies/UDHI/multichart`, false);
r.send(null);
if (r.status == 200) { 
    ychartsData = r.responseText;
}


mktwatchProfile = minifyHTML(substringBetween(mktwatchProfile,'id="maincontent"','id="below"'));
let mktwatchDesc = substringBetween(mktwatchProfile,'class="full"><p>','</p>');
let sector = substringBetween(mktwatchProfile,'Sector</p><p class="data lastcolumn">','</p>');
let debtToAsset = substringBetween(mktwatchProfile,'Total Debt to Total Assets</p><p class="data lastcolumn">','</p>');
console.log(`mktwatchDesc:`,mktwatchDesc);
console.log(`sector:`,sector);
console.log(`debtToAsset:`,debtToAsset);
console.log(`reutersData:`,reutersData);

function substringBetween(s, a, b) {
    var p = s.indexOf(a) + a.length;
    return s.substring(p, s.indexOf(b, p));
}

function minifyHTML(string){
    return string.replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2');
}

//Sector</p><p class="data lastcolumn">