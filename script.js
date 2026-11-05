/* ================= CUSTOMIZE YOUR GREETING HERE =================
   Change FAMILY_NAME to your family name.
   You can also change GREETING_TEXT if you want a personal message.
*/
const FAMILY_NAME = "Your Family";
const GREETING_TEXT = "May this Diwali fill your home with happiness, your heart with love, and your life with endless success. Wishing you and your family a bright, beautiful, and prosperous Diwali!";

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  // Scenes
  const scenes = {
    welcome: $("#welcomeScene"),
    fireworks: $("#fireworksScene"),
    celebration: $("#celebrationScene")
  };

  // Audio elements
  const audio = $("#diwaliAudio");
  const audioStatus = $("#audioStatus");
  const muteButton = $("#muteButton");
  const speakerIcon = $("#speakerIcon");

  // Action elements
  const toast = $("#toastNotification");
  const shareStatus = $("#shareStatus");
  const shareButton = $("#shareButton");
  const replayButton = $("#replayButton");
  const homeLink = $("#homeLink");
  const openSurpriseButton = $("#openSurpriseButton");
  const skipAnimationButton = $("#skipAnimationButton");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // State
  let currentScene = "welcome";
  let transitionTimer = null;
  let audioStarted = false;
  let userMuted = false;
  let shareStatusTimer = null;
  let toastTimer = null;

  // Initialize customized greeting text
  $("#familyNameText").textContent = FAMILY_NAME;
  $("#familyGreeting").textContent = GREETING_TEXT;

  // Family photo fallback handling
  function setupPhoto(img) {
    if (!img) return;
    const fallback = img.parentElement ? img.parentElement.querySelector(".photo-fallback") : null;
    if (!fallback) return;

    img.addEventListener("error", () => {
      img.hidden = true;
      fallback.hidden = false;
    });
    img.addEventListener("load", () => {
      img.hidden = false;
      fallback.hidden = true;
    });
    if (img.complete && img.naturalWidth === 0) {
      img.hidden = true;
      fallback.hidden = false;
    }
  }
  setupPhoto($("#familyPhoto"));

  // =========================================================================
  // WEB AUDIO API - REALISTIC CRACKER SOUND SYNTHESIZER
  // =========================================================================
  let webAudioCtx = null;

  function initWebAudio() {
    if (!webAudioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        webAudioCtx = new AudioContextClass();
      }
    }
    if (webAudioCtx && webAudioCtx.state === "suspended") {
      webAudioCtx.resume().catch(() => {});
    }
    return webAudioCtx;
  }

  function playSoundBoom(pitch = 85, duration = 0.45) {
    if (userMuted) return;
    const ctx = initWebAudio();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(pitch * 8, t);
      filter.frequency.exponentialRampToValueAtTime(35, t + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(t);
      whiteNoise.stop(t + duration);

      // Deep sub-bass drop oscillator
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch * 1.6, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + duration * 0.75);

      oscGain.gain.setValueAtTime(0.85, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.75);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration * 0.75);
    } catch (e) {}
  }

  function playSoundRocketWhistle(duration = 0.55) {
    if (userMuted) return;
    const ctx = initWebAudio();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + duration);

      gain.gain.setValueAtTime(0.02, t);
      gain.gain.linearRampToValueAtTime(0.24, t + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  function playSoundCrackle(burstCount = 6) {
    if (userMuted) return;
    const ctx = initWebAudio();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      for (let i = 0; i < burstCount; i++) {
        const offset = t + Math.random() * 0.35;
        const dur = 0.035;
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          output[j] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1900, offset);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25 + Math.random() * 0.2, offset);
        gain.gain.exponentialRampToValueAtTime(0.001, offset + dur);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(offset);
        source.stop(offset + dur);
      }
    } catch (e) {}
  }

  function playSoundLadiPops(count = 10) {
    if (userMuted) return;
    const ctx = initWebAudio();
    if (!ctx) return;
    try {
      const startT = ctx.currentTime;
      for (let i = 0; i < count; i++) {
        const t = startT + i * 0.08 + (Math.random() - 0.5) * 0.02;
        const dur = 0.04;
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          output[j] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(500 + Math.random() * 600, t);
        filter.Q.setValueAtTime(2.2, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(t);
        source.stop(t + dur);
      }
    } catch (e) {}
  }

  // Toast notification
  function showToast(message, duration = 3000) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    if (toastTimer !== null) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, duration);
  }

  // =========================================================================
  // SCENE NAVIGATION
  // =========================================================================
  function showScene(name) {
    Object.entries(scenes).forEach(([key, scene]) => {
      if (!scene) return;
      const active = key === name;
      scene.hidden = !active;
      scene.classList.toggle("active", active);
      scene.setAttribute("aria-hidden", String(!active));
    });
    currentScene = name;

    if (name === "fireworks" || name === "celebration") {
      crackerEngine.start();
    } else {
      crackerEngine.stop();
    }

    if (name === "celebration") {
      $("#celebrationTitle")?.focus?.({ preventScroll: true });
    }
  }

  function setAudioStatus(message) {
    if (!audioStatus) return;
    audioStatus.textContent = message;
    audioStatus.title = message;
  }

  function updateMuteButton() {
    if (audio) audio.muted = userMuted;
    speakerIcon.textContent = userMuted ? "🔇" : "🔊";
    muteButton.setAttribute("aria-label", userMuted ? "Unmute music & crackers" : "Mute music & crackers");
    muteButton.setAttribute("aria-pressed", String(userMuted));
  }

  async function startMusic() {
    initWebAudio();
    if (!audio || audioStarted) return;
    audio.loop = true;
    audio.muted = userMuted;
    try {
      await audio.play();
      audioStarted = true;
      setAudioStatus(userMuted ? "Sound muted" : "Diwali music is playing");
    } catch (error) {
      setAudioStatus("Tap the speaker to play music");
    }
  }

  muteButton.addEventListener("click", async () => {
    userMuted = !userMuted;
    updateMuteButton();
    initWebAudio();
    if (!audioStarted && !userMuted && audio) {
      try {
        await audio.play();
        audioStarted = true;
        setAudioStatus("Diwali music is playing");
      } catch (error) {
        setAudioStatus("Add assets/diwali-music.mp3 to play music");
      }
    } else {
      setAudioStatus(userMuted ? "Sound muted" : "Diwali sound is active");
    }
  });

  if (audio) {
    audio.addEventListener("error", () => {
      setAudioStatus("Add assets/diwali-music.mp3 to play music");
    });
    audio.addEventListener("playing", () => {
      if (!userMuted) setAudioStatus("Diwali music is playing");
    });
  }

  function clearTransition() {
    if (transitionTimer !== null) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }
  }

  function openSurprise() {
    clearTransition();
    startMusic();
    showScene("fireworks");
    // Intense opening cracker show
    crackerEngine.grandOpeningBombs();
    const delay = reduceMotion.matches ? 1200 : 5400;
    transitionTimer = window.setTimeout(showCelebration, delay);
  }

  function showCelebration() {
    clearTransition();
    showScene("celebration");
  }

  function replay() {
    clearTransition();
    if (shareStatus) shareStatus.textContent = "";
    showScene("welcome");
  }

  openSurpriseButton.addEventListener("click", openSurprise);
  skipAnimationButton.addEventListener("click", showCelebration);
  replayButton.addEventListener("click", replay);
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    replay();
  });

  // Sharing
  async function shareGreeting() {
    const shareData = {
      title: "A Little Diwali Surprise ✨",
      text: `Wishing you and your family a bright, prosperous, and joyous Diwali! From ${FAMILY_NAME} Family ✨🪔`,
      url: window.location.href
    };
    if (shareStatus) shareStatus.textContent = "";

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        if (shareStatus) shareStatus.textContent = "Thanks for sharing the Diwali love! ✨";
        showToast("Thanks for sharing Diwali wishes! ✨");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
      } else {
        const field = document.createElement("textarea");
        field.value = shareData.url;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy failed");
      }
      if (shareStatus) shareStatus.textContent = "Link copied! Send it to your loved ones. ✨";
      showToast("Link copied to clipboard! 📋✨");
    } catch (error) {
      if (shareStatus) shareStatus.textContent = "Copy this link from your browser address bar to share.";
      showToast("Copy URL from address bar to share.");
    }

    if (shareStatusTimer !== null) window.clearTimeout(shareStatusTimer);
    shareStatusTimer = window.setTimeout(() => {
      if (shareStatus) shareStatus.textContent = "";
    }, 6500);
  }
  shareButton.addEventListener("click", shareGreeting);

  // =========================================================================
  // SPECTACULAR CRACKER ANIMATION ENGINE (Canvas 2D Particle System)
  // =========================================================================
  const canvas = $("#fireworksCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const crackerEngine = (() => {
    let width = 0;
    let height = 0;
    let rafId = null;
    let lastAutoSpawn = 0;
    let lastAnarSpawn = 0;
    let lastChakriSpawn = 0;

    let particles = [];
    let rockets = [];
    let anars = [];
    let chakris = [];
    let flashIntensity = 0;

    // Vibrant festive color palettes
    const paletteGold = ["#ffd477", "#fff0b0", "#ffc35c", "#ff994d", "#ffffff"];
    const palettePeony = [
      "#ff3366", "#38bdf8", "#ffd477", "#a855f7",
      "#22c55e", "#ff8800", "#fff0b0", "#f43f5e"
    ];
    const paletteWillow = ["#ffd477", "#ffe599", "#fff2b2", "#ffb84d"];
    const paletteEmerald = ["#22c55e", "#4ade80", "#86efac", "#ffd477"];
    const paletteRuby = ["#ff3366", "#f43f5e", "#fb7185", "#ffd477"];

    const maxParticles = () => (window.innerWidth < 480 ? 280 : 550);
    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.6);

    function resize() {
      const dpr = pixelRatio();
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // 1. ROCKET CRACKER (Ascending with glowing sparks, exploding into varied shell types)
    function launchRocket(targetX, targetY, shellType = "random") {
      const startX = targetX !== undefined ? targetX : width * (0.15 + Math.random() * 0.7);
      const startY = height + 10;
      const endY = targetY !== undefined ? targetY : height * (0.12 + Math.random() * 0.38);

      const dy = startY - endY;
      const vy = -Math.max(7.5, Math.sqrt(dy * 0.44) + Math.random() * 2);
      const vx = (Math.random() - 0.5) * 2;

      const types = ["peony", "willow", "ring", "sparkler", "crackle"];
      const actualType = shellType === "random" ? types[Math.floor(Math.random() * types.length)] : shellType;

      rockets.push({
        x: startX,
        y: startY,
        vx,
        vy,
        targetY: endY,
        shellType: actualType,
        color: paletteGold[Math.floor(Math.random() * paletteGold.length)]
      });

      playSoundRocketWhistle(0.5);
    }

    // 2. DETONATE CRACKER SHELL AT (X, Y)
    function detonateShell(x, y, shellType = "peony") {
      flashIntensity = Math.min(0.25, flashIntensity + 0.15);

      switch (shellType) {
        case "willow": {
          // Cascading golden willow tree
          const count = width < 480 ? 45 : 85;
          for (let i = 0; i < count && particles.length < maxParticles(); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4.2 + 0.8;
            particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1.2,
              life: 65 + Math.random() * 45,
              maxLife: 110,
              size: Math.random() * 2 + 1,
              color: paletteWillow[Math.floor(Math.random() * paletteWillow.length)],
              gravity: 0.055, // heavier gravity gives weeping willow look
              drag: 0.98,
              twinkle: true
            });
          }
          playSoundBoom(70, 0.5);
          playSoundCrackle(6);
          break;
        }

        case "ring": {
          // Expanding concentric ring
          const count = width < 480 ? 32 : 55;
          const ringColor = palettePeony[Math.floor(Math.random() * palettePeony.length)];
          for (let i = 0; i < count && particles.length < maxParticles(); i++) {
            const angle = (i * Math.PI * 2) / count;
            const speed = 3.6 + Math.random() * 0.4;
            particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 45 + Math.random() * 25,
              maxLife: 70,
              size: Math.random() * 2.2 + 1.2,
              color: ringColor,
              gravity: 0.035,
              drag: 0.985,
              twinkle: false
            });
          }
          // Core sparks
          for (let k = 0; k < 15; k++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5;
            particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 40,
              maxLife: 40,
              size: 2,
              color: "#fff0b0",
              gravity: 0.03,
              drag: 0.98,
              twinkle: true
            });
          }
          playSoundBoom(95, 0.45);
          break;
        }

        case "crackle": {
          // Crackling palm with secondary pops
          const count = width < 480 ? 35 : 65;
          for (let i = 0; i < count && particles.length < maxParticles(); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4.8 + 1;
            particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 40 + Math.random() * 30,
              maxLife: 70,
              size: Math.random() * 2 + 1.2,
              color: paletteGold[Math.floor(Math.random() * paletteGold.length)],
              gravity: 0.04,
              drag: 0.982,
              twinkle: true,
              crackleOnDeath: true
            });
          }
          playSoundBoom(85, 0.4);
          playSoundCrackle(10);
          break;
        }

        case "sparkler": {
          // Intense glittering starburst
          const count = width < 480 ? 40 : 75;
          for (let i = 0; i < count && particles.length < maxParticles(); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5.5 + 1.5;
            particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 25 + Math.random() * 25,
              maxLife: 50,
              size: Math.random() * 2.2 + 0.8,
              color: Math.random() > 0.4 ? "#fff0b0" : "#ffd477",
              gravity: 0.045,
              drag: 0.96,
              twinkle: true
            });
          }
          playSoundCrackle(7);
          playSoundBoom(110, 0.3);
          break;
        }

        case "peony":
        default: {
          // Classic colorful spherical burst
          const count = width < 480 ? 45 : 85;
          const colorSet = [palettePeony, paletteEmerald, paletteRuby][Math.floor(Math.random() * 3)];
          const leadColor = colorSet[Math.floor(Math.random() * colorSet.length)];
          for (let i = 0; i < count && particles.length < maxParticles(); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4.4 + 0.8;
            particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 45 + Math.random() * 40,
              maxLife: 85,
              size: Math.random() * 2.3 + 0.9,
              color: Math.random() > 0.3 ? leadColor : colorSet[Math.floor(Math.random() * colorSet.length)],
              gravity: 0.038,
              drag: 0.984,
              twinkle: Math.random() > 0.4
            });
          }
          playSoundBoom(80, 0.5);
          break;
        }
      }
    }

    // 3. ANAR / FLOWERPOT FOUNTAIN (Shoots tall streams of golden sparks upward)
    function triggerAnar(posX, posY, durationFrames = 95) {
      const x = posX !== undefined ? posX : (Math.random() > 0.5 ? width * 0.12 : width * 0.88);
      const y = posY !== undefined ? posY : height - 15;

      anars.push({
        x,
        y,
        framesLeft: durationFrames,
        totalFrames: durationFrames,
        color: paletteGold
      });

      playSoundCrackle(8);
      playSoundBoom(120, 0.25);
    }

    // 4. CHAKRI / GROUND SPINNER (Spinning spiral wheel of fire)
    function triggerChakri(posX, posY) {
      const x = posX !== undefined ? posX : (width * (0.25 + Math.random() * 0.5));
      const y = posY !== undefined ? posY : height - 35;

      chakris.push({
        x,
        y,
        angle: 0,
        spinSpeed: 0.32,
        framesLeft: 85,
        color: ["#ffd477", "#22c55e", "#ff3366", "#38bdf8"][Math.floor(Math.random() * 4)]
      });

      playSoundCrackle(6);
    }

    // 5. RAPID LADI POP CHAIN
    function triggerLadi(posX, posY) {
      const startX = posX !== undefined ? posX : width * (0.3 + Math.random() * 0.4);
      const startY = posY !== undefined ? posY : height * (0.55 + Math.random() * 0.25);

      const popCount = 12;
      for (let i = 0; i < popCount; i++) {
        window.setTimeout(() => {
          const ox = startX + (Math.random() - 0.5) * 40;
          const oy = startY + i * 12 + (Math.random() - 0.5) * 8;
          detonateShell(ox, oy, "sparkler");

          // Red paper confetti flakes
          for (let c = 0; c < 3; c++) {
            particles.push({
              x: ox,
              y: oy,
              vx: (Math.random() - 0.5) * 2,
              vy: Math.random() * -1.5,
              life: 50 + Math.random() * 25,
              maxLife: 75,
              size: Math.random() * 2.2 + 1.2,
              color: "#ff2222",
              gravity: 0.055,
              drag: 0.97,
              twinkle: false
            });
          }
        }, i * 75);
      }
      playSoundLadiPops(popCount);
    }

    // Opening bomb show when user clicks "Open Your Diwali Surprise"
    function grandOpeningBombs() {
      for (let i = 0; i < 4; i++) {
        window.setTimeout(() => {
          launchRocket(width * (0.2 + i * 0.2), height * (0.16 + (i % 2) * 0.1), "peony");
        }, i * 220);
      }
      window.setTimeout(() => {
        triggerAnar(width * 0.15, height - 15, 110);
        triggerAnar(width * 0.85, height - 15, 110);
      }, 600);
      window.setTimeout(() => {
        launchRocket(width * 0.5, height * 0.18, "willow");
      }, 1400);
    }

    // Main animation loop
    function frame(time) {
      rafId = null;
      if (document.hidden) return;
      if (currentScene !== "fireworks" && currentScene !== "celebration") return;

      ctx.clearRect(0, 0, width, height);

      // Flash illumination glow on canvas
      if (flashIntensity > 0.005) {
        ctx.fillStyle = `rgba(255, 230, 180, ${flashIntensity})`;
        ctx.fillRect(0, 0, width, height);
        flashIntensity *= 0.88;
      }

      // =====================================================================
      // AUTOMATIC CHOREOGRAPHED CRACKER SHOW (Runs constantly in background)
      // =====================================================================
      if (!reduceMotion.matches) {
        const interval = currentScene === "fireworks" ? 480 : 1800;
        if (time - lastAutoSpawn > interval) {
          if (currentScene === "fireworks") {
            launchRocket(
              width * (0.15 + Math.random() * 0.7),
              height * (0.12 + Math.random() * 0.35)
            );
          } else {
            // Diverse background crackers on celebration page
            const roll = Math.random();
            if (roll < 0.55) {
              launchRocket();
            } else if (roll < 0.78) {
              detonateShell(
                width * (0.15 + Math.random() * 0.7),
                height * (0.12 + Math.random() * 0.32),
                "peony"
              );
            } else {
              detonateShell(
                width * (0.2 + Math.random() * 0.6),
                height * (0.15 + Math.random() * 0.28),
                "willow"
              );
            }
          }
          lastAutoSpawn = time;
        }

        // Anar fountains erupting periodically
        if (time - lastAnarSpawn > 6200 && currentScene === "celebration") {
          triggerAnar(width * 0.1, height - 15, 90);
          triggerAnar(width * 0.9, height - 15, 90);
          lastAnarSpawn = time;
        }

        // Ground chakri spinning periodically
        if (time - lastChakriSpawn > 8500 && currentScene === "celebration") {
          triggerChakri(width * (0.3 + Math.random() * 0.4), height - 35);
          lastChakriSpawn = time;
        }
      }

      // 1. UPDATE ROCKETS
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.13; // deceleration

        // Rocket spark & smoke trail
        if (particles.length < maxParticles()) {
          particles.push({
            x: r.x + (Math.random() - 0.5) * 2,
            y: r.y + Math.random() * 4,
            vx: (Math.random() - 0.5) * 0.8,
            vy: Math.random() * 1.5 + 0.6,
            life: 14,
            maxLife: 14,
            size: 1.5,
            color: "#ffc966",
            gravity: 0.04,
            drag: 0.96,
            twinkle: false
          });
        }

        // Rocket glowing head
        ctx.fillStyle = "#fff0b0";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffb74d";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reach apex -> Explode!
        if (r.y <= r.targetY || r.vy >= -0.6) {
          detonateShell(r.x, r.y, r.shellType);
          rockets.splice(i, 1);
        }
      }

      // 2. UPDATE ANARS (Flowerpot Fountains)
      for (let i = anars.length - 1; i >= 0; i--) {
        const a = anars[i];
        a.framesLeft--;

        const intensity = Math.min(1, a.framesLeft / 25);
        const count = Math.floor((width < 480 ? 5 : 10) * intensity);
        for (let s = 0; s < count && particles.length < maxParticles(); s++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
          const speed = Math.random() * 9.2 + 4.5;
          particles.push({
            x: a.x + (Math.random() - 0.5) * 8,
            y: a.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 40 + Math.random() * 35,
            maxLife: 75,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.35 ? "#ffd477" : "#fff0b0",
            gravity: 0.17, // heavy gravity causes graceful fountain arc
            drag: 0.985,
            twinkle: true
          });
        }

        if (a.framesLeft <= 0) {
          anars.splice(i, 1);
        }
      }

      // 3. UPDATE CHAKRIS (Ground Spinners)
      for (let i = chakris.length - 1; i >= 0; i--) {
        const c = chakris[i];
        c.framesLeft--;
        c.angle += c.spinSpeed;

        const count = width < 480 ? 4 : 7;
        for (let k = 0; k < count && particles.length < maxParticles(); k++) {
          const offsetAngle = c.angle + (k * Math.PI * 2) / count;
          const speed = Math.random() * 4.5 + 2.5;
          particles.push({
            x: c.x,
            y: c.y,
            vx: Math.cos(offsetAngle) * speed,
            vy: Math.sin(offsetAngle) * speed,
            life: 25 + Math.random() * 20,
            maxLife: 45,
            size: Math.random() * 2 + 0.9,
            color: c.color,
            gravity: 0.05,
            drag: 0.97,
            twinkle: false
          });
        }

        if (c.framesLeft <= 0) {
          chakris.splice(i, 1);
        }
      }

      // 4. UPDATE PARTICLES
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.life--;

        const progress = Math.max(0, p.life / p.maxLife);
        let alpha = progress;
        if (p.twinkle && Math.random() > 0.35) {
          alpha = Math.max(0.12, alpha * 0.6);
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.twinkle ? 10 : 6;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      rafId = window.requestAnimationFrame(frame);
    }

    function start() {
      stop();
      resize();
      particles = [];
      rockets = [];
      anars = [];
      chakris = [];
      lastAutoSpawn = 0;
      lastAnarSpawn = 0;
      lastChakriSpawn = 0;
      if (!reduceMotion.matches) {
        rafId = window.requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, width, height);
    }

    window.addEventListener("resize", () => {
      resize();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (currentScene === "fireworks" || currentScene === "celebration") start();
    });

    return {
      start,
      stop,
      launchRocket,
      detonateShell,
      triggerAnar,
      triggerChakri,
      triggerLadi,
      grandOpeningBombs
    };
  })();

  // =========================================================================
  // INTERACTIVE TAP / CLICK ANYWHERE TO BURST CRACKERS
  // =========================================================================
  function handlePointerBurst(clientX, clientY) {
    if (currentScene !== "celebration" && currentScene !== "fireworks") return;
    initWebAudio();

    const roll = Math.random();
    if (roll < 0.4) {
      crackerEngine.detonateShell(clientX, clientY, "peony");
    } else if (roll < 0.7) {
      crackerEngine.detonateShell(clientX, clientY, "sparkler");
    } else if (roll < 0.9) {
      crackerEngine.detonateShell(clientX, clientY, "willow");
    } else {
      crackerEngine.launchRocket(clientX, clientY);
    }
  }

  document.addEventListener("pointerdown", (e) => {
    // Ignore interactive element clicks so buttons work as expected
    const interactive = e.target.closest("button, a, input, select, textarea, label, [role='button']");
    if (interactive) return;

    handlePointerBurst(e.clientX, e.clientY);
  });

  // Optional: subtle sparkler trail when dragging across screen
  let lastDragTime = 0;
  document.addEventListener("pointermove", (e) => {
    if (e.buttons === 1) {
      const now = Date.now();
      if (now - lastDragTime > 85) {
        lastDragTime = now;
        if (currentScene === "celebration") {
          crackerEngine.detonateShell(e.clientX, e.clientY, "sparkler");
        }
      }
    }
  });

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  updateMuteButton();
  showScene("welcome");
})();