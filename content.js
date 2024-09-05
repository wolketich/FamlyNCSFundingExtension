// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Find and click "Add" button, open form, fill it out
function findFundingAddButton() {
    const button = [...document.querySelectorAll('button')].find(button => {
        const p = button.querySelector('p');
        return p && p.innerText === 'Add';
    });

    console.log(button ? 'Found the Add button' : 'Add button not found');
    return button || null;
}

function clickAddButton() {
    const button = findFundingAddButton();
    if (button) {
        console.log('Clicking the Add button...');
        button.click();
    } else {
        console.error('Add button not found. Cannot proceed.');
    }
}

function findFundingForm() {
    const form = document.querySelector('form');
    console.log(form ? 'Found the funding form' : 'Funding form not found');
    return form || null;
}

function findSelectArrowZones() {
    const form = findFundingForm();
    if (!form) {
        console.error('Form not found, cannot find select arrow zones.');
        return [];
    }
    const arrows = form.querySelectorAll('.Select-arrow-zone');
    console.log(`Found ${arrows.length} select arrow zones.`);
    return arrows;
}

function clickObject(object) {
    if (object) {
        console.log('Clicking on object:', object);
        const mouseDown = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        object.dispatchEvent(mouseDown);
    } else {
        console.error('Object to click not found.');
    }
}

function findFundingOption(option) {
    const optionElement = document.querySelector(`div[title="${option}"]`);
    console.log(optionElement ? `Found the funding option "${option}"` : `Funding option "${option}" not found`);
    return optionElement || null;
}

function findMonth(option) {
    const monthElement = document.querySelector(`div[aria-label="${option}"]`);
    console.log(monthElement ? `Found month option "${option}"` : `Month option "${option}" not found`);
    return monthElement || null;
}

async function openAndFillForm(option, startMonth, endMonth, amount) {
    console.log('Opening and filling the form with the following details:', { option, startMonth, endMonth, amount });

    clickAddButton();

    // Adding a delay before finding the select arrow zones
    await sleep(500);

    const arrows = findSelectArrowZones();
    if (arrows.length < 3) {
        console.error('Not enough select arrow zones found in the form.');
        return;
    }

    clickObject(arrows[0]);
    
    // Adding delay before finding and selecting funding option
    await sleep(300);

    const fundingOption = findFundingOption(option);
    clickObject(fundingOption);

    clickObject(arrows[1]);

    // Adding delay before selecting the start month
    await sleep(300);

    const startMonthOption = findMonth(startMonth);
    clickObject(startMonthOption);

    clickObject(arrows[2]);

    // Adding delay before selecting the end month
    await sleep(300);

    const endMonthOption = findMonth(endMonth);
    clickObject(endMonthOption);

    // Adding a delay before filling the amount
    await sleep(500);

    const inputElement = document.querySelector('input[placeholder="Amount"]');
    if (inputElement) {
        console.log('Filling the amount:', amount);
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inputElement, amount);
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.error('Amount input field not found.');
    }

    // Adding a delay before clicking the submit button
    await sleep(500);

    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        console.log('Clicking the submit button...');
        submitButton.click();
    } else {
        console.error('Submit button not found.');
    }
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        console.log('Received message to fill the form:', request.data);
        const { option, startMonth, endMonth, amount } = request.data;
        openAndFillForm(option, startMonth, endMonth, amount);
        sendResponse({ status: 'Form filled successfully' });
    } else {
        console.error('Unknown action:', request.action);
    }
});