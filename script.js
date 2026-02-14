const proposalScreen = document.getElementById('proposal-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const yesButton = document.getElementById('yes-btn');
const noButton = document.getElementById('no-btn');
const noMessage = document.getElementById('no-message');
const canvas = document.getElementById('heart-canvas');
const finalHeart = document.getElementById('final-heart');

const noLines = [
  'Naprawdę? 😢 Spróbuj jeszcze raz…',
  'Magdo, moje serce mówi „Tak”! 💞',
  'Nie przyjmuję tej odpowiedzi 😄',
  'Daj szansę miłości 🥹❤️',
];

let noIndex = 0;
let noScale = 1;

noButton.addEventListener('click', () => {
  noMessage.textContent = noLines[noIndex % noLines.length];
  noIndex += 1;

  noScale = Math.min(1.7, noScale + 0.08);
  yesButton.style.transform = `scale(${noScale})`;
  yesButton.style.boxShadow = `0 ${12 + noIndex * 2}px ${26 + noIndex * 3}px rgba(255, 63, 132, 0.45)`;

  if (noIndex >= 5) {
    noButton.style.opacity = '0.5';
    noButton.textContent = 'No dobra... 😅';
  }
});

yesButton.addEventListener('click', () => {
  proposalScreen.classList.remove('visible');
  celebrationScreen.classList.add('visible');
  startCelebration();
});

function startCelebration() {
  const context = canvas.getContext('2d');
  const heartParticles = [];
  const totalParticles = Math.min(1500, Math.round((window.innerWidth * window.innerHeight) / 550));
  let animationStart = 0;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function heartPosition(progress, size) {
    const t = progress * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    return {
      x: window.innerWidth / 2 + x * size,
      y: window.innerHeight / 2 - y * size,
    };
  }

  for (let i = 0; i < totalParticles; i += 1) {
    const orbitProgress = Math.random();
    const target = heartPosition(orbitProgress, Math.min(window.innerWidth, window.innerHeight) / 42);

    heartParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      tx: target.x,
      ty: target.y,
      size: 1 + Math.random() * 2.1,
      alpha: 0.45 + Math.random() * 0.55,
      driftX: -1.5 + Math.random() * 3,
      driftY: -1.5 + Math.random() * 3,
      hueShift: Math.random() * 14,
    });
  }

  function drawHeartDot(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, 0.8);
    ctx.bezierCurveTo(-1.2, -0.6, -1.8, 0.2, 0, 1.8);
    ctx.bezierCurveTo(1.8, 0.2, 1.2, -0.6, 0, 0.8);
    ctx.fill();
    ctx.restore();
  }

  function animate(timestamp) {
    if (!animationStart) animationStart = timestamp;

    const elapsed = timestamp - animationStart;
    const scatterDuration = 2900;
    const mergeDuration = 4200;
    const mergeStart = scatterDuration;
    const mergeProgress = Math.min(1, Math.max(0, (elapsed - mergeStart) / mergeDuration));

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const particle of heartParticles) {
      if (elapsed < scatterDuration) {
        particle.x += particle.driftX;
        particle.y += particle.driftY;

        if (particle.x < -20) particle.x = window.innerWidth + 20;
        if (particle.x > window.innerWidth + 20) particle.x = -20;
        if (particle.y < -20) particle.y = window.innerHeight + 20;
        if (particle.y > window.innerHeight + 20) particle.y = -20;
      } else {
        particle.x += (particle.tx - particle.x) * (0.016 + mergeProgress * 0.065);
        particle.y += (particle.ty - particle.y) * (0.016 + mergeProgress * 0.065);
      }

      const color = `hsl(${340 + particle.hueShift}, 95%, ${63 + particle.hueShift * 0.3}%)`;
      drawHeartDot(context, particle.x, particle.y, particle.size, color, particle.alpha);
    }

    if (mergeProgress > 0.9) {
      finalHeart.classList.add('visible');
    }

    if (elapsed < scatterDuration + mergeDuration + 2200) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}
