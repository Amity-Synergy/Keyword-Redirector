document.addEventListener("DOMContentLoaded", () => {
  let currentMode = "main";

  const input = document.getElementById("launchInput");
  const feedback = document.getElementById("feedback");
  const addForm = document.getElementById("addForm");
  const listSection = document.getElementById("listSection");
  const redirectList = document.getElementById("redirectList");
  const newKeyword = document.getElementById("newKeyword");
  const newUrl = document.getElementById("newUrl");
  const saveBtn = document.getElementById("saveBtn");

  input.focus();

  function setMode(mode) {
    currentMode = mode;
    feedback.classList.add("hidden");
    feedback.textContent = "";

    input.classList.toggle("hidden", mode !== "main");
    addForm.classList.toggle("hidden", mode !== "add");
    listSection.classList.toggle("hidden", mode !== "list");

    if (mode === "main") {
      input.value = "";
      input.focus();
    } else if (mode === "add") {
      newKeyword.value = "";
      newUrl.value = "";
      newKeyword.focus();
    }
  }

 function renderList() {
  redirectList.innerHTML = "";

  chrome.storage.sync.get({ redirects: [] }, (data) => {
    const redirects = data.redirects;

    if (redirects.length === 0) {
      const noItem = document.createElement("li");
      noItem.textContent = "No redirects found.";
      noItem.className = "text-gray-500 text-sm text-center";
      redirectList.appendChild(noItem);
      return;
    }

    redirects.forEach(({ keyword, url }, index) => {
      const item = document.createElement("li");
      item.className = "border p-2 rounded shadow flex flex-col";

      const row = document.createElement("div");
      row.className = "flex justify-between items-center";

      const text = document.createElement("span");
      text.textContent = `${keyword} → ${url}`;
      text.className = "text-sm truncate w-2/3";

      const btnGroup = document.createElement("div");
      btnGroup.className = "flex gap-1";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs";
      editBtn.onclick = () => {
        newKeyword.value = keyword;
        newUrl.value = url;
        setMode("add");
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs";
      deleteBtn.onclick = () => {
        redirects.splice(index, 1);
        chrome.storage.sync.set({ redirects }, renderList);
      };

      const qrBtn = document.createElement("button");
      qrBtn.textContent = "QR";
      qrBtn.className = "bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs";
      qrBtn.onclick = () => {
        const qrImg = document.createElement("img");
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(url)}`;
        qrImg.className = "mt-2 mx-auto";
        qrImg.style.maxWidth = "100px";
        item.appendChild(qrImg);
      };

      btnGroup.append(editBtn, deleteBtn, qrBtn);
      row.append(text, btnGroup);
      item.appendChild(row);
      redirectList.appendChild(item);
    });
  });
}

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = input.value.trim().toLowerCase();

      if (value === "add") {
        setMode("add");
      } else if (value === "list") {
        setMode("list");
        renderList();
      } else {
        chrome.storage.sync.get({ redirects: [] }, (data) => {
          const match = data.redirects.find((r) => r.keyword === value);
          if (match) {
            chrome.tabs.create({ url: match.url });
            window.close();
          } else {
            feedback.textContent = "Invalid keyword";
            feedback.classList.remove("hidden");
            input.classList.add("border-red-500");
          }
        });
      }
    } else if (e.key === "Escape") {
      if (currentMode === "main") {
        window.close();
      } else {
        setMode("main");
      }
    }
  });

  newKeyword.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMode("main");
  });

  newUrl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMode("main");
    if (e.key === "Enter") saveBtn.click();
  });

  saveBtn.addEventListener("click", () => {
    const keyword = newKeyword.value.trim().toLowerCase();
    const url = newUrl.value.trim();

    if (keyword && url) {
      chrome.storage.sync.get({ redirects: [] }, (data) => {
        const redirects = data.redirects;
        const index = redirects.findIndex((r) => r.keyword === keyword);
        if (index > -1) {
          redirects[index] = { keyword, url };
        } else {
          redirects.push({ keyword, url });
        }
        chrome.storage.sync.set({ redirects }, () => setMode("main"));
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentMode !== "main") {
      setMode("main");
    }
  });
});
