// Function to Find Funding Add Button
// JavaScript, find a button tag containing a p tag inside with text 'Add'
function findFundingAddButton() {
    return [...document.querySelectorAll('button')].find(button => {
        const p = button.querySelector('p');
        return p && p.innerText === 'Add';
    }) || null;
}

// Click on the Add button
function clickAddButton() {
    const button = findFundingAddButton();
    if (button) {
        button.click();
    } else {
        console.error("Add button not found");
    }
}

// Find form which opens after clicking on Add button
function findFundingForm() {
    return document.querySelector('form') || null;
}

// List all .Select-arrow-zone elements in the form
function findSelectArrowZones() {
    const form = findFundingForm();
    return form ? form.querySelectorAll('.Select-arrow-zone') : [];
}

// Generic function to simulate a click event
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

// Find div with a specific title attribute
function findFundingOption(option) {
    return document.querySelector(`div[title="${option}"]`) || null;
}

// Find div with a specific aria-label attribute (for month selection)
function findMonth(option) {
    return document.querySelector(`div[aria-label="${option}"]`) || null;
}

// Function to open the form and fill it out
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