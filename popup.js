// declare global error variable (counter + error months)
let errorMonths = [];
let errorCounter = 0;


// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function openAndFillForm(option, startMonth, endMonth, amount) {
    // Click Add button to open the form
    function findFundingAddButton() {
        const allDivs = document.getElementsByTagName('div');
        for (const div of allDivs) {
          const h3Elements = div.getElementsByTagName('h3');
          for (const h3 of h3Elements) {
            if (h3.textContent.trim() === 'Funding') {
              const buttons = div.getElementsByTagName('button');
              for (const button of buttons) {
                if (button.innerText.trim() === 'Add funding') {
                  return button;
                }
              }
              const childDivs = div.querySelectorAll('div');
              for (const childDiv of childDivs) {
                const buttonsInChildDiv = childDiv.getElementsByTagName('button');
                for (const button of buttonsInChildDiv) {
                  if (button.innerText.trim() === 'Add') {
                    return button;
                  }
                }
              }
            }
          }
        }
        return null;
      }

    const clickAddButton = () => {
        const button = findFundingAddButton();
        if (button) {
            button.click();
        } else {
            errorCounter++;
            errorMonths.push(startMonth);
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
        errorCounter++;
        errorMonths.push(startMonth);
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
            errorCounter++;
            errorMonths.push(startMonth);
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
        errorCounter++;
        errorMonths.push(startMonth);
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

async function openAndDeleteForm(startMonth) {
    // Step 1: Find the <h3> element with text "Funding"
    const h3Elements = document.querySelectorAll('h3');
    let fundingHeader = null;

    h3Elements.forEach(h3 => {
        if (h3.textContent.trim() === 'Funding') {
            fundingHeader = h3;
        }
    });

    if (!fundingHeader) {
        console.error('Funding <h3> element not found');
    } else {
        // Step 2: Locate the parent div of the "Funding" section
        const fundingSectionDiv = fundingHeader.parentElement;

        // Step 3: Find the sibling div containing the buttons
        let buttonsContainerDiv = fundingSectionDiv.nextElementSibling;

        // Skip non-element nodes
        while (buttonsContainerDiv && buttonsContainerDiv.nodeType !== 1) {
            buttonsContainerDiv = buttonsContainerDiv.nextSibling;
        }

        if (!buttonsContainerDiv) {
            console.error('Buttons container div not found');
        } else {
            // Step 4: Select all buttons within the buttons container div
            const buttons = buttonsContainerDiv.querySelectorAll('button');

            // Process each button
            for (const button of buttons) {
                const dateRange = button.querySelector('h3')?.textContent.trim();
                const planName = button.querySelector('p')?.textContent.trim();

                // Parse the date range and compare it to the startMonth
                if (planName === 'NCS 2024/2025') {
                    if (isDateRangeAfter(dateRange, startMonth)) {
                        // Press the funding button and open the form
                        button.click();
                        await sleep(200);
                        console.log(`Clicked the Delete button for ${dateRange}`);

                        // Wait for the form to load
                        const form = document.querySelector('form');

                        if (form) {
                            const formButtons = form.querySelectorAll('button');
                            if (formButtons.length === 3) {
                                formButtons[2].click();
                                await sleep(200);
                                console.log('Clicked the Delete button in the form');
                            } else {
                                console.error('Not enough buttons found in the form, pressing the close button');
                                formButtons[0].click();
                                await sleep(200);
                            }
                        } else {
                            console.error('Form not found');
                        }
                    }
                }
            }
        }
    }

    // Function to pause execution for a given number of milliseconds
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Function to check if the date range is after the compare date
    function isDateRangeAfter(dateRangeStr, compareDateStr) {
        // Parse the date range string (e.g., "Aug 2024 - Aug 2024")
        const [startDateStr] = dateRangeStr.split(' - ');

        // Parse the compare date string (e.g., "September 2024")
        const compareDate = parseMonthYear(compareDateStr);

        // Parse the start date
        const startDate = parseMonthYear(startDateStr);

        // Return true if the start date is after the compare date
        return startDate > compareDate;
    }

    function parseMonthYear(monthYearStr) {
        // Split the string into month and year
        const [monthStr, yearStr] = monthYearStr.split(' ');
        const month = getMonthNumber(monthStr);
        const year = parseInt(yearStr, 10);

        // Create a Date object (the first day of the month)
        return new Date(year, month, 1);
    }

    function getMonthNumber(monthStr) {
        const months = {
            'jan': 0,
            'january': 0,
            'feb': 1,
            'february': 1,
            'mar': 2,
            'march': 2,
            'apr': 3,
            'april': 3,
            'may': 4,
            'jun': 5,
            'june': 5,
            'jul': 6,
            'july': 6,
            'aug': 7,
            'august': 7,
            'sep': 8,
            'sept': 8,
            'september': 8,
            'oct': 9,
            'october': 9,
            'nov': 10,
            'november': 10,
            'dec': 11,
            'december': 11
        };

        monthStr = monthStr.toLowerCase();

        if (months.hasOwnProperty(monthStr)) {
            return months[monthStr];
        } else {
            throw new Error(`Invalid month: ${monthStr}`);
        }
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
populateMonthDropdown('deleteMonth', 'September 2024');