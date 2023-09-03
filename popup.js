

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
let wsjFinancials;
let wsjProfile;

let debtToAssetsMax = 33.33;
let cashAndReceivableToAssetsMax = 80;
let filtersString = "";

let isBatchMode = false;
let isDarkMode = true;

window.onload = function () {
    chrome.storage.sync.get(["fontSize", "darkMode", "market", "totalDebtToAssetsMax", "cashAndReceivablesToAssetsMax", "filters", "isBatchMode"], function (arg) {
        console.log(`arg:`, arg);
        for (let i = 0, length = textElements.length; i < length; i++) {
            textElements[i].style.fontSize = arg.fontSize + "px";
        }

        if (arg.isBatchMode === true) {
            isBatchMode = true;
            inputSymbol.removeAttribute("maxlength");
        }

        if (arg.darkMode === false) {
            isDarkMode = false;
            for (let i = 0, length = elementsAffectedByDarkMode.length; i < length; i++) {
                elementsAffectedByDarkMode[i].removeAttribute("darkmode");
            }
        }
        if (typeof arg.totalDebtToAssetsMax !== 'undefined' && typeof arg.cashAndReceivablesToAssetsMax !== 'undefined') {
            debtToAssetsMax = parseFloat(arg.totalDebtToAssetsMax);
            cashAndReceivableToAssetsMax = parseFloat(arg.cashAndReceivablesToAssetsMax);
        }
        if (typeof arg.filters !== 'undefined') {
            filtersString = arg.filters;
        }

        domDebtToAssetsMax.innerHTML = debtToAssetsMax;
        domCashAndReceivableToAssetsMax.innerHTML = cashAndReceivableToAssetsMax;
    });
}

searchBtn.addEventListener('click', () => {
    newSearch();
});

settingsBtn.addEventListener('click', () => {
    chrome.windows.create({ 'url': 'settings.html', 'type': 'popup', 'width': 460, 'height': 545 }, function (window) {
    });
});

inputSymbol.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
        newSearch();
        window.setTimeout(() => {
            inputSymbol.focus();
            if (!isBatchMode)
                inputSymbol.select();
        }, 0);
    }
});

inputSymbol.addEventListener('click', () => {
    window.setTimeout(() => {
        if (!isBatchMode)
            inputSymbol.select();
    }, 0);
});

let batchResults = [];
let batchPopup = null;

let isProcessing = false;
function updatePopup(batchResults, total) {
    let table = `<table id=resultTable><tr><th>Symbol</th><th>Flagged</th></tr>`;
    for (let i = 0; i < batchResults.length; i++) {
        const rowColor = batchResults[i].flagged ? 'style="background-color:rgb(255, 117, 117);"' : '';
        table += `<tr ${rowColor}><td>${batchResults[i].symbol}</td><td>${batchResults[i].flagged ? 'Yes' : 'No'}</td></tr>`;
    }
    table += `</table><br><div id="progress">Processed: ${batchResults.length} of ${total}</div>`;

    // Add Copy Button
    table += `<a id="copyButton" class="btn"><span style="margin: 0 3px;">Copy Table</span></a>`;

    let x = window.screenX || window.screenLeft || 0;
    let y = window.screenY || window.screenTop || 0;
    let width = 250;
    let height = 550;

    let batchPopup = window.open('', 'Batch Results', `width=${width},height=${height},left=${x + window.outerWidth + 5},top=${y}`);
    let css = `
         <style>
             body {
                 background-color: ${isDarkMode ? 'rgb(68, 68, 68)' : 'white'};
                 color: ${isDarkMode ? 'whitesmoke' : 'dimgrey'};
                 font-size: 13px;
             }
             table, th, td {
                 border: 1px solid ${isDarkMode ? 'whitesmoke' : 'black'};
                 font-size: 13px;
                 padding: .25rem .5rem;
             }
             th {
                 font-weight: bold;
             }
             #progress {
                 font-size: 13px;
                 padding: .25rem .5rem;
             }

             .btn {
                color: ${isDarkMode ? 'whitesmoke' : 'black'};
                border: 1px solid ${isDarkMode ? 'whitesmoke' : 'black'};
                cursor: pointer;
                display: block;
                font-size: 12px;
                padding: 3px;
                margin: 10px;
                max-width: 130px;
                text-decoration: none;
                width: 80px;
                text-align: center;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                border-radius: 30px;
                background: transparent;
            }

            .btn:hover {
                background: rgba(192, 192, 192, 0.2);
            }

            a[darkmode] {
                color: whitesmoke;
                border: 1px solid whitesmoke;
            }

         </style>
     `;

    batchPopup.document.body.innerHTML = css + table;

    // change popup title
    batchPopup.document.title = 'Batch Results';

    setTimeout(() => {

        batchPopup.document.addEventListener("click", function (event) {
            // get body element
            let body = batchPopup.document;
            // get the element that was clicked
            let target = event.target;
            // if the element is the button
            if (target.id === "copyButton" || target.parentNode.id === "copyButton") {
                if (isProcessing) return;
                isProcessing = true;
                let tableHTML = body.getElementById("resultTable").outerHTML;
                navigator.clipboard.writeText(tableHTML).then(function () {
                    alert('Table copied to clipboard');
                }).catch(function (err) {
                    showCustomDialog('Please confirm that you want to copy the table', function (userConfirmed) {
                        if (userConfirmed) {
                            navigator.clipboard.writeText(tableHTML);
                        }
                    });
                });
                isProcessing = false;
            }
        });
    }, 100);
    // }

}


