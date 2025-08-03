chrome.commands.onCommand.addListener((command) => {
  if (command === "open_keyword_popup") {
    chrome.windows.getCurrent((win) => {
      const width = 780;
      const height = 512;
      const left = win.left + Math.round((win.width - width) / 2);
      const top = win.top + Math.round((win.height - height) / 2);

      chrome.windows.create({
        url: chrome.runtime.getURL("quick-launch.html"),
        type: "popup",
        width,
        height,
        left,
        top,
        focused: true
      });
    });
  }
});

// Listen to message from quick-launch.js to auto-resize
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "resize") {
    chrome.windows.getLastFocused((win) => {
      chrome.windows.update(win.id, { height: msg.height });
    });
  }
});
