// ===================================================
// GLAZE AI (ഗ്ലേസ് AI) - INTERACTIVE ENGINE
// Over-The-Top Malayalam Praising & Meme Generator
// ===================================================

(function () {
  'use strict';

  // State
  let currentImageSrc = null;
  let currentGlazeData = null;
  let activeCategory = 'cinema_star';
  let isScanning = false;
  let webcamStream = null;

  // DOM Elements
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const previewContainer = document.getElementById('preview-container');
  const previewImg = document.getElementById('preview-img');
  const scannerOverlay = document.getElementById('scanner-overlay');
  const scanStatusText = document.getElementById('scan-status-text');
  
  const startScanBtn = document.getElementById('start-scan-btn');
  const resetBtn = document.getElementById('reset-btn');
  const webcamBtn = document.getElementById('webcam-btn');
  const webcamView = document.getElementById('webcam-view');
  const cameraVideo = document.getElementById('camera-video');
  const snapBtn = document.getElementById('snap-btn');
  const closeCamBtn = document.getElementById('close-cam-btn');

  // Mode buttons
  const modeButtons = document.querySelectorAll('.mode-btn');

  // Result elements
  const welcomeBox = document.getElementById('welcome-glaze-box');
  const glazeActiveContent = document.getElementById('glaze-content-active');
  const astonishText = document.getElementById('astonish-text');
  const celebDialogue = document.getElementById('celeb-dialogue');
  const celebTag = document.getElementById('celeb-tag');
  const royalTitlePill = document.getElementById('royal-title-pill');
  const warningText = document.getElementById('warning-text');
  const trollSpeaker = document.getElementById('troll-speaker');
  const trollQuote = document.getElementById('troll-quote');
  const metricsGrid = document.getElementById('metrics-grid');

  // Action buttons
  const reGlazeBtn = document.getElementById('re-glaze-btn');
  const downloadCardBtn = document.getElementById('download-card-btn');
  const ttsBtn = document.getElementById('tts-btn');
  const soundBtns = document.querySelectorAll('.sound-btn[data-sound]');
  const toastNotice = document.getElementById('toast-notice');

  // Confetti Canvas
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  // Preset chips
  const presetChips = document.querySelectorAll('.preset-chip');

  // ==========================================
  // 1. SOUND GENERATOR (Web Audio API)
  // No external mp3 files needed, 100% reliable
  // ==========================================
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playShutter() {
      this.init();
      if (!this.ctx) return;
      // White noise burst for camera shutter
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      noise.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    },

    playFanfare() {
      this.init();
      if (!this.ctx) return;
      // Cheerful arpeggio chord (C, E, G, High C)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + index * 0.09;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    },

    playLaughCheer() {
      this.init();
      if (!this.ctx) return;
      // Playful comedic bouncy pitches
      const freqs = [350, 420, 320, 480, 260, 520];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.1);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.13);
      });
    },

    playMassPunch() {
      this.init();
      if (!this.ctx) return;
      // Heavy cinema bass drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    }
  };

  // ==========================================
  // 2. CONFETTI CELEBRATION
  // ==========================================
  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  function triggerConfetti() {
    confettiParticles = [];
    const colors = ['#d10d96ff', '#FF1E76', '#f500ccff', '#03afffff', '#d63939ff'];
    for (let i = 0; i < 90; i++) {
      confettiParticles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rot += p.rotSpeed;
      p.alpha -= 0.008;

      if (p.alpha > 0) {
        alive = true;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rot * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.globalAlpha = Math.max(0, p.alpha);
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        confettiCtx.restore();
      }
    });

    if (alive) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // ==========================================
  // 3. TOAST NOTIFICATION HELPER
  // ==========================================
  let toastTimer = null;
  function showToast(msg) {
    if (!toastNotice) return;
    toastNotice.textContent = msg;
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3200);
  }

  // ==========================================
  // 4. IMAGE UPLOAD & PREVIEW
  // ==========================================
  function setImage(src) {
    currentImageSrc = src;
    previewImg.src = src;
    uploadZone.style.display = 'none';
    previewContainer.classList.add('active');
    startScanBtn.disabled = false;
    showToast('ഫോട്ടോ റെഡിയായി! ഇനി "സ്കാൻ ചെയ്തു സുഖിപ്പിക്കൂ" അമർത്തു! 🔥');
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Drag & drop
  ['dragenter', 'dragover'].forEach(name => {
    uploadZone.addEventListener(name, (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    uploadZone.addEventListener(name, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    });
  });
  uploadZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Preset chips click
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const src = chip.getAttribute('data-img');
      setImage(src);
    });
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    currentImageSrc = null;
    currentGlazeData = null;
    previewContainer.classList.remove('active');
    uploadZone.style.display = 'flex';
    fileInput.value = '';
    startScanBtn.disabled = true;
    welcomeBox.style.display = 'block';
    glazeActiveContent.classList.remove('visible');
    stopWebcam();
    showToast('പുതിയ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാം!');
  });

  // ==========================================
  // 5. WEBCAM SELFIE CAPTURE
  // ==========================================
  webcamBtn.addEventListener('click', async () => {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      cameraVideo.srcObject = webcamStream;
      webcamView.style.display = 'block';
      uploadZone.style.display = 'none';
      previewContainer.classList.remove('active');
    } catch (err) {
      alert('ക്യാമറ ആക്സസ് ചെയ്യാൻ സാധിച്ചില്ല. ഫോട്ടോ അപ്‌ലോഡ് ചെയ്തു നോക്കൂ.');
    }
  });

  snapBtn.addEventListener('click', () => {
    AudioEngine.playShutter();
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cameraVideo.videoWidth || 640;
    tempCanvas.height = cameraVideo.videoHeight || 480;
    const ctx = tempCanvas.getContext('2d');
    // Mirror snapshot to match selfie
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(cameraVideo, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
    stopWebcam();
    setImage(dataUrl);
  });

  closeCamBtn.addEventListener('click', () => {
    stopWebcam();
    if (!currentImageSrc) {
      uploadZone.style.display = 'flex';
    } else {
      previewContainer.classList.add('active');
    }
  });

  function stopWebcam() {
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      webcamStream = null;
    }
    webcamView.style.display = 'none';
  }

  // ==========================================
  // 6. CATEGORY MODE SELECTION
  // ==========================================
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-mode');
      if (currentGlazeData) {
        generateAndDisplayGlaze();
      }
    });
  });

  // ==========================================
  // 7. AI SCANNER & GLAZE GENERATOR
  // ==========================================
  startScanBtn.addEventListener('click', () => {
    if (!currentImageSrc || isScanning) return;
    runScanSimulation();
  });

  reGlazeBtn.addEventListener('click', () => {
    if (!currentImageSrc) return;
    AudioEngine.playFanfare();
    generateAndDisplayGlaze();
    triggerConfetti();
    showToast('🔥 പുതിയ അമിത സുഖിപ്പിക്കൽ റെഡിയായി!');
  });

  function runScanSimulation() {
    isScanning = true;
    scannerOverlay.classList.add('scanning');
    startScanBtn.disabled = true;

    AudioEngine.playShutter();

    const scanSteps = [
      "ഫേസ് ഡിറ്റക്ഷൻ ആരംഭിച്ചു...",
      "സൗന്ദര്യ മീറ്റർ പരിശോധിക്കുന്നു...",
      "ഐശ്വര്യാ റായ് ജെലസി ഇൻഡക്സ് കണക്കാക്കുന്നു...",
      "അമിത മൊഞ്ച് രേഖപ്പെടുത്തി! മീറ്റർ പൊട്ടി! 💥"
    ];

    let stepIndex = 0;
    scanStatusText.textContent = scanSteps[stepIndex];

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < scanSteps.length) {
        scanStatusText.textContent = scanSteps[stepIndex];
      }
    }, 600);

    setTimeout(() => {
      clearInterval(stepInterval);
      scannerOverlay.classList.remove('scanning');
      isScanning = false;
      startScanBtn.disabled = false;

      AudioEngine.playFanfare();
      AudioEngine.playMassPunch();
      triggerConfetti();
      generateAndDisplayGlaze();
      showToast('🎉 സ്കാനിംഗ് പൂർത്തിയായി! മൊഞ്ച് കണ്ടു സ്തംഭിച്ചു!');
    }, 2400);
  }

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateAndDisplayGlaze() {
    const db = window.GLAZE_DATABASE;
    if (!db) return;

    // Pick elements
    const astonish = getRandomItem(db.astonishments);
    const celeb = getRandomItem(db.celebrityComparisons);
    const warning = getRandomItem(db.warnings);
    const troll = getRandomItem(db.trollQuotes);
    const royalTitle = getRandomItem(db.royalTitles);

    // Pick category quote if available
    let categoryDialogue = "";
    if (db.categories[activeCategory]) {
      categoryDialogue = getRandomItem(db.categories[activeCategory]);
    }

    currentGlazeData = {
      astonish,
      celeb,
      warning,
      troll,
      royalTitle,
      categoryDialogue,
      timestamp: new Date().toLocaleTimeString('ml-IN')
    };

    // Update UI
    astonishText.textContent = astonish;
    celebDialogue.textContent = celeb.dialogue + (categoryDialogue ? " " + categoryDialogue : "");
    celebTag.textContent = celeb.tag;
    royalTitlePill.textContent = royalTitle;
    warningText.textContent = warning;
    trollSpeaker.textContent = "🎙️ " + troll.speaker + " (" + troll.movie + ")";
    trollQuote.textContent = `"${troll.quote}"`;

    // Render Metrics
    renderMetrics(db.metrics);

    // Switch panels
    welcomeBox.style.display = 'none';
    glazeActiveContent.classList.add('visible');

    // Scroll smoothly to results if on mobile
    if (window.innerWidth <= 768) {
      glazeActiveContent.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function renderMetrics(metricsList) {
    metricsGrid.innerHTML = '';
    // Shuffle and pick 3-4 metrics
    const shuffled = [...metricsList].sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffled.forEach(m => {
      const card = document.createElement('div');
      card.className = 'metric-card';
      card.innerHTML = `
        <div class="metric-label">${m.label}</div>
        <div class="metric-val">${m.value}</div>
        <div class="metric-sub">${m.sub}</div>
      `;
      metricsGrid.appendChild(card);
    });
  }

  // ==========================================
  // 8. TEXT-TO-SPEECH (Malayalam / Indian Voice)
  // ==========================================
  ttsBtn.addEventListener('click', () => {
    if (!currentGlazeData) return;
    if (!('speechSynthesis' in window)) {
      alert('നിങ്ങളുടെ ബ്രൗസറിൽ സൗണ്ട് സ്പീച്ച് ലഭ്യമല്ല.');
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare speech text in Malayalam
    const textToSpeak = `${currentGlazeData.astonish}. ${currentGlazeData.celeb.dialogue}. ${currentGlazeData.warning}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Try finding Malayalam or Indian voice
    const voices = window.speechSynthesis.getVoices();
    const mlVoice = voices.find(v => v.lang.includes('ml') || v.lang.includes('ML')) ||
                    voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN')) ||
                    voices[0];

    if (mlVoice) {
      utterance.voice = mlVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    ttsBtn.innerHTML = '🔊 വായിക്കുന്നു...';
    ttsBtn.disabled = true;

    utterance.onend = () => {
      ttsBtn.innerHTML = '🔊 കേൾക്കൂ (Read Aloud)';
      ttsBtn.disabled = false;
    };
    utterance.onerror = () => {
      ttsBtn.innerHTML = '🔊 കേൾക്കൂ (Read Aloud)';
      ttsBtn.disabled = false;
    };

    window.speechSynthesis.speak(utterance);
    showToast('🔊 മലയാളത്തിൽ വായിച്ചു കേൾപ്പിക്കുന്നു...');
  });

  // Soundboard quick buttons
  soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-sound');
      if (type === 'fanfare') AudioEngine.playFanfare();
      if (type === 'cheer') AudioEngine.playLaughCheer();
      if (type === 'mass') AudioEngine.playMassPunch();
      if (type === 'shutter') AudioEngine.playShutter();
    });
  });

  // ==========================================
  // 9. WHATSAPP / INSTAGRAM STATUS CERTIFICATE
  // ==========================================
  downloadCardBtn.addEventListener('click', () => {
    if (!currentImageSrc || !currentGlazeData) return;
    generateGlazeCertificate();
  });

  function generateGlazeCertificate() {
    const certCanvas = document.getElementById('cert-canvas');
    const ctx = certCanvas.getContext('2d');

    // 1080x1350 Instagram / WhatsApp Story format
    const W = 1080;
    const H = 1350;
    certCanvas.width = W;
    certCanvas.height = H;

    // 1. Luxury Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#070911');
    bgGrad.addColorStop(0.5, '#0e1322');
    bgGrad.addColorStop(1, '#1a0d24');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Gold Border
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    ctx.strokeStyle = '#FF1E76';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, W - 90, H - 90);

    // 3. Header Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD166';
    ctx.font = 'bold 38px "Outfit", sans-serif';
    ctx.fillText('GLAZE AI CERTIFIED', W / 2, 110);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 46px "Noto Sans Malayalam", sans-serif';
    ctx.fillText('ഔദ്യോഗിക അതിസുന്ദരൻ / അതിസുന്ദരി പത്രം', W / 2, 175);

    // 4. User Image with Gold Medal Frame
    const imgObj = new Image();
    imgObj.crossOrigin = 'anonymous';
    imgObj.onload = () => {
      const imgSize = 420;
      const imgX = (W - imgSize) / 2;
      const imgY = 220;

      // Draw rounded image
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Aspect ratio crop
      const aspect = imgObj.width / imgObj.height;
      let drawW = imgSize;
      let drawH = imgSize;
      if (aspect > 1) drawW = imgSize * aspect;
      else drawH = imgSize / aspect;

      ctx.drawImage(imgObj, imgX - (drawW - imgSize) / 2, imgY - (drawH - imgSize) / 2, drawW, drawH);
      ctx.restore();

      // Golden ring around image
      ctx.strokeStyle = '#FFB703';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(W / 2, imgY + imgSize / 2, imgSize / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Royal Title Badge
      ctx.fillStyle = '#FF1E76';
      ctx.beginPath();
      ctx.roundRect((W - 680) / 2, 680, 680, 65, 32);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px "Noto Sans Malayalam", sans-serif';
      ctx.fillText(currentGlazeData.royalTitle, W / 2, 724);

      // 6. Astonishment & Dialogue Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, 770, W - 160, 360, 24);
      ctx.fill();
      ctx.stroke();

      // Astonish quote
      ctx.fillStyle = '#FFD166';
      ctx.font = 'bold 36px "Noto Sans Malayalam", sans-serif';
      ctx.fillText(currentGlazeData.astonish, W / 2, 830);

      // Wrap & render celebrity comparison dialogue
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '500 28px "Noto Sans Malayalam", sans-serif';
      wrapText(ctx, currentGlazeData.celeb.dialogue, W / 2, 885, W - 220, 42);

      // Warning Note
      ctx.fillStyle = '#FFA59E';
      ctx.font = 'bold 25px "Noto Sans Malayalam", sans-serif';
      wrapText(ctx, currentGlazeData.warning, W / 2, 1050, W - 220, 36);

      // 7. Footer Stamp
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 24px "Outfit", sans-serif';
      ctx.fillText('⚡ SCANNED & GLAZED BY GLAZE AI • 100% MALAYALAM MEME CERTIFIED', W / 2, 1260);

      // Trigger Download
      const link = document.createElement('a');
      link.download = 'Glaze_AI_Certificate.png';
      link.href = certCanvas.toDataURL('image/png');
      link.click();

      showToast('🎉 വാട്സാപ്പ് സ്റ്റാറ്റസ് കാർഡ് ഡൗൺലോഡ് ആയി!');
    };

    imgObj.src = currentImageSrc;
  }

  // Canvas text wrap helper
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }

})();
