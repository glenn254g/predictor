// Elements
const timeDisplay = document.getElementById('timeDisplay');
const nextBtn = document.getElementById('nextBtn');
const spinner = document.getElementById('spinner');
const oddsValueEl = document.getElementById('oddsValue');
const predictTimeEl = document.getElementById('predictTime');

let currentOdds = 0;

// Format time (same style as your top bar)
function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2,"0")} ${ampm}`;
}

// Top bar real time
function updateClock() {
  timeDisplay.textContent = formatTime(new Date());
}
setInterval(updateClock, 1000);
updateClock();

// Predictor time = REAL TIME + 5 minutes
function updatePredictTime() {
  let d = new Date();
  d.setMinutes(d.getMinutes() + 5);
  predictTimeEl.textContent = formatTime(d);
}
setInterval(updatePredictTime, 1000);
updatePredictTime();


// NEW RANDOM ODDS GENERATION
function computePrediction() {
  const r = Math.random();

  // 90% → 30–74.45
  if (r < 0.9) {
    const val = 30 + Math.random() * (74.45 - 30);
    return Math.round(val * 100) / 100;
  }

  // 10% → 74.45–500
  const val = 74.45 + Math.random() * (500 - 74.45);
  return Math.round(val * 100) / 100;
}


// Animation engine (kept as-is)
function animateValue(from, to, duration = 1200, onUpdate, onComplete) {
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const value = from + (to - from) * ease;
    onUpdate(value);
    if (t < 1) requestAnimationFrame(step);
    else if (onComplete) onComplete();
  }
  requestAnimationFrame(step);
}

function setOdds(val) {
  oddsValueEl.textContent = val.toFixed(2) + "x";
}


// NEXT GAME button
nextBtn.addEventListener('click', () => {
  spinner.style.display = "flex";
  nextBtn.disabled = true;
  nextBtn.style.opacity = "0.7";

  setTimeout(() => {
    const target = computePrediction();

    animateValue(currentOdds, target, 1400, (val) => {
      setOdds(val);
    }, () => {
      spinner.style.display = "none";
      nextBtn.disabled = false;
      nextBtn.style.opacity = "1";
      currentOdds = target;
    });

  }, 700);
});


// Initial value
(function init(){
  const first = computePrediction();
  currentOdds = first;
  setOdds(first);
})();
