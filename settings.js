window.onload = function () {
    let fontSizeInput = document.querySelector("#input-fontsize");
    let darkModeSwitch = document.querySelector("#isdarkmode");
    let marketSelect = document.querySelector("#marketselector");
    let totalDebtToAssetsMaxInput = document.querySelector("#input-total-debt-to-assets-max");
    let cashAndReceivablesToAssetsMaxInput = document.querySelector("#input-cash-and-receivables-to-assets-max");
    let filtersTextInput = document.querySelector("#filters");
    let saveBtn = document.querySelector("#save-btn");
    let elementsAffectedByDarkMode = document.querySelectorAll("[darkmode]");

    let inputs = [fontSizeInput, darkModeSwitch, marketSelect, totalDebtToAssetsMaxInput, cashAndReceivablesToAssetsMaxInput];
    let isDarkMode = true;
    let needToSave = false;

    chrome.storage.sync.get(["fontSize", "darkMode", "market", "totalDebtToAssetsMax", "cashAndReceivablesToAssetsMax", "filters"], function (arg) {
        fontSizeInput.value = arg.fontSize;
        if (arg.darkMode === true) {
            darkModeSwitch.setAttribute("checked", "true");
        } else {
            toggleDarkMode();
            isDarkMode = false;
        }
        marketSelect.value = arg.market;
        totalDebtToAssetsMaxInput.value = arg.totalDebtToAssetsMax;
        cashAndReceivablesToAssetsMaxInput.value = arg.cashAndReceivablesToAssetsMax;
        filtersTextInput.value = arg.filters;
    });

    for (let i = 0, length = inputs.length; i < length; i++) {
        inputs[i].addEventListener("change", function () {
            needToSave = true;
        });
    }

    window.onbeforeunload = function (e) {
        if (needToSave) {
            return "Are you sure to quit without saving your changes ?"
        };
    };

    darkModeSwitch.addEventListener("change", function () {
        toggleDarkMode();
        if (darkModeSwitch.getAttribute("checked") == "true") {
            isDarkMode = false;
            darkModeSwitch.setAttribute("checked", "false")
        } else {
            isDarkMode = true;
            darkModeSwitch.setAttribute("checked", "true");
        }
    });

    marketSelect.addEventListener("click", () => {
        alert("Sorry, we only fully support US market at the moment.")
    });

    saveBtn.addEventListener("click", () => {
        chrome.storage.sync.set({
            fontSize: fontSizeInput.value,
            darkMode: darkModeSwitch.getAttribute("checked") == "true",
            market: marketSelect.value,
            totalDebtToAssetsMax: totalDebtToAssetsMaxInput.value,
            cashAndReceivablesToAssetsMax: cashAndReceivablesToAssetsMaxInput.value,
            filters: filtersTextInput.value
        });
        needToSave = false;
        document.querySelector("#savesuccess").style.removeProperty("display");
        setTimeout(() => {
            document.querySelector("#savesuccess").style.display = "none";
        }, 5000);
    });

    function toggleDarkMode() {
        if (isDarkMode) {
            document.querySelector(".dropdown").classList.remove("dropdown-dark");
            for (let i = 0, length = elementsAffectedByDarkMode.length; i < length; i++) {
                elementsAffectedByDarkMode[i].removeAttribute("darkmode");
            }

        } else {
            document.querySelector(".dropdown").classList.add("dropdown-dark");
            for (let i = 0, length = elementsAffectedByDarkMode.length; i < length; i++) {
                elementsAffectedByDarkMode[i].setAttribute("darkmode", "true");
            }
        }
    }
}

