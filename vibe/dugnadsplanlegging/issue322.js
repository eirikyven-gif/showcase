(function () {
  "use strict";

  const ACTIVE_DUGNAD = localStorage.getItem("vibe-active-dugnad") || "hell-lopefestival";
  const STORAGE_KEY = `vibe-dugnadsplanlegging:v1:${ACTIVE_DUGNAD}`;
  const SLOT_MINUTES = 60;

  const timelinePanel = document.querySelector(".timeline-panel");
  if (!timelinePanel) return;

  installStyles();

  const mobile = document.createElement("section");
  mobile.id = "mobileShiftList";
  mobile.className = "mobile-shift-list";
  mobile.setAttribute("aria-labelledby", "mobileShiftListTitle");
  mobile.innerHTML = `
    <details class="mobile-card-alternative">
      <summary>Alternativ kortliste og mangler-filter</summary>
      <div class="mobile-shift-heading">
        <div>
          <h3 id="mobileShiftListTitle">Mobil vaktliste</h3>
          <p>Kortvisning fra v0.5.2, som alternativ til matrisen.</p>
        </div>
        <label class="checkbox-label mobile-missing-toggle">
          <input id="mobileMissingOnly" type="checkbox">
          Kun mangler
        </label>
      </div>
      <div class="mobile-period-tabs" role="group" aria-label="Periodefilter"></div>
      <div id="mobileShiftSummary" class="mobile-shift-summary" aria-live="polite"></div>
      <div id="mobileShiftCards" class="mobile-shift-cards"></div>
    </details>
  `;
  timelinePanel.append(mobile);

  const periodTabs = mobile.querySelector(".mobile-period-tabs");
  const missingOnly = mobile.querySelector("#mobileMissingOnly");
  const summary = mobile.querySelector("#mobileShiftSummary");
  const cards = mobile.querySelector("#mobileShiftCards");
  let activePeriod = "all";

  missingOnly.addEventListener("change", renderMobileList);
  periodTabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-period]");
    if (!button) return;
    activePeriod = button.dataset.period;
    renderMobileList();
  });
  cards.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='edit-mobile-shift']");
    if (!button) return;
    if (window.HLF_DUGNAD_OPEN_SHIFT) {
      window.HLF_DUGNAD_OPEN_SHIFT(button.dataset.id);
      document.getElementById("assignmentEditor")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  });

  document.addEventListener("submit", scheduleRender, true);
  document.addEventListener("click", scheduleRender, true);
  document.getElementById("importInput")?.addEventListener("change", scheduleRender);
  new MutationObserver(scheduleRender).observe(document.getElementById("saveStatus") || document.body, {
    childList: true,
    characterData: true,
    subtree: true
  });

  renderMobileList();

  function installStyles() {
    if (document.getElementById("issue322Styles")) return;
    const style = document.createElement("style");
    style.id = "issue322Styles";
    style.textContent = `
      .mobile-shift-list {
        display: none;
      }

      .mobile-card-alternative {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fbfcfa;
        padding: 0.75rem;
      }

      .mobile-card-alternative > summary {
        min-height: 44px;
        cursor: pointer;
        font-weight: 750;
      }

      .mobile-card-alternative[open] > summary {
        margin-bottom: 0.75rem;
      }

      .mobile-shift-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .mobile-shift-heading h3,
      .mobile-shift-card h4,
      .mobile-shift-card h5 {
        margin: 0;
        letter-spacing: 0;
      }

      .mobile-shift-heading h3 {
        font-size: 1.08rem;
      }

      .mobile-missing-toggle {
        flex: 0 0 auto;
        min-height: 44px;
        align-items: center;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #fbfcfa;
        padding: 0.55rem 0.7rem;
      }

      .mobile-period-tabs {
        display: flex;
        gap: 0.45rem;
        margin-bottom: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.15rem;
      }

      .mobile-period-button {
        flex: 0 0 auto;
      }

      .mobile-period-button.active {
        border-color: var(--accent);
        background: var(--accent);
        color: #fff;
      }

      .mobile-shift-summary {
        margin-bottom: 0.75rem;
        color: var(--muted);
        font-weight: 650;
      }

      .mobile-shift-cards {
        display: grid;
        gap: 0.75rem;
      }

      .mobile-shift-card {
        display: grid;
        gap: 0.75rem;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fff;
        padding: 0.85rem;
      }

      .mobile-shift-card.partial,
      .mobile-shift-card.missing {
        border-color: #e6c56d;
      }

      .mobile-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .mobile-status {
        flex: 0 0 auto;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        background: #f4f7f5;
        font-size: 0.88rem;
        font-weight: 750;
      }

      .mobile-status.partial,
      .mobile-status.missing {
        border-color: #e6c56d;
        background: var(--warn-bg);
        color: var(--warn-text);
      }

      .mobile-card-meta,
      .mobile-line-list {
        display: grid;
        gap: 0.25rem;
      }

      .mobile-card-meta {
        color: var(--muted);
        font-size: 0.94rem;
      }

      .mobile-line-list {
        margin: 0.35rem 0 0;
        padding-left: 1.1rem;
      }

      .missing-lines li {
        color: var(--warn-text);
        font-weight: 650;
      }

      .mobile-description {
        border-top: 1px solid var(--line);
        padding-top: 0.7rem;
      }

      .mobile-description summary {
        min-height: 44px;
        cursor: pointer;
        font-weight: 750;
      }

      .mobile-description p {
        margin-top: 0.35rem;
        white-space: pre-wrap;
      }

      .mobile-card-actions {
        display: flex;
      }

      .mobile-card-actions button {
        width: 100%;
      }

      @media (max-width: 760px) {
        .timeline-panel .section-heading {
          margin-bottom: 0.75rem;
        }

        .timeline-panel .section-heading p::after {
          content: " Scroll sidelengs i matrisen for a se flere timer.";
          font-weight: 700;
        }

        .timeline-panel .timeline-summary,
        .timeline-panel .timeline-legend {
          display: flex;
        }

        .timeline-panel .timeline-scroll {
          display: block;
          margin-inline: -0.75rem;
          border-right: 0;
          border-left: 0;
          border-radius: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          scrollbar-gutter: stable both-edges;
          box-shadow: inset -18px 0 18px -20px rgba(32, 35, 31, 0.75);
        }

        .timeline-panel .timeline-scroll:focus-within {
          outline: 3px solid var(--focus);
          outline-offset: 2px;
        }

        .timeline-panel .timeline-table {
          width: max-content;
          min-width: 980px;
        }

        .timeline-panel .timeline-table th,
        .timeline-panel .timeline-table td {
          min-width: 146px;
          padding: 0.45rem;
        }

        .timeline-panel .timeline-table .timeline-task-header,
        .timeline-panel .timeline-table .timeline-task-cell {
          min-width: 168px;
          max-width: 176px;
          white-space: normal;
        }

        .timeline-panel .timeline-table thead th {
          top: 0;
        }

        .timeline-panel .timeline-table .timeline-task-header,
        .timeline-panel .timeline-table .timeline-task-cell {
          left: 0;
          box-shadow: 8px 0 12px -12px rgba(32, 35, 31, 0.85);
        }

        .timeline-panel .timeline-cell-button,
        .timeline-panel .timeline-no-need {
          min-height: 68px;
        }

        .timeline-panel .timeline-cell-button {
          padding: 0.45rem;
          font-size: 0.88rem;
        }

        .timeline-panel .timeline-time,
        .timeline-panel .timeline-task-meta,
        .timeline-panel .timeline-status,
        .timeline-panel .timeline-no-need {
          font-size: 0.8rem;
        }

        .mobile-shift-list {
          display: block;
          margin-top: 0.9rem;
        }
      }

      @media (max-width: 520px) {
        .mobile-shift-heading,
        .mobile-card-header {
          align-items: stretch;
          flex-direction: column;
        }

        .mobile-missing-toggle,
        .mobile-status {
          width: 100%;
        }
      }
    `;
    document.head.append(style);
  }

  function scheduleRender() {
    window.setTimeout(renderMobileList, 0);
  }

  function renderMobileList() {
    const state = loadState();
    const shifts = sortShifts(state.shifts.filter((shift) => shift.startAt && shift.endAt && isAfter(shift.endAt, shift.startAt)));
    const periods = periodOptions(shifts);
    if (!periods.some((period) => period.key === activePeriod)) activePeriod = "all";
    renderPeriodTabs(periods);

    const selectedPeriod = periods.find((period) => period.key === activePeriod) || periods[0];
    const visible = shifts
      .filter((shift) => overlaps(shift.startAt, shift.endAt, selectedPeriod.range.startAt, selectedPeriod.range.endAt))
      .map((shift) => shiftMobileModel(shift, state.contacts, selectedPeriod.range))
      .filter((model) => !missingOnly.checked || model.missingSlots.length > 0);

    const missingCount = visible.reduce((sum, model) => sum + model.missingSlots.length, 0);
    summary.textContent = `${visible.length} vakt(er) vist. ${missingCount} manglende tidsrom i valgt periode.`;
    cards.innerHTML = "";
    if (!visible.length) {
      cards.append(emptyText(missingOnly.checked ? "Ingen vakter med manglende bemanning i valgt periode." : "Ingen vakter i valgt periode."));
      return;
    }
    visible.forEach((model) => cards.append(mobileCard(model)));
  }

  function renderPeriodTabs(periods) {
    periodTabs.innerHTML = "";
    periods.forEach((period) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `secondary mobile-period-button${period.key === activePeriod ? " active" : ""}`;
      button.dataset.period = period.key;
      button.textContent = period.label;
      button.setAttribute("aria-pressed", period.key === activePeriod ? "true" : "false");
      periodTabs.append(button);
    });
  }

  function mobileCard(model) {
    const article = document.createElement("article");
    article.className = `mobile-shift-card ${model.statusKind}`;
    article.innerHTML = `
      <div class="mobile-card-header">
        <div>
          <h4>${escapeHtml(model.shift.title || "Uten tittel")}</h4>
          <p class="meta">${escapeHtml(formatPeriod(model.shift.startAt, model.shift.endAt))}</p>
        </div>
        <span class="mobile-status ${escapeHtml(model.statusKind)}">${escapeHtml(model.statusText)}</span>
      </div>
      <div class="mobile-card-meta">
        ${model.shift.location ? `<span>Sted: ${escapeHtml(model.shift.location)}</span>` : "<span>Sted: ikke angitt</span>"}
        <span>Behov: ${model.shift.capacity} per tidsrom</span>
      </div>
      <section>
        <h5>Bemanning</h5>
        ${model.assignmentLines.length ? `<ul class="mobile-line-list">${model.assignmentLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : '<p class="empty">Ingen bemanning lagt inn.</p>'}
      </section>
      <section>
        <h5>Mangler</h5>
        ${model.missingSlots.length ? `<ul class="mobile-line-list missing-lines">${model.missingSlots.map((slot) => `<li>${escapeHtml(formatPeriod(slot.startAt, slot.endAt))}: mangler ${slot.missing}</li>`).join("")}</ul>` : '<p class="small">Fullt dekket i valgt periode.</p>'}
      </section>
      ${model.shift.description ? `<details class="mobile-description"><summary>Vis vaktpostbeskrivelse</summary><p>${escapeHtml(model.shift.description)}</p></details>` : ""}
      <div class="mobile-card-actions">
        <button type="button" data-action="edit-mobile-shift" data-id="${escapeHtml(model.shift.id)}">Rediger bemanning</button>
      </div>
    `;
    return article;
  }

  function shiftMobileModel(shift, contacts, range) {
    const slots = shiftSlots(shift)
      .filter((slot) => overlaps(slot.startAt, slot.endAt, range.startAt, range.endAt));
    const missingSlots = slots.map((slot) => {
      const count = coverageCount(shift, slot.startAt, slot.endAt);
      return { ...slot, missing: Math.max(0, shift.capacity - count) };
    }).filter((slot) => slot.missing > 0);
    const assignmentLines = sortAssignments(shift.assignments)
      .filter((assignment) => overlaps(assignment.startAt, assignment.endAt, range.startAt, range.endAt))
      .map((assignment) => {
        const contact = contacts.find((item) => item.id === assignment.contactId);
        const name = contact ? `${contact.name} (${contact.type})` : "Ukjent kontakt";
        return `${name}: ${formatPeriod(assignment.startAt, assignment.endAt)}`;
      });
    const statusKind = missingSlots.length === 0 ? "staffed" : assignmentLines.length ? "partial" : "missing";
    const statusText = statusKind === "staffed"
      ? "Fullt dekket"
      : statusKind === "partial"
        ? "Delvis dekket"
        : "Mangler bemanning";
    return { shift, missingSlots, assignmentLines, statusKind, statusText };
  }

  function periodOptions(shifts) {
    const now = new Date();
    const nowAt = toLocalDateTime(now);
    const next4 = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const startAt = minDateTime(shifts.map((shift) => shift.startAt)) || nowAt;
    const endAt = maxDateTime(shifts.map((shift) => shift.endAt)) || toLocalDateTime(next4);
    const options = [
      { key: "all", label: "Alle", range: { startAt: floorToHour(startAt), endAt: ceilToHour(endAt) } },
      { key: "now", label: "Nå", range: { startAt: nowAt, endAt: toLocalDateTime(new Date(now.getTime() + SLOT_MINUTES * 60000)) } },
      { key: "next4", label: "Neste 4 timer", range: { startAt: nowAt, endAt: toLocalDateTime(next4) } }
    ];
    const dates = new Set();
    shifts.forEach((shift) => eachDate(shift.startAt, shift.endAt).forEach((date) => dates.add(date)));
    Array.from(dates).sort().forEach((date) => {
      options.push({
        key: date,
        label: formatDateLabel(`${date}T00:00`),
        range: { startAt: `${date}T00:00`, endAt: nextDateStart(date) }
      });
    });
    return options;
  }

  function shiftSlots(shift) {
    if (!shift.startAt || !shift.endAt || !isAfter(shift.endAt, shift.startAt)) return [];
    const slots = [];
    let cursor = new Date(shift.startAt);
    const end = new Date(shift.endAt);
    while (cursor < end) {
      const slotEnd = new Date(Math.min(cursor.getTime() + SLOT_MINUTES * 60000, end.getTime()));
      slots.push({ startAt: toLocalDateTime(cursor), endAt: toLocalDateTime(slotEnd) });
      cursor = slotEnd;
    }
    return slots;
  }

  function coverageCount(shift, startAt, endAt) {
    return shift.assignments.filter((assignment) => overlaps(assignment.startAt, assignment.endAt, startAt, endAt)).length;
  }

  function loadState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch (error) {
      return { contacts: [], shifts: [] };
    }
  }

  function normalizeState(input) {
    return {
      contacts: Array.isArray(input.contacts) ? input.contacts.map(normalizeContact) : [],
      shifts: Array.isArray(input.shifts) ? input.shifts.map(normalizeShift) : []
    };
  }

  function normalizeContact(contact) {
    return {
      id: String(contact.id || ""),
      type: contact.type === "gruppe" ? "gruppe" : "person",
      name: String(contact.name || "").trim()
    };
  }

  function normalizeShift(shift) {
    const startAt = normalizeDateTime(shift.startAt || joinDateTime(shift.startDate, shift.startTime));
    const endAt = normalizeDateTime(shift.endAt || joinDateTime(shift.endDate || shift.startDate, shift.endTime));
    const legacyAssignedIds = Array.isArray(shift.assignedIds) ? shift.assignedIds.map(String) : [];
    const assignments = Array.isArray(shift.assignments) && shift.assignments.length
      ? shift.assignments.map((assignment) => normalizeAssignment(assignment, shift.id, startAt, endAt))
      : legacyAssignedIds.map((contactId) => normalizeAssignment({ contactId, startAt, endAt }, shift.id, startAt, endAt));
    const capacity = Number.parseInt(shift.capacity, 10);
    return {
      id: String(shift.id || ""),
      title: String(shift.title || "").trim(),
      startAt,
      endAt,
      location: String(shift.location || "").trim(),
      capacity: capacity > 0 ? capacity : 1,
      description: String(shift.description || "").trim(),
      assignments
    };
  }

  function normalizeAssignment(assignment, shiftId, fallbackStartAt, fallbackEndAt) {
    return {
      id: String(assignment.id || ""),
      shiftId: String(assignment.shiftId || shiftId || ""),
      contactId: String(assignment.contactId || ""),
      startAt: normalizeDateTime(assignment.startAt || joinDateTime(assignment.startDate, assignment.startTime)) || fallbackStartAt || "",
      endAt: normalizeDateTime(assignment.endAt || joinDateTime(assignment.endDate || assignment.startDate, assignment.endTime)) || fallbackEndAt || ""
    };
  }

  function overlaps(startA, endA, startB, endB) {
    return isBefore(startA, endB) && isAfter(endA, startB);
  }

  function isAfter(a, b) {
    return new Date(a).getTime() > new Date(b).getTime();
  }

  function isBefore(a, b) {
    return new Date(a).getTime() < new Date(b).getTime();
  }

  function minDateTime(values) {
    return values.filter(Boolean).sort()[0] || "";
  }

  function maxDateTime(values) {
    return values.filter(Boolean).sort().at(-1) || "";
  }

  function floorToHour(value) {
    const date = new Date(value);
    date.setMinutes(0, 0, 0);
    return toLocalDateTime(date);
  }

  function ceilToHour(value) {
    const date = new Date(value);
    if (date.getMinutes() || date.getSeconds() || date.getMilliseconds()) {
      date.setHours(date.getHours() + 1);
    }
    date.setMinutes(0, 0, 0);
    return toLocalDateTime(date);
  }

  function eachDate(startAt, endAt) {
    const dates = [];
    const cursor = new Date(`${datePart(startAt)}T00:00`);
    const end = new Date(endAt);
    while (cursor <= end) {
      dates.push(datePart(toLocalDateTime(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  function nextDateStart(dateValue) {
    const date = new Date(`${dateValue}T00:00`);
    date.setDate(date.getDate() + 1);
    return toLocalDateTime(date);
  }

  function formatPeriod(startAt, endAt) {
    if (!startAt || !endAt) return "";
    return datePart(startAt) === datePart(endAt)
      ? `${formatDateLabel(startAt)} ${timePart(startAt)}-${timePart(endAt)}`
      : `${formatDateLabel(startAt)} ${timePart(startAt)}-${formatDateLabel(endAt)} ${timePart(endAt)}`;
  }

  function formatDateLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const weekday = new Intl.DateTimeFormat("nb-NO", { weekday: "short" }).format(date);
    const dayMonth = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit" }).format(date);
    return `${titleCase(weekday)} ${dayMonth}`;
  }

  function joinDateTime(date, time) {
    const cleanDate = String(date || "").trim();
    const cleanTime = String(time || "").trim();
    return cleanDate && cleanTime ? `${cleanDate}T${cleanTime}` : "";
  }

  function normalizeDateTime(value) {
    const match = String(value || "").trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    return match ? `${match[1]}T${match[2]}` : "";
  }

  function datePart(value) {
    return normalizeDateTime(value).slice(0, 10);
  }

  function timePart(value) {
    return normalizeDateTime(value).slice(11, 16);
  }

  function toLocalDateTime(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function sortShifts(shifts) {
    return [...shifts].sort((a, b) => `${a.startAt} ${a.title}`.localeCompare(`${b.startAt} ${b.title}`, "nb"));
  }

  function sortAssignments(assignments) {
    return [...assignments].sort((a, b) => `${a.startAt} ${a.endAt}`.localeCompare(`${b.startAt} ${b.endAt}`));
  }

  function emptyText(text) {
    const node = document.createElement("p");
    node.className = "empty";
    node.textContent = text;
    return node;
  }

  function titleCase(value) {
    const clean = String(value || "");
    return clean ? `${clean.slice(0, 1).toUpperCase()}${clean.slice(1)}` : "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();