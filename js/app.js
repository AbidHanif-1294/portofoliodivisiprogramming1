// ==========================================
// STATE
// ==========================================
let order = [0, 1, 2];
let activeTab = "perkenalan";
let isAnimating = false;

// foto custom (localStorage)
const PHOTO_LS_PREFIX = "porto_foto_";
const uploadedPhotos = {};
PEOPLE.forEach(p => {
  try {
    const saved = localStorage.getItem(PHOTO_LS_PREFIX + p.name);
    if (saved) uploadedPhotos[p.name] = saved;
  } catch (e) {}
});

// audio custom per track
const AUDIO_LS_PREFIX = "porto_audio_";
const uploadedAudio = {};
function audioKey(ownerName, trackTitle){
  return AUDIO_LS_PREFIX + ownerName + "__" + trackTitle;
}
try {
  for (let i = 0; i < localStorage.length; i++){
    const k = localStorage.key(i);
    if (k && k.startsWith(AUDIO_LS_PREFIX)){
      uploadedAudio[k] = localStorage.getItem(k);
    }
  }
} catch (e) {}

// cover custom per track
const COVER_LS_PREFIX = "porto_cover_";
const uploadedCovers = {};
try {
  for (let i = 0; i < localStorage.length; i++){
    const k = localStorage.key(i);
    if (k && k.startsWith(COVER_LS_PREFIX)){
      uploadedCovers[k] = localStorage.getItem(k);
    }
  }
} catch (e) {}

// ==========================================
// DOM REFS
// ==========================================
const stackEl = document.getElementById("stack");
const dotsEl = document.getElementById("dots");
const tabsEl = document.getElementById("tabs");
const contentEl = document.getElementById("content");
const toastEl = document.getElementById("toast");

const spPlayer = document.getElementById("spPlayer");
const spAudio = document.getElementById("spAudio");
const spPlayerArt = document.getElementById("spPlayerArt");
const spPlayerTitle = document.getElementById("spPlayerTitle");
const spPlayerArtist = document.getElementById("spPlayerArtist");
const spPlayBtn = document.getElementById("spPlayBtn");
const spProgressBar = document.getElementById("spProgressBar");
const spProgressFill = document.getElementById("spProgressFill");
const spCurrent = document.getElementById("spCurrent");
const spDuration = document.getElementById("spDuration");
const spClosePlayer = document.getElementById("spClosePlayer");
const spShuffleBtn = document.getElementById("spShuffleBtn");
const spRepeatBtn = document.getElementById("spRepeatBtn");
const spPrevBtn = document.getElementById("spPrevBtn");
const spNextBtn = document.getElementById("spNextBtn");
const spMuteBtn = document.getElementById("spMuteBtn");
const spVolSlider = document.getElementById("spVolSlider");

// ==========================================
// HELPERS
// ==========================================
function activePerson(){ return PEOPLE[order[0]]; }
function idNumber(i){ return "No. " + String(i + 1).padStart(10, "0"); }
function barcodeNumber(i){ return "89900" + String(i + 1).padStart(8, "0"); }
function photoSrc(p){
  if (uploadedPhotos[p.name]) return uploadedPhotos[p.name];
  return `https://ui-avatars.com/api/?name=${p.photoSeed}`;
}
function fmtTime(sec){
  if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

let toastTimer = null;
function showToast(msg, type = ""){
  toastEl.textContent = msg;
  toastEl.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.className = "toast " + type;
  }, 2600);
}

