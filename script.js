/* ================================================================
   1. STARFIELD BACKGROUND
   ================================================================ */
(function initStarfield() {
    const canvas = document.getElementById('starfield-bg');
    const ctx = canvas.getContext('2d');
    let stars = [];
    const STAR_COUNT = 220;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.3,
                alpha: Math.random() * 0.7 + 0.2,
                speed: Math.random() * 0.4 + 0.05,
                dir: Math.random() > 0.5 ? 1 : -1,
                twinkleSpeed: Math.random() * 0.015 + 0.005
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#060614');
        grad.addColorStop(0.5, '#0d0d1a');
        grad.addColorStop(1, '#0a0a10');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(s => {
            s.alpha += s.twinkleSpeed * s.dir;
            if (s.alpha > 0.95 || s.alpha < 0.1) s.dir *= -1;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 245, 210, ${s.alpha})`;
            ctx.shadowBlur = s.r * 3;
            ctx.shadowColor = 'rgba(200, 180, 120, 0.6)';
            ctx.fill();
            ctx.shadowBlur = 0;

            s.y -= s.speed * 0.08;
            if (s.y < -2) s.y = canvas.height + 2;
        });

        requestAnimationFrame(drawStars);
    }

    resize();
    createStars();
    drawStars();
    window.addEventListener('resize', () => { resize(); createStars(); });
})();

/* ================================================================
   2. STAR CLUSTER LOGO RENDERER
   ================================================================ */
function renderStarCluster(container, size) {
    const cx = size / 2;
    const cy = size / 2;

    const layout = [
        [0,    0,    3.5],
        [55,   13,   2.2],
        [140,  11,   1.8],
        [220,  14,   2.4],
        [310,  10,   1.6],
        [15,   21,   1.5],
        [85,   19,   2.0],
        [160,  22,   1.4],
        [240,  18,   1.9],
        [330,  20,   1.5],
        [40,   28,   1.2],
        [120,  26,   1.3],
        [200,  29,   1.1],
        [280,  27,   1.3],
        [350,  25,   1.0]
    ];

    const lines = [[0,1],[0,2],[0,3],[0,4],[1,6],[2,7],[3,8],[4,9],[6,10],[7,11],[8,12]];

    const pts = layout.map(d => {
        const rad = d[0] * Math.PI / 180;
        return {
            x: cx + d[1] * Math.cos(rad),
            y: cy + d[1] * Math.sin(rad),
            r: d[2]
        };
    });

    let html = `<svg class="sc-svg" viewBox="0 0 ${size} ${size}" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;">`;

    lines.forEach(pair => {
        const a = pts[pair[0]], b = pts[pair[1]];
        html += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="rgba(212,175,106,0.28)" stroke-width="0.8"/>`;
    });

    pts.forEach((p, i) => {
        const glow = i === 0 ? 'rgba(255,230,100,0.85)' : 'rgba(255,220,80,0.7)';
        html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r}" fill="${glow}">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="${2.5 + i * 0.3}s" repeatCount="indefinite"/>
                 </circle>`;
        if (p.r >= 1.8) {
            html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r * 2.2}" fill="rgba(255,200,60,0.1)"/>`;
        }
    });

    html += '</svg>';
    container.style.position = 'relative';
    container.innerHTML = html;
}

/* ================================================================
   3. CONSTELLATION DATA
   ================================================================ */
const constellationsData = {
    cygnus: {
        name: 'Cygnus',
        title: 'The Swan',
        starCount: 7,
        imagePath: 'images/Cygnus.png',      // ✅ 修复：大小写与文件名一致
        positions: [
            { left: '50%', top: '18%' },
            { left: '50%', top: '34%' },
            { left: '50%', top: '50%' },
            { left: '50%', top: '66%' },
            { left: '30%', top: '50%' },
            { left: '70%', top: '50%' },
            { left: '50%', top: '84%' }
        ],
        connections: [[0,1],[1,2],[2,3],[3,6],[4,2],[2,5]],
        description: 'Cygnus, The Swan, soars through the Milky Way. ' +
            'Its brightest star Deneb shines at the tail, while Albireo ' +
            'marks its beak — a jewel double star of contrasting colors.'
    },
    cassiopeia: {
        name: 'Cassiopeia',
        title: 'The Queen',
        starCount: 5,
        imagePath: 'images/Cassiopeia.png',  // ✅ 修复：大小写与文件名一致
        positions: [
            { left: '18%', top: '40%' },
            { left: '35%', top: '58%' },
            { left: '50%', top: '45%' },
            { left: '66%', top: '60%' },
            { left: '82%', top: '42%' }
        ],
        connections: [[0,1],[1,2],[2,3],[3,4]],
        description: 'Cassiopeia, The Queen, reigns as a brilliant W — or M — ' +
            'shape circling the north pole. Recognizable year-round, ' +
            'she never sets below the horizon for northern observers.'
    }
};

const QR_CODE_IMAGE_PATH = 'images/qrcode.png';

/* ================================================================
   4. GLOBAL STATE
   ================================================================ */
let currentUser = null;
let currentConstellation = 'cygnus';
let starElements = [];
let litStatus = [];

/* ================================================================
   5. TOAST
   ================================================================ */
const toastEl = document.getElementById('auth-toast');
let toastTimer = null;

function showToast(msg, type = 'info') {
    toastEl.textContent = msg;
    toastEl.className = `auth-toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

/* ================================================================
   6. VIEW SWITCHER
   ================================================================ */
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    const target = document.getElementById(viewId);
    if (target) target.style.display = 'block';
}

/* ================================================================
   7. USER DATA MANAGEMENT
   ================================================================ */
function getUsers() {
    const users = localStorage.getItem('starlight_users');
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem('starlight_users', JSON.stringify(users));
}

function initUserData(username) {
    const users = getUsers();
    if (!users[username]) return;
    if (!users[username].data) users[username].data = {};
    for (let constId in constellationsData) {
        if (!users[username].data[constId]) {
            users[username].data[constId] = {
                litStatus: new Array(constellationsData[constId].starCount).fill(false),
                lastCheckin: '',
                starNotes: new Array(constellationsData[constId].starCount).fill(''),
                notes: ''
            };
        } else if (!users[username].data[constId].starNotes) {
            users[username].data[constId].starNotes =
                new Array(constellationsData[constId].starCount).fill('');
        }
    }
    saveUsers(users);
}

function register(username, password) {
    if (!username || !password) return 'Username/Password cannot be empty';
    const users = getUsers();
    if (users[username]) return 'Username already exists';
    users[username] = { password, data: {} };
    saveUsers(users);
    initUserData(username);
    return 'success';
}

function login(username, password) {
    const users = getUsers();
    if (!users[username]) return 'User does not exist';
    if (users[username].password !== password) return 'Incorrect password';
    currentUser = username;
    localStorage.setItem('starlight_currentUser', username);
    return 'success';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('starlight_currentUser');
    showView('auth-view');
    const container = document.getElementById('star-chart');
    if (container) container.innerHTML = '';
}

function checkAutoLogin() {
    const savedUser = localStorage.getItem('starlight_currentUser');
    if (savedUser && getUsers()[savedUser]) {
        currentUser = savedUser;
        initUserData(currentUser);
        return true;
    }
    return false;
}

function getUserDataForConstellation(constId) {
    if (!currentUser) return null;
    const users = getUsers();
    return users[currentUser].data[constId];
}

function getLitStatus(constId) {
    const data = getUserDataForConstellation(constId);
    return data ? data.litStatus : new Array(constellationsData[constId].starCount).fill(false);
}

function saveLitStatusForConstellation(constId, status) {
    if (!currentUser) return;
    const users = getUsers();
    users[currentUser].data[constId].litStatus = status;
    saveUsers(users);
}

function setLastCheckin(constId, dateStr) {
    const users = getUsers();
    users[currentUser].data[constId].lastCheckin = dateStr;
    saveUsers(users);
}

function getLastCheckin(constId) {
    const data = getUserDataForConstellation(constId);
    return data ? data.lastCheckin : '';
}

function setNoteForConstellation(constId, note) {
    const users = getUsers();
    users[currentUser].data[constId].notes = note;
    saveUsers(users);
}

function getNoteForConstellation(constId) {
    const data = getUserDataForConstellation(constId);
    return data ? data.notes : '';
}

function getStarNote(constId, starIndex) {
    const data = getUserDataForConstellation(constId);
    return data && data.starNotes ? data.starNotes[starIndex] : '';
}

function setStarNote(constId, starIndex, note) {
    if (!currentUser) return;
    const users = getUsers();
    if (!users[currentUser].data[constId].starNotes) {
        users[currentUser].data[constId].starNotes =
            new Array(constellationsData[constId].starCount).fill('');
    }
    users[currentUser].data[constId].starNotes[starIndex] = note;
    saveUsers(users);
}

/* ================================================================
   8. LOAD CONSTELLATION DATA  ← ✅ 核心修复在这里
   ================================================================ */
function loadConstellationData(constellationId) {
    const data = constellationsData[constellationId];
    if (!data) return;

    document.getElementById('current-constellation-name').innerText = data.name;

    const container = document.getElementById('star-chart');
    container.innerHTML = '';
    starElements = [];

    // ✅ 修复：始终插入背景图（低透明度常驻），不依赖点亮状态
    if (data.imagePath) {
        const bgImg = document.createElement('div');
        bgImg.className = 'constellation-bg-image';
        bgImg.style.backgroundImage = `url('${data.imagePath}')`;
        container.appendChild(bgImg);
    }

    // 创建星点元素
    for (let i = 0; i < data.starCount; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.setAttribute('data-star-index', i);
        star.style.left = data.positions[i].left;
        star.style.top  = data.positions[i].top;
        container.appendChild(star);
        starElements.push(star);
    }

    // 画连线（需等星点渲染完毕）
    setTimeout(() => drawConstellationLines(data), 0);

    // 读取已点亮状态
    litStatus = getLitStatus(constellationId).slice();
    litStatus.forEach((isLit, idx) => {
        if (isLit && starElements[idx]) starElements[idx].classList.add('lit');
    });

    // 检查是否已全部点亮
    checkAllStarsLit();
}

function drawConstellationLines(data) {
    const container = document.getElementById('star-chart');
    if (!data.connections) return;

    data.connections.forEach((connection, index) => {
        const [si, ei] = connection;
        const startStar = starElements[si];
        const endStar   = starElements[ei];
        if (!startStar || !endStar) return;

        const line = document.createElement('div');
        line.className = 'constellation-line';
        line.id = `line-${index}`;

        const startRect     = startStar.getBoundingClientRect();
        const endRect       = endStar.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const startX = startRect.left - containerRect.left + startRect.width  / 2;
        const startY = startRect.top  - containerRect.top  + startRect.height / 2;
        const endX   = endRect.left   - containerRect.left + endRect.width    / 2;
        const endY   = endRect.top    - containerRect.top  + endRect.height   / 2;

        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle  = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        line.style.width           = `${length}px`;
        line.style.height          = '2px';
        line.style.left            = `${startX}px`;
        line.style.top             = `${startY}px`;
        line.style.transformOrigin = '0 0';
        line.style.transform       = `rotate(${angle}deg)`;
        container.appendChild(line);
    });
}

/* ================================================================
   9. CHECK ALL STARS LIT  ← ✅ 修复：全亮后背景图高亮
   ================================================================ */
function checkAllStarsLit() {
    const allLit = litStatus.every(s => s === true);
    if (!allLit) return;

    // 显示连线动画
    document.querySelectorAll('.constellation-line').forEach((line, i) => {
        setTimeout(() => line.classList.add('visible'), i * 200);
    });

    // ✅ 修复：找到背景图div并提升透明度
    setTimeout(() => {
        const container = document.getElementById('star-chart');
        const bgImg = container.querySelector('.constellation-bg-image');
        if (bgImg) bgImg.classList.add('visible');
    }, 1500);
}

/* ================================================================
   10. CHECK-IN LOGIC
   ================================================================ */
function getTodayStr() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function hasCheckedInToday() {
    return getLastCheckin(currentConstellation) === getTodayStr();
}

function markCheckinToday() {
    setLastCheckin(currentConstellation, getTodayStr());
}

function checkIn() {
    if (!currentUser) return;

    if (hasCheckedInToday()) {
        showToast('You already checked in today, come back tomorrow! ✓', 'info');
        return;
    }

    const nextIndex = litStatus.findIndex(s => s === false);
    if (nextIndex === -1) {
        showToast('All stars are already lit! 🎉', 'info');
        return;
    }

    litStatus[nextIndex] = true;
    if (starElements[nextIndex]) starElements[nextIndex].classList.add('lit');
    saveLitStatusForConstellation(currentConstellation, litStatus);
    markCheckinToday();

    showToast(`⭐ Star ${nextIndex + 1} lit! Keep going~`, 'success');
    checkAllStarsLit();
}

/* ================================================================
   11. NOTES SIDEBAR
   ================================================================ */
function initNotesSidebar() {
    const sidebar      = document.getElementById('notes-sidebar');
    const notesBtn     = document.getElementById('notes-btn');
    const closeBtn     = document.getElementById('close-sidebar');
    const saveBtn      = document.getElementById('save-note');
    const noteTextarea = document.getElementById('note-content');
    const starSelect   = document.getElementById('star-select');
    const historyList  = document.getElementById('history-list');

    if (!sidebar || !notesBtn) return;

    notesBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        populateStarSelect();
        loadNoteForSelectedStar();
        loadNotesHistory();
    });

    if (starSelect) starSelect.addEventListener('change', loadNoteForSelectedStar);
    if (closeBtn)   closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const starIndex = parseInt(starSelect.value);
            const note = noteTextarea.value;
            if (starIndex === -1) {
                setNoteForConstellation(currentConstellation, note);
            } else {
                setStarNote(currentConstellation, starIndex, note);
            }
            showToast('Note saved 🌙', 'success');
            loadNotesHistory();
        });
    }

    function populateStarSelect() {
        if (!starSelect) return;
        starSelect.innerHTML = '<option value="-1">Constellation Global Note</option>';
        const data = constellationsData[currentConstellation];
        if (data) {
            for (let i = 0; i < data.starCount; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = `Star ${i + 1}`;
                starSelect.appendChild(opt);
            }
        }
    }

    function loadNoteForSelectedStar() {
        if (!starSelect || !noteTextarea) return;
        const starIndex = parseInt(starSelect.value);
        noteTextarea.value = starIndex === -1
            ? getNoteForConstellation(currentConstellation)
            : getStarNote(currentConstellation, starIndex);
    }

    function loadNotesHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        const data = getUserDataForConstellation(currentConstellation);
        if (!data) return;

        if (data.notes) {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `<div class="date">Global Note</div>
                              <div class="content">${data.notes.substring(0, 50)}${data.notes.length > 50 ? '...' : ''}</div>`;
            historyList.appendChild(item);
        }

        if (data.starNotes) {
            data.starNotes.forEach((note, index) => {
                if (!note) return;
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `<div class="date">Star ${index + 1}</div>
                                  <div class="content">${note.substring(0, 50)}${note.length > 50 ? '...' : ''}</div>`;
                historyList.appendChild(item);
            });
        }
    }
}

/* ================================================================
   12. EVENT BINDING
   ================================================================ */
function bindEvents() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const backBtn = document.getElementById('back-to-selector');
    if (backBtn) backBtn.addEventListener('click', () => showView('constellation-selector'));

    document.querySelectorAll('.constellation-card').forEach(card => {
        card.addEventListener('click', () => {
            const constId = card.dataset.constellation;
            if (constId === 'locked') {
                showToast('This constellation is not yet unlocked.', 'info');
                return;
            }
            if (!constellationsData[constId]) return;
            currentConstellation = constId;
            loadConstellationData(constId);
            showView('observation-view');
        });
    });

    const checkinBtn = document.getElementById('checkin-btn');
    if (checkinBtn) checkinBtn.addEventListener('click', checkIn);

    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.addEventListener('click', generateShareImage);

    const certificateBtn = document.getElementById('certificate-btn');
    if (certificateBtn) certificateBtn.addEventListener('click', generateCertificate);

    const certBackBtn = document.getElementById('cert-back-btn');
    if (certBackBtn) certBackBtn.addEventListener('click', () => {
        showView('observation-view');
    });
}

/* ================================================================
   13. SHARE (html2canvas screenshot)
   ================================================================ */
async function generateShareImage() {
    const starChart = document.getElementById('star-chart');
    if (!starChart) return;

    const shareContainer = document.createElement('div');
    shareContainer.style.cssText = `
        position: absolute; top: -9999px; left: -9999px;
        width: 600px; height: 460px;
        background: #1e1b14; border: 2px solid #d4af6a;
        border-radius: 32px; padding: 20px;
        box-sizing: border-box; font-family: Georgia, serif;
    `;
    document.body.appendChild(shareContainer);

    const header = document.createElement('div');
    header.style.cssText = 'text-align:center;color:#ecd9a3;font-size:1.3rem;letter-spacing:3px;margin-bottom:12px;';
    header.textContent = '✦ Starlight Atlas';
    shareContainer.appendChild(header);

    const starChartCopy = starChart.cloneNode(true);
    starChartCopy.style.cssText = `
        position: relative; width: 100%; height: 300px;
        background: #1e1b14; border-radius: 24px;
        border: 1px solid #70562e; overflow: hidden;
    `;
    shareContainer.appendChild(starChartCopy);

    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-end;margin-top:12px;padding:0 4px;';

    const info = document.createElement('div');
    info.style.cssText = 'color:#bfa16c;font-size:0.85rem;line-height:1.8;';
    const litCount   = litStatus.filter(Boolean).length;
    const totalCount = constellationsData[currentConstellation].starCount;
    info.innerHTML = `
        <div style="color:#f3d382;font-size:1rem;font-weight:bold;">${constellationsData[currentConstellation].name}</div>
        <div>👤 ${currentUser}</div>
        <div>📅 ${new Date().toLocaleDateString()}</div>
        <div>⭐ ${litCount} / ${totalCount} stars lit</div>
    `;
    footer.appendChild(info);

    const qrWrapper = document.createElement('div');
    qrWrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;';
    const qrLabel = document.createElement('div');
    qrLabel.style.cssText = 'color:#aa8b54;font-size:0.65rem;letter-spacing:1px;';
    qrLabel.textContent = 'Scan to visit';
    qrWrapper.appendChild(qrLabel);

    const qrImg = document.createElement('img');
    qrImg.src = QR_CODE_IMAGE_PATH;
    qrImg.style.cssText = 'width:72px;height:72px;border-radius:8px;border:2px solid #d4af6a;background:#fff;';
    qrWrapper.appendChild(qrImg);
    footer.appendChild(qrWrapper);
    shareContainer.appendChild(footer);

    await new Promise(resolve => {
        if (qrImg.complete && qrImg.naturalWidth > 0) { resolve(); return; }
        qrImg.onload  = resolve;
        qrImg.onerror = () => { qrImg.style.display = 'none'; qrLabel.textContent = ''; resolve(); };
        setTimeout(resolve, 1000);
    });

    try {
        const canvas = await html2canvas(shareContainer, {
            scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#1e1b14'
        });
        const link = document.createElement('a');
        link.download = `${currentConstellation}-checkin-${getTodayStr()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Share image saved! 📸', 'success');
    } catch (error) {
        console.error('Share image error:', error);
        showToast('Failed to generate image, please try again.', 'error');
    } finally {
        document.body.removeChild(shareContainer);
    }
}

/* ================================================================
   14. CERTIFICATE
   ================================================================ */
async function generateCertificate() {
    const allLit = litStatus.every(s => s === true);
    if (!allLit) {
        showToast('Please light up all stars before generating the certificate!', 'info');
        return;
    }

    const data = constellationsData[currentConstellation];

    // 更新证书页内容
    document.getElementById('cert-const-name').textContent  = `${data.name} — ${data.title}`;
    document.getElementById('cert-em-name').textContent     = data.name;
    document.getElementById('cert-em-title').textContent    = data.title;
    document.getElementById('cert-stars-count').textContent = `${litStatus.length} / ${data.starCount}`;
    document.getElementById('cert-body-text').innerHTML =
        `This certifies that you have lit every star in <em>${data.name}</em>, ` +
        `completing your daily observation ritual and tracing the celestial path of ` +
        `<em>${data.title}</em> across the night sky.<br><br>` +
        `${data.description}<br><br>` +
        `May your dedication continue to illuminate the cosmos, one star at a time.`;

    const d = new Date();
    document.getElementById('cert-date').textContent =
        d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // 绘制证书星座图
    buildCertCircle(currentConstellation);
    showView('certificate-view');
}

function buildCertCircle(key) {
    const data   = constellationsData[key];
    const circle = document.getElementById('cert-circle');
    const svg    = document.getElementById('cert-svg');

    circle.querySelectorAll('.cert-star-dot').forEach(el => el.remove());
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const W = 190, H = 190, pad = 22;

    const pts = data.positions.map(pos => ({
        x: pad + (parseFloat(pos.left) / 100) * (W - pad * 2),
        y: pad + (parseFloat(pos.top)  / 100) * (H - pad * 2)
    }));

    data.connections.forEach(pair => {
        const a = pts[pair[0]], b = pts[pair[1]];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x.toFixed(1));
        line.setAttribute('y1', a.y.toFixed(1));
        line.setAttribute('x2', b.x.toFixed(1));
        line.setAttribute('y2', b.y.toFixed(1));
        line.setAttribute('stroke', 'rgba(200,168,240,0.45)');
        line.setAttribute('stroke-width', '1.2');
        svg.appendChild(line);
    });

    pts.forEach(p => {
        const dot = document.createElement('div');
        dot.className = 'cert-star-dot';
        dot.style.cssText = `width:7px;height:7px;left:${p.x}px;top:${p.y}px;`;
        circle.appendChild(dot);
    });
}

