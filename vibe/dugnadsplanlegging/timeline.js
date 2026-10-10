(function () {
  "use strict";

  const ACTIVE_DUGNAD = localStorage.getItem("vibe-active-dugnad") || "hell-lopefestival";
  const STORAGE_KEY = `vibe-dugnadsplanlegging:v1:${ACTIVE_DUGNAD}`;
  const SLOT_MINUTES = 60;
  const STATUS_FILTERS = [
    { value: "all", label: "Alle" },
    { value: "staffed", label: "Dekket" },
    { value: "partial", label: "Delvis dekket" },
    { value: "missing", label: "Ikke dekket" },
    { value: "no-need", label: "Ikke behov" }
  ];

  const daySelect = document.getElementById("timelineDay");
  const summary = document.getElementById("timelineSummary");
  const matrix = document.getElementById("timelineMatrix");

  if (!daySelect || !summary || !matrix) {
    return;
  }

  injectTimelineDetailStyles();

  const statusFilter = ensureStatusFilter();

  daySelect.addEventListener("change", renderTimeline);
  statusFilter?.addEventListener("change", renderTimeline);
  matrix.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='open-slot-details']");
    if (!button) return;
    const state = loadState();
    const shift = state.shifts.find((item) => item.id === button.dataset.id);
    if (!shift) {
      setTimelineStatus("Kunne ikke åpne tidsrommet fordi vakten ikke finnes lenger. Last inn siden på nytt og prøv igjen.");
      return;
    }
    openSlotDetails(shift, {
      startAt: button.dataset.startAt || "",
      endAt: button.dataset.endAt || ""
    }, state.contacts);
  });

  document.addEventListener("submit", scheduleRender, true);
  document.addEventListener("click", scheduleRender, true);
  document.getElementById("importInput")?.addEventListener("change", scheduleRender);

  const observer = new MutationObserver(scheduleRender);
  observer.observe(document.getElementById("saveStatus") || document.body, {
    childList: true,
    characterData: true,
    subtree: true
  });

  renderTimeline();

  function scheduleRender() {
    window.setTimeout(renderTimeline, 0);
  }

  function renderTimeline() {
    const state = loadState();
    const shifts = state.shifts.filter((shift) => shift.startAt && shift.endAt && isAfter(shift.endAt, shift.startAt));
    const options = timelineOptions(shifts);
    const previous = daySelect.value;
    daySelect.innerHTML = "";
    daySelect.disabled = options.length === 0;

    options.forEach((optionData) => {
      const option = document.createElement("option");
      option.value = optionData.key;
      option.textContent = optionData.label;
      daySelect.append(option);
    });

    if (options.some((option) => option.key === previous)) {
      daySelect.value = previous;
    } else if (options.length) {
      daySelect.value = options[0].key;
    }

    summary.innerHTML = "";
    matrix.innerHTML = "";

    if (!shifts.length) {
      summary.append(summaryBadge("Ingen vakter", "Opprett en vakt med startdato og sluttdato."));
      matrix.append(emptyText("Ingen tidsfestede vakter a vise i matrisen enna."));
      return;
    }

    const selected = options.find((option) => option.key === daySelect.value) || options[0];
    const range = selected.range;
    const columns = timelineColumns(range.startAt, range.endAt);
    const activeStatusFilter = statusFilter?.value || "all";
    const statusFilterLabel = statusFilterLabelFor(activeStatusFilter);
    const visibleShifts = sortShifts(shifts.filter((shift) => overlaps(shift.startAt, shift.endAt, range.startAt, range.endAt)));
    const displayShifts = filterShiftsByStatus(visibleShifts, columns, activeStatusFilter);

    const missingSlots = displayShifts.reduce((sum, shift) => {
      return sum + columns.filter((column) => {
        const status = slotStatus(shift, column);
        return status.needed && status.missing > 0;
      }).length;
    }, 0);
    const matchingSlots = countMatchingSlots(displayShifts, columns, activeStatusFilter);

    summary.append(
      summaryBadge("Visning", selected.label),
      summaryBadge("Filter", statusFilterLabel),
      summaryBadge("Tidskolonner", String(columns.length)),
      summaryBadge("Vakter", String(displayShifts.length)),
      summaryBadge(activeStatusFilter === "all" ? "Udekkede tidsrom" : "Matchende tidsrom", String(activeStatusFilter === "all" ? missingSlots : matchingSlots))
    );

    if (!displayShifts.length) {
      matrix.append(emptyText(`Ingen tidsrom med status ${statusFilterLabel.toLowerCase()} i valgt visning.`));
      return;
    }

    const table = document.createElement("table");
    table.className = "timeline-table";
    table.innerHTML = `
      <caption class="hidden">Vaktplan med timebasert dekning for ${escapeHtml(selected.label)}</caption>
      <thead>
        <tr>
          <th scope="col" class="timeline-task-header">Oppgave/vakt</th>
          ${columns.map((column) => `<th scope="col"><span class="timeline-time timeline-time-split"><span class="timeline-time-date">${escapeHtml(column.dateLabel)}</span><span class="timeline-time-hours">${escapeHtml(column.timeLabel)}</span></span></th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${displayShifts.map((shift) => timelineRowHtml(shift, columns, activeStatusFilter)).join("")}
      </tbody>
    `;
    matrix.append(table);
  }

  function ensureStatusFilter() {
    let select = document.getElementById("timelineStatusFilter");
    if (select) return select;

    const label = document.createElement("label");
    label.className = "search-label timeline-status-filter-label";
    label.textContent = "Statusfilter";

    select = document.createElement("select");
    select.id = "timelineStatusFilter";
    select.setAttribute("aria-label", "Filtrer vaktplan etter status");
    STATUS_FILTERS.forEach((filter) => {
      const option = document.createElement("option");
      option.value = filter.value;
      option.textContent = filter.label;
      select.append(option);
    });
    label.append(select);

    const dayLabel = daySelect.closest("label");
    if (dayLabel) {
      dayLabel.after(label);
    } else {
      matrix.before(label);
    }
    return select;
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
      name: String(contact.name || "").trim(),
      contactPoints: String(contact.contactPoints || "").trim()
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
      description: String(shift.description || shift.notes || "").trim(),
      assignments
    };
  }

  function normalizeAssignment(assignment, shiftId, fallbackStartAt, fallbackEndAt) {
    return {
      id: String(assignment.id || ""),
      shiftId: String(assignment.shiftId || shiftId || ""),
      contactId: String(assignment.contactId || ""),
      startAt: normalizeDateTime(assignment.startAt || joinDateTime(assignment.startDate, assignment.startTime)) || fallbackStartAt || "",
      endAt: normalizeDateTime(assignment.endAt || joinDateTime(assignment.endDate || assignment.startDate, assignment.endTime)) || fallbackEndAt || "",
      notes: String(assignment.notes || "").trim()
    };
  }

  function timelineOptions(shifts) {
    if (!shifts.length) return [];
    const startAt = minDateTime(shifts.map((shift) => shift.startAt));
    const endAt = maxDateTime(shifts.map((shift) => shift.endAt));
    const options = [{
      key: "all",
      label: "Alle vaktdager",
      range: { startAt: floorToHour(startAt), endAt: ceilToHour(endAt) }
    }];
    const dates = new Set();
    shifts.forEach((shift) => {
      eachDate(shift.startAt, shift.endAt).forEach((date) => dates.add(date));
    });
    Array.from(dates).sort().forEach((date) => {
      options.push({
        key: date,
        label: formatDateLabel(`${date}T00:00`),
        range: { startAt: `${date}T00:00`, endAt: nextDateStart(date) }
      });
    });
    return options;
  }

  function timelineColumns(startAt, endAt) {
    const columns = [];
    let cursor = new Date(startAt);
    const end = new Date(endAt);
    while (cursor < end) {
      const slotEnd = new Date(Math.min(cursor.getTime() + SLOT_MINUTES * 60000, end.getTime()));
      const columnStart = toLocalDateTime(cursor);
      const columnEnd = toLocalDateTime(slotEnd);
      columns.push({
        startAt: columnStart,
        endAt: columnEnd,
        label: formatColumnLabel(columnStart, columnEnd),
        dateLabel: formatColumnDateLabel(columnStart),
        timeLabel: formatColumnTimeLabel(columnStart, columnEnd)
      });
      cursor = slotEnd;
    }
    return columns;
  }

  function timelineRowHtml(shift, columns, activeStatusFilter) {
    return `
      <tr>
        <th scope="row" class="timeline-task-cell">
          <span class="timeline-task-title">${escapeHtml(shift.title)}</span>
        </th>
        ${columns.map((column) => timelineCellHtml(shift, column, activeStatusFilter)).join("")}
      </tr>
    `;
  }

  function timelineCellHtml(shift, column, activeStatusFilter) {
    const status = slotStatus(shift, column);
    const matchesFilter = activeStatusFilter === "all" || status.className === activeStatusFilter;
    const filterClass = matchesFilter ? "filter-match" : "filter-muted";
    const filterText = activeStatusFilter === "all" ? "" : matchesFilter ? ". Matcher valgt filter." : ". Utenfor valgt filter.";
    const label = `${status.text}: ${shift.title} ${formatColumnLabel(column.startAt, column.endAt)}${filterText}`;
    return `<td class="timeline-cell ${filterClass}">
      <button type="button" class="timeline-cell-button ${status.className} ${filterClass}" data-action="open-slot-details" data-id="${escapeHtml(shift.id)}" data-start-at="${escapeHtml(column.startAt)}" data-end-at="${escapeHtml(column.endAt)}" aria-label="${escapeHtml(label)}">
        <span class="timeline-status">${escapeHtml(status.text)}</span>
      </button>
    </td>`;
  }

  function filterShiftsByStatus(shifts, columns, activeStatusFilter) {
    if (activeStatusFilter === "all") return shifts;
    return shifts.filter((shift) => columns.some((column) => slotStatus(shift, column).className === activeStatusFilter));
  }

  function countMatchingSlots(shifts, columns, activeStatusFilter) {
    if (activeStatusFilter === "all") return 0;
    return shifts.reduce((sum, shift) => {
      return sum + columns.filter((column) => slotStatus(shift, column).className === activeStatusFilter).length;
    }, 0);
  }

  function statusFilterLabelFor(value) {
    return STATUS_FILTERS.find((filter) => filter.value === value)?.label || "Alle";
  }

  function slotStatus(shift, column) {
    if (!isNeeded(shift, column)) {
      return {
        needed: false,
        className: "no-need",
        text: "Ikke behov",
        assignments: [],
        covered: 0,
        missing: 0
      };
    }

    const assignments = sortAssignments(shift.assignments.filter((assignment) => overlaps(assignment.startAt, assignment.endAt, column.startAt, column.endAt)));
    const covered = assignments.length;
    const missing = Math.max(0, shift.capacity - covered);

    if (!covered) {
      return { needed: true, className: "missing", text: "Ikke dekket", assignments, covered, missing };
    }
    if (missing) {
      return { needed: true, className: "partial", text: "Delvis dekket", assignments, covered, missing };
    }
    return { needed: true, className: "staffed", text: "Dekket", assignments, covered, missing };
  }

  function openSlotDetails(shift, column, contacts) {
    cleanupModalState();
    const dialog = ensureSlotDialog();
    const status = slotStatus(shift, column);
    const body = dialog.querySelector(".slot-detail-body");
    if (!body) {
      setTimelineStatus("Kunne ikke vise tidsromdetaljer fordi dialogen mangler innholdsfelt.");
      return;
    }
    dialog.dataset.shiftId = shift.id || "";
    dialog.dataset.slotStartAt = column.startAt || "";
    dialog.dataset.slotEndAt = column.endAt || "";
    body.innerHTML = slotDetailHtml(shift, column, status, contacts);
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    dialog.querySelector(".slot-detail-close")?.focus();
  }

  function ensureSlotDialog() {
    let dialog = document.getElementById("slotDetailDialog");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "slotDetailDialog";
    dialog.className = "slot-detail-dialog";
    dialog.innerHTML = `
      <div class="slot-detail-shell">
        <div class="slot-detail-header">
          <h2 id="slotDetailTitle">Detaljer for tidsrom</h2>
          <button type="button" class="secondary slot-detail-close" value="close">Lukk</button>
        </div>
        <div class="slot-detail-body"></div>
        <div class="form-actions slot-detail-actions">
          <button type="button" data-action="edit-current-shift">Rediger vakt/bemanning</button>
          <button type="button" class="secondary slot-detail-close" value="close">Lukk</button>
        </div>
      </div>
    `;
    dialog.setAttribute("aria-labelledby", "slotDetailTitle");
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeSlotDialog(dialog);
    });
    dialog.querySelectorAll(".slot-detail-close").forEach((button) => {
      button.addEventListener("click", () => closeSlotDialog(dialog));
    });
    dialog.querySelector("[data-action='edit-current-shift']").addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const shiftId = dialog.dataset.shiftId || "";
      const slotContext = {
        startAt: dialog.dataset.slotStartAt || "",
        endAt: dialog.dataset.slotEndAt || ""
      };
      closeSlotDialog(dialog);
      window.setTimeout(() => {
        cleanupModalState();
        openExistingShiftEditor(shiftId, slotContext);
      }, 0);
    });
    document.body.append(dialog);
    return dialog;
  }

  function closeSlotDialog(dialog) {
    if (!dialog) {
      cleanupModalState();
      return;
    }
    if (dialog.contains(document.activeElement) && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    try {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      }
    } catch (error) {
      // Dialogen kan allerede vaere lukket eller fjernet fra top-layer.
    }
    dialog.removeAttribute("open");
    dialog.remove();
    cleanupModalState();
  }

  function cleanupModalState() {
    const activeElement = document.activeElement;
    if (activeElement?.closest?.(".slot-detail-dialog") && typeof activeElement.blur === "function") {
      activeElement.blur();
    }
    document.querySelectorAll("dialog.slot-detail-dialog").forEach((dialog) => {
      try {
        if (typeof dialog.close === "function" && dialog.open) {
          dialog.close();
        }
      } catch (error) {
        // Fortsett opprydding selv om native dialog-state allerede er inkonsistent.
      }
      dialog.removeAttribute("open");
      dialog.remove();
    });
    document.body.classList.remove("modal-open", "dialog-open", "is-modal-open");
    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "";
    }
    [document.body, document.querySelector("main"), document.querySelector(".topbar"), document.getElementById("vaktplan"), matrix]
      .filter(Boolean)
      .forEach((node) => {
        node.removeAttribute("inert");
        if (node.getAttribute("aria-hidden") === "true") {
          node.removeAttribute("aria-hidden");
        }
      });
  }

  function slotDetailHtml(shift, column, status, contacts) {
    const assignmentRows = status.assignments.length
      ? `<ul class="slot-detail-list">${status.assignments.map((assignment) => assignmentDetailHtml(assignment, contacts)).join("")}</ul>`
      : `<p class="empty">${status.needed ? "Ingen personer eller grupper er satt opp i dette tidsrommet." : "Ingen bemanning er nodvendig i dette tidsrommet."}</p>`;
    const missingText = status.needed ? String(status.missing) : "0";
    const coveredText = status.needed ? String(status.covered) : "0";
    return `
      <div class="slot-detail-summary">
        <span class="badge">${escapeHtml(status.text)}</span>
        <span class="badge">Dekket: ${escapeHtml(coveredText)}</span>
        <span class="badge ${status.missing ? "warn" : ""}">Mangler: ${escapeHtml(missingText)}</span>
      </div>
      <dl class="slot-detail-grid">
        <div>
          <dt>Oppgave/vaktpost</dt>
          <dd>${escapeHtml(shift.title || "Uten navn")}</dd>
        </div>
        <div>
          <dt>Dato/tidsrom</dt>
          <dd>${escapeHtml(formatColumnLabel(column.startAt, column.endAt))}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>${escapeHtml(status.text)}</dd>
        </div>
        <div>
          <dt>Behov/kapasitet</dt>
          <dd>${status.needed ? `${escapeHtml(String(shift.capacity))} per tidsrom` : "Ikke behov i dette tidsrommet"}</dd>
        </div>
        <div>
          <dt>Antall satt opp</dt>
          <dd>${escapeHtml(coveredText)}</dd>
        </div>
        <div>
          <dt>Mangler</dt>
          <dd>${escapeHtml(missingText)}</dd>
        </div>
        <div>
          <dt>Sted</dt>
          <dd>${shift.location ? escapeHtml(shift.location) : "Ikke oppgitt"}</dd>
        </div>
      </dl>
      <section class="slot-detail-section">
        <h3>Personer/grupper satt opp</h3>
        ${assignmentRows}
      </section>
      ${shift.description ? `
        <section class="slot-detail-section">
          <h3>Beskrivelse/instruks</h3>
          <p>${escapeHtml(shift.description).replace(/\n/g, "<br>")}</p>
        </section>
      ` : ""}
    `;
  }

  function assignmentDetailHtml(assignment, contacts) {
    const contact = contacts.find((item) => item.id === assignment.contactId);
    const name = contact ? `${contact.name} (${contact.type})` : "Ukjent kontakt";
    const notes = assignment.notes ? `<p class="small">${escapeHtml(assignment.notes)}</p>` : "";
    return `
      <li>
        <strong>${escapeHtml(name)}</strong>
        <span class="meta">${escapeHtml(formatPeriod(assignment.startAt, assignment.endAt))}</span>
        ${notes}
      </li>
    `;
  }

  function openExistingShiftEditor(id, slotContext) {
    if (!id) {
      setTimelineStatus("Kunne ikke åpne redigering fordi vakten mangler id.");
      cleanupModalState();
      return;
    }

    const slot = normalizeSlotContext(slotContext);
    try {
      cleanupModalState();
      let openedByApp = false;
      if (typeof window.HLF_DUGNAD_OPEN_SHIFT === "function") {
        try {
          openedByApp = window.HLF_DUGNAD_OPEN_SHIFT(id, slot) === true;
        } catch (error) {
          console.warn("Kunne ikke åpne vaktredigering fra tidsrom", error);
        }
      }

      if (!openedByApp) {
        fillShiftFormFromState(id);
      }
      prefillAssignmentFormFromSlot(id, slot);
      document.getElementById("assignmentEditor")?.scrollIntoView({ block: "start", behavior: "auto" });
      cleanupModalState();
    } catch (error) {
      console.warn("Kunne ikke fullføre overgang fra tidsromdetaljer til redigering", error);
      setTimelineStatus("Kunne ikke åpne redigering for dette tidsrommet. Last inn siden på nytt og prøv igjen.");
      cleanupModalState();
    }
  }

  function fillShiftFormFromState(id) {
    const state = loadState();
    const shift = state.shifts.find((item) => item.id === id);
    const form = document.getElementById("shiftForm");
    const controls = requiredFormControls(form, ["id", "title", "startDate", "startTime", "endDate", "endTime", "location", "capacity"], "Kunne ikke åpne redigering fordi vaktskjemaet mangler felt.");
    if (!shift || !controls) {
      setTimelineStatus("Kunne ikke åpne redigering fordi vaktdata mangler.");
      return false;
    }
    controls.id.value = shift.id;
    controls.title.value = shift.title;
    controls.startDate.value = datePart(shift.startAt);
    controls.startTime.value = timePart(shift.startAt);
    controls.endDate.value = datePart(shift.endAt);
    controls.endTime.value = timePart(shift.endAt);
    controls.location.value = shift.location;
    controls.capacity.value = shift.capacity;
    if (form.elements.notes) form.elements.notes.value = shift.description;
    document.getElementById("cancelShiftEdit")?.classList.remove("hidden");
    controls.title.focus();
    return true;
  }

  function prefillAssignmentFormFromSlot(shiftId, slotContext) {
    const slot = normalizeSlotContext(slotContext);
    if (!slot) return false;

    const state = loadState();
    const shift = state.shifts.find((item) => item.id === shiftId);
    const form = document.getElementById("assignmentForm");
    const controls = requiredFormControls(form, ["id", "startDate", "startTime", "endDate", "endTime"], "Kunne ikke forhåndsutfylle bemanning fordi bemanningsskjemaet mangler felt.");
    if (!shift || !controls) return false;
    if (!overlaps(shift.startAt, shift.endAt, slot.startAt, slot.endAt)) return false;

    controls.id.value = "";
    controls.startDate.value = datePart(slot.startAt);
    controls.startTime.value = timePart(slot.startAt);
    controls.endDate.value = datePart(slot.endAt);
    controls.endTime.value = timePart(slot.endAt);
    if (form.elements.notes) form.elements.notes.value = "";
    document.getElementById("cancelAssignmentEdit")?.classList.add("hidden");
    const submit = form.querySelector("button[type='submit']");
    if (submit) submit.textContent = "Legg til tildeling";
    form.elements.contactId?.focus();
    return true;
  }

  function requiredFormControls(form, names, message) {
    if (!form) {
      setTimelineStatus(message);
      return null;
    }
    const controls = {};
    for (const name of names) {
      const control = form.elements[name];
      if (!control) {
        setTimelineStatus(message);
        return null;
      }
      controls[name] = control;
    }
    return controls;
  }

  function normalizeSlotContext(slotContext) {
    const startAt = normalizeDateTime(slotContext?.startAt || "");
    const endAt = normalizeDateTime(slotContext?.endAt || "");
    return startAt && endAt && isAfter(endAt, startAt) ? { startAt, endAt } : null;
  }

  function setTimelineStatus(message) {
    const target = document.getElementById("saveStatus") || summary;
    if (target) target.textContent = message;
  }

  function isNeeded(shift, column) {
    return overlaps(shift.startAt, shift.endAt, column.startAt, column.endAt);
  }

  function coverageCount(shift, startAt, endAt) {
    return shift.assignments.filter((assignment) => overlaps(assignment.startAt, assignment.endAt, startAt, endAt)).length;
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

  function formatColumnLabel(startAt, endAt) {
    const startDate = datePart(startAt);
    const endDate = datePart(endAt);
    const startLabel = `${formatDateLabel(startAt)} ${timePart(startAt)}`;
    return startDate === endDate
      ? `${startLabel}-${timePart(endAt)}`
      : `${startLabel}-${formatDateLabel(endAt)} ${timePart(endAt)}`;
  }

  function formatColumnDateLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const weekday = new Intl.DateTimeFormat("nb-NO", { weekday: "long" }).format(date);
    const dayMonth = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "numeric" }).format(date).replace(/\.$/, "");
    return `${titleCase(weekday)} ${dayMonth}`;
  }

  function formatColumnTimeLabel(startAt, endAt) {
    return datePart(startAt) === datePart(endAt)
      ? `${timePart(startAt)}-${timePart(endAt)}`
      : `${timePart(startAt)}-${formatColumnDateLabel(endAt)} ${timePart(endAt)}`;
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
    const clean = String(value || "").trim();
    const match = clean.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
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

  function summaryBadge(label, value) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = `${label}: ${value}`;
    return badge;
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

  function injectTimelineDetailStyles() {
    if (document.getElementById("timelineDetailStyles")) return;
    const style = document.createElement("style");
    style.id = "timelineDetailStyles";
    style.textContent = `
      .timeline-status-filter-label {
        min-width: 180px;
      }

      .timeline-time-split {
        display: grid;
        gap: 0.08rem;
        line-height: 1.12;
        white-space: normal;
      }

      .timeline-time-date {
        font-weight: 750;
      }

      .timeline-time-hours {
        color: var(--muted);
        font-size: 0.86rem;
      }

      .timeline-cell-button {
        align-content: center;
        justify-items: start;
      }

      .timeline-cell-button.no-need {
        border-color: #dde1d8;
        background: #eef0ec;
        background-image: repeating-linear-gradient(-45deg, transparent 0 8px, rgba(99, 104, 95, 0.14) 8px 10px);
        color: var(--muted);
      }

      .timeline-cell-button .timeline-status {
        margin-top: 0;
      }

      .timeline-cell-button.filter-match {
        outline: 2px solid rgba(15, 107, 88, 0.34);
        outline-offset: -2px;
      }

      .timeline-cell-button.filter-muted {
        opacity: 0.42;
      }

      .slot-detail-dialog {
        width: min(720px, calc(100vw - 1.5rem));
        max-height: calc(100vh - 1.5rem);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 0;
        color: var(--text);
        background: var(--panel);
        box-shadow: 0 18px 45px rgba(25, 31, 25, 0.22);
      }

      .slot-detail-dialog::backdrop {
        background: rgba(32, 35, 31, 0.46);
      }

      .slot-detail-shell {
        display: grid;
        gap: 1rem;
        padding: 1rem;
      }

      .slot-detail-header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .slot-detail-header h2 {
        margin: 0;
      }

      .slot-detail-body {
        display: grid;
        gap: 1rem;
        overflow-wrap: anywhere;
      }

      .slot-detail-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .slot-detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
        margin: 0;
      }

      .slot-detail-grid > div {
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 0.7rem;
        background: #fbfcfa;
      }

      .slot-detail-grid dt {
        margin: 0 0 0.2rem;
        color: var(--muted);
        font-size: 0.86rem;
        font-weight: 750;
      }

      .slot-detail-grid dd {
        margin: 0;
      }

      .slot-detail-section {
        display: grid;
        gap: 0.45rem;
      }

      .slot-detail-section h3 {
        margin: 0;
        font-size: 1rem;
      }

      .slot-detail-list {
        display: grid;
        gap: 0.5rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .slot-detail-list li {
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 0.7rem;
        background: #fff;
      }

      .slot-detail-list strong,
      .slot-detail-list span {
        display: block;
      }

      .slot-detail-actions {
        justify-content: end;
      }

      @media (max-width: 640px) {
        .timeline-status-filter-label {
          width: 100%;
        }

        .slot-detail-dialog {
          width: calc(100vw - 0.75rem);
          max-height: calc(100vh - 0.75rem);
        }

        .slot-detail-header,
        .slot-detail-actions {
          align-items: stretch;
          flex-direction: column;
        }

        .slot-detail-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.append(style);
  }
})();