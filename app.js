'use strict';
const $ = id => document.getElementById(id);
const enc = new TextEncoder(), dec = new TextDecoder('utf-8', { fatal: true });
const b64 = b => { let s = ''; new Uint8Array(b).forEach(x => s += String.fromCharCode(x)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0));
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = s => { s = s.replace(/\s/g, ''); if (!/^([0-9a-f]{2})*$/i.test(s)) throw 0; return Uint8Array.from(s.match(/../g) || [], h => parseInt(h, 16)); };
const concat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; a.forEach(x => { o.set(x, p); p += x.length; }); return o; };
const mod = (n, m) => ((n % m) + m) % m;

let cur = 'ip'; const UPD = [];
const L = {
ru: { g_status:'Статус', g_security:'Безопасность', g_app:'Приложения', n_ip:'Мой IP', n_speed:'Тест скорости', n_enc:'Шифрование', n_dec:'Расшифровка', n_hash:'Хеш', n_pass:'Пароль', n_short:'Короткая ссылка',
 ip_h:'Мой IP адрес', country:'Страна', city:'Город', isp:'Провайдер', tz:'Часовой пояс', browser:'Браузер', refresh:'Обновить',
 sp_h:'Скорость интернета', sp_hint:'Тест идёт через серверы Cloudflare и занимает около 20 секунд.', status:'Статус', ready:'Готов', start:'Старт', done:'Готово',
 enc_h:'Шифрование', dec_h:'Расшифровка', method:'Метод', text:'Текст', result:'Результат', do_enc:'Зашифровать', do_dec:'Расшифровать', copy:'Копировать',
 hash_h:'Хеш', algo:'Алгоритм', calc:'Посчитать', pw_h:'Генератор паролей', len:'Длина', syms:'Символы', special:'Спецсимволы', gen:'Создать',
 sh_h:'Сокращение ссылок', sh_hint:'Ссылку сокращают сервисы cleanuri, is.gd, v.gd и 1pt. Если ни один не ответил, сайт делает длинную ссылку внутри себя.', link:'Ссылка', short:'Короткая', shorten:'Сократить',
 g1:'Современные (AES, PBKDF2)', g2:'Потоковые и XOR', g3:'Классические', g4:'Кодировки (без ключа)',
 m_caesar:'Цезарь (сдвиг)', m_rot13:'ROT13 (латиница)', m_atbash:'Атбаш', m_vig:'Виженер', m_morse:'Морзе (латиница)', m_rev:'Реверс',
 k_pass:'Пароль', k_num:'Сдвиг (число)', k_word:'Ключ (слово)', k_none:'Ключ не нужен',
 e_num:'e_num', e_key:'e_key', e_let:'e_let', e_pw8:'e_pw8', e_gen:'Ошибка: проверь метод, ключ и входной текст',
 e_url:'Нужна ссылка с http или https', e_svc:'Сервис не ответил. Попробуй позже', e_ip:'Не удалось получить IP. Отключи блокировщик и нажми «Обновить»', e_sp:'Ошибка. Проверь соединение и блокировщик рекламы', err:'Ошибка', e_fb:'Сервисы не ответили. Создана длинная ссылка внутри сайта.', copied:'Скопировано', n_go:'Переход', go_h:'Переход по ссылке', go_hint:'Эта ссылка ведёт на адрес ниже. Проверь его перед переходом.', go_btn:'Перейти', sh_hint2:'Свой сервер не подключён, поэтому ссылка хранит адрес внутри себя и не станет короче. Подключи Worker, см. config.js.' },
en: { g_status:'Status', g_security:'Security', g_app:'Application', n_ip:'My IP', n_speed:'Speed test', n_enc:'Encrypt', n_dec:'Decrypt', n_hash:'Hash', n_pass:'Password', n_short:'Short link',
 ip_h:'My IP address', country:'Country', city:'City', isp:'ISP', tz:'Time zone', browser:'Browser', refresh:'Refresh',
 sp_h:'Internet speed', sp_hint:'The test uses Cloudflare servers and takes about 20 seconds.', status:'Status', ready:'Ready', start:'Start', done:'Done',
 enc_h:'Encryption', dec_h:'Decryption', method:'Method', text:'Text', result:'Result', do_enc:'Encrypt', do_dec:'Decrypt', copy:'Copy',
 hash_h:'Hash', algo:'Algorithm', calc:'Calculate', pw_h:'Password generator', len:'Length', syms:'Symbols', special:'Special characters', gen:'Generate',
 sh_h:'Link shortener', sh_hint:'Services cleanuri, is.gd, v.gd and 1pt shorten the link. If none answers, the site makes a long link of its own.', link:'Link', short:'Short link', shorten:'Shorten',
 g1:'Modern (AES, PBKDF2)', g2:'Stream and XOR', g3:'Classic', g4:'Encodings (no key)',
 m_caesar:'Caesar (shift)', m_rot13:'ROT13 (Latin)', m_atbash:'Atbash', m_vig:'Vigenere', m_morse:'Morse (Latin)', m_rev:'Reverse',
 k_pass:'Password', k_num:'Shift (number)', k_word:'Key (word)', k_none:'No key needed',
 e_num:'The key must be a number', e_key:'Enter a key', e_let:'The key needs letters', e_pw8:'Password must have 8+ characters', e_gen:'Error: check the method, key and input text',
 e_url:'Enter a link with http or https', e_svc:'The service did not answer. Try later', e_ip:'Could not get the IP. Turn off the ad blocker and press Refresh', e_sp:'Error. Check the connection and the ad blocker', err:'Error', e_fb:'No service answered. A long link inside the site was made.', copied:'Copied', n_go:'Redirect', go_h:'Link redirect', go_hint:'This link leads to the address below. Check it before you open it.', go_btn:'Open', sh_hint2:'No own server is connected, so the link keeps the address inside and will not get shorter. Connect the Worker, see config.js.' }
};
let lang = 'ru';
try { lang = localStorage.getItem('lang') || 'ru'; } catch {}
const t = k => (L[lang] && L[lang][k]) || k;
function apply() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = t(e.dataset.i18n));
  document.querySelectorAll('.lk').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
  document.querySelectorAll('.msg').forEach(m => m.textContent = '');
  UPD.forEach(f => f()); show(cur);
}

