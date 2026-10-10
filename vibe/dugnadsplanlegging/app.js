(function () {
  "use strict";

  const ACTIVE_DUGNAD = localStorage.getItem("vibe-active-dugnad") || "hell-lopefestival";
  const STORAGE_KEY = `vibe-dugnadsplanlegging:v1:${ACTIVE_DUGNAD}`;
  const VERSION = "0.6.13-vibe";
  const SLOT_MINUTES = 60;
  const SMS_TEMPLATES = {
    custom: "",
    reminder: "Hei! Dette er en paminning om dugnadsvakten din for Hell Lopefestival. Svar gjerne hvis noe ikke stemmer.",
    change: "Hei! Det er en endring i dugnadsplanen for Hell Lopefestival. Sjekk oppdatert beskjed fra arrangor.",
    thanks: "Hei! Tusen takk for hjelpen med Hell Lopefestival. Innsatsen din betyr mye for arrangementet."
  };

  const emptyState = {
    version: VERSION,
    updatedAt: null,
    contacts: [],
    shifts: []
  };

  let state = loadState();
  let activeShiftId = "";

  const dom = {
    saveStatus: document.getElementById("saveStatus"),
    duplicateNotice: document.getElementById("duplicateNotice"),
    contactForm: document.getElementById("contactForm"),
    shiftForm: document.getElementById("shiftForm"),
    assignmentEditor: document.getElementById("assignmentEditor"),
    assignmentHeading: document.getElementById("assignmentHeading"),
    assignmentList: document.getElementById("assignmentList"),
    assignmentForm: document.getElementById("assignmentForm"),
    cancelAssignmentEdit: document.getElementById("cancelAssignmentEdit"),
    contactSearch: document.getElementById("contactSearch"),
    shiftSearch: document.getElementById("shiftSearch"),
    contactList: document.getElementById("contactList"),
    shiftList: document.getElementById("shiftList"),
    missingPhoneList: document.getElementById("missingPhoneList"),
    summaryCards: document.getElementById("summaryCards"),
    exportButton: document.getElementById("exportButton"),
    importInput: document.getElementById("importInput"),
    resetButton: document.getElementById("resetButton"),
    cancelContactEdit: document.getElementById("cancelContactEdit"),
    cancelShiftEdit: document.getElementById("cancelShiftEdit"),
    smsForm: document.getElementById("smsForm"),
    smsSource: document.getElementById("smsSource"),
    smsTarget: document.getElementById("smsTarget"),
    smsTargetLabel: document.getElementById("smsTargetLabel"),
    smsTemplate: document.getElementById("smsTemplate"),
    smsMessage: document.getElementById("smsMessage"),
    smsDryRun: document.getElementById("smsDryRun"),
    smsDryRunButton: document.getElementById("smsDryRunButton"),
    smsCopyScriptButton: document.getElementById("smsCopyScriptButton"),
    smsBridgeCheckButton: document.getElementById("smsBridgeCheckButton"),
    smsBridgeStatus: document.getElementById("smsBridgeStatus"),
    smsPreviewSummary: document.getElementById("smsPreviewSummary"),
    smsRecipientList: document.getElementById("smsRecipientList"),
    smsMissingList: document.getElementById("smsMissingList"),
    smsAppleScript: document.getElementById("smsAppleScript"),
    smsConfirmSend: document.getElementById("smsConfirmSend"),
    smsSendButton: document.getElementById("smsSendButton"),
    smsSendStatus: document.getElementById("smsSendStatus")
  };

  // Prevent browser navigation; each product handler still processes its local form.
  const contactFormGuard = document.querySelector('#contactForm');
  contactFormGuard.addEventListener('submit', (event) => event.preventDefault(), { capture: true });
  const shiftFormGuard = document.querySelector('#shiftForm');
  shiftFormGuard.addEventListener('submit', (event) => event.preventDefault(), { capture: true });
  const assignmentFormGuard = document.querySelector('#assignmentForm');
  assignmentFormGuard.addEventListener('submit', (event) => event.preventDefault(), { capture: true });
  const smsFormGuard = document.querySelector('#smsForm');
  smsFormGuard.addEventListener('submit', (event) => event.preventDefault(), { capture: true });

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  dom.contactForm.addEventListener("submit", saveContact);
  dom.shiftForm.addEventListener("submit", saveShift);
  dom.assignmentForm.addEventListener("submit", saveAssignment);
  dom.cancelAssignmentEdit.addEventListener("click", resetAssignmentForm);
  dom.contactSearch.addEventListener("input", render);
  dom.shiftSearch.addEventListener("input", render);
  dom.exportButton.addEventListener("click", exportBackup);
  dom.importInput.addEventListener("change", importBackup);
  dom.resetButton.addEventListener("click", resetData);
  dom.cancelContactEdit.addEventListener("click", resetContactForm);
  dom.cancelShiftEdit.addEventListener("click", resetShiftForm);
  dom.smsSource.addEventListener("change", () => {
    renderSmsTargetOptions();
    renderSmsPreview();
  });
  dom.smsTarget.addEventListener("change", renderSmsPreview);
  dom.smsTemplate.addEventListener("change", applySmsTemplate);
  dom.smsMessage.addEventListener("input", renderSmsPreview);
  dom.smsDryRun.addEventListener("change", renderSmsPreview);
  dom.smsConfirmSend.addEventListener("change", renderSmsPreview);
  dom.smsDryRunButton.addEventListener("click", runSmsDryRun);
  dom.smsCopyScriptButton.addEventListener("click", copySmsAppleScript);
  dom.smsBridgeCheckButton.addEventListener("click", checkSmsBridge);
  dom.smsSendButton.addEventListener("click", sendSmsViaBridge);

  window.HLF_DUGNAD_OPEN_SHIFT = editShift;

  if (state.version !== VERSION) {
    persist("Data migrert til v0.5.0-modell.");
  } else {
    render();
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = sampleState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      console.warn("Kunne ikke lese lokal lagring", error);
      return structuredCloneSafe(emptyState);
    }
  }

  function sampleState() {
    const date = "2026-10-17";
    const contacts = ["Deltaker A", "Deltaker B", "Deltaker C", "Deltaker D"].map((name, index) => normalizeContact({
      id: `demo-contact-${index + 1}`, type: "person", name, phone: "+47 00000000",
      contactPoints: "", notes: "Syntetisk eksempeldata"
    }));
    const shifts = [
      ["demo-shift-1", "Klargjøring", "09:00", "11:00", "Hovedområde", "demo-contact-1"],
      ["demo-shift-2", "Vertskap", "11:00", "13:00", "Inngang", "demo-contact-2"],
      ["demo-shift-3", "Servering", "13:00", "15:00", "Telt A", "demo-contact-3"],
      ["demo-shift-4", "Opprydding", "15:00", "17:00", "Hovedområde", ""]
    ].map(([id, title, startTime, endTime, location, contactId]) => normalizeShift({
      id, title, day: "Lørdag 17.10", startDate: date, startTime, endDate: date, endTime,
      startAt: `${date}T${startTime}`, endAt: `${date}T${endTime}`, location, capacity: 1,
      assignments: contactId ? [{ id: `${id}-assignment`, shiftId: id, contactId,
        startAt: `${date}T${startTime}`, endAt: `${date}T${endTime}`, notes: "Syntetisk tildeling" }] : [],
      notes: "Syntetisk eksempelvakt"
    }));
    return { ...structuredCloneSafe(emptyState), contacts, shifts };
  }

  function normalizeState(input) {
    return {
      version: VERSION,
      updatedAt: input.updatedAt || null,
      contacts: Array.isArray(input.contacts) ? input.contacts.map(normalizeContact) : [],
      shifts: Array.isArray(input.shifts) ? input.shifts.map(normalizeShift) : []
    };
  }

  function normalizeContact(contact) {
    return {
      id: String(contact.id || createId()),
      type: contact.type === "gruppe" ? "gruppe" : "person",
      name: String(contact.name || "").trim(),
      phone: String(contact.phone || "").trim(),
      contactPoints: String(contact.contactPoints || "").trim(),
      notes: String(contact.notes || "").trim(),
      createdAt: contact.createdAt || new Date().toISOString(),
      updatedAt: contact.updatedAt || contact.createdAt || new Date().toISOString()
    };
  }

  function normalizeShift(shift) {
    const now = new Date().toISOString();
    const capacity = Number.parseInt(shift.capacity, 10);
    const startAt = normalizeDateTime(shift.startAt || joinDateTime(shift.startDate, shift.startTime));
    const endAt = normalizeDateTime(shift.endAt || joinDateTime(shift.endDate || shift.startDate, shift.endTime));
    const legacyAssignedIds = Array.isArray(shift.assignedIds) ? shift.assignedIds.map(String) : [];
    const hasAssignments = Array.isArray(shift.assignments) && shift.assignments.length > 0;
    const normalized = {
      id: String(shift.id || createId()),
      title: String(shift.title || "").trim(),
      day: String(shift.day || labelDate(startAt) || "").trim(),
      startDate: datePart(startAt),
      startTime: timePart(startAt) || String(shift.startTime || "").trim(),
      endDate: datePart(endAt),
      endTime: timePart(endAt) || String(shift.endTime || "").trim(),
      startAt,
      endAt,
      location: String(shift.location || "").trim(),
      capacity: capacity > 0 ? capacity : 1,
      assignments: hasAssignments ? shift.assignments.map((assignment) => normalizeAssignment(assignment, shift.id, startAt, endAt)) : [],
      assignedIds: legacyAssignedIds,
      notes: String(shift.notes || "").trim(),
      createdAt: shift.createdAt || now,
      updatedAt: shift.updatedAt || shift.createdAt || now
    };

    if (!normalized.assignments.length && legacyAssignedIds.length && startAt && endAt && isAfter(endAt, startAt)) {
      normalized.assignments = legacyAssignedIds.map((contactId) => normalizeAssignment({
        contactId,
        startAt,
        endAt,
        notes: "Migrert fra tidligere fullvakt-bemanning."
      }, normalized.id, startAt, endAt));
    }
    normalized.assignedIds = unique(normalized.assignments.map((assignment) => assignment.contactId));
    return normalized;
  }

  function normalizeAssignment(assignment, shiftId, fallbackStartAt, fallbackEndAt) {
    const now = new Date().toISOString();
    const startAt = normalizeDateTime(assignment.startAt || joinDateTime(assignment.startDate, assignment.startTime)) || fallbackStartAt || "";
    const endAt = normalizeDateTime(assignment.endAt || joinDateTime(assignment.endDate || assignment.startDate, assignment.endTime)) || fallbackEndAt || "";
    return {
      id: String(assignment.id || createId()),
      shiftId: String(assignment.shiftId || shiftId || ""),
      contactId: String(assignment.contactId || assignment.assignedId || ""),
      startAt,
      endAt,
      notes: String(assignment.notes || "").trim(),
      createdAt: assignment.createdAt || now,
      updatedAt: assignment.updatedAt || assignment.createdAt || now
    };
  }

  function persist(message) {
    state = normalizeState(state);
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    dom.saveStatus.textContent = message || "Lagret lokalt.";
    render();
  }

  function saveContact(event) {
    event.preventDefault();
    const form = new FormData(dom.contactForm);
    const now = new Date().toISOString();
    const id = String(form.get("id") || "");
    const existing = state.contacts.find((contact) => contact.id === id);
    const contact = normalizeContact({
      id: id || createId(),
      type: form.get("type"),
      name: form.get("name"),
      phone: form.get("phone"),
      contactPoints: form.get("contactPoints"),
      notes: form.get("notes"),
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    });

    if (!contact.name) return;

    if (existing) {
      state.contacts = state.contacts.map((item) => item.id === id ? contact : item);
    } else {
      state.contacts.push(contact);
    }
    resetContactForm();
    persist("Person/gruppe lagret.");
  }

  function saveShift(event) {
    event.preventDefault();
    const form = new FormData(dom.shiftForm);
    const now = new Date().toISOString();
    const id = String(form.get("id") || "");
    const existing = state.shifts.find((shift) => shift.id === id);
    const startAt = joinDateTime(form.get("startDate"), form.get("startTime"));
    const endAt = joinDateTime(form.get("endDate"), form.get("endTime"));

    if (!form.get("title") || !startAt || !endAt || !isAfter(endAt, startAt)) {
      window.alert("Vakten må ha tittel, starttidspunkt og sluttidspunkt etter start.");
      return;
    }

    const shift = normalizeShift({
      id: id || createId(),
      title: form.get("title"),
      startAt,
      endAt,
      location: form.get("location"),
      capacity: form.get("capacity"),
      assignments: existing ? existing.assignments : [],
      assignedIds: existing ? existing.assignedIds : [],
      notes: form.get("notes"),
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    });

    if (existing) {
      state.shifts = state.shifts.map((item) => item.id === id ? shift : item);
    } else {
      state.shifts.push(shift);
    }
    activeShiftId = shift.id;
    fillShiftForm(shift);
    resetAssignmentForm();
    persist("Vakt lagret. Du kan legge til bemanningstildelinger under.");
  }

  function saveAssignment(event) {
    event.preventDefault();
    const shift = activeShift();
    if (!shift) {
      window.alert("Lagre eller velg en vakt før du legger til bemanning.");
      return;
    }
    const form = new FormData(dom.assignmentForm);
    const startAt = joinDateTime(form.get("startDate"), form.get("startTime"));
    const endAt = joinDateTime(form.get("endDate"), form.get("endTime"));
    const contactId = String(form.get("contactId") || "");
    const id = String(form.get("id") || "");
    const existing = shift.assignments.find((assignment) => assignment.id === id);

    if (!contactId || !startAt || !endAt || !isAfter(endAt, startAt)) {
      window.alert("Velg person/gruppe og et gyldig tidsrom for bemanning.");
      return;
    }
    if (shift.startAt && isBefore(startAt, shift.startAt) || shift.endAt && isAfter(endAt, shift.endAt)) {
      window.alert("Bemanningstildelingen må ligge innenfor vaktens start og slutt.");
      return;
    }

    const assignment = normalizeAssignment({
      id: id || createId(),
      shiftId: shift.id,
      contactId,
      startAt,
      endAt,
      notes: form.get("notes"),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, shift.id, shift.startAt, shift.endAt);

    shift.assignments = existing
      ? shift.assignments.map((item) => item.id === id ? assignment : item)
      : [...shift.assignments, assignment];
    shift.assignedIds = unique(shift.assignments.map((item) => item.contactId));
    shift.updatedAt = new Date().toISOString();
    state.shifts = state.shifts.map((item) => item.id === shift.id ? normalizeShift(shift) : item);
    resetAssignmentForm();
    persist(existing ? "Bemanningstildeling oppdatert." : "Bemanningstildeling lagt til.");
  }

  function editContact(id) {
    const contact = state.contacts.find((item) => item.id === id);
    if (!contact) return;
    dom.contactForm.elements.id.value = contact.id;
    dom.contactForm.elements.type.value = contact.type;
    dom.contactForm.elements.name.value = contact.name;
    dom.contactForm.elements.phone.value = contact.phone;
    dom.contactForm.elements.contactPoints.value = contact.contactPoints;
    dom.contactForm.elements.notes.value = contact.notes;
    dom.cancelContactEdit.classList.remove("hidden");
    setActiveTab("vaktplan");
    dom.contactForm.elements.name.focus();
  }

  function editShift(id) {
    const shift = state.shifts.find((item) => item.id === id);
    if (!shift) return;
    activeShiftId = shift.id;
    fillShiftForm(shift);
    resetAssignmentForm();
    dom.cancelShiftEdit.classList.remove("hidden");
    setActiveTab("vaktplan");
    dom.shiftForm.elements.title.focus();
    render();
  }

  function fillShiftForm(shift) {
    dom.shiftForm.elements.id.value = shift.id;
    dom.shiftForm.elements.title.value = shift.title;
    dom.shiftForm.elements.startDate.value = datePart(shift.startAt);
    dom.shiftForm.elements.startTime.value = timePart(shift.startAt);
    dom.shiftForm.elements.endDate.value = datePart(shift.endAt);
    dom.shiftForm.elements.endTime.value = timePart(shift.endAt);
    dom.shiftForm.elements.location.value = shift.location;
    dom.shiftForm.elements.capacity.value = shift.capacity;
    dom.shiftForm.elements.notes.value = shift.notes;
  }

  function editAssignment(assignmentId) {
    const shift = activeShift();
    const assignment = shift?.assignments.find((item) => item.id === assignmentId);
    if (!assignment) return;
    dom.assignmentForm.elements.id.value = assignment.id;
    dom.assignmentForm.elements.contactId.value = assignment.contactId;
    dom.assignmentForm.elements.startDate.value = datePart(assignment.startAt);
    dom.assignmentForm.elements.startTime.value = timePart(assignment.startAt);
    dom.assignmentForm.elements.endDate.value = datePart(assignment.endAt);
    dom.assignmentForm.elements.endTime.value = timePart(assignment.endAt);
    dom.assignmentForm.elements.notes.value = assignment.notes;
    dom.cancelAssignmentEdit.classList.remove("hidden");
    dom.assignmentForm.querySelector("button[type='submit']").textContent = "Oppdater tildeling";
    dom.assignmentForm.elements.contactId.focus();
  }

  function deleteContact(id) {
    const contact = state.contacts.find((item) => item.id === id);
    if (!contact || !window.confirm(`Slette ${contact.name}? Personen/gruppen fjernes og tas ut av vakter.`)) return;
    state.contacts = state.contacts.filter((item) => item.id !== id);
    state.shifts = state.shifts.map((shift) => normalizeShift({
      ...shift,
      assignments: shift.assignments.filter((assignment) => assignment.contactId !== id),
      assignedIds: shift.assignedIds.filter((assignedId) => assignedId !== id)
    }));
    persist("Person/gruppe slettet.");
  }

  function deleteShift(id) {
    const shift = state.shifts.find((item) => item.id === id);
    if (!shift || !window.confirm(`Slette vakten "${shift.title}"?`)) return;
    state.shifts = state.shifts.filter((item) => item.id !== id);
    if (activeShiftId === id) resetShiftForm();
    persist("Vakt slettet.");
  }

  function deleteAssignment(assignmentId) {
    const shift = activeShift();
    const assignment = shift?.assignments.find((item) => item.id === assignmentId);
    if (!shift || !assignment || !window.confirm("Slette denne bemanningstildelingen?")) return;
    shift.assignments = shift.assignments.filter((item) => item.id !== assignmentId);
    shift.assignedIds = unique(shift.assignments.map((item) => item.contactId));
    shift.updatedAt = new Date().toISOString();
    state.shifts = state.shifts.map((item) => item.id === shift.id ? normalizeShift(shift) : item);
    resetAssignmentForm();
    persist("Bemanningstildeling slettet.");
  }

  function resetContactForm() {
    dom.contactForm.reset();
    dom.contactForm.elements.id.value = "";
    dom.cancelContactEdit.classList.add("hidden");
  }

  function resetShiftForm() {
    dom.shiftForm.reset();
    dom.shiftForm.elements.id.value = "";
    dom.shiftForm.elements.capacity.value = "1";
    dom.cancelShiftEdit.classList.add("hidden");
    activeShiftId = "";
    resetAssignmentForm();
    render();
  }

  function resetAssignmentForm() {
    dom.assignmentForm.reset();
    dom.assignmentForm.elements.id.value = "";
    dom.cancelAssignmentEdit.classList.add("hidden");
    dom.assignmentForm.querySelector("button[type='submit']").textContent = "Legg til tildeling";
    const shift = activeShift();
    if (shift) {
      dom.assignmentForm.elements.startDate.value = datePart(shift.startAt);
      dom.assignmentForm.elements.startTime.value = timePart(shift.startAt);
      dom.assignmentForm.elements.endDate.value = datePart(shift.endAt);
      dom.assignmentForm.elements.endTime.value = timePart(shift.endAt);
    }
  }

  function render() {
    renderAssigneeOptions();
    renderContacts();
    renderShifts();
    renderAssignmentEditor();
    renderMissingPhones();
    renderSummary();
    renderDuplicateNotice();
    renderSmsTargetOptions();
    renderSmsPreview();
  }

  function renderAssigneeOptions() {
    const previous = dom.assignmentForm.elements.contactId.value;
    dom.assignmentForm.elements.contactId.innerHTML = '<option value="">Velg person/gruppe</option>';
    sortContacts(state.contacts).forEach((contact) => {
      const option = document.createElement("option");
      option.value = contact.id;
      option.textContent = `${contact.name} (${contact.type})`;
      option.selected = previous === contact.id;
      dom.assignmentForm.elements.contactId.append(option);
    });
  }

  function renderContacts() {
    const query = normalizeSearch(dom.contactSearch.value);
    const contacts = sortContacts(state.contacts).filter((contact) => contactMatches(contact, query));
    dom.contactList.innerHTML = "";
    if (!contacts.length) {
      dom.contactList.append(emptyNode());
      return;
    }
    contacts.forEach((contact) => dom.contactList.append(contactRow(contact)));
  }

  function renderShifts() {
    const query = normalizeSearch(dom.shiftSearch.value);
    const shifts = sortShifts(state.shifts).filter((shift) => shiftMatches(shift, query));
    dom.shiftList.innerHTML = "";
    if (!shifts.length) {
      dom.shiftList.append(emptyNode());
      return;
    }
    shifts.forEach((shift) => dom.shiftList.append(shiftRow(shift)));
  }

  function renderAssignmentEditor() {
    const shift = activeShift();
    dom.assignmentEditor.classList.toggle("hidden", !shift);
    if (!shift) return;
    dom.assignmentHeading.textContent = `Bemanning for ${shift.title}`;
    dom.assignmentList.innerHTML = "";
    const coverage = coverageSummary(shift);
    const status = document.createElement("p");
    status.className = "small";
    status.textContent = `${formatShiftPeriod(shift)}. ${coverage.text}`;
    dom.assignmentList.append(status);

    if (!shift.assignments.length) {
      dom.assignmentList.append(emptyText("Ingen bemanningstildelinger. Hele vakten regnes som manglende bemanning."));
      return;
    }

    sortAssignments(shift.assignments).forEach((assignment) => {
      const contact = findContact(assignment.contactId);
      const row = document.createElement("article");
      row.className = "row assignment-row";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(contact ? contact.name : "Ukjent kontakt")}</strong>
          <span class="meta">${escapeHtml(formatPeriod(assignment.startAt, assignment.endAt))}</span>
          ${assignment.notes ? `<p class="small">${escapeHtml(assignment.notes)}</p>` : ""}
        </div>
        <div class="row-actions">
          <button type="button" class="secondary" data-action="edit-assignment" data-id="${escapeHtml(assignment.id)}">Rediger</button>
          <button type="button" class="danger" data-action="delete-assignment" data-id="${escapeHtml(assignment.id)}">Slett</button>
        </div>
      `;
      bindRowActions(row);
      dom.assignmentList.append(row);
    });
  }

  function contactRow(contact) {
    const row = document.createElement("article");
    row.className = "row";
    const shifts = assignedShifts(contact.id);
    row.innerHTML = `
      <div class="row-header">
        <div>
          <h3>${escapeHtml(contact.name)}</h3>
          <p class="meta">${contact.type === "gruppe" ? "Gruppe" : "Person"}</p>
        </div>
        <div class="row-actions">
          <button type="button" class="secondary" data-action="edit-contact" data-id="${escapeHtml(contact.id)}">Rediger</button>
          <button type="button" class="danger" data-action="delete-contact" data-id="${escapeHtml(contact.id)}">Slett</button>
        </div>
      </div>
      <div class="badge-line">
        ${phoneBadge(contact)}
        ${contact.contactPoints ? `<span class="badge">Kontaktpunkt: ${escapeHtml(firstLine(contact.contactPoints))}</span>` : ""}
      </div>
      <div class="details">
        ${contact.notes ? `<p>${escapeHtml(contact.notes)}</p>` : ""}
        <p class="small">Tildelinger: ${shifts.length ? escapeHtml(shifts.map(formatShiftShort).join(", ")) : "Ingen registrert"}</p>
      </div>
    `;
    bindRowActions(row);
    return row;
  }

  function shiftRow(shift) {
    const row = document.createElement("article");
    row.className = "row";
    const coverage = coverageSummary(shift);
    row.innerHTML = `
      <div class="row-header">
        <div>
          <h3>${escapeHtml(shift.title)}</h3>
          <p class="meta">${escapeHtml(formatShiftPeriod(shift))}${shift.location ? ` - ${escapeHtml(shift.location)}` : ""}</p>
        </div>
        <div class="row-actions">
          <button type="button" class="secondary" data-action="edit-shift" data-id="${escapeHtml(shift.id)}">Rediger</button>
          <button type="button" class="danger" data-action="delete-shift" data-id="${escapeHtml(shift.id)}">Slett</button>
        </div>
      </div>
      <div class="assignment-list">
        <span class="badge ${coverage.missingSlots ? "warn" : ""}">${escapeHtml(coverage.text)}</span>
        <span class="badge">Behov: ${shift.capacity} per tidsrom</span>
        <span class="badge">Tildelinger: ${shift.assignments.length}</span>
      </div>
      <div class="details">
        ${assignmentSummaryHtml(shift)}
        ${shift.notes ? `<p>${escapeHtml(shift.notes)}</p>` : ""}
      </div>
    `;
    bindRowActions(row);
    return row;
  }

  function assignmentSummaryHtml(shift) {
    if (!shift.assignments.length) return '<p class="small">Ingen bemanning lagt inn for tidsrom.</p>';
    return `<p class="small">${sortAssignments(shift.assignments).map((assignment) => {
      const contact = findContact(assignment.contactId);
      return `${contact ? contact.name : "Ukjent"}: ${formatPeriod(assignment.startAt, assignment.endAt)}`;
    }).join(" | ")}</p>`;
  }

  function bindRowActions(row) {
    row.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        if (action === "edit-contact") editContact(id);
        if (action === "delete-contact") deleteContact(id);
        if (action === "edit-shift") editShift(id);
        if (action === "delete-shift") deleteShift(id);
        if (action === "edit-assignment") editAssignment(id);
        if (action === "delete-assignment") deleteAssignment(id);
      });
    });
  }

  function renderMissingPhones() {
    dom.missingPhoneList.innerHTML = "";
    const missing = sortContacts(state.contacts).filter((contact) => !hasPhone(contact));
    if (!missing.length) {
      dom.missingPhoneList.innerHTML = '<p class="empty">Alle registrerte personer/grupper har telefon eller kontaktpunkt.</p>';
      return;
    }
    missing.forEach((contact) => {
      const row = document.createElement("article");
      row.className = "row";
      row.innerHTML = `
        <div class="row-header">
          <div>
            <h3>${escapeHtml(contact.name)}</h3>
            <p class="meta">${contact.type === "gruppe" ? "Gruppe" : "Person"} mangler telefonnummer.</p>
          </div>
          <div class="row-actions">
            <button type="button" class="secondary" data-action="edit-contact" data-id="${escapeHtml(contact.id)}">Legg til telefon</button>
          </div>
        </div>
      `;
      bindRowActions(row);
      dom.missingPhoneList.append(row);
    });
  }

  function renderSummary() {
    const assignmentCount = state.shifts.reduce((sum, shift) => sum + shift.assignments.length, 0);
    const missingPhoneCount = state.contacts.filter((contact) => !hasPhone(contact)).length;
    const understaffed = state.shifts.filter((shift) => coverageSummary(shift).missingSlots > 0).length;
    const cards = [
      ["Personer/grupper", state.contacts.length],
      ["Oppgaver/vakter", state.shifts.length],
      ["Tildelinger", assignmentCount],
      ["Mangler telefon", missingPhoneCount],
      ["Har udekkede tidsrom", understaffed],
      ["Sist lagret", state.updatedAt ? new Date(state.updatedAt).toLocaleString("nb-NO") : "Ikke lagret"]
    ];
    dom.summaryCards.innerHTML = cards.map(([label, value]) => `
      <article class="summary-card">
        <strong>${escapeHtml(String(value))}</strong>
        <span>${escapeHtml(label)}</span>
      </article>
    `).join("");
  }

  function renderDuplicateNotice() {
    const names = new Map();
    state.contacts.forEach((contact) => {
      const key = contact.name.trim().toLowerCase();
      if (!key) return;
      names.set(key, (names.get(key) || 0) + 1);
    });
    const duplicates = Array.from(names.entries()).filter((entry) => entry[1] > 1).map((entry) => entry[0]);
    dom.duplicateNotice.textContent = duplicates.length ? `Mulige duplikatnavn: ${duplicates.join(", ")}` : "";
  }

  function renderSmsTargetOptions() {
    const previousValue = dom.smsTarget.value;
    const source = dom.smsSource.value;
    const targets = smsTargetsForSource(source);
    dom.smsTarget.innerHTML = "";
    dom.smsTarget.disabled = source === "all";
    dom.smsTargetLabel.classList.toggle("hidden", source === "all");
    targets.forEach((target) => {
      const option = document.createElement("option");
      option.value = target.id;
      option.textContent = target.label;
      dom.smsTarget.append(option);
    });
    if (targets.some((target) => target.id === previousValue)) dom.smsTarget.value = previousValue;
  }

  function smsTargetsForSource(source) {
    if (source === "person") {
      return sortContacts(state.contacts).filter((contact) => contact.type === "person").map((contact) => ({ id: contact.id, label: contact.name }));
    }
    if (source === "gruppe") {
      return sortContacts(state.contacts).filter((contact) => contact.type === "gruppe").map((contact) => ({ id: contact.id, label: contact.name }));
    }
    if (source === "shift") {
      return sortShifts(state.shifts).map((shift) => ({ id: shift.id, label: formatShiftShort(shift) }));
    }
    return [];
  }

  function applySmsTemplate() {
    const template = SMS_TEMPLATES[dom.smsTemplate.value] || "";
    if (template) dom.smsMessage.value = template;
    renderSmsPreview();
  }

  function renderSmsPreview() {
    const preview = buildSmsPreview();
    const ready = preview.recipients.length > 0 && preview.message.length > 0;
    const bridgeMode = dom.smsDryRun.checked ? "Torrkjoring" : "Faktisk AppleScript-sending";
    dom.smsPreviewSummary.innerHTML = `
      <p><strong>${bridgeMode}</strong></p>
      <p>${preview.recipients.length} mottaker(e) klare for SMS.</p>
      <p>${preview.missing.length} person(er)/gruppe(r) mangler telefonnummer eller kontaktpunkt.</p>
      <p>Melding: ${preview.message.length} tegn.</p>
    `;
    dom.smsRecipientList.innerHTML = "";
    if (!preview.recipients.length) {
      dom.smsRecipientList.append(emptyText("Ingen mottakere med telefonnummer valgt."));
    } else {
      preview.recipients.forEach((recipient) => {
        const row = document.createElement("article");
        row.className = "row";
        row.innerHTML = `
          <div class="row-header">
            <div>
              <h3>${escapeHtml(recipient.name)}</h3>
              <p class="meta">${escapeHtml(recipient.source)}</p>
            </div>
            <span class="recipient-phone">${escapeHtml(recipient.phone)}</span>
          </div>
        `;
        dom.smsRecipientList.append(row);
      });
    }
    dom.smsMissingList.innerHTML = "";
    if (!preview.missing.length) {
      dom.smsMissingList.append(emptyText("Ingen valgte mottakere mangler telefonnummer."));
    } else {
      preview.missing.forEach((missing) => {
        const row = document.createElement("article");
        row.className = "row";
        row.innerHTML = `
          <div class="row-header">
            <div>
              <h3>${escapeHtml(missing.name)}</h3>
              <p class="meta">${escapeHtml(missing.reason)}</p>
            </div>
            <span class="badge warn">Sendes ikke</span>
          </div>
        `;
        dom.smsMissingList.append(row);
      });
    }
    dom.smsAppleScript.value = preview.appleScript;
    dom.smsDryRunButton.disabled = !ready;
    dom.smsCopyScriptButton.disabled = !preview.appleScript;
    dom.smsSendButton.disabled = dom.smsDryRun.checked || !ready || !dom.smsConfirmSend.checked;
  }

  function buildSmsPreview() {
    const message = dom.smsMessage.value.trim();
    const contacts = selectedSmsContacts();
    const recipients = [];
    const missing = [];
    const seenPhones = new Set();
    contacts.forEach(({ contact, source }) => {
      const extracted = extractSmsRecipients(contact, source);
      extracted.recipients.forEach((recipient) => {
        const key = normalizePhone(recipient.phone);
        if (!key || seenPhones.has(key)) return;
        seenPhones.add(key);
        recipients.push({ ...recipient, phone: key });
      });
      if (extracted.missing) missing.push(extracted.missing);
    });
    return {
      message,
      recipients,
      missing,
      appleScript: recipients.length && message ? generateAppleScript(recipients, message) : ""
    };
  }

  function selectedSmsContacts() {
    const source = dom.smsSource.value;
    const targetId = dom.smsTarget.value;
    if (source === "all") return sortContacts(state.contacts).map((contact) => ({ contact, source: "Alle registrerte" }));
    if (source === "shift") {
      const shift = state.shifts.find((item) => item.id === targetId);
      if (!shift) return [];
      return unique(shift.assignments.map((assignment) => assignment.contactId))
        .map(findContact)
        .filter(Boolean)
        .map((contact) => ({ contact, source: formatShiftShort(shift) }));
    }
    const contact = state.contacts.find((item) => item.id === targetId && item.type === source);
    return contact ? [{ contact, source: source === "gruppe" ? "Valgt gruppe" : "Valgt person" }] : [];
  }

  function extractSmsRecipients(contact, source) {
    const recipients = [];
    const phone = normalizePhone(contact.phone);
    if (phone) recipients.push({ name: contact.name, phone, source });
    if (contact.type === "gruppe" && contact.contactPoints) {
      contact.contactPoints.split(/\r?\n/).forEach((line) => {
        const parsedPhone = normalizePhone(extractPhoneFromText(line));
        if (!parsedPhone) return;
        recipients.push({
          name: contactPointName(line, parsedPhone) || contact.name,
          phone: parsedPhone,
          source: `${contact.name} kontaktpunkt`
        });
      });
    }
    return {
      recipients,
      missing: recipients.length ? null : {
        name: contact.name,
        reason: `${contact.type === "gruppe" ? "Gruppe" : "Person"} mangler telefonnummer eller kontaktpunkt.`
      }
    };
  }

  function extractPhoneFromText(value) {
    const match = String(value || "").match(/(?:\+|00)?\d[\d\s().-]{5,}\d/);
    return match ? match[0] : "";
  }

  function contactPointName(line, phone) {
    return String(line || "").replace(phone, "").replace(extractPhoneFromText(line), "").replace(/[-:,()]/g, " ").trim();
  }

  function normalizePhone(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const compact = raw.replace(/[^\d+]/g, "");
    if (compact.startsWith("00")) return `+${compact.slice(2)}`;
    return compact;
  }

  function generateAppleScript(recipients, message) {
    return `-- Syntetisk forhåndsvisning. Ingen SMS-integrasjon er tilgjengelig i Vibe-demoen.\n-- Mottakere: ${recipients.length}\n-- Melding: ${String(message).replace(/[\r\n]/g, " ").slice(0, 500)}`;
  }

  function appleScriptString(value) {
    return String(value).split(/\r?\n/).map((part) => {
      return `"${part.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
    }).join(" & return & ");
  }

  function runSmsDryRun() {
    const preview = buildSmsPreview();
    if (!preview.recipients.length || !preview.message) {
      dom.smsSendStatus.textContent = "Torrtest kan ikke kjores for mottaker og melding er valgt.";
      return;
    }
    dom.smsSendStatus.textContent = `Torrtest ok: ${preview.recipients.length} SMS ville blitt klargjort. Ingen SMS ble sendt.`;
  }

  async function copySmsAppleScript() {
    const script = dom.smsAppleScript.value;
    if (!script) {
      dom.smsSendStatus.textContent = "Ingen AppleScript er generert enna.";
      return;
    }
    try {
      await navigator.clipboard.writeText(script);
      dom.smsSendStatus.textContent = "AppleScript kopiert til utklippstavlen.";
    } catch (error) {
      dom.smsAppleScript.focus();
      dom.smsAppleScript.select();
      dom.smsSendStatus.textContent = "Kunne ikke kopiere automatisk. Marker og kopier AppleScript manuelt.";
    }
  }

  async function checkSmsBridge() {
    dom.smsBridgeStatus.textContent = "Simulert SMS-bro: ingen tilkobling eller melding sendes fra denne demoen.";
  }

  async function sendSmsViaBridge() {
    const preview = buildSmsPreview();
    if (dom.smsDryRun.checked) {
      runSmsDryRun();
      return;
    }
    if (!preview.recipients.length || !preview.message) {
      dom.smsSendStatus.textContent = "Velg minst en mottaker med telefonnummer og skriv melding for sending.";
      return;
    }
    if (!dom.smsConfirmSend.checked) {
      dom.smsSendStatus.textContent = "Du ma bekrefte at mottakere og melding er kontrollert for faktisk sending.";
      return;
    }
    dom.smsSendStatus.textContent = `Simulert: ${preview.recipients.length} syntetiske mottakere ville fått meldingen. Ingen SMS eller AppleScript kjøres.`;
  }

  function exportBackup() {
    const link = document.createElement("a");
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    link.href = URL.createObjectURL(blob);
    link.download = `dugnadsplan-demo-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    dom.saveStatus.textContent = "JSON-eksempel lastet ned lokalt.";
  }

  function importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        state = normalizeState(JSON.parse(String(reader.result || "{}")));
        persist("JSON-backup importert og lagret.");
        resetContactForm();
        resetShiftForm();
      } catch (error) {
        window.alert("Kunne ikke importere JSON-backup. Kontroller filformatet.");
      } finally {
        dom.importInput.value = "";
      }
    });
    reader.readAsText(file);
  }

  function resetData() {
    if (!window.confirm("Nullstille alle lokale eksempeldata?")) return;
    state = structuredCloneSafe(emptyState);
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("vibe-dugnadsplanlegging:v1:") || key.startsWith("vibe-dugnad-signups:") || key === "vibe-dugnad-events:v1" || key === "vibe-active-dugnad") localStorage.removeItem(key);
    }
    resetContactForm();
    resetShiftForm();
    dom.saveStatus.textContent = "Data er nullstilt.";
    render();
  }

  function coverageSummary(shift) {
    const slots = shiftSlots(shift);
    if (!slots.length) {
      return {
        totalSlots: 0,
        missingSlots: shift.assignments.length ? 0 : 1,
        text: shift.assignments.length ? "Bemanning registrert" : "Mangler tidsfestet bemanning"
      };
    }
    const missingSlots = slots.filter((slot) => coverageCount(shift, slot.startAt, slot.endAt) < shift.capacity).length;
    return {
      totalSlots: slots.length,
      missingSlots,
      text: missingSlots ? `Mangler bemanning i ${missingSlots} av ${slots.length} tidsrom` : `Dekket i alle ${slots.length} tidsrom`
    };
  }

  function coverageCount(shift, startAt, endAt) {
    return shift.assignments.filter((assignment) => overlaps(assignment.startAt, assignment.endAt, startAt, endAt)).length;
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

  function activeShift() {
    return state.shifts.find((shift) => shift.id === activeShiftId) || null;
  }

  function assignedShifts(contactId) {
    return sortShifts(state.shifts.filter((shift) => shift.assignments.some((assignment) => assignment.contactId === contactId)));
  }

  function findContact(id) {
    return state.contacts.find((contact) => contact.id === id);
  }

  function hasPhone(contact) {
    return Boolean(contact.phone.trim() || contact.contactPoints.trim());
  }

  function phoneBadge(contact) {
    if (hasPhone(contact)) return `<span class="badge">Telefon: ${escapeHtml(contact.phone || firstLine(contact.contactPoints))}</span>`;
    return '<span class="badge warn">Mangler telefon</span>';
  }

  function formatShiftShort(shift) {
    return `${shift.title} (${formatShiftPeriod(shift)})`;
  }

  function formatShiftPeriod(shift) {
    return formatPeriod(shift.startAt, shift.endAt) || [shift.day, shift.startTime, shift.endTime].filter(Boolean).join(" ");
  }

  function formatPeriod(startAt, endAt) {
    if (!startAt || !endAt) return "";
    const sameDate = datePart(startAt) === datePart(endAt);
    return sameDate
      ? `${formatDateLabel(startAt)} ${timePart(startAt)}-${timePart(endAt)}`
      : `${formatDateLabel(startAt)} ${timePart(startAt)}-${formatDateLabel(endAt)} ${timePart(endAt)}`;
  }

  function formatDateLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const weekday = new Intl.DateTimeFormat("nb-NO", { weekday: "short" }).format(date);
    const dateLabel = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit" }).format(date);
    return `${titleCase(weekday)} ${dateLabel}`;
  }

  function labelDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("nb-NO", { weekday: "long" }).format(date);
  }

  function sortContacts(contacts) {
    return [...contacts].sort((a, b) => a.name.localeCompare(b.name, "nb"));
  }

  function sortShifts(shifts) {
    return [...shifts].sort((a, b) => `${a.startAt || ""} ${a.title}`.localeCompare(`${b.startAt || ""} ${b.title}`, "nb"));
  }

  function sortAssignments(assignments) {
    return [...assignments].sort((a, b) => `${a.startAt} ${a.endAt}`.localeCompare(`${b.startAt} ${b.endAt}`));
  }

  function contactMatches(contact, query) {
    if (!query) return true;
    return normalizeSearch([
      contact.name,
      contact.type,
      contact.phone,
      contact.contactPoints,
      contact.notes,
      assignedShifts(contact.id).map(formatShiftShort).join(" ")
    ].join(" ")).includes(query);
  }

  function shiftMatches(shift, query) {
    if (!query) return true;
    const assigned = shift.assignments.map((assignment) => findContact(assignment.contactId)).filter(Boolean).map((contact) => contact.name).join(" ");
    return normalizeSearch([
      shift.title,
      formatShiftPeriod(shift),
      shift.location,
      shift.notes,
      assigned
    ].join(" ")).includes(query);
  }

  function setActiveTab(tabId) {
    document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabId));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
  }

  function joinDateTime(date, time) {
    const cleanDate = String(date || "").trim();
    const cleanTime = String(time || "").trim();
    return cleanDate && cleanTime ? `${cleanDate}T${cleanTime}` : "";
  }

  function normalizeDateTime(value) {
    const clean = String(value || "").trim();
    if (!clean) return "";
    const match = clean.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    return match ? `${match[1]}T${match[2]}` : "";
  }

  function datePart(value) {
    return normalizeDateTime(value).slice(0, 10);
  }

  function timePart(value) {
    return normalizeDateTime(value).slice(11, 16);
  }

  function isAfter(a, b) {
    return new Date(a).getTime() > new Date(b).getTime();
  }

  function isBefore(a, b) {
    return new Date(a).getTime() < new Date(b).getTime();
  }

  function overlaps(startA, endA, startB, endB) {
    return isBefore(startA, endB) && isAfter(endA, startB);
  }

  function toLocalDateTime(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean).map(String)));
  }

  function normalizeSearch(value) {
    return String(value || "").trim().toLowerCase();
  }

  function firstLine(value) {
    return String(value || "").split(/\r?\n/).find(Boolean) || "";
  }

  function emptyNode() {
    return document.getElementById("emptyTemplate").content.firstElementChild.cloneNode(true);
  }

  function emptyText(text) {
    const node = document.createElement("p");
    node.className = "empty";
    node.textContent = text;
    return node;
  }

  function createId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
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
