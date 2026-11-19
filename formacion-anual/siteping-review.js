(() => {
  const projects = new Map([
    ['/albert-guerra-landing/v4/', 'albert'],
    ['/spazio-landings/formacion-anual/', 'sujati'],
  ]);
  const projectName = projects.get(location.pathname.replace(/\/?$/, '/'));
  if (location.origin !== 'https://weavesdv.github.io' || !projectName) return;
  const base = 'https://review.weavewp.com';
  const endpoint = `${base}/api/siteping`;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Activar comentarios';
  Object.assign(button.style, {position:'fixed',right:'16px',bottom:'16px',zIndex:'2147483640',padding:'10px 16px',background:'#1e2a4a',color:'white',border:'0',borderRadius:'8px',cursor:'pointer',font:'14px system-ui'});
  document.body.append(button);
  button.addEventListener('click', async () => {
    const apiKey = window.prompt('Pega el código de revisión de este proyecto.');
    if (!apiKey) return;
    if (!/^[a-f0-9]{64}$/.test(apiKey)) return window.alert('Código de revisión inválido.');
    button.disabled = true;
    try {
      const response = await fetch(`${endpoint}?projectName=${projectName}&limit=1`, {headers:{Authorization:`Bearer ${apiKey}`},cache:'no-store'});
      if (!response.ok) throw Error('Access denied');
      if (!window.SitePing?.initSiteping) await new Promise((resolve,reject) => {
        const script=document.createElement('script');
        script.src=`${base}/widget.js`;
        script.onload=resolve;
        script.onerror=reject;
        document.head.append(script);
      });
      window.SitePing.initSiteping({endpoint,projectName,headers:()=>({Authorization:`Bearer ${apiKey}`}),forceShow:true,readOnly:true,locale:'es',identity:{name:'Revisor',email:'reviewer@example.test'}});
      button.remove();
    } catch {
      button.disabled = false;
      window.alert('No se pudo activar la revisión. Comprueba el código e inténtalo de nuevo.');
    }
  });
})();