function showCustomDialog(message, callback) {
    // Check if dialog already exists
    let existingDialog = document.getElementById('customDialog');
    if (existingDialog) return;

    // Create elements
    let dialog = document.createElement('div');
    dialog.id = 'customDialog'; // set a unique id
    let text = document.createElement('p');
    let yesButton = document.createElement('button');
    let noButton = document.createElement('button');

    // Add text and buttons to the dialog
    text.innerText = message;
    yesButton.innerText = 'Yes';
    noButton.innerText = 'No';

    dialog.appendChild(text);
    dialog.appendChild(yesButton);
    dialog.appendChild(noButton);

    // Style the dialog
    dialog.style.position = 'fixed';
    dialog.style.left = '50%';
    dialog.style.top = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.padding = '15px';
    dialog.style.border = '2px solid black';
    dialog.style.backgroundColor = 'white';

    // Add event listeners
    yesButton.addEventListener('click', function () {
        document.body.removeChild(dialog);
        callback(true);
    });

    noButton.addEventListener('click', function () {
        document.body.removeChild(dialog);
        callback(false);
    });

    // Add the dialog to the body
    document.body.appendChild(dialog);
}



async function fetchSymbolData(symbol) {
    return new Promise(async (resolve, reject) => {
        try {
            symbol = symbol.toUpperCase();

            let mktwatchProfile = await fetch(`https://www.marketwatch.com/investing/stock/${symbol}/profile`);
            let mktwatchFinancials = await fetch(`https://www.marketwatch.com/investing/stock/${symbol}/financials/balance-sheet`);
            let secondDescData = await fetch(`https://www.marketbeat.com/stocks/A/${symbol}`);

            mktwatchProfile.ok ? mktwatchProfile = minifyHTML(await mktwatchProfile.text()) : mktwatchProfile = "Error";
            mktwatchFinancials.ok ? mktwatchFinancials = minifyHTML(await mktwatchFinancials.text()) : mktwatchFinancials = "Error";
            secondDescData.ok ? secondDescData = minifyHTML(await secondDescData.text()) : secondDescData = "Error";


            let mktwatchProfilePart = substringBetween(mktwatchProfile, '</mw-watchlist>', '<footer class=');  //remove the code we don't need
            let mktwatchDesc = substringBetween(mktwatchProfilePart, '<p class="description__text">', '</p>');
            let sector = substringBetween(mktwatchProfilePart, 'Sector</small><span class="primary ">', '</span>');
            let debtToAsset = substringBetween(mktwatchProfilePart, 'Total Debt to Total Assets</td><td class="table__cell w25 ">', '</td>').replace(/,/g, '');
            let cash = substringBetween(substringBetween(mktwatchFinancials, 'Cash &amp; Short Term Investments</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
            if (cash === "Error") cash = substringBetween(substringBetween(mktwatchFinancials, 'Total Cash &amp; Due from Banks</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
            let receivables = substringBetween(substringBetween(mktwatchFinancials, 'Total Accounts Receivable</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
            let totalAssets = substringBetween(substringBetween(mktwatchFinancials, '<div class="cell__content ">Total Assets</div>', '</tr>'), '<div class="cell__content"><span class="">', '</span></div>', true);
            let yearOfData = substringBetween(substringBetween(mktwatchFinancials, '<header class="header header--table">', '<div class="cell__content">5-year trend</div></th>'), '<div class="cell__content">', '</div></th>', true);
            let secondDesc = stripHTML(substringBetween(substringBetween(secondDescData, '<div class="row price-data-section', '<div id="priceChart"'), `<div class="read-more-section">`, `<div class="c-blue read-more-button`));
            let market = substringBetween(mktwatchProfile, 'exchange" content="', '"');
            let cashAndReceivableToAssets = validateTotalAssets(cash, receivables, totalAssets);

            // console.log(`cash:`,cash);
            // console.log(`receivables:`,receivables);
            // console.log(`totalAssets:`,totalAssets);
            // console.log(`yearOfData:`,yearOfData);

            let wsjFinancials, wsjProfile;

            if (mktwatchProfilePart !== "Error") {
                if (debtToAsset === "Error") {
                    let wsjFinancialsResponse = await fetch(`https://www.wsj.com/market-data/quotes/${symbol}/financials`);
                    wsjFinancials = wsjFinancialsResponse.ok ? minifyHTML(await wsjFinancialsResponse.text()) : "Error";

                    debtToAsset = wsjFinancials !== "Error" ?
                        substringBetween(wsjFinancials, `Total Debt to Total Assets</span><span class="data_data"><span class="marketDelta noChange">`, '</span>').replace(/,/g, '') :
                        "Error";
                }

                if (mktwatchDesc === "Error" || sector === "Error") {
                    let wsjProfileResponse = await fetch(`https://www.wsj.com/market-data/quotes/${symbol}/company-people`);
                    wsjProfile = wsjProfileResponse.ok ? minifyHTML(await wsjProfileResponse.text()) : "Error";

                    if (sector === "Error") {
                        sector = wsjProfile !== "Error" ?
                            substringBetween(wsjProfile, 'Sector</span><span class="data_data">', '</span>') :
                            "Error";
                    }
                }

                if (mktwatchDesc === "Error") {
                    mktwatchDesc = wsjProfile !== "Error" ?
                        substringBetween(wsjProfile, '<div class="cr_description_full cr_expand"><p class="txtBody">', '</p>') :
                        "Error";
                    domShortDescSource.innerHTML = "(wsj.com)";
                } else {
                    domShortDescSource.innerHTML = "(marketwatch.com)";
                }
            }



            let haramRegex = new RegExp(`(${filtersString})`, "ig");

            let newMktwatchDesc = mktwatchDesc.replace(haramRegex, '<span class="highlight">$1</span>');
            let newSecondDesc = secondDesc.replace(haramRegex, '<span class="highlight">$1</span>');

            let replacementOccured = (newMktwatchDesc !== mktwatchDesc) || (newSecondDesc !== secondDesc)
            let flagged = replacementOccured;

            domSymbol.innerHTML = symbol;
            domMarket.innerHTML = market;
            domSectorVal.innerHTML = sector;
            domDebtToAssetsVal.innerHTML = debtToAsset;
            domCashAndReceivableToAssetsVal.innerHTML = cashAndReceivableToAssets;
            domMktWatchDescription.innerHTML = newMktwatchDesc;
            domSecondDescription.innerHTML = newSecondDesc;
            domCashAndReceivableToAssetsYear.innerHTML = yearOfData;

            if (parseInt(yearOfData) + 2 < (new Date()).getFullYear() || yearOfData === "Error") {
                domCashAndReceivableToAssetsYear.classList.add("nodata");
            } else {
                domCashAndReceivableToAssetsYear.classList.remove("nodata");
            }

            if (cashAndReceivableToAssets > cashAndReceivableToAssetsMax) {
                domCashAndReceivableToAssetsVal.parentNode.classList.add("not-conform");
                domCashAndReceivableToAssetsVal.parentNode.classList.remove("conform");
                domCashAndReceivableToAssetsVal.parentNode.classList.remove("nodata");
                flagged = true;
            } else if (!isNaN(cashAndReceivableToAssets)) {
                domCashAndReceivableToAssetsVal.parentNode.classList.remove("not-conform");
                domCashAndReceivableToAssetsVal.parentNode.classList.add("conform");
                domCashAndReceivableToAssetsVal.parentNode.classList.remove("nodata");
            } else {
                flagged = true;
                domCashAndReceivableToAssetsVal.parentNode.classList.remove("not-conform");
                domCashAndReceivableToAssetsVal.parentNode.classList.remove("conform");
                domCashAndReceivableToAssetsVal.parentNode.classList.add("nodata");
            }

            if (debtToAsset > debtToAssetsMax) {
                flagged = true;
                domDebtToAssetsVal.parentNode.classList.add("not-conform");
                domDebtToAssetsVal.parentNode.classList.remove("conform");
                domDebtToAssetsVal.parentNode.classList.remove("nodata");
            } else if (!isNaN(debtToAsset)) {
                domDebtToAssetsVal.parentNode.classList.add("conform");
                domDebtToAssetsVal.parentNode.classList.remove("not-conform");
                domDebtToAssetsVal.parentNode.classList.remove("nodata");
            } else {
                flagged = true;
                domDebtToAssetsVal.parentNode.classList.remove("not-conform");
                domDebtToAssetsVal.parentNode.classList.remove("conform");
                domDebtToAssetsVal.parentNode.classList.add("nodata");
            }

            if (document.querySelector(".not-conform") !== null) {
                warningIcon.style.display = "";
                warningIcon.classList.remove("nodataavailable");
            } else if (document.querySelector(".nodata") !== null) {
                warningIcon.classList.add("nodataavailable");
            } else {
                warningIcon.classList.remove("nodataavailable");
                warningIcon.style.display = "none";
            }

            if(!isBatchMode)
                document.title = symbol;
            setTimeout(() => {
                spinner.style.display = "none";
            }, 1000);


            resolve({
                symbol: symbol,
                flagged: flagged // or false, depending on your logic
            });
        } catch (error) {
            reject(error);
        }
    });
}


async function newSearch() {
    if (batchPopup !== null) {
        batchPopup.close();
        batchPopup = null;
    }
    if (inputSymbol.value !== "") {
        let symbols = inputSymbol.value.split(' ').filter((symbol) => symbol.trim() !== "");

        batchResults = []; // Reset the batch results
        const totalSymbols = symbols.length;

        if (!isBatchMode) {
            spinner.style.display = "";
            document.title = "Loading..."
            await fetchSymbolData(symbols[0]);
        }
        else {
            // Open an empty popup at the beginning
            updatePopup([], totalSymbols);
            for (let i = 0; i < totalSymbols; i++) {
                let symbol = symbols[i];
                if (symbol) { // Check if symbol is not an empty string
                    // Generate a random delay time between 500ms and 2500ms
                    let randomDelay = Math.floor(Math.random() * (2500 - 500 + 1)) + 500;

                    await new Promise((resolve) => {
                        setTimeout(async () => {
                            try {
                                const result = await fetchSymbolData(symbol);
                                batchResults.push(result);
                                updatePopup(batchResults, totalSymbols);
                                resolve();
                            } catch (error) {
                                console.error(`Error fetching data for ${symbol}: ${error}`);
                                resolve(); // still resolve the promise even if there was an error
                            }
                        }, randomDelay);
                    });
                }
            }
        }
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
