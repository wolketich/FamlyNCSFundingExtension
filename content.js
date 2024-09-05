// Find and click "Add" button, open form, fill it out
function findFundingAddButton() {
    return [...document.querySelectorAll('button')].find(button => {
        const p = button.querySelector('p');
        return p && p.innerText === 'Add';
    }) || null;
}

function clickAddButton() {
    const button = findFundingAddButton();
    if (button) {
        button.click();
    } else {
        console.error("Add button not found");
    }
}

function findFundingForm() {
    return document.querySelector('form') || null;
}

function findSelectArrowZones() {
    const form = findFundingForm();
    return form ? form.querySelectorAll('.Select-arrow-zone') : [];
}

function clickObject(object) {
    if (object) {
        const mouseDown = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        object.dispatchEvent(mouseDown);
    } else {
        console.error("Object to click not found");
    }
}

function findFundingOption(option) {
    return document.querySelector(`div[title="${option}"]`) || null;
}

function findMonth(option) {
    return document.querySelector(`div[aria-label="${option}"]`) || null;
}

function openAndFillForm(option, startMonth, endMonth, amount) {
    clickAddButton();

    const arrows = findSelectArrowZones();
    if (arrows.length < 3) {
        console.error("Not enough select arrow zones found in the form");
        return;
    }

    clickObject(arrows[0]);
    const fundingOption = findFundingOption(option);
    clickObject(fundingOption);

    clickObject(arrows[1]);
    const startMonthOption = findMonth(startMonth);
    clickObject(startMonthOption);

    clickObject(arrows[2]);
    const endMonthOption = findMonth(endMonth);
    clickObject(endMonthOption);

    const inputElement = document.querySelector('input[placeholder="Amount"]');
    if (inputElement) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inputElement, amount);
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.error("Amount input field not found");
    }

    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.click();
    } else {
        console.error("Submit button not found");
    }
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        const { option, startMonth, endMonth, amount } = request.data;
        openAndFillForm(option, startMonth, endMonth, amount);
        sendResponse({ status: 'Form filled successfully' });
    }
});