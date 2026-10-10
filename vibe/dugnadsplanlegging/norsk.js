(function () {
  "use strict";

  const TEXT_REPLACEMENTS = [
    ["paminning", "påminning"],
    ["Paminning", "Påminning"],
    ["Hell Lopefestival", "Hell Løpefestival"],
    ["arrangor", "arrangør"],
    ["Torrkjoring", "Tørrkjøring"],
    ["torrkjoring", "tørrkjøring"],
    ["Torrtest", "Tørrtest"],
    ["torrtest", "tørrtest"],
    ["kjores", "kjøres"],
    ["kjore", "kjøre"],
    ["kjorer", "kjører"],
    ["kjort", "kjørt"],
    ["Kjor", "Kjør"],
    [" enna", " ennå"],
    [" klar pa ", " klar på "],
    [" via Messages pa ", " via Messages på "],
    ["Du ma ", "Du må "]
  ];

  patchDialogs();
  patchDocumentText();
  patchSmsTemplateText();

  new MutationObserver(() => {
    patchDocumentText();
    patchSmsTemplateText();
  }).observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true
  });

  document.addEventListener("change", (event) => {
    if (event.target && event.target.id === "smsTemplate") {
      window.setTimeout(patchSmsTemplateText, 0);
    }
  }, true);

  function patchDialogs() {
    const originalAlert = window.alert.bind(window);
    const originalConfirm = window.confirm.bind(window);
    window.alert = function alertWithNorwegianText(message) {
      return originalAlert(normalizeNorwegianText(message));
    };
    window.confirm = function confirmWithNorwegianText(message) {
      return originalConfirm(normalizeNorwegianText(message));
    };
  }

  function patchDocumentText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = normalizeNorwegianText(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  }

  function patchSmsTemplateText() {
    const message = document.getElementById("smsMessage");
    if (!message || typeof message.value !== "string") return;
    const next = normalizeNorwegianText(message.value);
    if (next !== message.value) message.value = next;
  }

  function normalizeNorwegianText(value) {
    return TEXT_REPLACEMENTS.reduce((text, replacement) => {
      return text.split(replacement[0]).join(replacement[1]);
    }, String(value || ""));
  }
})();
