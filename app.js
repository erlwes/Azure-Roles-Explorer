let roles = [];
let reverseLookup = false;

// ----------------------------
// Load roles
// ----------------------------
fetch("./roles.json")
    .then(r => {
        if (!r.ok) throw new Error("Failed to load roles.json");
        return r.json();
    })
    .then(data => {
        roles = data;
    });


// ----------------------------
// DOM refs
// ----------------------------
const searchBox = document.getElementById("search");
const resultsDiv = document.getElementById("results");
const detailsDiv = document.getElementById("details");

const resultsTitle = document.getElementById("resultsTitle");
const detailsTitle = document.getElementById("detailsTitle");

const swapBtn = document.getElementById("swapBtn");
const examplesBar = document.getElementById("examplesBar");


// ----------------------------
// Example data
// ----------------------------
const roleExamples = [
    "Contributor",
    "Network",
    "Key Vault",
    "User Access",
    "Storage Blob"
];

const actionExamples = [
    "KeyVault/vaults",
    "Microsoft.Network/*",
    "blobServices/containers/write",
    "purge/action"
];


// ----------------------------
// UI MODE UPDATE
// ----------------------------
function updateDirection() {

    if (!reverseLookup) {

        resultsTitle.textContent = "Roles";
        detailsTitle.textContent = "Actions";

        searchBox.placeholder = "Search Roles...";
    }
    else {

        resultsTitle.textContent = "Actions";
        detailsTitle.textContent = "Roles";

        searchBox.placeholder = "Search Actions...";
    }

    updateExamples();
}


// ----------------------------
// EXAMPLE CHIPS
// ----------------------------
function updateExamples() {

    const list = reverseLookup
        ? actionExamples
        : roleExamples;

    examplesBar.innerHTML = "";

    list.forEach(text => {

        const chip = document.createElement("div");
        chip.className = "exampleChip";
        chip.textContent = text;

        chip.onclick = () => {

            searchBox.value = text;
            performSearch();
        };

        examplesBar.appendChild(chip);
    });
}


// ----------------------------
// SWAP MODE
// ----------------------------
swapBtn.addEventListener("click", () => {

    reverseLookup = !reverseLookup;

    resultsDiv.innerHTML = "";
    detailsDiv.innerHTML = "";

    updateDirection();
    performSearch();
});


// ----------------------------
// SEARCH INPUT
// ----------------------------
searchBox.addEventListener("input", performSearch);


// ----------------------------
// MAIN SEARCH
// ----------------------------
function performSearch() {

    const query = searchBox.value.toLowerCase().trim();

    resultsDiv.innerHTML = "";
    detailsDiv.innerHTML = "";

    if (!query) return;

    if (!reverseLookup) {

        roles
            .filter(r => r.Name.toLowerCase().includes(query))
            .slice(0, 30)
            .forEach(renderRoleItem);

    } else {

        const actions = new Set();

        for (const role of roles) {
            for (const action of role.Actions) {
                if (action.toLowerCase().includes(query)) {
                    actions.add(action);
                }
            }
        }

        Array.from(actions)
            .slice(0, 50)
            .forEach(renderActionItem);
    }
}


// ----------------------------
// RENDER ROLE ITEM
// ----------------------------
function renderRoleItem(role) {

    const div = document.createElement("div");

    div.className = "result roleItem";

    div.innerHTML = `
        ${role.Name}
        <span class="tag">ROLE</span>
        <span class="tag">${role.Actions.length} actions</span>
    `;

    div.onclick = () => showRoleDetails(role);

    resultsDiv.appendChild(div);
}


// ----------------------------
// RENDER ACTION ITEM
// ----------------------------
function renderActionItem(action) {

    const matchingRoles = roles.filter(r =>
        r.Actions.some(a =>
            a.toLowerCase() === action.toLowerCase()
        )
    );

    const div = document.createElement("div");

    div.className = "result actionItem";

    div.innerHTML = `
        ${action}
        <span class="tag">ACTION</span>
        <span class="tag">${matchingRoles.length} roles</span>
    `;

    div.onclick = () => showActionDetails(action);

    resultsDiv.appendChild(div);
}


// ----------------------------
// ROLE DETAILS VIEW
// ----------------------------
function showRoleDetails(role) {

    detailsDiv.innerHTML = `
        <h3>${role.Name}</h3>
        <p>${role.Description || ""}</p>

        <h4>Actions (${role.Actions.length})</h4>

        <ul>
            ${role.Actions.map(a =>
                `<li class="clickableAction">${a}</li>`
            ).join("")}
        </ul>
    `;

    // clicking actions → switch to action mode + search
    detailsDiv.querySelectorAll(".clickableAction")
        .forEach(el => {

            el.onclick = () => {

                reverseLookup = true;
                updateDirection();

                searchBox.value = el.textContent;
                performSearch();
            };
        });
}


// ----------------------------
// ACTION DETAILS VIEW
// ----------------------------
function showActionDetails(action) {

    const matchingRoles = roles.filter(r =>
        r.Actions.some(a =>
            a.toLowerCase() === action.toLowerCase()
        )
    );

    detailsDiv.innerHTML = `
        <h3>${action}</h3>

        <h4>Matching Roles (${matchingRoles.length})</h4>

        <ul>
            ${matchingRoles.map(r =>
                `<li class="clickableRole">${r.Name}</li>`
            ).join("")}
        </ul>
    `;

    // clicking roles → switch back to role mode + search
    detailsDiv.querySelectorAll(".clickableRole")
        .forEach(el => {

            el.onclick = () => {

                reverseLookup = false;
                updateDirection();

                searchBox.value = el.textContent;
                performSearch();
            };
        });
}


// ----------------------------
// INIT
// ----------------------------
updateDirection();