// Навигация
const names = { ip: 'Status>My IP', speed: 'Status>Speed test', enc: 'Security>Encrypt', dec: 'Security>Decrypt', hash: 'Security>Hash', pass: 'Security>Password', short: 'Application>Short link', go: 'x' };
const groupOf = { ip: 'status', speed: 'status', enc: 'security', dec: 'security', hash: 'security', pass: 'security', short: 'app', go: 'app' };
function show(p) {
  if (!names[p]) p = 'ip';
  document.querySelectorAll('section').forEach(s => s.hidden = s.id !== 'p-' + p);
  document.querySelectorAll('.side li').forEach(li => li.classList.toggle('act', li.dataset.p === p));
  document.querySelectorAll('.side ul').forEach(u => u.classList.toggle('open', u.dataset.gl === groupOf[p]));
  document.querySelectorAll('.grp').forEach(g => g.classList.toggle('open', g.dataset.g === groupOf[p]));
  cur = p; $('crumb').textContent = t('g_' + groupOf[p]) + '>' + t('n_' + p);
  if (p === 'ip' && $('ip-ip').textContent === '...') loadIp();
}
document.querySelectorAll('.side li').forEach(li => li.addEventListener('click', () => { location.hash = li.dataset.p; }));
document.querySelectorAll('.grp').forEach(g => g.addEventListener('click', () => {
  g.classList.toggle('open'); document.querySelector(`[data-gl="${g.dataset.g}"]`).classList.toggle('open');
}));
window.addEventListener('hashchange', () => { resolveLink().then(r => { if (!r) show(location.hash.slice(1)); }); });

