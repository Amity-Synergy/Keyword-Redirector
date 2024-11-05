chrome.omnibox.onInputEntered.addListener((text) => {
    if (text.toLowerCase() === "help") {
      // Open the options/settings page
      chrome.runtime.openOptionsPage();
    } else {
      // Check stored redirects for matching keyword
      chrome.storage.sync.get({ redirects: [] }, (data) => {
        const redirect = data.redirects.find(item => item.keyword === text.toLowerCase());
        if (redirect) {
          chrome.tabs.update({ url: redirect.url });
        }
      });
    }
  });
  