
onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(c);
  }, 1000);

  generateStars();
  generatePetals();
  initValentineCard();
};

const AudioEngine = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  play(type) {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      const now = this.ctx.currentTime;
      if (type === 'open') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(freq, now + i * 0.1);
          g.gain.setValueAtTime(0.1, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
          o.connect(g); g.connect(this.ctx.destination);
          o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.5);
        });
      }
    } catch (e) { console.error("Audio error:", e); }
  }
};

function initValentineCard() {
  const card = document.getElementById("valentine-card");
  const yesBtn = document.getElementById("yes-btn");
  const noBtn = document.getElementById("no-btn");
  const question = document.getElementById("valentine-question");
  const openBtn = document.getElementById("open-btn");
  const envelope = document.querySelector(".envelope");

  const letterText = document.getElementById("letter-text");
  const nextPageBtn = document.getElementById("next-page-btn");
  const letterContainer = document.getElementById("letter-container");
  const questionContainer = document.getElementById("question-container");

  const pages = [
    "Dani... 🌸",
    "Te tengo que decir algo muy importante... ✨",
    "Pero muy muy muy muy importante, de importancia mundial. 💜",
    "Como sabras, no he conocido persona que se bañe tan seguido como tu. 🌻",
    "Pero eso no tiene nada que ver, la pregunta que quiero hacerte es..."
  ];

  let currentPage = 0;
  if (letterText) letterText.innerText = pages[0];

  nextPageBtn.addEventListener("click", () => {
    AudioEngine.play('pop');
    currentPage++;
    if (currentPage < pages.length) {
      letterText.innerText = pages[currentPage];
    } else {
      letterContainer.style.display = "none";
      questionContainer.style.display = "block";
    }
  });

  if (card) {
    card.style.pointerEvents = "none";
    card.style.opacity = "0";
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      AudioEngine.play('open');
      envelope.classList.add("open");
      openBtn.style.display = "none";
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.pointerEvents = "all";
      }, 600);
    });
  }

  const noMessages = ["¿Segura? 🥺", "¡Ples! 👉👈", "¡Te doy un dulce! 🍭", "¡Pero si te quiero mucho! 💔", "¿En serio? 😭", "¡Vuelve a pensarlo! 🧐", "¡Me rindo! 🦄"];
  let noClickCount = 0;

  if (noBtn) {
    noBtn.addEventListener("mouseover", () => {
      moveButton(noBtn);
      spawnAnimal(); // Spawn animal on hover too!
    });

    noBtn.addEventListener("click", () => {
      AudioEngine.play('pop');
      noClickCount++;
      moveButton(noBtn);
      if (noClickCount < noMessages.length) noBtn.innerText = noMessages[noClickCount];
      spawnAnimal();
    });
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      AudioEngine.play('success');
      question.innerText = "¡SABÍA QUE DIRÍAS QUE SÍ! 💖✨";
      card.style.backgroundColor = "rgba(255, 255, 255, 1)";
      yesBtn.style.display = "none";
      noBtn.style.display = "none";

      setTimeout(() => {
        const wrapper = document.getElementById("envelope-wrapper");
        if (wrapper) {
          wrapper.style.opacity = "0"; wrapper.style.pointerEvents = "none"; wrapper.style.transition = "opacity 1s ease";
        }
      }, 3000);
    });
  }
}

function moveButton(btn) {
  // CRITICAL: Append to body to bypass transformed parent offsets
  if (btn.parentElement !== document.body) {
    document.body.appendChild(btn);
  }

  const padding = 50;
  const maxX = window.innerWidth - btn.offsetWidth - padding;
  const maxY = window.innerHeight - btn.offsetHeight - padding;

  const x = Math.max(padding, Math.min(maxX, Math.random() * maxX));
  const y = Math.max(padding, Math.min(maxY, Math.random() * maxY));

  btn.style.position = "fixed";
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
  btn.style.zIndex = "200000";
  btn.classList.add("moving");
  setTimeout(() => btn.classList.remove("moving"), 200);
}

function spawnAnimal() {
  const animals = ["assets/cat.png", "assets/dog.png", "assets/bear.png", "assets/bunny.png"];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const img = document.createElement("img");
  img.src = randomAnimal;
  img.className = "animal-stamp";

  // Spawn in corners/edges to avoid covering the card (center is 25%-75%)
  // Choose left side (5%-20%) or right side (80%-95%)
  const side = Math.random() > 0.5;
  const leftPos = side ? (Math.random() * 15 + 5) : (Math.random() * 15 + 80);
  const topPos = Math.random() * 80 + 10; // 10% to 90% vertical

  img.style.left = `${leftPos}%`;
  img.style.top = `${topPos}%`;

  document.body.appendChild(img);
}


function generateStars() {
  const starsContainer = document.querySelector(".stars");
  const starCount = 150;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`; star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`; star.style.left = `${Math.random() * 100}%`;
    const duration = Math.random() * 3 + 2; star.style.setProperty("--duration", `${duration}s`);
    const colors = ["#ffffff", "#ffe9c4", "#d4fbff"];
    star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    star.style.setProperty("--opacity", Math.random() * 0.7 + 0.3);
    star.style.animationDelay = `${Math.random() * 5}s`;
    starsContainer.appendChild(star);
  }
}

function generatePetals() {
  const petalsContainer = document.querySelector(".petals");
  const petalCount = 20;
  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    const size = Math.random() * 15 + 10;
    petal.style.width = `${size}px`; petal.style.height = `${size}px`;
    petal.style.left = `${Math.random() * 100}%`;
    const duration = Math.random() * 5 + 10; petal.style.setProperty("--duration", `${duration}s`);
    petal.style.setProperty("--drift", `${(Math.random() - 0.5) * 400}px`);
    petal.style.animationDelay = `${Math.random() * 10}s`;
    petalsContainer.appendChild(petal);
  }
}
