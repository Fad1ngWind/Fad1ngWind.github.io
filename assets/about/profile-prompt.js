(() => {
  const output = document.querySelector("[data-profile-prompt]");
  const template = document.querySelector("[data-profile-prompt-lines]");
  const toggle = document.querySelector("[data-profile-prompt-toggle]");

  if (!output || !template || !toggle) return;

  const firstLine = output.textContent.trim();
  const lines = [firstLine, ...Array.from(template.content.querySelectorAll("code"), (item) => item.textContent.trim())]
    .filter(Boolean);
  if (lines.length < 2) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let length = lines[0].length;
  let deleting = true;
  let paused = false;
  let timer;

  function schedule(delay) {
    timer = window.setTimeout(type, delay);
  }

  function showFullLine() {
    length = lines[current].length;
    output.textContent = lines[current];
    deleting = true;
  }

  function type() {
    length += deleting ? -1 : 1;
    output.textContent = lines[current].slice(0, length);

    if (deleting && length === 0) {
      current = (current + 1) % lines.length;
      deleting = false;
      schedule(160);
    } else if (!deleting && length === lines[current].length) {
      deleting = true;
      schedule(2400);
    } else {
      schedule(deleting ? 16 : 34);
    }
  }

  function applyMotionPreference() {
    window.clearTimeout(timer);
    toggle.hidden = reducedMotion.matches;

    if (reducedMotion.matches) {
      current = 0;
      showFullLine();
    } else if (!paused) {
      schedule(2400);
    }
  }

  toggle.addEventListener("click", () => {
    window.clearTimeout(timer);
    paused = !paused;
    const label = paused ? "Resume typing animation" : "Pause typing animation";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;

    if (paused) {
      showFullLine();
    } else {
      schedule(900);
    }
  });

  reducedMotion.addEventListener("change", applyMotionPreference);
  applyMotionPreference();
})();