function resizeImage(file, maxSize = 400, quality = 0.85){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height){
          if (width > maxSize){ height = Math.round(height * (maxSize / width)); width = maxSize; }
        } else {
          if (height > maxSize){ width = Math.round(width * (maxSize / height)); height = maxSize; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        try { resolve(canvas.toDataURL("image/jpeg", quality)); } catch (err){ reject(err); }
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==========================================
// PLAYER STATE
// ==========================================
let currentTrack = null;
let isShuffle = false;
let isRepeat = false;
let volume = 0.7;
let isMuted = false;

// ==========================================
// PLAYER LOGIC
// ==========================================
function openPlayer(track){
  currentTrack = track;
  spPlayerArt.textContent = track.emoji || "♪";
  spPlayerTitle.textContent = track.title;
  spPlayerArtist.textContent = track.artist;
  spPlayer.classList.add("show");

  const key = audioKey(track.ownerName, track.title);
  const src = uploadedAudio[key];
  if (src){
    spAudio.src = src;
    spAudio.play().catch(() => {});
    spPlayBtn.textContent = "⏸";
  } else {
    spAudio.pause();
    spAudio.removeAttribute("src");
    spAudio.load();
    spPlayBtn.textContent = "▶";
    spCurrent.textContent = "0:00";
    spDuration.textContent = track.duration || "0:00";
    spProgressFill.style.width = "0%";
    showToast(`Belum ada file audio untuk "${track.title}" — upload dulu`, "error");
  }

  if (activeTab === "musik"){
    updateNowPlayingUI();
    updateTrackHighlight();
  }
}

function closePlayer(){
  spAudio.pause();
  spPlayer.classList.remove("show");
  currentTrack = null;
}

function togglePlayPause(){
  if (!currentTrack) return;
  const key = audioKey(currentTrack.ownerName, currentTrack.title);
  const src = uploadedAudio[key];
  if (!src){
    showToast("Belum ada file audio untuk track ini. Upload dulu di section Musik.", "error");
    return;
  }
  if (spAudio.src !== src) spAudio.src = src;
  if (spAudio.paused){ spAudio.play(); spPlayBtn.textContent = "⏸"; }
  else { spAudio.pause(); spPlayBtn.textContent = "▶"; }
}

function findNextTrack(direction){
  if (!currentTrack) return null;
  const owner = PEOPLE.find(p => p.name === currentTrack.ownerName);
  if (!owner || !owner.music.playlist.length) return null;
  const list = owner.music.playlist;
  const idx = list.findIndex(t => t.title === currentTrack.title);
  if (idx === -1) return null;
  if (isShuffle && list.length > 1){
    let n = Math.floor(Math.random() * list.length);
    while (n === idx) n = Math.floor(Math.random() * list.length);
    return { ...list[n], ownerName: owner.name };
  }
  const nextIdx = (idx + direction + list.length) % list.length;
  return { ...list[nextIdx], ownerName: owner.name };
}

spPlayBtn.addEventListener("click", togglePlayPause);
spClosePlayer.addEventListener("click", closePlayer);

spPrevBtn.addEventListener("click", () => {
  if (spAudio.currentTime > 3){ spAudio.currentTime = 0; return; }
  const prev = findNextTrack(-1);
  if (prev) openPlayer(prev);
});
spNextBtn.addEventListener("click", () => {
  const next = findNextTrack(1);
  if (next) openPlayer(next);
});

spShuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  spShuffleBtn.classList.toggle("active", isShuffle);
});
spRepeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  spRepeatBtn.classList.toggle("active", isRepeat);
});

spMuteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  spAudio.volume = isMuted ? 0 : volume;
  spMuteBtn.textContent = isMuted ? "🔇" : "🔊";
});
spVolSlider.addEventListener("input", (e) => {
  volume = parseFloat(e.target.value);
  isMuted = false;
  spAudio.volume = volume;
  spMuteBtn.textContent = "🔊";
});

spAudio.addEventListener("timeupdate", () => {
  if (!spAudio.duration) return;
  const pct = (spAudio.currentTime / spAudio.duration) * 100;
  spProgressFill.style.width = pct + "%";
  spCurrent.textContent = fmtTime(spAudio.currentTime);
});
spAudio.addEventListener("loadedmetadata", () => {
  spDuration.textContent = fmtTime(spAudio.duration);
});
spAudio.addEventListener("ended", () => {
  if (isRepeat){
    spAudio.currentTime = 0;
    spAudio.play();
    return;
  }
  const next = findNextTrack(1);
  if (next) openPlayer(next);
  else { spPlayBtn.textContent = "▶"; spProgressFill.style.width = "0%"; }
});

spProgressBar.addEventListener("click", (e) => {
  if (!spAudio.duration) return;
  const rect = spProgressBar.getBoundingClientRect();
  const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  spAudio.currentTime = pct * spAudio.duration;
});

