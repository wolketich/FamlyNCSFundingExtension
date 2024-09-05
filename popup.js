// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to execute in the content script
async function openAndFillForm(option, startMonth, endMonth, amount) {
    console.log('Opening and filling the form with the following details:', { option, startMonth, endMonth, amount });

    function findFundingAddButton() {
        const button = [...document.querySelectorAll('button')].find(button => {
            const p = button.querySelector('p');
            return p && p.innerText === 'Add';
        });
        return button || null;
    }

    function clickObject(object) {
        if (object) {
            const mouseDown = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            object.dispatchEvent(mouseDown);
        }
    }

    function findFundingOption(option) {
        return document.querySelector(`div[title="${option}"]`);
    }

    function findMonth(option) {
        return document.querySelector(`div[aria-label="${option}"]`);
    }

    const button = findFundingAddButton();
    if (!button) {
        console.error('Add button not found.');
        return;
    }

    // Simulate button click to open form
    button.click();

    await sleep(1500);  // Add delay to let form load

    const arrows = document.querySelectorAll('.Select-arrow-zone');
    if (arrows.length < 3) {
        console.error('Not enough select arrow zones found.');
        return;
    }

    // Select the funding option
    clickObject(arrows[0]);
    await sleep(1000);  // Wait for options to load
    const fundingOption = findFundingOption(option);
    if (fundingOption) {
        fundingOption.click();
    } else {
        console.error(`Funding option ${option} not found.`);
    }

    // Select the start month
    clickObject(arrows[1]);
    await sleep(1000);
    const startMonthOption = findMonth(startMonth);
    if (startMonthOption) {
        startMonthOption.click();
    } else {
        console.error(`Start month ${startMonth} not found.`);
    }

    // Select the end month
    clickObject(arrows[2]);
    await sleep(1000);
    const endMonthOption = findMonth(endMonth);
    if (endMonthOption) {
        endMonthOption.click();
    } else {
        console.error(`End month ${endMonth} not found.`);
    }

    // Fill the amount
    await sleep(1000);
    const inputElement = document.querySelector('input[placeholder="Amount"]');
    if (inputElement) {
        inputElement.value = amount;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.error('Amount input field not found.');
    }

    // Click the submit button
    await sleep(1000);
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        console.log('Clicking the submit button...');
        submitButton.click();
    } else {
        console.error('Submit button not found.');
    }

    // Wait for the form submission to complete before resolving
    await sleep(2000);  // Adjust delay if needed to account for form submission
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

                // Inject and execute the openAndFillForm function in the active tab
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

        await sleep(3000);  // Ensure there is enough time between submissions
    }
});