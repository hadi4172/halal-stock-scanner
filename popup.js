

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
let domSecondDescription = document.querySelector("#description .secondvalue");
let domShortDescSource = document.querySelector("#shortdescsource");
let spinner = document.querySelector(".sk-chase");
let elementsAffectedByDarkMode = document.querySelectorAll("[darkmode]");
let textElements = Array.from(document.querySelectorAll(".info"));
textElements.push(document.querySelector("#description"));

let mktwatchProfile;
let mktwatchFinancials;
let secondDescData;
let ychartsData;
let wsjFinancials;
let wsjProfile;

let debtToAssetsMax = 33.33;
let cashAndReceivableToAssetsMax = 80;

window.onload = function () {
    chrome.storage.sync.get(["fontSize", "darkMode", "market", "totalDebtToAssetsMax", "cashAndReceivablesToAssetsMax"], function (arg) {
        console.log(`arg:`, arg);
        for (let i = 0, length = textElements.length; i < length; i++) {
            textElements[i].style.fontSize = arg.fontSize + "px";
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
        } else {
            mktwatchProfile = "Error"
        }

        r.open('GET', `https://www.marketwatch.com/investing/stock/${symbol}/financials/balance-sheet`, false);
        r.send(null);
        if (r.status == 200) {
            mktwatchFinancials = minifyHTML(r.responseText);
            // console.log(`mktwatchFinancials:`,mktwatchFinancials);
        } else {
            mktwatchFinancials = "Error"
        }

        r.open('GET', `https://www.marketbeat.com/stocks/${symbol}`, false);
        r.send(null);
        if (r.status == 200) {
            secondDescData = minifyHTML(r.responseText);
        } else {
            secondDescData = "Error"
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
        let cash = substringBetween(substringBetween(mktwatchFinancials, 'Cash &amp; Short Term Investments</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
        if (cash === "Error") cash = substringBetween(substringBetween(mktwatchFinancials, 'Total Cash &amp; Due from Banks</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
        let receivables = substringBetween(substringBetween(mktwatchFinancials, 'Total Accounts Receivable</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
        let totalAssets = substringBetween(substringBetween(mktwatchFinancials, '<div class="cell__content ">Total Assets</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
        let yearOfData = substringBetween(substringBetween(mktwatchFinancials, '<div class="financials">', '<div class="cell__content">5-year trend</div></th>'), '<div class="cell__content">', '</div></th>', true);
        let secondDesc = stripHTML(substringBetween(secondDescData, `<div class='read-more-section'>`, `</div><div class='c-blue read-more-button invisible'>`));
        let market = substringBetween(ychartsData, 'class="exchg exchgName">', '</span>');
        let cashAndReceivableToAssets = validateTotalAssets(cash, receivables, totalAssets);

        // console.log(`cash:`,cash);
        // console.log(`receivables:`,receivables);
        // console.log(`totalAssets:`,totalAssets);
        // console.log(`yearOfData:`,yearOfData);

        if (mktwatchProfile !== "Error") {
            if (debtToAsset === "Error") {
                r.open('GET', `https://www.wsj.com/market-data/quotes/${symbol}/financials`, false);
                r.send(null);
                if (r.status == 200) {
                    wsjFinancials = minifyHTML(r.responseText);
                } else {
                    wsjFinancials = "Error"
                }

                debtToAsset = substringBetween(wsjFinancials, `Total Debt to Total Assets</span><span class="data_data"><span class="marketDelta noChange">`, '</span>').replace(/,/g, '');
            }
            if (mktwatchDesc === "Error" || sector === "Error") {
                r.open('GET', `https://www.wsj.com/market-data/quotes/${symbol}/company-people`, false);
                r.send(null);
                if (r.status == 200) {
                    wsjProfile = minifyHTML(r.responseText);
                } else {
                    wsjProfile = "Error"
                }

                if (sector === "Error") sector = substringBetween(wsjProfile, 'Sector</span><span class="data_data">', '</span>');
            }

            if (mktwatchDesc === "Error") {
                mktwatchDesc = substringBetween(wsjProfile, '<div class="cr_description_full cr_expand"><p class="txtBody">', '</p>');
                domShortDescSource.innerHTML = "(wsj.com)";
            } else {
                domShortDescSource.innerHTML = "(marketwatch.com)";
            }
        }

        mktwatchDesc = mktwatchDesc.replace(/(gay|lgbt|mortgage|wine|military|defense|cannabi|alcohol|weapon|meat|pork|bank|gambling|insurance|tobacco|adult|sex|bonds|movie|shows|streaming|music|food|real estate investment|financial services|equity investment|beverage|general retailer|casino|marijuana)/ig, '<span class="highlight">$1</span>');
        secondDesc = secondDesc.replace(/(gay|lgbt|mortgage|wine|military|defense|cannabi|alcohol|weapon|meat|pork|bank|gambling|insurance|tobacco|adult|sex|bonds|movie|shows|streaming|music|food|real estate investment|financial services|equity investment|beverage|general retailer|casino|marijuana)/ig, '<span class="highlight">$1</span>');

        domSymbol.innerHTML = symbol;
        domMarket.innerHTML = market;
        domSectorVal.innerHTML = sector;
        domDebtToAssetsVal.innerHTML = debtToAsset;
        domCashAndReceivableToAssetsVal.innerHTML = cashAndReceivableToAssets;
        domMktWatchDescription.innerHTML = mktwatchDesc;
        domSecondDescription.innerHTML = secondDesc;
        domCashAndReceivableToAssetsYear.innerHTML = yearOfData;

        if(parseInt(yearOfData) + 2 < (new Date()).getFullYear() || yearOfData === "Error"){
            domCashAndReceivableToAssetsYear.classList.add("nodata");
        } else{
            domCashAndReceivableToAssetsYear.classList.remove("nodata");
        }

        if (cashAndReceivableToAssets > cashAndReceivableToAssetsMax) {
            domCashAndReceivableToAssetsVal.parentNode.classList.add("not-conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("nodata");
        } else if (!isNaN(cashAndReceivableToAssets)) {
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("not-conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.add("conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("nodata");
        } else {
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("not-conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.remove("conform");
            domCashAndReceivableToAssetsVal.parentNode.classList.add("nodata");
        }

        if (debtToAsset > debtToAssetsMax) {
            domDebtToAssetsVal.parentNode.classList.add("not-conform");
            domDebtToAssetsVal.parentNode.classList.remove("conform");
            domDebtToAssetsVal.parentNode.classList.remove("nodata");
        } else if (!isNaN(debtToAsset)) {
            domDebtToAssetsVal.parentNode.classList.add("conform");
            domDebtToAssetsVal.parentNode.classList.remove("not-conform");
            domDebtToAssetsVal.parentNode.classList.remove("nodata");
        } else {
            domDebtToAssetsVal.parentNode.classList.remove("not-conform");
            domDebtToAssetsVal.parentNode.classList.remove("conform");
            domDebtToAssetsVal.parentNode.classList.add("nodata");
        }

        if (document.querySelector(".not-conform") !== null) {
            warningIcon.style.display = "";
            warningIcon.classList.remove("nodataavailable");
        } else if(document.querySelector(".nodata") !== null){
            warningIcon.classList.add("nodataavailable");
        } else {
            warningIcon.classList.remove("nodataavailable");
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
    let thousand = false, million = false, billion = false, trillion = false, negative = false;
    if (string.includes("K")) {
        string = string.replace(/K/g, "");
        thousand = true
    } else if (string.includes("M")) {
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
    if (thousand) {
        number *= 1000;
    } else if (million) {
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
