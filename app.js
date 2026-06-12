
let roles = [];

// =====================================================
// LOAD DATA
// =====================================================
fetch("./roles.json")
    .then(r => {
        if (!r.ok) throw new Error("Failed to load roles.json");
        return r.json();
    })
    .then(data => roles = data);

// =====================================================
// ELEMENTS
// =====================================================
const searchBox = document.getElementById("search");
const resultsDiv = document.getElementById("results");
const detailsDiv = document.getElementById("details");
const modeHeader = document.getElementById("modeHeader");

// =====================================================
// MODE
// =====================================================
function getMode() {
    return document.querySelector('input[name="mode"]:checked').value;
}

// =====================================================
// HEADER
// =====================================================
function updateModeHeader() {

    const mode = getMode();

    modeHeader.innerText =
        mode === "role"
            ? "Search roles to find actions"
            : "Search actions to find roles";
}

// =====================================================
// SEARCH ROUTER
// =====================================================
searchBox.addEventListener("input", () => {

    updateModeHeader();

    const q = searchBox.value.toLowerCase().trim();
    const mode = getMode();

    resultsDiv.innerHTML = "";
    detailsDiv.innerHTML = "<div class='muted'>Select a result...</div>";

    if (!q) return;

    // =====================================================
    // ROLE MODE
    // =====================================================
    if (mode === "role") {

        roles
            .filter(r => r.Name.toLowerCase().includes(q))
            .slice(0, 30)
            .forEach(renderRoleItem);
    }

    // =====================================================
    // ACTION MODE
    // =====================================================
    if (mode === "action") {

        const actionSet = new Set();

        for (const role of roles) {
            for (const action of role.Actions) {

                if (action.toLowerCase().includes(q)) {
                    actionSet.add(action);
                }
            }
        }

        Array.from(actionSet)
            .slice(0, 50)
            .forEach(renderActionItem);
    }
});

// =====================================================
// ROLE RESULT ITEM (WITH COUNTER)
// =====================================================
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

// =====================================================
// ACTION RESULT ITEM (WITH ROLE COUNTER)
// =====================================================
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

// =====================================================
// ROLE DETAILS
// =====================================================
function showRoleDetails(role) {

    detailsDiv.innerHTML = `
        <h3>${role.Name}</h3>
        <p>${role.Description || ""}</p>

        <h4>Actions (${role.Actions.length})</h4>
        <ul>
            ${role.Actions.map(a => `<li>${a}</li>`).join("")}
        </ul>
    `;
}

// =====================================================
// ACTION DETAILS
// =====================================================
function showActionDetails(action) {

    const matchingRoles = roles.filter(r =>
        r.Actions.some(a =>
            a.toLowerCase() === action.toLowerCase()
        )
    );

    detailsDiv.innerHTML = `
        <h3>${action}</h3>

        <h4>Roles that include this action (${matchingRoles.length})</h4>

        <ul>
            ${matchingRoles.length
                ? matchingRoles.map(r => `<li>${r.Name}</li>`).join("")
                : "<li class='muted'>No exact matches</li>"
            }
        </ul>
    `;
}

// =====================================================
// INIT
// =====================================================
document.querySelectorAll('input[name="mode"]').forEach(r =>
    r.addEventListener("change", updateModeHeader)
);

updateModeHeader();