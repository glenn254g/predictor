// script.js - controls time display, spinner, and odds prediction animation

// Elements
const timeDisplay = document.getElementById('timeDisplay');
const nextBtn = document.getElementById('nextBtn');
const spinner = document.getElementById('spinner');
const oddsValueEl = document.getElementById('oddsValue');

let currentOdds = 0; // numeric value without 'x'

// Utility: format time as h:mm AM/PM (similar to screenshot)
function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mm = minutes.toString().padStart(2, '0');
  return `${hours}:${mm} ${ampm}`;
}

// Live clock update
function updateClock() {
  timeDisplay.textContent = formatTime(new Date());
}
updateClock();
setInterval(updateClock, 1000);

// Map a fraction [0,1] to range [minVal, maxVal]
function mapToRange(frac, minVal, maxVal) {
  return minVal + frac * (maxVal - minVal);
}

// Deterministic "predictor" that depends on current time
// Returns a number between 30.23 and 503.35
function computePredictionFromNow(date = new Date()) {
  const minV = 30.23;
  const maxV = 503.35;

  // Use seconds + ms to create a fraction that changes fairly smoothly
  const s = date.getSeconds();
  const ms = date.getMilliseconds();
  // combine seconds and ms into 0..1
  const frac1 = ((s * 1000 + ms) % 10000) / 10000; // 0..1
  // add a second moderate-variation component using minutes
  const m = date.getMinutes();
  const frac2 = (Math.sin((m / 60) * Math.PI * 2) + 1) / 2; // 0..1

  // Combine them to produce a bit of structure yet varying
  const frac = (0.6 * frac1 + 0.4 * frac2) % 1;

  // Map into the requested range
  const val = mapToRange(frac, minV, maxV);

  // Round to 2 decimal places (digit-by-digit computation)
  // (We compute the integer cents to ensure deterministic rounding.)
  const cents = Math.round(val * 100); // integer cents
  return cents / 100;
}

// Animate numeric value from current to target over duration milliseconds
function animateValue(from, to, duration = 1200, onUpdate, onComplete) {
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    // easeOutCubic for nicer feel
    const ease = 1 - Math.pow(1 - t, 3);
    const value = from + (to - from) * ease;
    onUpdate(value);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (onComplete) onComplete();
    }
  }
  requestAnimationFrame(step);
}

function setOddsTextNumeric(val) {
  // ensure two decimals and append x
  // Round using integer cents for digit-by-digit correctness
  const cents = Math.round(val * 100);
  const s = (cents / 100).toFixed(2) + 'x';
  oddsValueEl.textContent = s;
}

// When Next Game is clicked
nextBtn.addEventListener('click', () => {
  // Show spinner and disable button
  spinner.style.display = 'flex';
  nextBtn.disabled = true;
  nextBtn.style.opacity = '0.75';
  // small simulated "load" time then compute prediction
  // Use current time so the result varies naturally
  setTimeout(() => {
    // compute deterministic target
    const target = computePredictionFromNow(new Date());
    // animate spinner for a short while more
    // animate odds from currentOdds to target
    animateValue(currentOdds, target, 1400, (val) => {
      setOddsTextNumeric(val);
    }, () => {
      // hide spinner & re-enable button
      spinner.style.display = 'none';
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      currentOdds = target;
    });
  }, 800); // brief load-phase
});

// Initialize with a time-based odds so UI isn't empty
(function init() {
  const initial = computePredictionFromNow(new Date());
  currentOdds = initial;
  setOddsTextNumeric(initial);
})();
