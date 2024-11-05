// Load saved redirects on page load
document.addEventListener("DOMContentLoaded", displayRedirects);

let editIndex = -1;  // Keeps track of the item being edited

document.getElementById("add").addEventListener("click", () => {
    const keyword = document.getElementById("keyword").value.trim().toLowerCase();
    const url = document.getElementById("url").value.trim();

    if (keyword && url) {
        chrome.storage.sync.get({ redirects: [] }, (data) => {
            const redirects = data.redirects;

            if (editIndex > -1) {
                // Update existing redirect
                redirects[editIndex] = { keyword, url };
                editIndex = -1;  // Reset edit index
            } else {
                // Add new redirect
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
            listItem.textContent = `${keyword} → ${url}`;

            // Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.style.marginLeft = "10px";
            //   tailwindcss editButton style class
            editButton.classList.add("bg-blue-500", "text-white", "py-2", "px-2", "rounded", "hover:bg-blue-600");

            editButton.onclick = () => {
                document.getElementById("keyword").value = keyword;
                document.getElementById("url").value = url;
                editIndex = index;  // Set index for editing
            };

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.style.marginLeft = "5px";
            //   tailwindcss deleteButton style class
            deleteButton.classList.add("bg-red-500", "text-white", "py-2", "px-2", "rounded", "hover:bg-red-600");
            deleteButton.onclick = () => {
                // Modify and save the redirects array
                data.redirects.splice(index, 1);  // Remove the redirect
                chrome.storage.sync.set({ redirects: data.redirects }, displayRedirects);  // Save and refresh
            };

            listItem.appendChild(editButton);
            listItem.appendChild(deleteButton);
            redirectList.appendChild(listItem);
        });
    });
}
