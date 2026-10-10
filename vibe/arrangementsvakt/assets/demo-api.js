/* Local-only simulator for the Arrangementsvakt showcase copy. */
(() => {
  const KEY = 'vibe.arrangementsvakt.demo.v1';
  const stamp = () => new Date().toISOString();
  const defaults = () => {
    const users = [
      {id:'u-lead',fullName:'Syntetisk Løpsleder',displayName:'Løpsleder Demo',phone:'000000001',role:'raceLead',teamIds:[],isLeadership:true,isPrimaryLeader:true,active:true,testSeed:true},
      {id:'u-leadership',fullName:'Syntetisk Koordinator',displayName:'Koordinator Demo',phone:'000000002',role:'leadership',teamIds:[],isLeadership:true,active:true,testSeed:true},
      {id:'u-team',fullName:'Syntetisk Gruppeleder',displayName:'Gruppeleder Demo',phone:'000000003',role:'teamLead',teamIds:['t-vert'],active:true,testSeed:true},
      {id:'u-member',fullName:'Syntetisk Frivillig',displayName:'Frivillig Demo',phone:'000000004',role:'member',teamIds:['t-vert'],active:true,testSeed:true},
      {id:'u-member2',fullName:'Syntetisk Medhjelper',displayName:'Medhjelper Demo',phone:'000000005',role:'member',teamIds:['t-info'],active:true,testSeed:true}
    ];
    const teams=[{id:'t-vert',name:'Vertskap',description:'Syntetisk gruppe for mottak og praktisk hjelp.',active:true,leaderIds:['u-team']},{id:'t-info',name:'Informasjon',description:'Syntetisk gruppe for veivisning.',active:true,leaderIds:['u-team']}];
    const events=[{id:'e-demo',name:'Eksempelarrangement',active:true,createdAt:stamp()}];
    const incidents=[{id:'i-demo',title:'Kø ved inngang',severity:'followUp',severityMeta:{name:'Trenger oppfølging',tone:'warning'},location:'Inngang A',description:'Syntetisk eksempel: køen øker, og én ekstra vert kan hjelpe.',teamIds:['t-vert'],createdBy:'u-member',createdByName:'Frivillig Demo',status:'new',createdAt:stamp(),comments:[],imageRefs:[],eventId:'e-demo'}];
    const messages=[{id:'m-demo',type:'broadcast',targetType:'all',senderId:'u-lead',senderName:'Løpsleder Demo',body:'Syntetisk fellesmelding: husk å holde inngangspartiet fritt.',createdAt:stamp(),read:false,requiresAcknowledgement:true}];
    return {users,teams,events,settings:{activeEventId:'e-demo'},incidents,messages,threads:[],teamChat:[],comments:[],severities:[{id:'info',name:'Info',tone:'info',active:true,sortOrder:10},{id:'followUp',name:'Trenger oppfølging',tone:'warning',active:true,sortOrder:20},{id:'urgent',name:'Haster',tone:'urgent',active:true,sortOrder:30},{id:'critical',name:'Kritisk',tone:'critical',active:true,sortOrder:40}],userId:null,testMode:true};
  };
  let data;
  try { data=JSON.parse(localStorage.getItem(KEY))||defaults(); } catch { data=defaults(); }
  const persist=()=>localStorage.setItem(KEY,JSON.stringify(data));
  const clone=x=>JSON.parse(JSON.stringify(x));
  const bodyOf=opt=>{ if (!opt?.body) return {}; if (opt.body instanceof FormData) return Object.fromEntries(opt.body.entries()); try{return JSON.parse(opt.body)}catch{return {}} };
  const current=()=>data.users.find(u=>u.id===data.userId)||null;
  const result=x=>({ok:true,...x});
  async function demoApi(path, options={}) {
    const endpoint=path.split('?')[0], method=options.method||'GET', b=bodyOf(options), user=current();
    let out;
    if(endpoint==='setup.php') {
      if(method==='GET') out=result({setupRequired:false,testMode:true,testUsers:clone(data.users).map(u=>({...u,teamNames:(data.teams.filter(t=>(u.teamIds||[]).includes(t.id)).map(t=>t.name))})),teams:clone(data.teams),events:clone(data.events),activeEventId:data.settings.activeEventId,severities:[{id:'info',name:'Info',tone:'info'},{id:'followUp',name:'Trenger oppfølging',tone:'warning'},{id:'urgent',name:'Haster',tone:'urgent'},{id:'critical',name:'Kritisk',tone:'critical'}]});
      else {data.userId='u-lead';out=result({user:clone(current()),pin:'00000'});}
      if(b.action==='resetTestData'){data=defaults();out=result({testMode:true,testUsers:clone(data.users),teams:clone(data.teams),events:clone(data.events),activeEventId:data.settings.activeEventId});}
    } else if(endpoint==='login.php') {
      if(method==='GET') out=result({user:clone(user),testMode:true});
      else if(b.action==='testLogin'){data.userId=b.userId;out=result({user:clone(current())});}
      else if(path.includes('logout')){data.userId=null;out=result({});}
      else out=result({user:clone(user)});
    } else if(endpoint==='teams.php') {
      if(method==='GET') out=result({teams:clone(data.teams)});
      else {if(b.action==='create')data.teams.push({id:'t-'+crypto.randomUUID(),name:b.name,description:b.description||'',active:true,leaderIds:[]});else{const t=data.teams.find(x=>x.id===b.id);if(t){if(b.action==='deactivate')t.active=false;else Object.assign(t,b);}}out=result({teams:clone(data.teams)});}
    } else if(endpoint==='users.php') {
      if(method==='GET') out=result({users:clone(data.users)});
      else if(b.action==='create'){const cleanName=(b.displayName||b.fullName||'Demo').trim();const u={id:'u-'+crypto.randomUUID(),fullName:`Syntetisk ${cleanName}`,displayName:`Demo ${cleanName}`,phone:'000000000',role:b.role||'member',teamIds:b.teamIds||[],active:true,testSeed:true};data.users.push(u);out=result({user:clone(u),pin:'00000',users:clone(data.users)});}
      else if(b.action==='regeneratePin')out=result({pin:'00000'});
      else {const u=data.users.find(x=>x.id===b.id);if(u){const safe={...b};if('phone'in safe)safe.phone='000000000';Object.assign(u,safe);}out=result({users:clone(data.users)});}
    } else if(endpoint==='events.php') {
      if(method==='GET')out=result({events:clone(data.events),settings:clone(data.settings)});
      else if(b.action==='create'){data.events.forEach(e=>e.active=false);const e={id:'e-'+crypto.randomUUID(),name:b.name,active:true,createdAt:stamp()};data.events.push(e);data.settings.activeEventId=e.id;out=result({event:e});}
      else {data.settings.activeEventId=b.id;data.events.forEach(e=>e.active=e.id===b.id);out=result({});}
    } else if(endpoint==='incidents.php') {
      if(method==='GET')out=result({incidents:clone(data.incidents)});
      else if(b.action==='create'){const i={...b,id:'i-'+crypto.randomUUID(),createdAt:stamp(),eventId:data.settings.activeEventId,createdBy:user?.id,createdByName:user?.displayName,status:'new',comments:[],imageRefs:[]};data.incidents.unshift(i);out=result({incident:clone(i)});}
      else {const i=data.incidents.find(x=>x.id===b.id);if(i){Object.assign(i,b);if(b.comment)i.comments.push({id:'c-'+crypto.randomUUID(),displayName:user?.displayName,comment:b.comment,createdAt:stamp()});}out=result({incident:clone(i)});}
    } else if(endpoint==='messages.php') {
      if(method==='GET')out=result({messages:clone(data.messages),directTargets:clone(data.users),unreadCount:data.messages.filter(m=>!m.read).length,teamChatMessages:clone(data.teamChat),teamChatTeams:clone(data.teams),controlledTargets:{teamTargets:clone(data.teams),teamLeadTargets:clone(data.users.filter(x=>x.role==='teamLead')),memberTargets:clone(data.users.filter(x=>x.role==='member')),teamChatTeams:clone(data.teams)}});
      else if(b.action==='markRead'||b.action==='acknowledge'){const m=data.messages.find(x=>x.id===b.messageId);if(m){m.read=true;m.acknowledged=true;}out=result({message:m,messages:clone(data.messages),unreadCount:data.messages.filter(x=>!x.read).length});}else {const m={...b,id:'m-'+crypto.randomUUID(),senderId:user?.id,senderName:user?.displayName,createdAt:stamp(),read:false};if(b.type==='teamChat')data.teamChat.unshift({...m,teamName:data.teams.find(t=>t.id===b.teamId)?.name||'Syntetisk gruppe'});else data.messages.unshift(m);out=result({message:m,messages:clone(data.messages)});}
    } else if(endpoint==='live-chat.php'||endpoint==='chat-threads.php'||endpoint==='chat-edit.php') {
      const thread={...b,id:b.id||'th-'+crypto.randomUUID(),createdAt:stamp(),senderName:user?.displayName};data.threads.unshift(thread);out=result({thread,threads:clone(data.threads),comments:clone(data.comments)});
    } else if(endpoint==='message-status.php') out=result({messages:clone(data.messages)});
    else if(endpoint==='severities.php'){if(method==='POST'){if(b.action==='create')data.severities.push({...b,id:'sev-'+crypto.randomUUID(),active:true});else{const v=data.severities.find(x=>x.id===b.id);if(v)Object.assign(v,b,b.action==='deactivate'?{active:false}:{})}}out=result({severities:clone(data.severities)});}
    else if(endpoint==='push.php')out=result({push:{enabled:false,subscriptionCount:0,publicKey:'',needsServerKey:true,hasPublicKey:false,vapidPublicKeyStatus:'missing',diagnostics:[{ok:false,message:'Simulert: push og serverdiagnostikk er slått av.'}]},diagnostics:[{ok:false,message:'Simulert lokalt; ingen pushleverandør er kontaktet.'}]});
    else if(endpoint==='upload.php')out=result({uploaded:true,notice:'Vedlegg vises kun i denne nettleserøkten.'});
    else if(endpoint==='member-import.php'){const rows=[{fullName:'Syntetisk importperson A',displayName:'Importdemo A',role:'member',teamIds:['t-vert']},{fullName:'Syntetisk importperson B',displayName:'Importdemo B',role:'member',teamIds:['t-info']}];if(b.action==='commit'){rows.forEach((u,i)=>data.users.push({...u,id:'u-import-'+crypto.randomUUID(),phone:'00000000'+(6+i),active:true,testSeed:true}));out=result({imported:rows.length,skipped:0,rows});}else out=result({summary:{importable:rows.length,blocked:0},rows,preview:rows});}
    else out=result({});
    persist(); return out;
  }
  window.demoApi=demoApi;
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#demoReset')?.addEventListener('click',()=>{localStorage.removeItem(KEY);localStorage.removeItem('vibe.arrangementsvakt.offlineIncidents');location.reload();});
    document.querySelectorAll('a[href*="demo-export="]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const kind=a.href.includes('csv')?'csv':'json';const content=kind==='csv'?'type,title,status,description\n'+data.incidents.map(i=>`${i.severity},${i.title},${i.status},${i.description}`).join('\n'):JSON.stringify(data,null,2);const blob=new Blob([content],{type:kind==='csv'?'text/csv':'application/json'});const url=URL.createObjectURL(blob);const d=document.createElement('a');d.href=url;d.download=`arrangementsvakt-demo.${kind}`;d.click();URL.revokeObjectURL(url);}));
  });
})();
