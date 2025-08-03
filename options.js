document.addEventListener("DOMContentLoaded", displayRedirects);

let editIndex = -1;

document.getElementById("add").addEventListener("click", () => {
  const keyword = document.getElementById("keyword").value.trim().toLowerCase();
  const url = document.getElementById("url").value.trim();

  if (keyword && url) {
    chrome.storage.sync.get({ redirects: [] }, (data) => {
      const redirects = data.redirects;

      if (editIndex > -1) {
        redirects[editIndex] = { keyword, url };
        editIndex = -1;
      } else {
        redirects.push({ keyword, url });
      }

      chrome.storage.sync.set({ redirects }, () => {
        displayRedirects();
        document.getElementById("keyword").value = '';
        document.getElementById("url").value = '';
      });
    });
  }
});

function displayRedirects() {
  chrome.storage.sync.get({ redirects: [] }, (data) => {
    const redirectList = document.getElementById("redirectList");
    redirectList.innerHTML = '';

    data.redirects.forEach(({ keyword, url }, index) => {
      const listItem = document.createElement("li");
      listItem.classList.add("bg-gray-50", "p-2", "rounded", "shadow", "flex", "flex-col");

      const topRow = document.createElement("div");
      topRow.classList.add("flex", "justify-between", "items-center");

      const label = document.createElement("span");
      label.textContent = `${keyword} → ${url}`;
      label.classList.add("text-sm", "truncate", "w-2/3");

      const buttonGroup = document.createElement("div");
      buttonGroup.classList.add("flex", "gap-1");

      const createButton = (text, classList, onClick) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        classList.forEach(cls => btn.classList.add(cls));
        btn.onclick = onClick;
        return btn;
      };

      const editButton = createButton("Edit", ["bg-blue-500", "text-white", "py-1", "px-2", "rounded", "hover:bg-blue-600"], () => {
        document.getElementById("keyword").value = keyword;
        document.getElementById("url").value = url;
        editIndex = index;
      });

      const deleteButton = createButton("Delete", ["bg-red-500", "text-white", "py-1", "px-2", "rounded", "hover:bg-red-600"], () => {
        data.redirects.splice(index, 1);
        chrome.storage.sync.set({ redirects: data.redirects }, displayRedirects);
      });

      const copyButton = createButton("Copy", ["bg-gray-500", "text-white", "py-1", "px-2", "rounded", "hover:bg-gray-600"], () => {
        navigator.clipboard.writeText(url).then(() => {
          alert("URL copied to clipboard");
        });
      });

      const qrContainer = document.createElement("div");
      qrContainer.classList.add("mt-2", "hidden");

      const qrButton = createButton("QR", ["bg-green-500", "text-white", "py-1", "px-2", "rounded", "hover:bg-green-600"], () => {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
          text: url,
          width: 150,
          height: 150
        });
        qrContainer.classList.toggle("hidden");
      });

      buttonGroup.appendChild(editButton);
      buttonGroup.appendChild(deleteButton);
      buttonGroup.appendChild(copyButton);
      buttonGroup.appendChild(qrButton);

      topRow.appendChild(label);
      topRow.appendChild(buttonGroup);

      listItem.appendChild(topRow);
      listItem.appendChild(qrContainer);
      redirectList.appendChild(listItem);
    });
  });
}
