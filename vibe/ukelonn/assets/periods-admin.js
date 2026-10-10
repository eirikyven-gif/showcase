(() => {
  const root=window.Ukelonn?.root||'./', target=document.querySelector('[data-periods]'), message=document.querySelector('[data-period-message]');
  let token='';
  const show=(text)=>{if(message){message.textContent=text;message.hidden=!text;}};
  async function request(path,options={}){const r=await fetch(root+path,{credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});const x=await r.json().catch(()=>({}));if(!r.ok)throw Error(x.error||'Forespørselen kunne ikke fullføres.');return x;}
  function date(value){return new Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
  async function load(){try{const x=await request('api/admin/periods.php');target.innerHTML=(x.periods||[]).length?'<div class="table-wrap"><table><caption class="sr-only">Konfigurerte perioder</caption><thead><tr><th scope="col">Start</th><th scope="col">Slutt</th></tr></thead><tbody>'+x.periods.map(p=>'<tr><td>'+date(p.starts_at)+'</td><td>'+date(p.ends_at)+'</td></tr>').join('')+'</tbody></table></div>':'<p class="empty-state">Ingen egendefinerte perioder er lagt inn. Standard er fredag kl. 20:00.</p>'; }catch(e){show(e.message);}}
  document.querySelector('[data-period-form]')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;show('');const data=Object.fromEntries(new FormData(form));try{await request('api/admin/periods.php',{method:'POST',headers:{'X-CSRF-Token':token},body:JSON.stringify(data)});form.reset();await load();show('Perioden er lagret.');}catch(err){show(err.message);}});
  request('api/auth.php').then(s=>{if(!s.authenticated||s.identity?.role!=='admin'){location.assign(root+'admin/logg-inn/');return;}token=s.csrfToken||'';load();}).catch(()=>location.assign(root+'admin/logg-inn/'));
})();
