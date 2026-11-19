(() => {
  const projects = new Map([
    ['/albert-guerra-landing/v4/', 'albert'],
    ['/spazio-landings/formacion-anual/', 'sujati'],
  ]);
  const projectName = projects.get(location.pathname.replace(/\/?$/, '/'));
  if (location.origin !== 'https://weavesdv.github.io' || !projectName) return;

  const base = 'https://review.weavewp.com';
  const endpoint = `${base}/api/siteping`;
  const storageKey = `siteping:${projectName}`;
  const normalize = value => (value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const isValid = value => /^[A-HJ-NP-Z2-9]{12}$/.test(normalize(value));
  const readCode = () => { try { return localStorage.getItem(storageKey) || ''; } catch { return ''; } };
  const writeCode = value => { try { localStorage.setItem(storageKey, value); } catch { /* modo privado */ } };
  const eraseCode = () => { try { localStorage.removeItem(storageKey); } catch { /* modo privado */ } };
  const fromUrl = () => {
    const hash = new URLSearchParams(location.hash.replace(/^#/, '')).get('siteping');
    const query = new URLSearchParams(location.search).get('siteping');
    return hash || query || '';
  };

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Activar comentarios';
  Object.assign(button.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: '2147483640', padding: '10px 16px', background: '#1e2a4a', color: 'white', border: '0', borderRadius: '8px', cursor: 'pointer', font: '14px system-ui' });
  button.hidden = true;
  document.body.append(button);

  const showButton = () => { button.hidden = false; button.disabled = false; };

  button.addEventListener('click', () => {
    const input = window.prompt('Pega el código de revisión (12 caracteres).');
    if (!input) return;
    const code = normalize(input);
    if (!isValid(code)) return window.alert('Ese código no es válido. Debe tener 12 caracteres.');
    activate(code).catch(() => window.alert('No pudimos activar la revisión. Revisa el código e inténtalo de nuevo.'));
  });

  async function activate(rawCode) {
    const code = normalize(rawCode);
    const response = await fetch(`${endpoint}?projectName=${projectName}&limit=1`, { headers: { Authorization: `Bearer ${code}` }, cache: 'no-store' });
    if (!response.ok) {
      eraseCode();
      throw Error('denied');
    }
    if (!window.SitePing?.initSiteping) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${base}/widget.js`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
    }
    window.SitePing.initSiteping({
      endpoint,
      projectName,
      headers: () => ({ Authorization: `Bearer ${code}` }),
      forceShow: true,
      readOnly: true,
      locale: 'es',
      identity: { name: 'Revisor', email: 'reviewer@example.test' },
    });
    writeCode(code);
    if (fromUrl()) history.replaceState(null, '', location.pathname + location.search);
    button.remove();
  }

  const fromLink = normalize(fromUrl());
  if (isValid(fromLink)) {
    activate(fromLink).catch(() => showButton());
  } else if (isValid(readCode())) {
    activate(readCode()).catch(() => showButton());
  } else {
    showButton();
  }
})();
