document.getElementById('fillFormBtn').addEventListener('click', () => {
    const option = document.getElementById('option').value;
    const startMonth = document.getElementById('startMonth').value;
    const endMonth = document.getElementById('endMonth').value;
    const amount = document.getElementById('amount').value;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'fillForm',
            data: { option, startMonth, endMonth, amount }
        }, (response) => {
            console.log(response.status);
        });
    });
});