document.addEventListener("keydown", (e) => {
  const tag = (e.target.tagName || "").toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
  if (e.code === "Space" && currentTrack){
    e.preventDefault();
    togglePlayPause();
  }
});

// ==========================================
// STACK CARD
// ==========================================
function cardHTML(p, personIdx){
  const isCustom = !!uploadedPhotos[p.name];
  return `
    <div class="id-no">${idNumber(personIdx)}</div>
    <div class="id-header">ID CARD</div>
    <div class="id-body">
      <div class="id-photo ${isCustom ? "has-custom" : ""}" data-name="${p.name}">
        <img src="${photoSrc(p)}" alt="Foto ${p.name}">
        <button class="id-photo-reset" type="button" title="Reset ke foto default" data-name="${p.name}">✕</button>
        <div class="id-photo-overlay">
          <span class="cam">📷</span>
          <span>KLIK UNTUK GANTI FOTO</span>
        </div>
        <input type="file" accept="image/*">
      </div>
      <div class="id-fields">
        <span class="id-label">NAME</span><span class="id-colon">:</span><span class="id-value">${p.name.toUpperCase()}</span>
        <span class="id-label">KELAS</span><span class="id-colon">:</span><span class="id-value">${p.kelas}</span>
        <span class="id-label">POSISI</span><span class="id-colon">:</span><span class="id-value">${p.role}</span>
      </div>
      <div class="id-barcode">
        <div class="barcode-bars"></div>
        <div class="barcode-num">${barcodeNumber(personIdx)}</div>
      </div>
    </div>
    <div class="id-footer">DIVISI PROGRAMMING &middot; 2026</div>
  `;
}

function renderStack(){
  stackEl.querySelectorAll(".p-card").forEach(el => el.remove());
  const arrowLeft = document.getElementById("prevBtn");

  order.forEach((personIdx, pos) => {
    const p = PEOPLE[personIdx];
    const card = document.createElement("div");
    card.className = `p-card pos-${pos}`;
    card.style.zIndex = 10 - pos;
    card.innerHTML = cardHTML(p, personIdx);

    card.addEventListener("click", (e) => {
      if (e.target.closest(".id-photo")) return;
      if (pos === 0 || pos === 1) flipAdvance();
    });

    const photoEl = card.querySelector(".id-photo");
    if (photoEl){
      const input = photoEl.querySelector("input[type=file]");
      const resetBtn = photoEl.querySelector(".id-photo-reset");

      photoEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target === resetBtn) return;
        if (pos !== 0) return;
        input.click();
      });

      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")){
          showToast("File harus berupa gambar", "error");
          return;
        }
        try {
          const dataUrl = await resizeImage(file, 400, 0.85);
          try {
            localStorage.setItem(PHOTO_LS_PREFIX + p.name, dataUrl);
            uploadedPhotos[p.name] = dataUrl;
            showToast("Foto berhasil disimpan ✓", "success");
          } catch {
            uploadedPhotos[p.name] = dataUrl;
            showToast("Foto dipakai, tapi gagal disimpan permanen", "error");
          }
          renderStack();
        } catch {
          showToast("Gagal memproses gambar", "error");
        }
      });

      if (resetBtn){
        resetBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (pos !== 0) return;
          try { localStorage.removeItem(PHOTO_LS_PREFIX + p.name); } catch {}
          delete uploadedPhotos[p.name];
          showToast("Foto dikembalikan ke default");
          renderStack();
        });
      }
    }

    stackEl.insertBefore(card, arrowLeft);
  });
}

function flipAdvance(){
  if (isAnimating) return;
  isAnimating = true;
  const cards = Array.from(stackEl.querySelectorAll(".p-card"));
  const backCard = cards[2];
  cards[0].classList.add("anim-to-back");
  if (cards[1]) cards[1].classList.add("anim-forward");
  if (backCard) backCard.classList.add("anim-forward-back");
  setTimeout(() => {
    order.push(order.shift());
    renderStack(); renderDots(); renderContent();
    isAnimating = false;
  }, 700);
}

