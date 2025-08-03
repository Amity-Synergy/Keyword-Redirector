chrome.omnibox.onInputEntered.addListener((text) => {
  if (text.toLowerCase() === "help") {
    chrome.runtime.openOptionsPage();
  } else {
    chrome.storage.sync.get({ redirects: [] }, (data) => {
      const redirect = data.redirects.find(item => item.keyword === text.toLowerCase());
      if (redirect) {
        chrome.tabs.update({ url: redirect.url });
      }
    });
  }
});
