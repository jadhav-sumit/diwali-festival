/* ================= CUSTOMIZE YOUR GREETING HERE =================
   Change FAMILY_NAME to your family name.
   You can also change GREETING_TEXT if you want a personal message.
*/
const FAMILY_NAME = "Your Family";
const GREETING_TEXT = "May this Diwali fill your home with happiness, your heart with love, and your life with endless success. Wishing you and your family a bright, beautiful, and prosperous Diwali!";

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const scenes = {
    welcome: $("#welcomeScene"),
    fireworks: $("#fireworksScene"),
    family: $("#familyScene"),
    final: $("#finalScene")
  };
  const audio = $("#diwaliAudio");
  const audioStatus = $("#audioStatus");
  const muteButton = $("#muteButton");
  const speakerIcon = $("#speakerIcon");
  const shareStatus = $("#shareStatus");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let currentScene = "welcome";
  let transitionTimer = null;
  let audioStarted = false;
  let userMuted = false;
  let shareStatusTimer = null;

  $("#familyNameText").textContent = FAMILY_NAME;
  $("#finalFamilyName").textContent = FAMILY_NAME;
  $("#familyGreeting").textContent = GREETING_TEXT;
  $("#finalGreeting").textContent = GREETING_TEXT;

  function setupPhoto(img) {
    const fallback = img.parentElement.querySelector(".photo-fallback");
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
  setupPhoto($("#finalFamilyPhoto"));

  function showScene(name) {
    Object.entries(scenes).forEach(([key, scene]) => {
      const active = key === name;
      scene.hidden = !active;
      scene.classList.toggle("active", active);
      scene.setAttribute("aria-hidden", String(!active));
    });
    currentScene = name;
    if (name === "fireworks") fireworks.start();
    else fireworks.stop();
    if (name === "family") {
      $("#familyTitle").focus?.({ preventScroll: true });
    }
  }

  function setAudioStatus(message) {
    audioStatus.textContent = message;
    audioStatus.title = message;
  }
  function updateMuteButton() {
    audio.muted = userMuted;
    speakerIcon.textContent = userMuted ? "🔇" : "🔊";
    muteButton.setAttribute("aria-label", userMuted ? "Unmute music" : "Mute music");
    muteButton.setAttribute("aria-pressed", String(userMuted));
  }
  async function startMusic() {
    if (!audio || audioStarted) return;
    audio.loop = true;
    audio.muted = userMuted;
    try {
      await audio.play();
      audioStarted = true;
      setAudioStatus(userMuted ? "Music muted" : "Diwali music is playing");
    } catch (error) {
      setAudioStatus("Tap the speaker to try playing music");
      // Missing or unsupported audio should never stop the greeting.
    }
  }
  muteButton.addEventListener("click", async () => {
    userMuted = !userMuted;
    updateMuteButton();
    if (!audioStarted && !userMuted) {
      try {
        await audio.play();
        audioStarted = true;
        setAudioStatus("Diwali music is playing");
      } catch (error) {
        setAudioStatus("Add assets/diwali-music.mp3 to play music");
      }
    } else {
      setAudioStatus(userMuted ? "Music muted" : "Diwali music is playing");
    }
  });
  audio.addEventListener("error", () => {
    setAudioStatus("Add assets/diwali-music.mp3 to play music");
  });
  audio.addEventListener("playing", () => {
    if (!userMuted) setAudioStatus("Diwali music is playing");
  });

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
    if (reduceMotion.matches) {
      transitionTimer = window.setTimeout(showFamily, 1200);
    } else {
      transitionTimer = window.setTimeout(showFamily, 6500);
    }
  }
  function showFamily() {
    clearTransition();
    showScene("family");
  }
  function showFinal() {
    clearTransition();
    showScene("final");
  }
  function replay() {
    clearTransition();
    shareStatus.textContent = "";
    showScene("welcome");
    // Music intentionally keeps playing; replay never calls play() again.
  }

  $("#openSurpriseButton").addEventListener("click", openSurprise);
  $("#skipAnimationButton").addEventListener("click", showFamily);
  $("#continueButton").addEventListener("click", showFinal);
  $("#replayButton").addEventListener("click", replay);
  $("#homeLink").addEventListener("click", (event) => {
    event.preventDefault();
    replay();
  });

  async function shareGreeting() {
    const shareData = {
      title: "A Little Diwali Surprise",
      text: "Wishing you and your family a bright, beautiful, and prosperous Diwali! ✨🪔",
      url: window.location.href
    };
    shareStatus.textContent = "";
    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        shareStatus.textContent = "Thanks for sharing the Diwali love! ✨";
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
        // If native share fails, try the copy-link fallback.
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
        if (!copied) throw new Error("Copy command failed");
      }
      shareStatus.textContent = "Link copied! Send it to your friends and family. ✨";
    } catch (error) {
      shareStatus.textContent = "Copy this link from your browser address bar to share the greeting.";
    }
    if (shareStatusTimer !== null) window.clearTimeout(shareStatusTimer);
    shareStatusTimer = window.setTimeout(() => { shareStatus.textContent = ""; }, 6500);
  }
  $("#shareButton").addEventListener("click", shareGreeting);

  // Lightweight canvas fireworks. One animation loop maximum; it pauses while hidden.
  const canvas = $("#fireworksCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const fireworks = (() => {
    let width = 0, height = 0, rafId = null, lastSpawn = 0;
    let particles = [];
    const colors = ["#ffd477", "#ff8d45", "#ff5478", "#a78bfa", "#7ce7d2", "#fff0b0"];
    const maxParticles = () => window.innerWidth < 400 ? 110 : 220;
    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.7);

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
    function burst(x, y, count) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count && particles.length < maxParticles(); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.2 + .5;
        particles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 45 + Math.random() * 40, maxLife: 85, size: Math.random() * 2 + .6,
          color, gravity: .025 + Math.random() * .035
        });
      }
    }
    function frame(time) {
      rafId = null;
      if (document.hidden || currentScene !== "fireworks") return;
      ctx.clearRect(0, 0, width, height);
      if (!reduceMotion.matches && time - lastSpawn > 520) {
        burst(width * (.14 + Math.random() * .72), height * (.12 + Math.random() * .43), width < 400 ? 15 : 24);
        lastSpawn = time;
      }
      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= .988; p.life--;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 9;
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
      lastSpawn = 0;
      if (!reduceMotion.matches) {
        burst(width * .5, height * .26, width < 400 ? 18 : 32);
        rafId = window.requestAnimationFrame(frame);
      }
    }
    function stop() {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, width, height);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (currentScene === "fireworks") start();
    });
    window.addEventListener("resize", () => {
      resize();
      if (currentScene === "fireworks" && !document.hidden && rafId === null && !reduceMotion.matches) {
        rafId = window.requestAnimationFrame(frame);
      }
    });
    return { start, stop };
  })();

  updateMuteButton();
  showScene("welcome");
})();
