(() => {
  const form = document.querySelector('#slip-form');
  const sheet = document.querySelector('#print-sheet');
  const cropNames = {
    wheat: 'Hvete', rye: 'Rug', barley: 'Bygg', oats: 'Havre',
    triticale: 'Rughvete', oilseed: 'Oljefrø', peas: 'Erter', beans: 'Åkerbønner'
  };

  const copyMarkup = `
    <article class="print-copy">
      <header class="copy-promo">
        <div class="copy-photo">
          <div class="ksl-logo"><b>NYT<br>NORGE</b><span><strong>KSL</strong><small>Kvalitetssystem<br>i landbruket</small></span></div>
          <div class="yellow-callout">Leverings-<br>seddel skal<br>benyttes ved<br>alle leveranser</div>
        </div>
        <div class="green-promo">
          <h2>Leveringsseddel<br>= korrekt oppgjør</h2>
          <p>Ved leveranse av matkorn kreves det at kvalitetssystemet KSL er etablert og i orden. Dersom KSL ikke er i orden, trekkes 10 øre pr. kilo korn.</p>
          <p>Dersom du trenger flere leveringssedler – ta kontakt med ditt lokale kornmottak.</p>
        </div>
      </header>
      <div class="fk-logo"><span class="fk-mark">F<span>K</span></span><strong>Felleskjøpet</strong></div>
      <section class="copy-form">
        <h2>Leveringsseddel – korn</h2>
        <p class="copy-terms">Leveringsseddel skal benyttes ved alle leveranser av korn til Felleskjøpet. Ved levering og salg av korn til Felleskjøpet gjelder vilkår gitt i sesongens Kornguide. Kornleverandør godtar leveransevilkår, Felleskjøpets krav til kornkvalitet og regler for verdifastsettelse.</p>
        <div class="identity-rows">
          <div class="identity-row">Navn:<span class="fill" data-out="name"></span></div>
          <div class="identity-row">Adresse:<span class="fill" data-out="address"></span></div>
          <div class="identity-row">Postnr.:<span class="fill short" data-out="postal"></span> Poststed:<span class="fill" data-out="city"></span></div>
          <div class="identity-row">Telefon:<span class="fill" data-out="phone"></span></div>
          <div class="identity-row">Produsentnr.:<span class="fill" data-out="producer"></span></div>
        </div>
        <div class="two-fields storage-line"><span><i class="mark square" data-check="storage"></i> Leielagring er avtalt</span><span>Lastetid (minutter):<b class="fill" data-out="load-time"></b></span></div>
        <div class="copy-crops">
          ${Object.entries(cropNames).map(([value, label]) => `<div class="copy-crop" data-crop="${value}"><i class="mark square crop-mark"></i><strong>${label} (sort):</strong><span class="fill" data-out="${value}-sort"></span>${value === 'wheat' || value === 'rye' ? `<small>Forhåndsprøvenr:</small><span class="fill sample-fill" data-out="${value}-sample"></span>` : ''}</div>`).join('')}
        </div>
        <div class="choice-line"><span>Transportutstyr er rengjort før transport:</span><span class="yesno"><i class="mark circle" data-group="clean" data-value="Ja"></i>Ja <i class="mark circle" data-group="clean" data-value="Nei"></i>Nei</span></div>
        <div class="choice-line"><span>Glyfosat er brukt i moden åker:</span><span class="yesno"><i class="mark circle" data-group="glyphosate" data-value="Ja"></i>Ja <i class="mark circle" data-group="glyphosate" data-value="Nei"></i>Nei</span></div>
        <div class="two-fields vehicle-line"><span>Bilnr.:<b class="fill" data-out="vehicle"></b></span><span>Containernr.:<b class="fill" data-out="container-number"></b></span></div>
        <div class="two-fields date-line"><span>Dato:<b class="fill" data-out="date"></b></span><span>Underskrift:<b class="fill" data-out="signature"></b></span></div>
        <p class="copy-declaration">Undertegnede bekrefter at kornet som leveres er dyrket i Norge og er i henhold til leveransevilkår for levering og salg av korn til Felleskjøpet beskrevet i Kornguiden.</p>
        <div class="analysis-line"><span>Mat-analyse?</span><span class="yesno"><i class="mark circle" data-group="analysis-one" data-value="Ja"></i>Ja <i class="mark circle" data-group="analysis-one" data-value="Nei"></i>Nei</span></div>
        <div class="analysis-line"><span>Mat-analyse?</span><span class="yesno"><i class="mark circle" data-group="analysis-two" data-value="Ja"></i>Ja <i class="mark circle" data-group="analysis-two" data-value="Nei"></i>Nei</span></div>
      </section>
      <footer class="fk-footer"><span class="fk-mark">F<span>K</span></span><strong>Felleskjøpet</strong></footer>
    </article>`;

  sheet.innerHTML = copyMarkup.repeat(3);

  function valueOf(name) {
    const field = form.elements.namedItem(name);
    return field ? field.value : '';
  }

  function checkedValue(name) {
    return [...form.querySelectorAll(`input[name="${name}"]`)].find((input) => input.checked)?.value || '';
  }

  function printableDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
  }

  function syncCopies() {
    sheet.querySelectorAll('[data-out]').forEach((node) => {
      const name = node.dataset.out;
      const value = valueOf(name);
      node.textContent = name === 'date' ? printableDate(value) : value;
    });
    sheet.querySelectorAll('[data-check]').forEach((node) => {
      node.classList.toggle('checked', Boolean(form.elements.namedItem(node.dataset.check)?.checked));
    });
    sheet.querySelectorAll('[data-crop]').forEach((node) => {
      node.classList.toggle('selected', checkedValue('crop') === node.dataset.crop);
    });
    sheet.querySelectorAll('[data-group]').forEach((node) => {
      node.classList.toggle('checked', checkedValue(node.dataset.group) === node.dataset.value);
    });
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', syncCopies);
  form.addEventListener('change', syncCopies);
  document.querySelector('#print').addEventListener('click', () => {
    syncCopies();
    window.print();
  });
  syncCopies();
})();
