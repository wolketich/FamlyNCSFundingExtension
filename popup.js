// declare global error variable (counter + error months)
let errorMonths = [];
let errorCounter = 0;


// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function openAndFillForm(option, startMonth, endMonth, amount) {
    // Helper to pause execution for a specified time
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Wait for a specific DOM element to appear
    async function waitForElement(selector, maxRetries = 10, interval = 25) {
        for (let i = 0; i < maxRetries; i++) {
            const element = document.querySelector(selector);
            if (element) return element;
            await sleep(interval);
        }
        throw new Error(`Element with selector "${selector}" not found`);
    }

    // Simulate a mouse click on an element
    function simulateClick(element) {
        if (!element) throw new Error("Element to click not found");
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    }

    // Populate an input field with a value
    function populateInput(inputElement, value) {
        if (!inputElement) throw new Error("Input field not found");
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inputElement, value);
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Step 1: Find and click the "Add funding" button
    function findAndClickAddFundingButton() {
        const fundingSection = Array.from(document.getElementsByTagName('div')).find((div) => {
            const heading = div.querySelector('h3');
            return heading && heading.textContent.trim() === 'Funding';
        });

        if (!fundingSection) throw new Error("Funding section not found");

        const addButton = Array.from(fundingSection.getElementsByTagName('button')).find(
            (btn) => btn.innerText.trim() === 'Add funding' || btn.innerText.trim() === 'Add'
        );

        if (!addButton) throw new Error("Add button not found");
        addButton.click();
    }

    // Step 2: Wait for the form to appear
    const form = await (async () => {
        findAndClickAddFundingButton();
        return waitForElement('form');
    })();

    // Step 3: Select the funding option
    const fundingDropdown = form.querySelectorAll('.Select-arrow-zone')[0];
    if (!fundingDropdown) throw new Error("Funding dropdown not found");
    simulateClick(fundingDropdown);

    const fundingOption = await waitForElement(`div[title="${option}"]`);
    simulateClick(fundingOption);

    // Step 4: Select the start month
    const startMonthDropdown = form.querySelectorAll('.Select-arrow-zone')[1];
    if (!startMonthDropdown) throw new Error("Start month dropdown not found");
    simulateClick(startMonthDropdown);

    const startMonthOption = await waitForElement(`div[aria-label="${startMonth}"]`);
    simulateClick(startMonthOption);

    // Step 5: Select the end month
    const endMonthDropdown = form.querySelectorAll('.Select-arrow-zone')[2];
    if (!endMonthDropdown) throw new Error("End month dropdown not found");
    simulateClick(endMonthDropdown);
    await sleep(100);

    const endMonthOption = await waitForElement(`div[aria-label="${endMonth}"]`);
    simulateClick(endMonthOption);

    // Step 6: Input the amount
    const amountInput = form.querySelector('input[placeholder="Amount"]');
    populateInput(amountInput, amount);


    // Step 7: Submit the form
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) throw new Error("Submit button not found");
    submitButton.click();
}

async function openAndDeleteForm(startMonth) {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Step 1: Find the "Funding" section
    function findFundingSection() {
        const fundingHeader = Array.from(document.querySelectorAll('h3')).find(
            (h3) => h3.textContent.trim() === 'Funding'
        );
        if (!fundingHeader) throw new Error('Funding <h3> element not found');
        return fundingHeader.parentElement.nextElementSibling;
    }

    // Step 2: Get all funding buttons
    function getFundingButtons(fundingSection) {
        return Array.from(fundingSection.querySelectorAll('button'));
    }

    // Step 3: Check if the date range is after the startMonth
    function isDateRangeAfter(dateRange, compareDate) {
        const [startDateStr] = dateRange.split(' - ');
        const startDate = parseMonthYear(startDateStr);
        const compareDateParsed = parseMonthYear(compareDate);
        return startDate > compareDateParsed;
    }

    function parseMonthYear(monthYearStr) {
        const [monthStr, yearStr] = monthYearStr.split(' ');
        return new Date(parseInt(yearStr, 10), getMonthNumber(monthStr), 1);
    }

    function getMonthNumber(monthStr) {
        const months = {
            'jan': 0, 'january': 0, 'feb': 1, 'february': 1,
            'mar': 2, 'march': 2, 'apr': 3, 'april': 3,
            'may': 4, 'jun': 5, 'june': 5, 'jul': 6,
            'july': 6, 'aug': 7, 'august': 7, 'sep': 8,
            'september': 8, 'oct': 9, 'october': 9,
            'nov': 10, 'november': 10, 'dec': 11, 'december': 11
        };
        const lowerCaseMonth = monthStr.toLowerCase();
        if (!(lowerCaseMonth in months)) throw new Error(`Invalid month: ${monthStr}`);
        return months[lowerCaseMonth];
    }

    // Step 4: Process and delete all matching funding plans
    async function processFundingButtons(fundingSection, compareDate) {
        let buttonsProcessed = false;

        do {
            const fundingButtons = getFundingButtons(fundingSection);
            buttonsProcessed = false;

            for (const button of fundingButtons) {
                const dateRange = button.querySelector('h3')?.textContent.trim();
                const planName = button.querySelector('p')?.textContent.trim();

                if (planName === 'NCS 2024/2025' && dateRange && isDateRangeAfter(dateRange, compareDate)) {
                    button.click();
                    console.log(`Clicked the Delete button for ${dateRange}`);
                    await sleep(50);

                    const form = await waitForForm();
                    if (form) {
                        handleForm(form);
                        buttonsProcessed = true; // At least one button was processed
                    }
                }
            }
        } while (buttonsProcessed); // Repeat until no buttons are processed
    }

    // Step 5: Wait for the form to appear
    async function waitForForm() {
        return new Promise((resolve) => {
            const maxRetries = 10;
            let attempts = 0;

            const interval = setInterval(() => {
                const form = document.querySelector('form');
                if (form) {
                    clearInterval(interval);
                    resolve(form);
                } else if (++attempts >= maxRetries) {
                    clearInterval(interval);
                    resolve(null); // Form not found after retries
                }
            }, 100);
        });
    }

    // Step 6: Handle the form (delete or close)
    function handleForm(form) {
        const buttons = form.querySelectorAll('button');
        if (buttons.length >= 3) {
            buttons[2].click(); // Delete button
            console.log('Clicked the Delete button in the form');
        } else {
            console.error('Not enough buttons in the form, closing the form');
            buttons[0]?.click(); // Close button
        }
    }

    // Main process
    try {
        const fundingSection = findFundingSection();
        await processFundingButtons(fundingSection, startMonth);
        alert('All matching funding plans have been deleted.');
        console.log('All matching funding plans have been deleted.');
    } catch (error) {
        console.error(error.message);
    }
}


