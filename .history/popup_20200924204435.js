let symbol = "UDHI";
let mktwatchProfile;
let mktwatchFinancials;
let reutersData;
let ychartsData;

var r = new XMLHttpRequest();
r.open('GET', `https://www.marketwatch.com/investing/stock/bmo/profile`, false);
r.send(null);
if (r.status == 200) {
    mktwatchProfile = minifyHTML(r.responseText);
}
r.open('GET', `https://www.marketwatch.com/investing/stock/udhi/financials/balance-sheet`, false);
r.send(null);
if (r.status == 200) {
    mktwatchFinancials = minifyHTML(r.responseText);
}
r.open('GET', `https://in.reuters.com/finance/stocks/company-profile/UDHI.PK`, false);
r.send(null);
if (r.status == 200) {
    reutersData = minifyHTML(r.responseText);
}
r.open('GET', `https://ycharts.com/companies/UDHI/multichart`, false);
r.send(null);
if (r.status == 200) {
    ychartsData = minifyHTML(r.responseText);
}


mktwatchProfile = substringBetween(mktwatchProfile, 'id="maincontent"', 'id="below"');
let mktwatchDesc = substringBetween(mktwatchProfile, 'class="full"><p>', '</p>');
let sector = substringBetween(mktwatchProfile, 'Sector</p><p class="data lastcolumn">', '</p>');
let debtToAsset = substringBetween(mktwatchProfile, 'Total Debt to Total Assets</p><p class="data lastcolumn">', '</p>');
console.log(`mktwatchDesc:`, mktwatchDesc);
console.log(`sector:`, sector);
console.log(`debtToAsset:`, debtToAsset);
console.log(`mktwatchFinancials:`, mktwatchFinancials);

function substringBetween(s, a, b) {
    let p = s.indexOf(a) + a.length;
    let f = s.indexOf(b, p);
    if ((p - a.length === -1) || f === -1) return "Error"
    return s.substring(p, f);
}
function minifyHTML(string) {
    return string.replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2');
}

//Sector</p><p class="data lastcolumn">