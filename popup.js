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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        
        if (!activeTab) {
            console.error('No active tab found.');
            return;
        }

        console.log('Sending message to tab:', activeTab.url);
        
        // Ensure that the content script is loaded by checking the URL
        if (activeTab.url && activeTab.url.startsWith('http')) {
            chrome.tabs.sendMessage(activeTab.id, {
                action: 'fillForm',
                data: { option, startMonth, endMonth, amount }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error handling response:', chrome.runtime.lastError.message);
                } else if (response) {
                    console.log(response.status);
                }
            });
        } else {
            console.error('The content script cannot be injected into this type of page.');
        }
    });
});