// Listeners for the buttons

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

                // Inject the function and run it
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    func: openAndFillForm,
                    args: [option, months[index], months[index], amount]
                }, (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error during execution: ', chrome.runtime.lastError.message);
                    } else {
                        console.log(`Form filled for ${months[index]} with amount ${amount}`);
                    }
                    resolve();
                });
            });
        });

        await sleep(200);  // Ensure enough time between submissions
    }
    if (errorCounter > 0) {
        alert(`Form filled with ${errorCounter} errors: ${errorMonths.join(', ')}`);
    } else
        alert('Form filled successfully!');
});

// Event listener for ECCE funding button
document.getElementById('ecceFundingBtn').addEventListener('click', async () => {
    const option = document.getElementById('ecceOption').value || 'ECCE 2024/2025';
    const amount = document.getElementById('ecceAmount').value || '245.10';
    const startMonth = document.getElementById('ecceStartDate').value || 'September 2024';
    const endMonth = document.getElementById('ecceEndDate').value || 'June 2025';

    await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab) {
                console.error('No active tab found.');
                resolve();
                return;
            }

            // Inject the function and run it
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: openAndFillForm,
                args: [option, startMonth, endMonth, amount]
            }, (result) => {
                if (chrome.runtime.lastError) {
                    console.error('Error during execution: ', chrome.runtime.lastError.message);
                } else {
                    console.log(`Form filled from ${startMonth} to ${endMonth} with amount ${amount}`);
                }
                resolve();
            });
        });
    });

    if (errorCounter > 0) {
        alert(`Form filled with errors: ${errorMonths.join(', ')}`);
    } else {
        alert('Form filled successfully!');
    }
});

// Listen for the delete button click
document.getElementById('deleteFundingBtn').addEventListener('click', async () => {
    const startMonth = document.getElementById('deleteMonth').value || 'September 2024';

    await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab) {
                console.error('No active tab found.');
                resolve();
                return;
            }

            // Inject the function and run it
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: openAndDeleteForm,
                args: [startMonth]
            }, (result) => {
                if (chrome.runtime.lastError) {
                    console.error('Error during execution: ', chrome.runtime.lastError.message);
                } else {
                    console.log(`Form deleted for ${startMonth}`);
                }
                resolve();
            });
        });
    });
});

const monthsList = [
    'August 2024', 'September 2024', 'October 2024', 'November 2024',
    'December 2024', 'January 2025', 'February 2025', 'March 2025',
    'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025'
];

function populateMonthDropdown(selectElementId, defaultMonth) {
    const selectElement = document.getElementById(selectElementId);
    monthsList.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.text = month;
        selectElement.add(option);
    });
    selectElement.value = defaultMonth;
}
// Populate the ECCE Start Date and End Date dropdowns
populateMonthDropdown('ecceStartDate', 'September 2024');
populateMonthDropdown('ecceEndDate', 'June 2025');

// Populate the Delete Month dropdown
populateMonthDropdown('deleteMonth', 'November 2024');