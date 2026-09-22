const appendDetail = (element, label, value) => {
  const detailLabel = document.createElement("dt");
  detailLabel.textContent = label;
  const detailValue = document.createElement("dd");
  detailValue.textContent = value ?? "Ikke satt";
  element.append(detailLabel, detailValue);
};

const renderDetails = (element, entries) => {
  element.replaceChildren();
  entries.forEach(([label, value]) => appendDetail(element, label, value));
};

const renderTable = (apps) => {
  const table = document.createElement("table");
  table.className = "table";

  const headers = ["App", "Bruksområde", "Kilde/repo", "Status", "Auth-status", "Showcase-lenke"];
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  headers.forEach((header) => {
    const cell = document.createElement("th");
    cell.textContent = header;
    headRow.append(cell);
  });

  thead.append(headRow);

  const tbody = document.createElement("tbody");

  apps.forEach((app) => {
    const row = document.createElement("tr");
    const values = [
      app.name,
      app.usage,
      app.sourceRepo ?? "Uavklart",
      app.status,
      app.authStatus,
      app.showcaseUrl ?? "Ikke etablert"
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    tbody.append(row);
  });

  table.append(thead, tbody);
  return table;
};

const init = async () => {
  const response = await fetch("../appregister/apps.json");
  if (!response.ok) {
    throw new Error(`Kunne ikke laste appregister (${response.status})`);
  }
  const registry = await response.json();
  const includedApps = registry.apps.filter((app) => app.status === "included");
  const excludedApps = registry.apps.filter((app) => app.status === "excluded");
  const visiblePassword = registry.demoAuth.displayOnShowcase ? registry.demoAuth.password : "Skjult";

  document.getElementById("included-count").textContent = String(includedApps.length);
  document.getElementById("excluded-count").textContent = String(excludedApps.length);
  document.getElementById("auth-summary").textContent = `${registry.demoAuth.username} / ${visiblePassword}`;

  renderDetails(document.getElementById("auth-details"), [
    ["Strategi", registry.demoAuth.strategy],
    ["Brukernavn", registry.demoAuth.username],
    ["Passord", visiblePassword],
    ["Synlig i showcase", registry.demoAuth.displayOnShowcase ? "Ja" : "Nei"],
    ["Notat", registry.demoAuth.notes]
  ]);

  renderDetails(document.getElementById("state-details"), [
    ["Primærmodus", registry.stateStrategy.primaryMode],
    ["Nullstillingsintervall", `${registry.stateStrategy.resetIntervalMinutes} minutter`],
    ["Mekanisme", registry.stateStrategy.resetMechanism],
    ["Fallback", registry.stateStrategy.fallbackMode]
  ]);

  if (includedApps.length > 0) {
    document.getElementById("included-apps").replaceChildren(renderTable(includedApps));
  }

  document.getElementById("excluded-apps").replaceChildren(renderTable(excludedApps));
};

init().catch((error) => {
  document.getElementById("auth-summary").textContent = "Kunne ikke laste appregister";
  const message = document.createElement("p");
  message.className = "empty-state";
  message.textContent = error.message;
  document.getElementById("excluded-apps").replaceChildren(message);
});
