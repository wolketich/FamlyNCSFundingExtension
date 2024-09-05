// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

document.getElementById('fillFormBtn').addEventListener('click', async () => {
    const option = document.getElementById('option').value;
    const amountsString = document.getElementById('amounts').value;
    const months = [
        'August 2024', 'September 2024', 'October 2024', 'November 2024',
        'December 2024', 'January 2025', 'February 2025', 'March 2025',
        'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025'
    ];

    const amounts = amountsString.split(',').map(amount => amount.trim());

    if (!option || amounts.length !== months.length) {
        console.error('Please provide a funding type and 13 comma-separated amounts.');
        alert('Please fill in the funding type and provide exactly 13 amounts.');
        return;
    }

    for (let index = 0; index < months.length; index++) {
        const amount = amounts[index];
        if (amount === '0' || amount === '') {
            console.log(`Skipping ${months[index]}`);
            continue;
        }

        await new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (!activeTab) {
                    console.error('No active tab found.');
                    resolve();
                    return;
                }

                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    func: openAndFillForm,
                    args: [option, months[index], months[index], amount]
                }, () => {
                    console.log(`Form filled for ${months[index]} with amount ${amount}`);
                    resolve();
                });
            });
        });

        await sleep(3000);  // Ensure enough time between submissions
    }
});