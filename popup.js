let editIndex = -1;

document.addEventListener("DOMContentLoaded", () => {
  displayRedirects();

  document.getElementById("addBtn").addEventListener("click", () => {
    const keyword = document.getElementById("keyword").value.trim().toLowerCase();
    const url = document.getElementById("url").value.trim();
    if (!keyword || !url) return;

    chrome.storage.sync.get({ redirects: [] }, (data) => {
      const redirects = data.redirects;
      if (editIndex > -1) {
        redirects[editIndex] = { keyword, url };
        editIndex = -1;
      } else {
        redirects.push({ keyword, url });
      }
      chrome.storage.sync.set({ redirects }, () => {
        document.getElementById("keyword").value = '';
        document.getElementById("url").value = '';
        displayRedirects();
      });
    });
  });

  document.getElementById("shortcutBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });
});

function displayRedirects() {
  chrome.storage.sync.get({ redirects: [] }, (data) => {
    const list = document.getElementById("redirectList");
    const emptyState = document.getElementById("emptyState");
    list.innerHTML = '';

    if (data.redirects.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    data.redirects.forEach(({ keyword, url }, index) => {
      const li = document.createElement("li");
      li.className = "bg-white p-3 rounded shadow";

      const head = document.createElement("div");
      head.className = "text-sm font-medium text-gray-800 truncate overflow-hidden whitespace-nowrap";
      head.title = `${keyword} → ${url}`;
      head.textContent = `${keyword} → ${url}`;

      const img = document.createElement("img");
      img.className = "mt-2 w-24 h-24 hidden rounded";

      const btnRow = document.createElement("div");
      btnRow.className = "flex gap-2 mt-2";

      const createBtn = (label, classes, fn) => {
        const b = document.createElement("button");
        b.className = classes;
        b.textContent = label;
        b.onclick = fn;
        return b;
      };

      btnRow.append(
        createBtn("✏️", "flex-1 bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600", () => {
          document.getElementById("keyword").value = keyword;
          document.getElementById("url").value = url;
          editIndex = index;
        }),
        createBtn("🗑️", "flex-1 bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600", () => {
          data.redirects.splice(index, 1);
          chrome.storage.sync.set({ redirects: data.redirects }, displayRedirects);
        }),
        createBtn("📋", "flex-1 bg-gray-500 text-white py-1 px-2 rounded hover:bg-gray-600", () => {
          navigator.clipboard.writeText(url);
        }),
        createBtn("🔗", "flex-1 bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600", () => {
          img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
          img.classList.remove("hidden");
        })
      );

      li.append(head, btnRow, img);
      list.appendChild(li);
    });
  });
}
