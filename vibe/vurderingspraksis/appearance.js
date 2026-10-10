/* Fixed Trøndelag profile with a local light/dark preference. */
(() => {
  'use strict';
  const key='vibe-vurderingspraksis-appearance-v2';
  const legacyKey='vibe-vurderingspraksis-appearance-v1';
  const profile={green:'#476b5a',cyan:'#f9df4c',blue:'#183f50',focus:'#183f50',purple:'#d76527'};
  const $=id=>document.getElementById(id);
  let theme='light';

  function apply(){
    const dark=theme==='dark';
    const values={
      page:dark?'#10161d':'#f7f6f0',surface:dark?'#18212b':'#ffffff',
      text:dark?'#f4f6f8':'#1a1819',muted:dark?'#c4ced8':'#514f49',
      primary:dark?'#aebfc4':'#183f50','primary-text':dark?'#000000':'#ffffff',
      'action-text':dark?'#aebfc4':'#183f50',secondary:dark?'#91a8b5':'#183f50',
      tint:dark?'#25343e':'#fdf7d7','tint-alt':dark?'#22313a':'#e7eff0',
      border:dark?'#53636e':'#cbc9b2','control-border':dark?'#aab8c8':'#514f49',
      'focus-ring':dark?'#c4e1f0':'#315f78',danger:dark?'#ffd6c5':'#8e4d4b',
      success:dark?'#a5d7b8':'#476b5a',link:dark?'#a9d7f5':'#183f50',
      'button-surface':dark?'#53636e':'#cbc9b2','button-ink':dark?'#f4f6f8':'#183f50',
      'nav-ink':dark?'#f4f6f8':'#183f50',highlight:'#f9df4c','regional-teal':'#3b8892',accent:'#d76527',
      ...profile
    };
    const root=document.documentElement;
    root.dataset.theme=theme;
    Object.entries(values).forEach(([name,value])=>root.style.setProperty('--'+name,value));
    document.querySelectorAll('[data-theme-choice]').forEach(button=>{
      const selected=button.dataset.themeChoice===theme;
      button.setAttribute('aria-pressed',String(selected));
      button.textContent=(selected?'✓ ':'')+(button.dataset.themeChoice==='dark'?'Mørkt':'Lyst');
    });
  }

  function choose(next){
    theme=next;apply();
    $('theme-error').hidden=true;
    try{
      localStorage.setItem(key,JSON.stringify({version:2,theme}));
    }catch{
      $('theme-error').hidden=false;
      $('theme-error').textContent='Temaet kunne ikke lagres i nettleseren. Valget kan forsvinne når du laster siden på nytt.';
    }
  }

  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.themeChoice)));
  try{
    const raw=localStorage.getItem(key)||localStorage.getItem(legacyKey);
    if(raw){
      const saved=JSON.parse(raw);
      if(saved&&['light','dark'].includes(saved.theme))theme=saved.theme;
    }
    apply();
  }catch{
    apply();$('theme-error').hidden=false;
    $('theme-error').textContent='Det lagrede temaet kunne ikke leses. Lyst tema brukes. Du kan velge tema på nytt.';
  }
})();
