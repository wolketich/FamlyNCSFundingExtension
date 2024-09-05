document.getElementById('fillFormBtn').addEventListener('click', () => {
    const option = document.getElementById('option').value;
    const startMonth = document.getElementById('startMonth').value;
    const endMonth = document.getElementById('endMonth').value;
    const amount = document.getElementById('amount').value;

    console.log('Button pressed. Sending the following data to content script:');
    console.log({ option, startMonth, endMonth, amount });

    // Make sure the data is valid before sending the message
    if (!option || !startMonth || !endMonth || !amount) {
        console.error('Some fields are missing!');
        alert('Please fill in all the fields.');
        return;
    }

    // Send the message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'fillForm',
            data: { option, startMonth, endMonth, amount }
        }, (response) => {
            if (response) {
                console.log(response.status);
            } else {
                console.error('No response from content script.');
            }
        });
    });
});