// Шифры
const ABC = ['abcdefghijklmnopqrstuvwxyz', 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'];
const mapCh = (t, fn) => [...t].map(c => {
  const l = c.toLowerCase();
  for (const a of ABC) { const i = a.indexOf(l); if (i >= 0) { const r = a[fn(i, a.length)]; return c === l ? r : r.toUpperCase(); } }
  return c;
}).join('');
const num = k => { const n = parseInt(k, 10); if (isNaN(n)) throw 'e_num'; return n; };
const word = k => { if (!k) throw 'e_key'; return k; };
const vig = (t, key, s) => {
  const ks = [...word(key).toLowerCase()].map(c => { for (const a of ABC) { const i = a.indexOf(c); if (i >= 0) return i; } return -1; }).filter(x => x >= 0);
  if (!ks.length) throw 'e_let';
  let j = 0; return mapCh(t, (i, n) => mod(i + s * ks[j++ % ks.length], n));
};
const stream = (data, key) => {
  const k = enc.encode(word(key)), S = [...Array(256).keys()]; let j = 0;
  for (let i = 0; i < 256; i++) { j = (j + S[i] + k[i % k.length]) & 255; [S[i], S[j]] = [S[j], S[i]]; }
  let i = 0; j = 0;
  return data.map(b => { i = (i + 1) & 255; j = (j + S[i]) & 255; [S[i], S[j]] = [S[j], S[i]]; return b ^ S[(S[i] + S[j]) & 255]; });
};
const xor = (data, key) => { const k = enc.encode(word(key)); return data.map((b, i) => b ^ k[i % k.length]); };
const MORSE = Object.fromEntries('a:.-,b:-...,c:-.-.,d:-..,e:.,f:..-.,g:--.,h:....,i:..,j:.---,k:-.-,l:.-..,m:--,n:-.,o:---,p:.--.,q:--.-,r:.-.,s:...,t:-,u:..-,v:...-,w:.--,x:-..-,y:-.--,z:--..,0:-----,1:.----,2:..---,3:...--,4:....-,5:.....,6:-....,7:--...,8:---..,9:----.'.split(',').map(x => [x[0], x.slice(2)]));
const UNMORSE = Object.fromEntries(Object.entries(MORSE).map(([a, b]) => [b, a]));

const aes = (mode, bits) => {
  const ivLen = mode === 'AES-GCM' ? 12 : 16;
  const key = async (pw, salt, use) => {
    const m = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, m, { name: mode, length: bits }, false, [use]);
  };
  const par = iv => mode === 'AES-CTR' ? { name: mode, counter: iv, length: 64 } : { name: mode, iv };
  return {
    need: 'pass', label: `${mode} ${bits}`,
    e: async (t, pw) => {
      if (pw.length < 8) throw 'e_pw8';
      const s = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(ivLen));
      return b64(concat(s, iv, new Uint8Array(await crypto.subtle.encrypt(par(iv), await key(pw, s, 'encrypt'), enc.encode(t)))));
    },
    d: async (t, pw) => { const d = unb64(t); return dec.decode(await crypto.subtle.decrypt(par(d.slice(16, 16 + ivLen)), await key(pw, d.slice(0, 16), 'decrypt'), d.slice(16 + ivLen))); }
  };
};
const M = [
  ['g1', {
    'aes-gcm-256': aes('AES-GCM', 256), 'aes-gcm-192': aes('AES-GCM', 192), 'aes-gcm-128': aes('AES-GCM', 128),
    'aes-cbc-256': aes('AES-CBC', 256), 'aes-cbc-128': aes('AES-CBC', 128),
    'aes-ctr-256': aes('AES-CTR', 256), 'aes-ctr-128': aes('AES-CTR', 128)
  }],
  ['g2', {
    rc4: { need: 'pass', label: 'RC4', e: (t, k) => b64(stream(enc.encode(t), k)), d: (t, k) => dec.decode(stream(unb64(t), k)) },
    xor: { need: 'pass', label: 'XOR', e: (t, k) => b64(xor(enc.encode(t), k)), d: (t, k) => dec.decode(xor(unb64(t), k)) }
  }],
  ['g3', {
    caesar: { need: 'num', lk: 'm_caesar', e: (t, k) => mapCh(t, (i, n) => mod(i + num(k), n)), d: (t, k) => mapCh(t, (i, n) => mod(i - num(k), n)) },
    rot13: { need: 'none', lk: 'm_rot13', e: t => t.replace(/[a-z]/gi, c => String.fromCharCode((c <= 'Z' ? 65 : 97) + mod(c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13, 26))), d: t => M[2][1].rot13.e(t) },
    atbash: { need: 'none', lk: 'm_atbash', e: t => mapCh(t, (i, n) => n - 1 - i), d: t => mapCh(t, (i, n) => n - 1 - i) },
    vigenere: { need: 'word', lk: 'm_vig', e: (t, k) => vig(t, k, 1), d: (t, k) => vig(t, k, -1) }
  }],
  ['g4', {
    base64: { need: 'none', label: 'Base64', e: t => b64(enc.encode(t)), d: t => dec.decode(unb64(t)) },
    hex: { need: 'none', label: 'Hex', e: t => hex(enc.encode(t)), d: t => dec.decode(unhex(t)) },
    binary: { need: 'none', label: 'Binary', e: t => [...enc.encode(t)].map(b => b.toString(2).padStart(8, '0')).join(' '), d: t => dec.decode(Uint8Array.from(t.trim().split(/\s+/), b => parseInt(b, 2))) },
    url: { need: 'none', label: 'URL', e: t => encodeURIComponent(t), d: t => decodeURIComponent(t) },
    morse: { need: 'none', lk: 'm_morse', e: t => [...t.toLowerCase()].map(c => c === ' ' ? '/' : MORSE[c] || '?').join(' '), d: t => t.trim().split(' ').map(c => c === '/' ? ' ' : UNMORSE[c] || '?').join('') },
    reverse: { need: 'none', lk: 'm_rev', e: t => [...t].reverse().join(''), d: t => [...t].reverse().join('') }
  }]
];
const ALL = Object.assign({}, ...M.map(g => g[1]));
const KL = { pass: 'k_pass', num: 'k_num', word: 'k_word', none: 'k_none' };

