let roles = [];
let reverseLookup = false;

fetch("./roles.json")
    .then(r => {
        if (!r.ok) {
            throw new Error("Failed to load roles.json");
        }

        return r.json();
    })
    .then(data => {
        roles = data;
    });

const searchBox = document.getElementById("search");
const resultsDiv = document.getElementById("results");
const detailsDiv = document.getElementById("details");

const leftLabel = document.getElementById("leftLabel");
const rightLabel = document.getElementById("rightLabel");

const resultsTitle =
    document.getElementById("resultsTitle");

const detailsTitle =
    document.getElementById("detailsTitle");

const swapBtn =
    document.getElementById("swapBtn");

function updateDirection() {

    if (!reverseLookup) {

        leftLabel.textContent = "Roles";
        rightLabel.textContent = "Actions";

        resultsTitle.textContent = "Roles";
        detailsTitle.textContent = "Actions";

        searchBox.placeholder =
            "Search Azure roles...";

        swapBtn.textContent = "⇄";
    }
    else {

        leftLabel.textContent = "Actions";
        rightLabel.textContent = "Roles";

        resultsTitle.textContent = "Actions";
        detailsTitle.textContent = "Roles";

        searchBox.placeholder =
            "Search Azure actions...";

        swapBtn.textContent = "⇄";
    }
}

swapBtn.addEventListener("click", () => {

    reverseLookup = !reverseLookup;

    resultsDiv.innerHTML = "<div class='muted'></div>";
    detailsDiv.innerHTML = "<div class='muted'></div>";

    performSearch();

    updateDirection();
});

searchBox.addEventListener(
    "input",
    performSearch
);

function performSearch() {

    const query =
        searchBox.value.toLowerCase().trim();

    resultsDiv.innerHTML = "<div class='muted'></div>";

    detailsDiv.innerHTML = "<div class='muted'></div>";

    if (!query) return;

    if (!reverseLookup) {

        roles
            .filter(r =>
                r.Name.toLowerCase().includes(query)
            )
            .slice(0, 30)
            .forEach(renderRoleItem);
    }
    else {

        const actions = new Set();

        for (const role of roles) {

            for (const action of role.Actions) {

                if (
                    action.toLowerCase().includes(query)
                ) {
                    actions.add(action);
                }
            }
        }

        Array.from(actions)
            .slice(0, 50)
            .forEach(renderActionItem);
    }
}

function renderRoleItem(role) {

    const div =
        document.createElement("div");

    div.className =
        "result roleItem";

    div.innerHTML = `
        ${role.Name}
        <span class="tag">ROLE</span>
        <span class="tag">${role.Actions.length} actions</span>
    `;

    div.onclick =
        () => showRoleDetails(role);

    resultsDiv.appendChild(div);
}

function renderActionItem(action) {

    const matchingRoles =
        roles.filter(r =>
            r.Actions.some(a =>
                a.toLowerCase() ===
                action.toLowerCase()
            )
        );

    const div =
        document.createElement("div");

    div.className =
        "result Select a result...";

    div.innerHTML = `
        ${action}
        <span class="tag">ACTION</span>
        <span class="tag">${matchingRoles.length} roles</span>
    `;

    div.onclick =
        () => showActionDetails(action);

    resultsDiv.appendChild(div);
}

function showRoleDetails(role) {

    detailsDiv.innerHTML = `
        <h3>${role.Name}</h3>

        <p>${role.Description || ""}</p>

        <h4>Actions (${role.Actions.length})</h4>

        <ul>
            ${role.Actions
                .map(a => `<li>${a}</li>`)
                .join("")}
        </ul>
    `;
}

function showActionDetails(action) {

    const matchingRoles =
        roles.filter(r =>
            r.Actions.some(a =>
                a.toLowerCase() ===
                action.toLowerCase()
            )
        );

    detailsDiv.innerHTML = `
        <h3>${action}</h3>

        <h4>
            Matching Roles (${matchingRoles.length})
        </h4>

        <ul>
            ${
                matchingRoles
                    .map(r => `<li>${r.Name}</li>`)
                    .join("")
            }
        </ul>
    `;
}

updateDirection();
