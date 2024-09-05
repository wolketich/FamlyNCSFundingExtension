chrome.action.onClicked.addListener((tab) => {
    const target = { tabId: tab.id };

    // Attach debugger to the current tab
    chrome.debugger.attach(target, "1.2", function () {
        console.log("Debugger attached");

        // Focus on the input field before typing
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const input = document.querySelector('input'); // Adjust selector as needed
                if (input) input.focus();
            }
        }, () => {
            // After focusing, simulate typing
            simulateTyping(target, [
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "n", code: "KeyN", keyCode: 78 },
                { type: "keyDown", key: "c", code: "KeyC", keyCode: 67 },
                { type: "keyDown", key: "s", code: "KeyS", keyCode: 83 },
                { type: "keyDown", key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
                { type: "keyDown", key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "a", code: "KeyA", keyCode: 65 },
                { type: "keyDown", key: "u", code: "KeyU", keyCode: 85 },
                { type: "keyDown", key: "g", code: "KeyG", keyCode: 71 },
                { type: "keyDown", key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "s", code: "KeyS", keyCode: 83 },
                { type: "keyDown", key: "e", code: "KeyE", keyCode: 69 },
                { type: "keyDown", key: "p", code: "KeyP", keyCode: 80 },
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "Tab", code: "Tab", keyCode: 9 },
                { type: "keyDown", key: "3", code: "Digit3", keyCode: 51 },
                { type: "keyDown", key: "0", code: "Digit0", keyCode: 48 },
                { type: "keyDown", key: "0", code: "Digit0", keyCode: 48 },
                { type: "keyDown", key: "Enter", code: "Enter", keyCode: 13 }
            ]);
        });
    });
});

function simulateTyping(target, events) {
    events.forEach(event => {
        chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", event);
    });
}