function setup(p, fn) {
  const sel = $(p + '-m');
  const fill = () => {
    const v = sel.value; sel.textContent = '';
    M.forEach(([title, items]) => {
      const g = document.createElement('optgroup'); g.label = t(title);
      for (const [id, m] of Object.entries(items)) { const o = document.createElement('option'); o.value = id; o.textContent = m.label || t(m.lk); g.appendChild(o); }
      sel.appendChild(g);
    });
    if (v) sel.value = v;
  };
  const upd = () => {
    const n = ALL[sel.value].need; $(p + '-kl').textContent = t(KL[n]);
    $(p + '-k').disabled = n === 'none'; $(p + '-k').type = n === 'pass' ? 'password' : 'text'; if (n === 'none') $(p + '-k').value = '';
  };
  UPD.push(() => { fill(); upd(); });
  fill(); sel.addEventListener('change', upd); upd();
  $(p + '-go').addEventListener('click', async () => {
    $(p + '-msg').textContent = '';
    try { $(p + '-out').value = await ALL[sel.value][fn]($(p + '-in').value, $(p + '-k').value); }
    catch (e) { $(p + '-out').value = ''; $(p + '-msg').textContent = typeof e === 'string' ? t(e) : t('e_gen'); }
  });
}
setup('e', 'e'); setup('d', 'd');

// Хеш и пароль
$('h-go').addEventListener('click', async () => $('h-out').value = hex(await crypto.subtle.digest($('h-a').value, enc.encode($('h-in').value))));
$('g-go').addEventListener('click', () => {
  const len = Math.min(64, Math.max(8, Number($('g-len').value) || 20));
  const set = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789' + ($('g-sym').checked ? '!@#$%^&*-_=+?' : '');
  const lim = 256 - (256 % set.length); let out = '';
  while (out.length < len) for (const b of crypto.getRandomValues(new Uint8Array(len * 2))) if (b < lim && out.length < len) out += set[b % set.length];
  $('g-out').value = out;
});

