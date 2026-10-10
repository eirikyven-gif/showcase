(() => {
  const namesEl=document.querySelector('#names'),methodEl=document.querySelector('#method'),amountEl=document.querySelector('#amount');
  const generateEl=document.querySelector('#generate'),againEl=document.querySelector('#again'),exportEl=document.querySelector('#export'),resetEl=document.querySelector('#reset');
  const statusEl=document.querySelector('#status'),summaryEl=document.querySelector('#summary'),groupsEl=document.querySelector('#groups'),previewEl=document.querySelector('#preview');
  const moveControlsEl=document.querySelector('#move-controls'),selectedStudentEl=document.querySelector('#selected-student'),targetGroupEl=document.querySelector('#target-group'),moveSelectedEl=document.querySelector('#move-selected');
  let lastNames=[],lastGroups=[];
  function plannedDistribution(names,method,amount){const count=method==='groups'?Math.min(amount,names.length):Math.ceil(names.length/amount);const base=Math.floor(names.length/count),extra=names.length%count;return {count,sizes:Array.from({length:count},(_,i)=>base+(i<extra?1:0))}}
  function updatePreview(){const names=parseNames(namesEl.value),method=methodEl.value,amount=Number(amountEl.value);if(!names.length||!method||!Number.isInteger(amount)||amount<1){previewEl.textContent='Forhåndsvisning: lim inn navn og velg et gyldig antall.';return}const plan=plannedDistribution(names,method,amount);previewEl.innerHTML='<strong>Forhåndsvisning:</strong> '+names.length+' deltakere · '+plan.count+' grupper · '+plan.sizes.join(', ')+' deltaker(e) per gruppe.'}
  function xmlEscape(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;'}[c]))}
  function crc32(data){let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
  function u16(n){return new Uint8Array([n&255,(n>>>8)&255])} function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
  function concatBytes(parts){const total=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let pos=0;parts.forEach(p=>{out.set(p,pos);pos+=p.length});return out}
  function makeXlsx(groups){
    const encoder=new TextEncoder();
    const cleanXml=value=>String(value).replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]/g,'');
    const xmlEscape=value=>cleanXml(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;'}[c]));
    const inlineCell=(ref,value,style=0)=>'<c r="'+ref+'" t="inlineStr"'+(style?' s="'+style+'"':'')+'><is><t xml:space="preserve">'+xmlEscape(value)+'</t></is></c>';
    let rows='<row r="1">'+inlineCell('A1','Gruppe',1)+inlineCell('B1','Student',1)+'</row>',row=2;
    groups.forEach(group=>group.members.forEach(name=>{rows+='<row r="'+row+'">'+inlineCell('A'+row,group.name)+inlineCell('B'+row,name)+'</row>';row++}));
    const files={
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http:&#47;&#47;schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http:&#47;&#47;schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http:&#47;&#47;schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http:&#47;&#47;schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http:&#47;&#47;schemas.openxmlformats.org/officeDocument/2006/relationships"><fileVersion appName="xl"/><workbookPr defaultThemeVersion="124226"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews><sheets><sheet name="Grupper" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http:&#47;&#47;schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http:&#47;&#47;schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http:&#47;&#47;schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http:&#47;&#47;schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment horizontal="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
      'xl/worksheets/sheet1.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http:&#47;&#47;schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:B'+(row-1)+'"/><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/><sheetData>'+rows+'</sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>'
    };
    const local=[],central=[];let offset=0;
    for(const [name,text] of Object.entries(files)){const nameBytes=encoder.encode(name),data=encoder.encode(text),crc=crc32(data),header=concatBytes([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameBytes.length),u16(0),nameBytes,data]);local.push(header);central.push(concatBytes([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameBytes.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameBytes]));offset+=header.length}
    const body=concatBytes(local),directory=concatBytes(central),end=concatBytes([u32(0x06054b50),u16(0),u16(0),u16(central.length),u16(central.length),u32(directory.length),u32(body.length),u16(0)]);
    return new Blob([body,directory,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
  }
  function downloadXlsx(){if(!lastGroups.length)return setStatus('Generer grupper før eksport.',true);const url=URL.createObjectURL(makeXlsx(lastGroups)),a=document.createElement('a');a.href=url;a.download='gruppegenerator.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function setStatus(message,error=false){statusEl.textContent=message;statusEl.className='status'+(error?' error':'')}
  function updateMoveControls(preferred=''){
    selectedStudentEl.replaceChildren();targetGroupEl.replaceChildren();
    const entries=[];
    lastGroups.forEach((group,groupIndex)=>group.members.forEach((name,memberIndex)=>entries.push({value:groupIndex+':'+memberIndex,label:name+' · '+group.name,groupIndex,memberIndex})));
    entries.forEach(entry=>{const option=document.createElement('option');option.value=entry.value;option.textContent=entry.label;selectedStudentEl.append(option)});
    if(!entries.length||lastGroups.length<2){moveControlsEl.hidden=true;return}
    moveControlsEl.hidden=false;selectedStudentEl.value=entries.some(entry=>entry.value===preferred)?preferred:entries[0].value;
    const sourceGroup=Number(selectedStudentEl.value.split(':')[0]);
    lastGroups.forEach((group,groupIndex)=>{if(groupIndex!==sourceGroup){const option=document.createElement('option');option.value=groupIndex;option.textContent=group.name;targetGroupEl.append(option)}});
    document.querySelectorAll('.student.selected').forEach(node=>node.classList.remove('selected'));
    const selected=document.querySelector('.student[data-student="'+selectedStudentEl.value+'"]');if(selected)selected.classList.add('selected');
  }
  function render(groups,preferred=''){
    lastGroups=groups;groupsEl.replaceChildren();
    groups.forEach((group,groupIndex)=>{
      const card=document.createElement('article');card.className='group';card.dataset.groupIndex=groupIndex;
      card.addEventListener('dragover',event=>{event.preventDefault();card.classList.add('drag-over')});
      card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
      card.addEventListener('drop',event=>{event.preventDefault();card.classList.remove('drag-over');const source=event.dataTransfer.getData('text/plain');moveMember(source,groupIndex)});
      const heading=document.createElement('h3');heading.textContent=group.name;card.append(heading);
      const list=document.createElement('ul');
      group.members.forEach((name,memberIndex)=>{
        const row=document.createElement('li');row.className='student-row';
        const student=document.createElement('span');student.className='student';student.dataset.student=groupIndex+':'+memberIndex;student.textContent=name;student.draggable=true;student.tabIndex=0;student.setAttribute('role','button');student.setAttribute('aria-label',name+' i '+group.name+'; velg for flytting eller dra til en annen gruppe');
        student.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',groupIndex+':'+memberIndex);student.classList.add('selected')});
        student.addEventListener('click',()=>updateMoveControls(groupIndex+':'+memberIndex));
        student.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();updateMoveControls(groupIndex+':'+memberIndex)}});
        row.append(student);list.append(row)
      });card.append(list);groupsEl.append(card)
    });updateMoveControls(preferred);summaryEl.textContent=groups.length+' grupper · '+groups.reduce((total,g)=>total+g.members.length,0)+' deltakere';exportEl.disabled=false
  }
  function moveMember(source,targetGroup){
    const [sourceGroup,memberIndex]=String(source).split(':').map(Number);const destination=Number(targetGroup);
    if(!Number.isInteger(sourceGroup)||!Number.isInteger(memberIndex)||!Number.isInteger(destination)||sourceGroup===destination||!lastGroups[sourceGroup]||!lastGroups[destination])return;
    const [member]=lastGroups[sourceGroup].members.splice(memberIndex,1);if(member===undefined)return;
    lastGroups[destination].members.push(member);render(lastGroups);updateMoveControls();setStatus(member+' er flyttet til '+lastGroups[destination].name+'.')
  }

  function parseNames(value){return value.split(/\r?\n/).map(line=>line.replace(/\t+/g,' ').replace(/\s+/g,' ').trim()).filter(Boolean)}
  function shuffle(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
  function makeGroups(names,method,amount){const count=method==='groups'?Math.min(amount,names.length):Math.ceil(names.length/amount);const groups=Array.from({length:count},(_,i)=>({name:'Gruppe '+(i+1),members:[]}));shuffle(names).forEach((name,i)=>groups[i%count].members.push(name));return groups}


  function generate(){const names=parseNames(namesEl.value);const method=methodEl.value;const amount=Number(amountEl.value);if(!names.length)return setStatus('Lim inn minst ett navn.',true);if(!method||!Number.isInteger(amount)||amount<1)return setStatus('Velg fordelingsmetode og oppgi et gyldig antall.',true);lastNames=names;render(makeGroups(names,method,amount));againEl.disabled=false;setStatus('Gruppene er generert.')}
  namesEl.addEventListener('input',updatePreview);amountEl.addEventListener('input',updatePreview);methodEl.addEventListener('change',()=>{amountEl.disabled=!methodEl.value;amountEl.value='';amountEl.setAttribute('aria-label',methodEl.value==='groups'?'Antall grupper':'Deltakere per gruppe');updatePreview()});
  generateEl.addEventListener('click',generate);againEl.addEventListener('click',()=>{if(lastNames.length)render(makeGroups(lastNames,methodEl.value,Number(amountEl.value)))});exportEl.addEventListener('click',downloadXlsx);
  selectedStudentEl.addEventListener('change',()=>updateMoveControls(selectedStudentEl.value));
  moveSelectedEl.addEventListener('click',()=>{if(selectedStudentEl.value&&targetGroupEl.value)moveMember(selectedStudentEl.value,Number(targetGroupEl.value))});
  resetEl.addEventListener('click',()=>{namesEl.value='';methodEl.value='';amountEl.value='';amountEl.disabled=true;lastNames=[];lastGroups=[];againEl.disabled=true;exportEl.disabled=true;previewEl.textContent='Forhåndsvisning: lim inn navn og velg fordelingsmetode.';summaryEl.textContent='Ingen grupper er generert ennå.';groupsEl.innerHTML='<p class="empty">Resultatet vises her.</p>';moveControlsEl.hidden=true;setStatus('Arbeidsflaten er nullstilt.')});
})();
