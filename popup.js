

let inputSymbol = document.querySelector("#input");
let searchBtn = document.querySelector("#search-btn");
let settingsBtn = document.querySelector("#settings-btn");
let domSymbol = document.querySelector("#symbol");
let warningIcon = document.querySelector("#icon-is-correct-or-no");
let domMarket = document.querySelector("#market .value");
let domSectorVal = document.querySelector("#sector .value");
let domDebtToAssetsVal = document.querySelector("#debt-to-assets .value");
let domDebtToAssetsMax = document.querySelector("#debt-to-assets .max");
let domCashAndReceivableToAssetsVal = document.querySelector("#cash-receivable-to-total-assets .value");
let domCashAndReceivableToAssetsMax = document.querySelector("#cash-receivable-to-total-assets .max");
let domCashAndReceivableToAssetsYear = document.querySelector("#cash-receivable-to-total-assets .year");
let domMktWatchDescription = document.querySelector("#description .mtkwatchvalue");
let domReutersDescription = document.querySelector("#description .reutersvalue");
let spinner = document.querySelector(".sk-chase");
let elementsAffectedByDarkMode = document.querySelectorAll("[darkmode]");
let textElements = Array.from(document.querySelectorAll(".info"));
textElements.push(document.querySelector("#description"));

let mktwatchProfile;
let mktwatchFinancials;
let reutersData;
let ychartsData;

let debtToAssetsMax = 33.33;
let cashAndReceivableToAssetsMax = 80;

window.onload = function () {
    chrome.storage.sync.get(["fontSize", "darkMode", "market", "totalDebtToAssetsMax", "cashAndReceivablesToAssetsMax"], function (arg) {
        console.log(`arg:`, arg);
        for (let i = 0, length = textElements.length; i < length; i++) {
            textElements[i].style.fontSize = arg.fontSize+"px";
        }
        if (arg.darkMode === false) {
            for (let i = 0, length = elementsAffectedByDarkMode.length; i < length; i++) {
                elementsAffectedByDarkMode[i].removeAttribute("darkmode");
            }
        }
        if (typeof arg.totalDebtToAssetsMax !== 'undefined' && typeof arg.cashAndReceivablesToAssetsMax !== 'undefined') {
            debtToAssetsMax = parseFloat(arg.totalDebtToAssetsMax);
            cashAndReceivableToAssetsMax = parseFloat(arg.cashAndReceivablesToAssetsMax);
        }
        domDebtToAssetsMax.innerHTML = debtToAssetsMax;
        domCashAndReceivableToAssetsMax.innerHTML = cashAndReceivableToAssetsMax;
    });
}

searchBtn.addEventListener('click', () => {
    newSearch();
});

settingsBtn.addEventListener('click', () => {
    chrome.windows.create({ 'url': 'settings.html', 'type': 'popup', 'width': 440, 'height': 380 }, function (window) {
    });
});

inputSymbol.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
        newSearch();
        window.setTimeout(() => {
            inputSymbol.focus();
            inputSymbol.select();
        }, 0);
    }
});

inputSymbol.addEventListener('click', () => {
    window.setTimeout(() => {
        inputSymbol.select();
    }, 0);
});


