const renderDetails = (element, entries) => {
  element.innerHTML = entries
    .map(
      ([label, value]) =>
        `<dt>${label}</dt><dd>${value ?? "Ikke satt"}</dd>`
    )
    .join("");
};

const renderTable = (apps) => {
  const rows = apps
    .map(
      (app) => `
        <tr>
          <td>${app.name}</td>
          <td>${app.usage}</td>
          <td>${app.sourceRepo ?? "Uavklart"}</td>
          <td>${app.status}</td>
          <td>${app.authStatus}</td>
          <td>${app.showcaseUrl ?? "Ikke etablert"}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table class="table">
      <thead>
        <tr>
          <th>App</th>
          <th>Bruksområde</th>
          <th>Kilde/repo</th>
          <th>Status</th>
          <th>Auth-status</th>
          <th>Showcase-lenke</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const init = async () => {
  const response = await fetch("../appregister/apps.json");
  const registry = await response.json();
  const includedApps = registry.apps.filter((app) => app.status === "included");
  const excludedApps = registry.apps.filter((app) => app.status === "excluded");

  document.getElementById("included-count").textContent = String(includedApps.length);
  document.getElementById("excluded-count").textContent = String(excludedApps.length);
  document.getElementById("auth-summary").textContent = `${registry.demoAuth.username} / ${registry.demoAuth.password}`;

  renderDetails(document.getElementById("auth-details"), [
    ["Strategi", registry.demoAuth.strategy],
    ["Brukernavn", registry.demoAuth.username],
    ["Passord", registry.demoAuth.password],
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
    document.getElementById("included-apps").innerHTML = renderTable(includedApps);
  }

  document.getElementById("excluded-apps").innerHTML = renderTable(excludedApps);
};

init().catch((error) => {
  document.getElementById("auth-summary").textContent = "Kunne ikke laste appregister";
  document.getElementById("excluded-apps").innerHTML = `<p class="empty-state">${error.message}</p>`;
});
