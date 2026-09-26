// Fill.ai download page: the form in the hero that fills itself, copy
// buttons, a note for browsers that can't run the extension, the rail's
// "you are here", and sections that ease in as they scroll into view.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Select it';
    }
    clearTimeout(btn.timer);
    btn.timer = setTimeout(() => (btn.textContent = 'Copy'), 1600);
  });
});

// Chrome, Edge and Brave on a computer can load Fill.ai. Everything else
// (phones, Firefox, Safari) gets told so before downloading a zip it can't use.
const ua = navigator.userAgentData;
const chromium = !!ua?.brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge|Brave/.test(b.brand));
const mobile = ua ? ua.mobile : /Android|iPhone|iPad/i.test(navigator.userAgent);
if (!chromium || mobile) document.querySelector('.browser-note').hidden = false;

// ---------------------------------------------------------------- the form
// Answers are written in one at a time, letter by letter, in ink, and each
// gets its source number once it's down. The blanks that are the reader's
// to answer, and the untouched Submit, show once the writing is done.
// Without JS, or with reduced motion, the form is simply shown filled.

const demo = document.getElementById('demo');
const rows = [...demo.querySelectorAll('.f[data-answer]')];
const again = demo.querySelector('.demo__again');
let run = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fillDemo() {
  const mine = ++run;
  demo.classList.add('is-blank');
  rows.forEach((row) => {
    row.classList.remove('is-filled');
    row.querySelector('.ink').textContent = '';
  });
  again.classList.remove('is-on');
  await sleep(500);

  for (const row of rows) {
    const ink = row.querySelector('.ink');
    const text = row.dataset.answer;
    for (let i = 1; i <= text.length; i++) {
      if (mine !== run) return;
      ink.textContent = text.slice(0, i);
      await sleep(26 + Math.random() * 34);
    }
    row.classList.add('is-filled');
    await sleep(260);
  }
  if (mine !== run) return;
  demo.classList.remove('is-blank');
  await sleep(700);
  again.classList.add('is-on');
}

if (!reduced && 'IntersectionObserver' in window) {
  rows.forEach((row) => {
    row.querySelector('.ink').textContent = '';
  });
  demo.classList.add('is-blank');
  const watch = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    watch.disconnect();
    fillDemo();
  }, { threshold: 0.4 });
  watch.observe(demo);

  again.addEventListener('click', fillDemo);
  // The real shortcut replays it. If Fill.ai is installed, Chrome hands the
  // keys to the extension instead, which is the better demo anyway.
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyF') {
      e.preventDefault();
      if (window.eggs) window.eggs.find('fillai');
      demo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fillDemo();
    }
  });
} else {
  rows.forEach((row) => row.classList.add('is-filled'));
}

// With Fill.ai installed, Chrome hands Alt+Shift+F to the extension and this
// page never hears the keys, so the easter egg could never be found by the
// people who actually use it. The extension's panel does arrive in this page,
// though (as #fillai-root, see src/content/panel.js), and that counts too.
new MutationObserver((records) => {
  const opened = records.some((r) => [...r.addedNodes].some((n) => n.id === 'fillai-root'));
  if (opened && window.eggs) window.eggs.find('fillai');
}).observe(document.documentElement, { childList: true });

// ------------------------------------------------------ rail: you are here

const links = [...document.querySelectorAll('.rail__nav a')];
const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
if ('IntersectionObserver' in window) {
  const here = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((a, i) => a.classList.toggle('is-here', sections[i] === e.target));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && here.observe(s));
}

// ------------------------------------------------------------- reveals

const items = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}