function newSearch() {
    if (inputSymbol.value !== "") {
        spinner.style.display = "";
        document.title = "Loading..."
        let symbol = inputSymbol.value.toUpperCase();
        let r = new XMLHttpRequest();
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
        } else {
            ychartsData = "Error"
        }

        mktwatchProfile = substringBetween(mktwatchProfile, '</mw-watchlist>', '<footer class=');  //remove the code we don't need
        let mktwatchDesc = substringBetween(mktwatchProfile, '<p class="description__text">', '</p>');
        let sector = substringBetween(mktwatchProfile, 'Sector</small><span class="primary ">', '</span>');
        let debtToAsset = substringBetween(mktwatchProfile, 'Total Debt to Total Assets</td><td class="table__cell w25 ">', '</td>').replace(/,/g, '');
        let cash = substringBetween(substringBetween(mktwatchFinancials, 'Cash &amp; Short Term Investments</td>', '<td class="miniGraphCell">'), '<td class="valueCell">', '</td>', true);
        if (cash === "Error") cash = substringBetween(substringBetween(mktwatchFinancials, 'Cash &amp; Due from Banks</td>', '<td class="miniGraphCell">'), '<td class="valueCell">', '</td>', true);
        let receivables = substringBetween(substringBetween(mktwatchFinancials, 'Total Accounts Receivable</td>', '<td class="miniGraphCell">'), '<td class="valueCell">', '</td>', true);
        let totalAssets = substringBetween(substringBetween(mktwatchFinancials, '</a> Total Assets</td>', '<td class="miniGraphCell">'), '<td class="valueCell">', '</td>', true);
        let yearOfData = substringBetween(substringBetween(mktwatchFinancials, ' millions.</th>', '<th scope="col">5-year trend</th>'), '<th scope="col">', '</th>', true);
        let reutersDesc = stripHTML(substringBetween(reutersData, 'Full Description</a></h3></div><div class="moduleBody"><p>', '</p><div class="moreLink">'));
        let market = substringBetween(ychartsData, 'class="exchg exchgName">', '</span>');

        let cashAndReceivableToAssets = validateTotalAssets(cash, receivables, totalAssets);

        domSymbol.innerHTML = symbol;
        domMarket.innerHTML = market;
        domSectorVal.innerHTML = sector;
        domDebtToAssetsVal.innerHTML = debtToAsset;
        domCashAndReceivableToAssetsVal.innerHTML = cashAndReceivableToAssets;
        domMktWatchDescription.innerHTML = mktwatchDesc;
        domReutersDescription.innerHTML = reutersDesc;
        domCashAndReceivableToAssetsYear.innerHTML = yearOfData;

        if (cashAndReceivableToAssets > cashAndReceivableToAssetsMax) {
            domCashAndReceivableToAssetsVal.parentNode.classList.add("not-conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("conform");
        } else if (!isNaN(cashAndReceivableToAssets)) {
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("not-conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.add("conform");
        } else {
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("not-conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("conform");
        }

        if (debtToAsset > debtToAssetsMax) {
            domDebtToAssetsVal.parentNode.classList.add("not-conform");
            domDebtToAssetsVal.parentNode.classList.remove("conform");
        } else if (!isNaN(debtToAsset)) {
            domDebtToAssetsVal.parentNode.classList.add("conform");
            domDebtToAssetsVal.parentNode.classList.remove("not-conform");
        } else {
            domDebtToAssetsVal.parentNode.classList.remove("not-conform");
            domDebtToAssetsVal.parentNode.classList.remove("conform");
        }

        if (document.querySelector(".not-conform") !== null) {
            warningIcon.style.display = "";
        } else {
            warningIcon.style.display = "none";
        }

        document.title = symbol;
        setTimeout(() => {
            spinner.style.display = "none";
        }, 1000);
    }
}

function getNumberValue(string) {
    let number;
    let million = false, billion = false, trillion = false, negative = false;
    if (string.includes("M")) {
        string = string.replace(/M/g, "");
        million = true
    } else if (string.includes("B")) {
        string = string.replace(/B/g, "");
        billion = true;
    } else if (string.includes("T")) {
        string = string.replace(/T/g, "");
        trillion = true;
    }
    if (string.includes("(")) {
        string = string.replace(/\(|\)/g, "");
        negative = true
    }
    if (string.includes(",")) {
        string = string.replace(/,/g, '');
    }
    if (string === "-" || string === "Error") {
        string = "0";
    }
    number = parseFloat(string);
    if (million) {
        number *= 1000000;
    } else if (billion) {
        number *= 1000000000;
    } else if (trillion) {
        number *= 1000000000000;
    }
    if (negative) {
        number = -number;
    }
    return number;
}

function substringBetween(s, a, b, last = false) {
    if (typeof s === 'undefined') return "Error"
    let p = (last ? s.lastIndexOf(a) : s.indexOf(a)) + a.length;
    let f = s.indexOf(b, p);
    if ((p - a.length === -1) || f === -1) return "Error"
    return s.substring(p, f);
}

function minifyHTML(string) {
    return string.replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2');
}

function stripHTML(string) {
    return string.replace(/<[^>]*>?/gm, '');
}

function validateTotalAssets(cash, receivables, totalAssets) {
    let cashVal = getNumberValue(cash);
    let receivablesVal = getNumberValue(receivables);
    totalAssets = getNumberValue(totalAssets);
    if ((cash !== "Error" || receivables !== "Error") && totalAssets !== 0) {
        return round2dec(((cashVal + receivablesVal) / totalAssets) * 100);
    }
    return "Error"
}

function round2dec(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}
