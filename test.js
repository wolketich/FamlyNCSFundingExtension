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

    button.click();
    console.log('Clicked the Add button to open the form.');

    await sleep(2000);  // Wait for the form to load

    const arrows = document.querySelectorAll('.Select-arrow-zone');
    if (arrows.length < 3) {
        console.error('Not enough select arrow zones found.');
        return;
    }

    console.log('Found select arrow zones:', arrows);

    // Select the funding option
    clickObject(arrows[0]);
    await sleep(1500);  // Wait for options to load
    const fundingOption = findFundingOption(option);
    if (fundingOption) {
        fundingOption.click();
        console.log(`Selected the funding option: ${option}`);
    } else {
        console.error(`Funding option ${option} not found.`);
    }

    // Select the start month
    clickObject(arrows[1]);
    await sleep(1500);
    const startMonthOption = findMonth(startMonth);
    if (startMonthOption) {
        startMonthOption.click();
        console.log(`Selected the start month: ${startMonth}`);
    } else {
        console.error(`Start month ${startMonth} not found.`);
    }

    // Select the end month
    clickObject(arrows[2]);
    await sleep(1500);
    const endMonthOption = findMonth(endMonth);
    if (endMonthOption) {
        endMonthOption.click();
        console.log(`Selected the end month: ${endMonth}`);
    } else {
        console.error(`End month ${endMonth} not found.`);
    }

    // Fill the amount
    await sleep(1500);  // Wait before filling the amount
    const inputElement = document.querySelector('input[placeholder="Amount"]');
    if (inputElement) {
        inputElement.value = amount;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`Entered the amount: ${amount}`);
    } else {
        console.error('Amount input field not found.');
    }

    // Submit the form
    await sleep(1500);  // Wait before submitting
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        console.log('Clicking the submit button...');
        submitButton.click();
    } else {
        console.error('Submit button not found.');
    }

    await sleep(2000);  // Wait for form submission to complete
}

amountsString = "0,0,102.72,115.56,141.24,38.52,0,0,0,0,0,0,0";
option = "NCS 2024/2025"
const months = [
    'August 2024', 'September 2024', 'October 2024', 'November 2024',
    'December 2024', 'January 2025', 'February 2025', 'March 2025',
    'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025'
];

const amounts = amountsString.split(',').map(amount => amount.trim());

for (let index = 0; index < months.length; index++) {
    const amount = amounts[index];
    if (amount === '0' || amount === '') {
        console.log(`Skipping ${months[index]}`);
        continue;
    } else {
        console.log(`Filling form for ${months[index]} with amount ${amount}`);
        openAndFillForm(option, months[index], months[index], amount);
        await sleep(10000);
    }

}