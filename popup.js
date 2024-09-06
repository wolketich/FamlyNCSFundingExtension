// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function openAndFillForm(option, startMonth, endMonth, amount) {
    // Click Add button to open the form
    function findFundingAddButton() {
        const button = [...document.querySelectorAll('button')].find(button => {
            const p = button.querySelector('p');
            return p && p.innerText === 'Add';
        });
        return button || null;
    }

    const clickAddButton = () => {
        const button = findFundingAddButton();
        if (button) {
            button.click();
        } else {
            console.error("Add button not found");
        }
    };

    // Wait for the form to load after clicking "Add"
    const waitForForm = async () => {
        for (let i = 0; i < 10; i++) {  // Try for 5 seconds
            const form = document.querySelector('form');
            if (form) {
                return form;
            }
            await sleep(500);
        }
        console.error("Form not found.");
        return null;
    };

    const clickObject = (object) => {
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
    };

    const findFundingOption = (option) => {
        return document.querySelector(`div[title="${option}"]`) || null;
    };

    const findMonth = (option) => {
        return document.querySelector(`div[aria-label="${option}"]`) || null;
    };

    // Start filling the form
    clickAddButton(); 

    // Wait for the form to be loaded
    const form = await waitForForm();
    if (!form) return;

    // Find and click the select arrow zones
    const arrows = form.querySelectorAll('.Select-arrow-zone');
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

        await sleep(700);  // Ensure enough time between submissions
    }

    alert('Form filled successfully!');
});