/* ================================================================
   15. AUTH
   ================================================================ */
function initAuth() {
    const loginTab    = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm   = document.getElementById('login-form');
    const registerForm= document.getElementById('register-form');
    const loginBtn    = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginMsg    = document.getElementById('login-message');
    const regMsg      = document.getElementById('reg-message');

    if (!loginBtn || !registerBtn) return;

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display    = 'flex';
        registerForm.style.display = 'none';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'flex';
        loginForm.style.display    = 'none';
    });

    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const result   = login(username, password);
        if (result === 'success') {
            initUserData(currentUser);
            showView('constellation-selector');
            document.getElementById('welcome-name').textContent = `Hello, ${currentUser}`;
            const hLogo = document.getElementById('header-logo-cluster');
            if (hLogo) renderStarCluster(hLogo, 48);
            bindEvents();
            initNotesSidebar();
            showToast(`Welcome back, ${currentUser}!`, 'success');
        } else {
            if (loginMsg) { loginMsg.textContent = result; loginMsg.style.color = '#e07070'; }
        }
    });

    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const result   = register(username, password);
        if (result === 'success') {
            if (regMsg) { regMsg.textContent = 'Registration successful! Please log in.'; regMsg.style.color = '#7ec8a0'; }
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display    = 'flex';
            registerForm.style.display = 'none';
        } else {
            if (regMsg) { regMsg.textContent = result; regMsg.style.color = '#e07070'; }
        }
    });

    // Enter 快捷键
    document.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const av = document.getElementById('auth-view');
        if (!av || av.style.display === 'none') return;
        if (registerForm.style.display !== 'none') registerBtn.click();
        else loginBtn.click();
    });

    // 绘制 auth logo
    const authLogo = document.getElementById('auth-logo-cluster');
    if (authLogo) renderStarCluster(authLogo, 64);
}

/* ================================================================
   16. PAGE INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    showView('auth-view');

    if (checkAutoLogin()) {
        showView('constellation-selector');
        document.getElementById('welcome-name').textContent = `Hello, ${currentUser}`;
        const hLogo = document.getElementById('header-logo-cluster');
        if (hLogo) renderStarCluster(hLogo, 48);
        bindEvents();
        initNotesSidebar();
    } else {
        initAuth();
    }
});
