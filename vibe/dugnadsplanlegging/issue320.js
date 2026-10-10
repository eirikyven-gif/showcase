(function () {
  "use strict";

  const ACTIVE_DUGNAD = localStorage.getItem("vibe-active-dugnad") || "hell-lopefestival";
  const STORAGE_KEY = `vibe-dugnadsplanlegging:v1:${ACTIVE_DUGNAD}`;
  const DESCRIPTION_FIELD = "description";

  let pendingShiftDescription = null;

  installIssueStyles();
  installDescriptionField();
  installConflictMessage();
  installAssignmentConflictGuard();
  installImportConflictGuard();
  installDescriptionPersistence();
  installDescriptionRendering();

  function installIssueStyles() {
    if (document.getElementById("issue320Styles")) return;
    const style = document.createElement("style");
    style.id = "issue320Styles";
    style.textContent = `
      .conflict-message:not(:empty) {
        margin: 0.75rem 0;
        border: 1px solid #e6c56d;
        border-radius: 8px;
        background: var(--warn-bg);
        padding: 0.75rem;
      }

      .shift-description-detail {
        display: grid;
        gap: 0.35rem;
        margin-bottom: 0.75rem;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fbfcfa;
        padding: 0.75rem;
      }

      .shift-description-detail h4 {
        margin: 0;
        font-size: 1rem;
        letter-spacing: 0;
      }

      .shift-description-detail p {
        white-space: pre-wrap;
      }
    `;
    document.head.append(style);
  }

  function installDescriptionField() {
    const form = document.getElementById("shiftForm");
    if (!form || form.elements[DESCRIPTION_FIELD]) return;

    const label = document.createElement("label");
    label.className = "wide";
    label.dataset.issue320 = "description-field";
    label.innerHTML = `
      Utvidet vaktpostbeskrivelse
      <textarea name="${DESCRIPTION_FIELD}" rows="5" placeholder="Praktisk instruks, ansvar, oppmøtested, utstyr, kontaktpunkt, rutiner og særskilte hensyn"></textarea>
    `;

    const notesLabel = form.elements.notes?.closest("label");
    form.insertBefore(label, notesLabel || form.querySelector(".form-actions"));
    scheduleDescriptionFieldFill();
  }

  function installConflictMessage() {
    const form = document.getElementById("assignmentForm");
    if (!form || document.getElementById("assignmentConflictMessage")) return;
    const message = document.createElement("p");
    message.id = "assignmentConflictMessage";
    message.className = "notice conflict-message";
    message.setAttribute("role", "alert");
    message.setAttribute("aria-live", "assertive");
    form.before(message);
  }

  function installAssignmentConflictGuard() {
    const form = document.getElementById("assignmentForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      const formData = new FormData(form);
      const candidate = {
        id: String(formData.get("id") || ""),
        shiftId: String(document.getElementById("shiftForm")?.elements.id.value || ""),
        contactId: String(formData.get("contactId") || ""),
        startAt: joinDateTime(formData.get("startDate"), formData.get("startTime")),
        endAt: joinDateTime(formData.get("endDate"), formData.get("endTime"))
      };
      const conflict = findAssignmentConflict(readState(), candidate, candidate.id);
      if (!conflict) {
        setConflictMessage("");
        return;
      }
      const message = conflictMessage(conflict);
      event.preventDefault();
      event.stopImmediatePropagation();
      setConflictMessage(message);
      window.alert(message);
    }, true);
  }

  function installImportConflictGuard() {
    const input = document.getElementById("importInput");
    if (!input) return;
    input.addEventListener("change", (event) => {
      const file = input.files && input.files[0];
      if (!file) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const reader = new FileReader();
      reader.addEventListener("load", async () => {
        try {
          const importedPayload = statePayloadFromImport(JSON.parse(String(reader.result || "{}")));
          if (!importedPayload) {
            throw new Error("Importfilen inneholder ikke contacts/shifts.");
          }
          const imported = normalizeState(importedPayload);
          const conflict = findFirstStateConflict(imported);
          if (conflict) {
            const message = `Importen ble stoppet. ${conflictMessage(conflict)}`;
            setConflictMessage(message);
            window.alert(message);
            return;
          }
          const mergedPayload = mergeDescriptionsIntoStatePayload(importedPayload);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedPayload));
          await saveImportedStateToServer(mergedPayload);
          setSaveStatus("JSON-backup importert, kontrollert for overlapp og lagret på server. Laster siden på nytt...");
          window.setTimeout(() => window.location.reload(), 500);
        } catch (error) {
          const message = error.message
            ? `Kunne ikke importere JSON-backup: ${error.message}`
            : "Kunne ikke importere JSON-backup. Kontroller filformatet.";
          setSaveStatus(message);
          window.alert(message);
        } finally {
          input.value = "";
        }
      });
      reader.readAsText(file);
    }, true);
  }

  function installDescriptionPersistence() {
    const previousSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function issue320SetItem(key, value) {
      if (key === STORAGE_KEY) {
        previousSetItem(key, mergeDescriptionsIntoSerializedState(value));
        return;
      }
      previousSetItem(key, value);
    };

    const form = document.getElementById("shiftForm");
    form?.addEventListener("submit", () => {
      const formData = new FormData(form);
      pendingShiftDescription = {
        id: String(formData.get("id") || ""),
        title: String(formData.get("title") || "").trim(),
        startAt: joinDateTime(formData.get("startDate"), formData.get("startTime")),
        endAt: joinDateTime(formData.get("endDate"), formData.get("endTime")),
        description: String(formData.get(DESCRIPTION_FIELD) || "").trim()
      };
      window.setTimeout(() => {
        pendingShiftDescription = null;
        scheduleDescriptionFieldFill();
        renderDescriptionDetails();
      }, 0);
    }, true);
  }

  function installDescriptionRendering() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("button[data-action='edit-shift']")) {
        scheduleDescriptionFieldFill();
      }
    }, true);
    document.getElementById("shiftForm")?.addEventListener("reset", () => {
      window.setTimeout(() => {
        const field = document.getElementById("shiftForm")?.elements[DESCRIPTION_FIELD];
        if (field) {
          field.value = "";
          field.dataset.shiftId = "";
        }
      }, 0);
    });

    const observer = new MutationObserver(() => {
      scheduleDescriptionFieldFill();
      renderDescriptionDetails();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    renderDescriptionDetails();
  }

  function mergeDescriptionsIntoSerializedState(serialized) {
    try {
      const incoming = statePayloadFromImport(JSON.parse(String(serialized || "{}")));
      return incoming ? JSON.stringify(mergeDescriptionsIntoStatePayload(incoming)) : serialized;
    } catch (error) {
      return serialized;
    }
  }

  function mergeDescriptionsIntoStatePayload(payload) {
    const incoming = cloneStatePayload(payload);
    const previous = readState();
    const previousDescriptions = new Map(previous.shifts.map((shift) => [shift.id, shift[DESCRIPTION_FIELD] || ""]));

    incoming.shifts = incoming.shifts.map((shift) => {
      const normalizedShift = normalizeShift(shift);
      const description = descriptionForIncomingShift(normalizedShift, previousDescriptions);
      return { ...shift, [DESCRIPTION_FIELD]: description };
    });
    return incoming;
  }

  function statePayloadFromImport(payload) {
    if (!payload || typeof payload !== "object") return null;
    const candidates = [
      payload,
      payload.state,
      payload.data,
      payload.payload,
      payload.dugnadsplan
    ];
    return candidates.find((candidate) => {
      return candidate
        && typeof candidate === "object"
        && (Array.isArray(candidate.contacts) || Array.isArray(candidate.shifts));
    }) || null;
  }

  function cloneStatePayload(payload) {
    return {
      ...payload,
      contacts: Array.isArray(payload.contacts) ? payload.contacts : [],
      shifts: Array.isArray(payload.shifts) ? payload.shifts : []
    };
  }

  async function saveImportedStateToServer() {
    // Showcase demo persists only in localStorage.
  }

  function descriptionForIncomingShift(shift, previousDescriptions) {
    if (pendingShiftDescription && shiftMatchesPendingDescription(shift)) {
      return pendingShiftDescription.description;
    }
    return String(shift[DESCRIPTION_FIELD] || previousDescriptions.get(shift.id) || "").trim();
  }

  function shiftMatchesPendingDescription(shift) {
    if (!pendingShiftDescription) return false;
    if (pendingShiftDescription.id) return shift.id === pendingShiftDescription.id;
    return shift.title === pendingShiftDescription.title
      && shift.startAt === pendingShiftDescription.startAt
      && shift.endAt === pendingShiftDescription.endAt;
  }

  function scheduleDescriptionFieldFill() {
    window.setTimeout(fillDescriptionField, 0);
  }

  function fillDescriptionField() {
    const form = document.getElementById("shiftForm");
    const field = form?.elements[DESCRIPTION_FIELD];
    if (!form || !field) return;
    const id = String(form.elements.id.value || "");
    if (!id) {
      if (!document.activeElement || document.activeElement !== field) field.dataset.shiftId = "";
      return;
    }
    if (field.dataset.shiftId === id && document.activeElement === field) return;
    const shift = readState().shifts.find((item) => item.id === id);
    field.value = shift ? String(shift[DESCRIPTION_FIELD] || "") : "";
    field.dataset.shiftId = id;
  }

  function renderDescriptionDetails() {
    const state = readState();
    const byId = new Map(state.shifts.map((shift) => [shift.id, shift]));

    document.querySelectorAll("button[data-action='edit-shift'][data-id]").forEach((button) => {
      const row = button.closest(".row");
      if (!row || row.querySelector(".shift-description-preview")) return;
      const shift = byId.get(button.dataset.id);
      const description = String(shift?.[DESCRIPTION_FIELD] || "").trim();
      if (!description) return;
      const details = row.querySelector(".details");
      if (!details) return;
      const preview = document.createElement("p");
      preview.className = "small shift-description-preview";
      preview.textContent = `Instruks: ${excerpt(description, 150)}`;
      details.prepend(preview);
    });

    const activeShiftId = String(document.getElementById("shiftForm")?.elements.id.value || "");
    const assignmentList = document.getElementById("assignmentList");
    if (!assignmentList) return;
    const existingDetail = assignmentList.querySelector(".shift-description-detail");
    const activeShift = byId.get(activeShiftId);
    const description = String(activeShift?.[DESCRIPTION_FIELD] || "").trim();
    if (!description) {
      existingDetail?.remove();
      return;
    }
    const existingText = existingDetail?.querySelector("p")?.textContent || "";
    if (existingDetail?.dataset.shiftId === activeShiftId && existingText === description) {
      return;
    }
    existingDetail?.remove();
    const detail = document.createElement("section");
    detail.className = "shift-description-detail";
    detail.dataset.shiftId = activeShiftId;
    detail.innerHTML = `
      <h4>Utvidet vaktpostbeskrivelse</h4>
      <p></p>
    `;
    detail.querySelector("p").textContent = description;
    assignmentList.prepend(detail);
  }

  function findFirstStateConflict(state) {
    const seen = [];
    for (const shift of state.shifts) {
      for (const assignment of shift.assignments) {
        const conflict = findAssignmentConflict({ contacts: state.contacts, shifts: seen }, assignment, assignment.id);
        if (conflict) return conflict;
      }
      seen.push(shift);
    }
    return null;
  }

  function findAssignmentConflict(state, candidate, excludeAssignmentId) {
    if (!candidate.contactId || !candidate.startAt || !candidate.endAt || !isAfter(candidate.endAt, candidate.startAt)) {
      return null;
    }
    const contact = state.contacts.find((item) => item.id === candidate.contactId) || null;
    for (const shift of state.shifts) {
      for (const assignment of shift.assignments || []) {
        if (excludeAssignmentId && assignment.id === excludeAssignmentId) continue;
        if (assignment.contactId !== candidate.contactId) continue;
        if (!intervalsOverlap(candidate.startAt, candidate.endAt, assignment.startAt, assignment.endAt)) continue;
        return { contact, shift, assignment };
      }
    }
    return null;
  }

  function conflictMessage(conflict) {
    const name = conflict.contact?.name || "Valgt person/gruppe";
    const title = conflict.shift?.title || "ukjent vakt";
    return `${name} er allerede satt opp på "${title}" ${formatPeriod(conflict.assignment.startAt, conflict.assignment.endAt)}. Tildelinger kan ikke overlappe i tid.`;
  }

  function setConflictMessage(message) {
    const target = document.getElementById("assignmentConflictMessage");
    if (target) target.textContent = message;
    if (message) setSaveStatus(message);
  }

  function setSaveStatus(message) {
    const target = document.getElementById("saveStatus");
    if (target) target.textContent = message;
  }

  function readState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch (error) {
      return { version: "0.5.1", updatedAt: null, contacts: [], shifts: [] };
    }
  }

  function normalizeState(input) {
    return {
      version: "0.5.1",
      updatedAt: input.updatedAt || null,
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
    const assignments = Array.isArray(shift.assignments) ? shift.assignments.map((assignment) => normalizeAssignment(assignment, shift.id, startAt, endAt)) : [];
    return {
      id: String(shift.id || ""),
      title: String(shift.title || "").trim(),
      startAt,
      endAt,
      [DESCRIPTION_FIELD]: String(shift[DESCRIPTION_FIELD] || "").trim(),
      assignments
    };
  }

  function normalizeAssignment(assignment, shiftId, fallbackStartAt, fallbackEndAt) {
    return {
      id: String(assignment.id || ""),
      shiftId: String(assignment.shiftId || shiftId || ""),
      contactId: String(assignment.contactId || assignment.assignedId || ""),
      startAt: normalizeDateTime(assignment.startAt || joinDateTime(assignment.startDate, assignment.startTime)) || fallbackStartAt || "",
      endAt: normalizeDateTime(assignment.endAt || joinDateTime(assignment.endDate || assignment.startDate, assignment.endTime)) || fallbackEndAt || ""
    };
  }

  function intervalsOverlap(startA, endA, startB, endB) {
    return isBefore(startA, endB) && isAfter(endA, startB);
  }

  function isAfter(a, b) {
    return new Date(a).getTime() > new Date(b).getTime();
  }

  function isBefore(a, b) {
    return new Date(a).getTime() < new Date(b).getTime();
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

  function formatPeriod(startAt, endAt) {
    if (!startAt || !endAt) return "";
    return startAt.slice(0, 10) === endAt.slice(0, 10)
      ? `${startAt.slice(0, 10)} ${startAt.slice(11, 16)}-${endAt.slice(11, 16)}`
      : `${startAt.slice(0, 10)} ${startAt.slice(11, 16)}-${endAt.slice(0, 10)} ${endAt.slice(11, 16)}`;
  }

  function excerpt(value, maxLength) {
    const clean = String(value || "").replace(/\s+/g, " ").trim();
    return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}...` : clean;
  }
})();