function goBack(){
  if (isAnimating) return;
  order.unshift(order.pop());
  renderStack(); renderDots(); renderContent();
}

function goTo(targetIdx){
  if (order[0] === targetIdx) return;
  while (order[0] !== targetIdx) order.push(order.shift());
  renderStack(); renderDots(); renderContent();
}

function renderDots(){
  dotsEl.innerHTML = "";
  PEOPLE.forEach((p, i) => {
    const d = document.createElement("button");
    d.className = "dot" + (order[0] === i ? " active" : "");
    d.setAttribute("aria-label", `Tampilkan profil ${p.name}`);
    d.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(d);
  });
}

function renderTabs(){
  tabsEl.innerHTML = "";
  TABS.forEach(t => {
    const b = document.createElement("button");
    b.className = "tab" + (activeTab === t.id ? " active" : "");
    b.textContent = t.label;
    b.addEventListener("click", () => { activeTab = t.id; renderTabs(); renderContent(); });
    tabsEl.appendChild(b);
  });
}

// ==========================================
// PANEL CONTENT
// ==========================================
function paneHTML(p){
  if (activeTab === "perkenalan"){
    return `
      <h1 class="headline">${p.name.split(" ")[0]} <span class="hi">${p.name.split(" ").slice(1).join(" ")}</span></h1>
      <div class="sub-role">${p.role} &middot; Kelas ${p.kelas}</div>
      <div class="terminal">
        <div class="terminal-bar"><span></span><span></span><span></span></div>
        <div class="terminal-body"><span class="prompt">$</span>${p.intro}</div>
      </div>
      <div class="meta-grid">
        <div class="meta-box"><div class="meta-label">LAHIR</div><div class="meta-val">${p.born}</div></div>
        <div class="meta-box"><div class="meta-label">LOKASI</div><div class="meta-val">${p.location}</div></div>
        <div class="meta-box"><div class="meta-label">KELAS</div><div class="meta-val">${p.kelas}</div></div>
        <div class="meta-box"><div class="meta-label">FOKUS</div><div class="meta-val">${p.role}</div></div>
      </div>
    `;
  }

  if (activeTab === "karya"){
    return `
      <h1 class="headline">Karya <span class="hi">${p.name.split(" ")[0]}</span></h1>
      <div class="sub-role">Beberapa project yang pernah dikerjakan</div>
      <div class="work-list">
        ${p.works.map(w => `
          <div class="work-item">
            <div class="work-top">
              <div class="work-title">${w.title}</div>
              <a class="work-link" href="#" onclick="return false;">${w.link}</a>
            </div>
            <div class="work-desc">${w.desc}</div>
            <div class="work-stack">${w.stack.map(s => `<span class="p-tag">${s}</span>`).join("")}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  if (activeTab === "skill"){
    return `
      <h1 class="headline">Skill &amp; <span class="hi">Tools</span></h1>
      <div class="sub-role">Kemampuan teknis ${p.name.split(" ")[0]}</div>
      <div class="skill-list">
        ${p.skills.map(s => `
          <div>
            <div class="skill-row-top">
              <span class="skill-name">${s.name}</span>
              <span class="skill-pct">${s.pct}%</span>
            </div>
            <div class="skill-bar"><div class="skill-fill" style="width:${s.pct}%"></div></div>
          </div>
        `).join("")}
      </div>
      <div class="tool-tags">${p.tools.map(t => `<span class="tool-tag">${t}</span>`).join("")}</div>
    `;
  }

  if (activeTab === "musik"){
    return paneMusikHTML(p);
  }

  if (activeTab === "kontak"){
    return `
      <h1 class="headline">Hubungi <span class="hi">${p.name.split(" ")[0]}</span></h1>
      <div class="sub-role">Sosial media dan kontak lainnya</div>
      <div class="contact-list">
        ${p.contacts.map(c => `
          <a class="contact-row" href="${c.url}" target="_blank" rel="noopener noreferrer">
            <div class="contact-left">
              <div class="contact-icon">${c.icon}</div>
              <div>
                <div class="contact-platform">${c.platform}</div>
                <div class="contact-handle">${c.handle}</div>
              </div>
            </div>
            <div class="contact-arrow">&rarr;</div>
          </a>
        `).join("")}
      </div>
    `;
  }

  if (activeTab === "hobi"){
    return `
      <h1 class="headline">Hobi &amp; <span class="hi">Fun Fact</span></h1>
      <div class="sub-role">Di luar coding, ${p.name.split(" ")[0]} suka ngapain aja</div>
      <div class="hobby-grid">
        ${p.hobbies.map(h => `
          <div class="hobby-card">
            <div class="hobby-emoji">${h.emoji}</div>
            <div class="hobby-title">${h.title}</div>
            <div class="hobby-desc">${h.desc}</div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

// ==========================================
// MUSIC PANEL
// ==========================================
function paneMusikHTML(p){
  const list = p.music.playlist;
  const nowTrack = currentTrack && currentTrack.ownerName === p.name
    ? currentTrack
    : (list[0] ? { ...list[0], ownerName: p.name } : null);

  const coverKey = COVER_LS_PREFIX + p.name + "__" + (nowTrack?.title || "");
  const coverSrc = nowTrack ? uploadedCovers[coverKey] : null;
  const playing = currentTrack && currentTrack.ownerName === p.name && !spAudio.paused;

  const nowAudioKey = nowTrack ? audioKey(p.name, nowTrack.title) : null;
  const nowHasAudio = nowAudioKey ? !!uploadedAudio[nowAudioKey] : false;

  return `
    <h1 class="headline">Musik <span class="hi">Favorit</span></h1>
    <div class="sub-role">Lagu yang sering diputar ${p.name.split(" ")[0]}</div>

    <div class="music-layout">
      <div class="sp-now">
        <div class="sp-cover ${playing ? 'playing' : ''}" id="spCoverBox">
          ${coverSrc
            ? `<img src="${coverSrc}" alt="cover">`
            : `<span class="disc">💿</span>`}
          ${playing ? `
            <div class="sp-eq">
              <span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span>
            </div>
          ` : ""}
        </div>
        <div class="sp-now-title">${nowTrack ? nowTrack.title : "— Belum ada lagu —"}</div>
        <div class="sp-now-artist">${nowTrack ? nowTrack.artist : p.music.artist}</div>

        <div class="sp-progress">
          <span id="spNowCur">${currentTrack?.ownerName === p.name ? fmtTime(spAudio.currentTime) : "0:00"}</span>
          <div class="sp-progress-bar" id="spNowBar">
            <div class="sp-progress-fill" id="spNowFill" style="width:${currentTrack?.ownerName === p.name && spAudio.duration ? (spAudio.currentTime / spAudio.duration) * 100 : 0}%"></div>
          </div>
          <span id="spNowDur">${nowTrack?.duration || "0:00"}</span>
        </div>

        <div class="sp-controls">
          <button class="sp-btn ${isShuffle ? 'active' : ''}" id="spNowShuffle" title="Shuffle">⇄</button>
          <button class="sp-btn" id="spNowPrev" title="Previous">⏮</button>
          <button class="sp-btn play" id="spNowPlay" title="Play/Pause">${playing ? "⏸" : "▶"}</button>
          <button class="sp-btn" id="spNowNext" title="Next">⏭</button>
          <button class="sp-btn ${isRepeat ? 'active' : ''}" id="spNowRepeat" title="Repeat">↻</button>
        </div>

        <div class="sp-vol">
          <button class="sp-btn" id="spNowMute" title="Mute">${isMuted ? "🔇" : "🔊"}</button>
          <input type="range" id="spNowVol" min="0" max="1" step="0.01" value="${isMuted ? 0 : volume}">
        </div>

        ${nowTrack && !nowHasAudio ? `
          <div style="margin-top:14px; padding:10px 12px; border:1px dashed var(--border); border-radius:8px; font-size:11.5px; color:var(--text-dim); text-align:center; font-family:'JetBrains Mono', monospace;">
            Upload audio buat lagu ini di tombol 📁 di playlist →
          </div>
        ` : ""}
      </div>

      <div class="sp-playlist">
        <div class="sp-playlist-header">
          <h3>Playlist ${p.name.split(" ")[0]}</h3>
          <span>${list.length} track</span>
        </div>

        ${list.length === 0 ? `
          <div class="sp-empty">
            <span class="icon">🎵</span>
            Belum ada lagu di playlist ini.<br>
            Tambahin lagu lewat <code>js/data.js</code> bro.
          </div>
        ` : `
          <div class="sp-tracklist">
            ${list.map((t, idx) => {
              const isCur = currentTrack && currentTrack.ownerName === p.name && currentTrack.title === t.title;
              const tCover = uploadedCovers[COVER_LS_PREFIX + p.name + "__" + t.title];
              const hasAudio = !!uploadedAudio[audioKey(p.name, t.title)];
              return `
                <div class="sp-track ${isCur ? 'is-playing' : ''}" data-title="${t.title}" data-artist="${t.artist}" data-emoji="${t.emoji || '♪'}" data-duration="${t.duration || '0:00'}" data-owner="${p.name}">
                  <span class="sp-track-num">${idx + 1}</span>
                  <span class="sp-track-eq"><span></span><span></span><span></span><span></span></span>
                  <span class="sp-track-art">
                    ${tCover ? `<img src="${tCover}" alt="">` : (t.emoji || "♪")}
                  </span>
                  <span class="sp-track-info">
                    <span class="sp-track-title">${t.title}${hasAudio ? ' <span style="color:var(--accent-1);font-size:10px;">●</span>' : ''}</span>
                    <span class="sp-track-artist">${t.artist}</span>
                  </span>
                  <span class="sp-track-dur">${t.duration || "0:00"}</span>
                  <label class="sp-track-upload" title="Upload audio buat track ini" onclick="event.stopPropagation();">
                    📁
                    <input type="file" accept="audio/*" data-owner="${p.name}" data-title="${t.title}" style="display:none;">
                  </label>
                </div>
              `;
            }).join("")}
          </div>
        `}
      </div>
    </div>
  `;
}

function updateNowPlayingUI(){
  if (activeTab !== "musik") return;
  const p = activePerson();
  if (!currentTrack || currentTrack.ownerName !== p.name) return;

  const titleEl = contentEl.querySelector(".sp-now-title");
  const artistEl = contentEl.querySelector(".sp-now-artist");
  const coverBox = contentEl.querySelector(".sp-cover");
  const playBtn = contentEl.querySelector("#spNowPlay");

  if (titleEl) titleEl.textContent = currentTrack.title;
  if (artistEl) artistEl.textContent = currentTrack.artist;
  if (playBtn) playBtn.textContent = spAudio.paused ? "▶" : "⏸";

  if (coverBox){
    const key = COVER_LS_PREFIX + currentTrack.ownerName + "__" + currentTrack.title;
    const src = uploadedCovers[key];
    coverBox.classList.toggle("playing", !spAudio.paused);
    const isPlaying = coverBox.classList.contains("playing");
    const eqHTML = isPlaying ? `<div class="sp-eq"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>` : "";
    if (src){
      coverBox.innerHTML = `<img src="${src}" alt="cover">` + eqHTML;
    } else {
      coverBox.innerHTML = `<span class="disc">💿</span>` + eqHTML;
    }
  }
}

function updateTrackHighlight(){
  contentEl.querySelectorAll(".sp-track").forEach(el => {
    const isCur = currentTrack
      && el.dataset.owner === currentTrack.ownerName
      && el.dataset.title === currentTrack.title;
    el.classList.toggle("is-playing", !!isCur);
  });
}

function setupMusicEvents(p){
  // tombol play di hero
  const playBtn = contentEl.querySelector("#spNowPlay");
  if (playBtn){
    playBtn.addEventListener("click", () => {
      if (!currentTrack || currentTrack.ownerName !== p.name){
        if (p.music.playlist.length === 0){
          showToast("Playlist kosong, tambahin lagu dulu di data.js", "error");
          return;
        }
        openPlayer({ ...p.music.playlist[0], ownerName: p.name });
      } else {
        togglePlayPause();
        playBtn.textContent = spAudio.paused ? "▶" : "⏸";
      }
    });
  }

  const shuffleBtn = contentEl.querySelector("#spNowShuffle");
  if (shuffleBtn) shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    spShuffleBtn.classList.toggle("active", isShuffle);
  });
  const repeatBtn = contentEl.querySelector("#spNowRepeat");
  if (repeatBtn) repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
    spRepeatBtn.classList.toggle("active", isRepeat);
  });

  const prevBtn = contentEl.querySelector("#spNowPrev");
  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (spAudio.currentTime > 3){ spAudio.currentTime = 0; return; }
    const prev = findNextTrack(-1);
    if (prev) openPlayer(prev);
  });
  const nextBtn = contentEl.querySelector("#spNowNext");
  if (nextBtn) nextBtn.addEventListener("click", () => {
    const next = findNextTrack(1);
    if (next) openPlayer(next);
  });

  const muteBtn = contentEl.querySelector("#spNowMute");
  const volSlider = contentEl.querySelector("#spNowVol");
  if (muteBtn) muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    spAudio.volume = isMuted ? 0 : volume;
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
    if (volSlider) volSlider.value = isMuted ? 0 : volume;
    spMuteBtn.textContent = isMuted ? "🔇" : "🔊";
  });
  if (volSlider) volSlider.addEventListener("input", (e) => {
    volume = parseFloat(e.target.value);
    isMuted = false;
    spAudio.volume = volume;
    if (muteBtn) muteBtn.textContent = "🔊";
    spVolSlider.value = volume;
    spMuteBtn.textContent = "🔊";
  });

  // seek dari progress hero
  const nowBar = contentEl.querySelector("#spNowBar");
  if (nowBar) nowBar.addEventListener("click", (e) => {
    if (!spAudio.duration) return;
    const rect = nowBar.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    spAudio.currentTime = pct * spAudio.duration;
  });

  // klik track → mainkan
  contentEl.querySelectorAll(".sp-track").forEach(el => {
    el.addEventListener("click", (e) => {
      // kalau klik di tombol upload, jangan mainkan
      if (e.target.closest(".sp-track-upload")) return;
      openPlayer({
        title: el.dataset.title,
        artist: el.dataset.artist,
        emoji: el.dataset.emoji,
        duration: el.dataset.duration,
        ownerName: el.dataset.owner
      });
    });
  });

  // upload audio per-track
  contentEl.querySelectorAll(".sp-track-upload input[type=file]").forEach(input => {
    input.addEventListener("change", (e) => {
      e.stopPropagation();
      const file = e.target.files[0];
      if (!file) return;
      const owner = input.dataset.owner;
      const title = input.dataset.title;
      const reader = new FileReader();
      reader.onload = () => {
        const key = audioKey(owner, title);
        try {
          localStorage.setItem(key, reader.result);
          uploadedAudio[key] = reader.result;
          showToast(`Audio dipasang ke "${title}" ✓`, "success");
          // kalau track ini lagi aktif, langsung set src
          if (currentTrack && currentTrack.ownerName === owner && currentTrack.title === title){
            spAudio.src = reader.result;
            spAudio.play().catch(() => {});
            spPlayBtn.textContent = "⏸";
          }
          renderContent();
        } catch {
          uploadedAudio[key] = reader.result;
          showToast("Audio kepasang, tapi gagal disimpan (storage penuh)", "error");
          renderContent();
        }
      };
      reader.readAsDataURL(file);
    });
  });
}

// ==========================================
// RENDER CONTENT
// ==========================================
function renderContent(){
  const p = activePerson();
  contentEl.classList.remove("content-slide");
  void contentEl.offsetWidth;
  contentEl.innerHTML = paneHTML(p);
  contentEl.classList.add("content-slide");

  if (activeTab === "musik") setupMusicEvents(p);
}

// ==========================================
// INIT
// ==========================================
document.getElementById("prevBtn").addEventListener("click", goBack);
document.getElementById("nextBtn").addEventListener("click", flipAdvance);
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === "ArrowRight") flipAdvance();
  if (e.key === "ArrowLeft") goBack();
});

renderStack();
renderDots();
renderTabs();
renderContent();
