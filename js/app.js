const BASES = {
  2: { name: 'Binary', hint: 'Ones and zeroes', digits: 'Digits 0–1', icon: '01', color: 'binary-icon' },
  8: { name: 'Octal', hint: 'A compact counting system', digits: 'Digits 0–7', icon: '8', color: 'decimal-icon' },
  10: { name: 'Decimal', hint: 'Everyday numbers', digits: 'Digits 0–9', icon: '10', color: 'decimal-icon' },
  16: { name: 'Hexadecimal', hint: 'Digits 0–9 and A–F', digits: 'Digits 0–9, A–F', icon: 'Aₓ', color: 'binary-icon' }
};
let fromBase = 10;
let toBase = 2;
let history = [];
let toastTimer;

const $ = (id) => document.getElementById(id);
const input = $('numberInput');

function parseValue(raw, base) {
  const value = raw.trim().replace(/\s+/g, '');
  if (!value) throw new Error('Pop a number in the box to get started.');
  let sign = '';
  let digits = value;
  if (digits[0] === '+' || digits[0] === '-') {
    sign = digits[0] === '-' ? '-' : '';
    digits = digits.slice(1);
  }
  if (!digits) throw new Error('Add at least one digit after the sign.');
  const valid = base === 16 ? /^[0-9a-fA-F]+$/ : new RegExp(`^[0-${base - 1}]+$`);
  if (!valid.test(digits)) {
    const label = BASES[base].name;
    throw new Error(`${label} numbers can only use ${BASES[base].digits.toLowerCase()}.`);
  }
  // BigInt keeps large whole numbers exact instead of silently rounding them.
  const alphabet = '0123456789ABCDEF';
  let result = 0n;
  for (const char of digits.toUpperCase()) {
    result = result * BigInt(base) + BigInt(alphabet.indexOf(char));
  }
  return sign === '-' ? -result : result;
}

function formatValue(value, base) {
  if (value === 0n) return '0';
  const negative = value < 0n;
  const result = (negative ? -value : value).toString(base).toUpperCase();
  return `${negative ? '-' : ''}${result}`;
}

function updateBaseDetails() {
  const from = BASES[fromBase];
  const to = BASES[toBase];
  $('fromTag').textContent = `BASE ${fromBase}`;
  $('toTag').textContent = `BASE ${toBase}`;
  $('fromName').textContent = from.name;
  $('fromHint').textContent = from.hint;
  $('fromIcon').textContent = from.icon;
  $('fromIcon').className = `base-icon ${from.color}`;
  $('toName').textContent = to.name;
  $('toHint').textContent = to.hint;
  $('toIcon').textContent = to.icon;
  $('toIcon').className = `base-icon ${to.color}`;
  $('inputHelp').textContent = from.digits;
  document.querySelectorAll('#fromOptions [data-base]').forEach((button) => button.classList.toggle('selected', Number(button.dataset.base) === fromBase));
  document.querySelectorAll('#toOptions [data-base]').forEach((button) => button.classList.toggle('selected', Number(button.dataset.base) === toBase));
}

function convert({ save = true } = {}) {
  updateBaseDetails();
  const error = $('errorMessage');
  try {
    const value = parseValue(input.value, fromBase);
    const result = formatValue(value, toBase);
    $('resultValue').textContent = result;
    $('resultMeta').textContent = `${result.replace('-', '').length} ${BASES[toBase].name.toLowerCase()} digit${result.replace('-', '').length === 1 ? '' : 's'}`;
    error.hidden = true;
    if (save && input.value.trim()) addHistory(input.value.trim(), result, fromBase, toBase);
    return true;
  } catch (err) {
    $('resultValue').textContent = '—';
    $('resultMeta').textContent = 'Waiting for a valid number';
    error.textContent = err.message;
    error.hidden = false;
    return false;
  }
}

function addHistory(source, result, from, to) {
  const entry = { source, result, from, to };
  if (history[0] && history[0].source === source && history[0].from === from && history[0].to === to) return;
  history.unshift(entry);
  history = history.slice(0, 5);
  renderHistory();
}

function renderHistory() {
  const container = $('historyList');
  if (!history.length) {
    container.innerHTML = '<div class="empty-history"><span>↗</span><p>Your conversions will show up here.</p></div>';
    return;
  }
  container.innerHTML = history.map((item, index) => `
    <div class="history-item">
      <div class="history-main"><div class="history-equation">${escapeHTML(item.source)} <b>base ${item.from} →</b> ${escapeHTML(item.result)}</div><div class="history-sub">${BASES[item.from].name} to ${BASES[item.to].name}</div></div>
      <button class="history-use" type="button" data-history="${index}">Use again ↗</button>
    </div>`).join('');
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
}

document.querySelectorAll('#fromOptions [data-base]').forEach((button) => {
  button.addEventListener('click', () => { fromBase = Number(button.dataset.base); convert({ save: false }); });
});
document.querySelectorAll('#toOptions [data-base]').forEach((button) => {
  button.addEventListener('click', () => { toBase = Number(button.dataset.base); convert(); });
});
input.addEventListener('input', () => convert());
$('swapBtn').addEventListener('click', () => {
  const oldFrom = fromBase;
  fromBase = toBase;
  toBase = oldFrom;
  const oldInput = $('resultValue').textContent;
  if (oldInput !== '—') input.value = oldInput;
  convert({ save: false });
});
$('clearBtn').addEventListener('click', () => { input.value = ''; convert({ save: false }); input.focus(); });
$('copyBtn').addEventListener('click', async () => {
  const value = $('resultValue').textContent;
  if (!value || value === '—') return showToast('There is no result to copy just yet.');
  try { await navigator.clipboard.writeText(value); showToast('Copied! Your number is ready.'); }
  catch { showToast('Clipboard access is unavailable in this browser.'); }
});
$('clearHistory').addEventListener('click', () => { history = []; renderHistory(); });
$('historyList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-history]');
  if (!button) return;
  const item = history[Number(button.dataset.history)];
  if (!item) return;
  input.value = item.source;
  fromBase = item.from;
  toBase = item.to;
  convert({ save: false });
  window.scrollTo({ top: $('top').offsetTop, behavior: 'smooth' });
});

convert({ save: false });