// Короткая ссылка: сторонние сервисы по очереди, в конце ссылка внутри сайта
const jsonp = (base, url) => new Promise((res, rej) => {
  const cb = 'cb' + crypto.getRandomValues(new Uint32Array(1))[0];
  const sc = document.createElement('script');
  const end = () => { delete window[cb]; sc.remove(); };
  window[cb] = d => { end(); res(d); };
  sc.onerror = () => { end(); rej(new Error('jsonp')); };
  sc.src = `${base}/create.php?format=json&callback=${cb}&url=${encodeURIComponent(url)}`;
  document.head.appendChild(sc);
  setTimeout(() => { if (window[cb]) { end(); rej(new Error('timeout')); } }, 8000);
});
const gd = async (base, u, viaScript) => {
  const j = viaScript ? await jsonp(base, u) : await (await fetch(`${base}/create.php?format=json&url=${encodeURIComponent(u)}`, { signal: AbortSignal.timeout(7000) })).json();
  if (j.shorturl) return j.shorturl; throw new Error(j.errormessage || base);
};
const PROV = [
  async u => {
    const j = await (await fetch('https://cleanuri.com/api/v1/shorten', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'url=' + encodeURIComponent(u), signal: AbortSignal.timeout(7000) })).json();
    if (j.result_url) return j.result_url; throw new Error(j.error || 'cleanuri');
  },
  u => gd('https://is.gd', u, false),
  u => gd('https://v.gd', u, false),
  async u => {
    const j = await (await fetch('https://api.1pt.co/addURL?long=' + encodeURIComponent(u), { signal: AbortSignal.timeout(7000) })).json();
    const c = j.short || j.message; if (!c || !/^[\w-]{1,40}$/.test(c)) throw new Error('1pt'); return 'https://1pt.co/' + c;
  },
  u => gd('https://is.gd', u, true),
  u => gd('https://v.gd', u, true)
];
const b64u = b => b64(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => unb64(s.replace(/-/g, '+').replace(/_/g, '/'));
const pipe = async (data, st) => new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(st)).arrayBuffer());
const packUrl = async u => b64u(await pipe(enc.encode(u), new CompressionStream('deflate-raw')));
const unpackUrl = async c => dec.decode(await pipe(unb64u(c), new DecompressionStream('deflate-raw')));
const okUrl = s => { try { const u = new URL(String(s).trim()); return /^https?:$/.test(u.protocol) && !u.username && !u.password && u.href.length <= 2048 ? u : null; } catch { return null; } };
async function resolveLink() {
  const m = location.hash.match(/^#\/r\/([A-Za-z0-9_-]{1,3000})$/); if (!m) return false;
  try { const u = okUrl(await unpackUrl(m[1])); if (!u) throw 0; $('go-url').textContent = u.href; $('go-a').href = u.href; }
  catch { $('go-url').textContent = t('e_url'); $('go-a').removeAttribute('href'); }
  show('go'); return true;
}
$('s-go').addEventListener('click', async () => {
  const msg = $('s-msg'), btn = $('s-go'); msg.textContent = ''; $('s-out').value = '';
  const u = okUrl($('s-in').value); if (!u) { msg.textContent = t('e_url'); return; }
  btn.disabled = true;
  for (const p of PROV) {
    try { const out = await p(u.href); if (new URL(out).protocol === 'https:') { $('s-out').value = out; btn.disabled = false; return; } } catch {}
  }
  try { $('s-out').value = location.origin + location.pathname + '#/r/' + await packUrl(u.href); msg.textContent = t('e_fb'); }
  catch { msg.textContent = t('e_svc'); }
  btn.disabled = false;
});

// IP
async function loadIp() {
  $('ip-msg').textContent = '';
  try {
    const j = await (await fetch('https://ipwho.is/')).json();
    if (j.success === false) throw 0;
    $('ip-ip').textContent = j.ip; $('ip-co').textContent = j.country || '-'; $('ip-ci').textContent = j.city || '-';
    $('ip-isp').textContent = (j.connection && j.connection.isp) || '-'; $('ip-tz').textContent = (j.timezone && j.timezone.id) || '-';
    $('ip-ua').textContent = navigator.userAgent;
  } catch { $('ip-msg').textContent = t('e_ip'); }
}
$('ip-r').addEventListener('click', loadIp);

// Скорость
const CF = 'https://speed.cloudflare.com/';
const FB = ['https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js', 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/editor/editor.main.js'];
const JQ = 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/package.json';
const mbps = (b, s0) => b * 8 / ((performance.now() - s0) / 1000) / 1e6;
async function pingOnce(url) {
  const s0 = performance.now();
  const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'r=' + Math.random(), { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  await r.arrayBuffer(); return performance.now() - s0;
}
async function download(urlFn, ms, onTick) {
  const ac = new AbortController(); let got = 0, s0 = 0, err = null;
  const stop = setTimeout(() => ac.abort(), ms);
  const w = async () => {
    try {
      while (!ac.signal.aborted) {
        const r = await fetch(urlFn(), { cache: 'no-store', signal: ac.signal });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const rd = r.body.getReader();
        for (;;) { const { done, value } = await rd.read(); if (done) break; if (!s0) s0 = performance.now(); got += value.length; }
      }
    } catch (e) { if (!ac.signal.aborted) err = e; }
  };
  const tick = setInterval(() => s0 && onTick(mbps(got, s0)), 400);
  await Promise.all([w(), w(), w(), w()]); clearTimeout(stop); clearInterval(tick);
  if (!got) throw err || new Error('no data');
  return mbps(got, s0);
}
$('sp-go').addEventListener('click', async () => {
  const btn = $('sp-go'), st = $('sp-st'); btn.disabled = true; st.removeAttribute('data-i18n');
  ['sp-ping', 'sp-jit', 'sp-down', 'sp-up'].forEach(i => $(i).textContent = '-');
  try {
    st.textContent = 'Ping...'; const p = [];
    try { for (let i = 0; i < 7; i++) p.push(await pingOnce(CF + '__down?bytes=0')); }
    catch { p.length = 0; for (let i = 0; i < 7; i++) p.push(await pingOnce(JQ)); }
    p.shift();
    $('sp-ping').textContent = Math.min(...p).toFixed(0) + ' ms';
    $('sp-jit').textContent = (p.slice(1).reduce((a, x, i) => a + Math.abs(x - p[i]), 0) / (p.length - 1)).toFixed(1) + ' ms';

    st.textContent = 'Download...';
    const showD = v => $('sp-down').textContent = v.toFixed(1) + ' Mbps';
    try { showD(await download(() => CF + '__down?bytes=25000000&r=' + Math.random(), 8000, showD)); }
    catch {
      try { let n = 0; showD(await download(() => FB[n++ % FB.length] + '?r=' + Math.random(), 8000, showD)); }
      catch (e) { $('sp-down').textContent = t('err') + ' (' + e.message + ')'; }
    }

    st.textContent = 'Upload...';
    const blob = new Blob([new Uint8Array(4e6)]); let sent = 0; const t1 = performance.now();
    for (let r = 0; r < 3; r++) await Promise.all([0, 1, 2, 3].map(() => fetch(CF + '__up', { method: 'POST', body: blob }).then(x => { if (x.ok) sent += blob.size; }).catch(() => {})));
    $('sp-up').textContent = sent ? mbps(sent, t1).toFixed(1) + ' Mbps' : t('err');
    st.textContent = t('done');
  } catch { st.textContent = t('e_sp'); }
  btn.disabled = false;
});

document.querySelectorAll('.cp').forEach(b => b.addEventListener('click', async () => {
  const el = $(b.dataset.c), v = el.value; if (!v) return;
  try { await navigator.clipboard.writeText(v); } catch { el.select(); try { document.execCommand('copy'); } catch {} }
  b.textContent = t('copied'); setTimeout(() => b.textContent = t('copy'), 1500);
}));
document.querySelectorAll('.lk').forEach(b => b.addEventListener('click', () => { lang = b.dataset.l; try { localStorage.setItem('lang', lang); } catch {} apply(); }));
cur = location.hash.slice(1) || 'ip'; apply(); resolveLink();
