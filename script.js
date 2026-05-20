// ======================= 星空背景动画 =======================
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
    window.addEventListener('resize', () => {
        resize();
        createStars();
    });
})();

// ======================= Constellation Data =======================
const constellationsData = {
    cygnus: {
        name: 'Cygnus',
        starCount: 7,
        // 【替换说明】将 'images/cygnus.png' 改为你的天鹅座图片路径
        imagePath: 'images/cygnus.png',
        positions: [
            { left: '20%', top: '30%' },
            { left: '35%', top: '25%' },
            { left: '50%', top: '28%' },
            { left: '65%', top: '35%' },
            { left: '55%', top: '50%' },
            { left: '40%', top: '55%' },
            { left: '25%', top: '48%' }
        ],
        connections: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]
        ]
    },
    cassiopeia: {
        name: 'Cassiopeia',
        starCount: 5,
        // 【替换说明】将 'images/cassiopeia.png' 改为你的仙后座图片路径
        imagePath: 'images/cassiopeia.png',
        positions: [
            { left: '30%', top: '40%' },
            { left: '45%', top: '35%' },
            { left: '60%', top: '38%' },
            { left: '50%', top: '55%' },
            { left: '35%', top: '60%' }
        ],
        connections: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]
        ]
    }
};

// ======================= 二维码图片路径配置 =======================
// 【替换说明】将 'images/qrcode.png' 改为你准备好的二维码图片路径
const QR_CODE_IMAGE_PATH = 'images/qrcode.png';

// ======================= Global Variables =======================
let currentUser = null;
let currentConstellation = 'cygnus';
let starElements = [];
let litStatus = [];

// ======================= User Data Management =======================
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
            users[username].data[constId].starNotes = new Array(constellationsData[constId].starCount).fill('');
        }
    }
    saveUsers(users);
}

function register(username, password) {
    if (!username || !password) return 'Username/Password cannot be empty';
    const users = getUsers();
    if (users[username]) return 'Username already exists';
    users[username] = { password: password, data: {} };
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

// ======================= Data Read/Write (User-based) =======================
function getUserDataForConstellation(constId) {
    if (!currentUser) return null;
    const users = getUsers();
    return users[currentUser].data[constId];
}

function saveLitStatusForConstellation(constId, status) {
    if (!currentUser) return;
    const users = getUsers();
    users[currentUser].data[constId].litStatus = status;
    saveUsers(users);
}

function getLitStatus(constId) {
    const data = getUserDataForConstellation(constId);
    return data ? data.litStatus : new Array(constellationsData[constId].starCount).fill(false);
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
        users[currentUser].data[constId].starNotes = new Array(constellationsData[constId].starCount).fill('');
    }
    users[currentUser].data[constId].starNotes[starIndex] = note;
    saveUsers(users);
}

// ======================= View Switching =======================
function showView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => { view.style.display = 'none'; });
    const target = document.getElementById(viewId);
    if (target) target.style.display = 'block';
}

// ======================= Load Constellation Data =======================
function loadConstellationData(constellationId) {
    const data = constellationsData[constellationId];
    if (!data) return;

    document.getElementById('current-constellation-name').innerText = data.name;

    const container = document.getElementById('star-chart');
    container.innerHTML = '';
    starElements = [];

    // 插入星座背景图片（始终显示，低透明度作为底图）
    if (data.imagePath) {
        const bgImg = document.createElement('div');
        bgImg.className = 'constellation-bg-image';
        bgImg.style.backgroundImage = `url('${data.imagePath}')`;
        container.appendChild(bgImg);
    }

    // 创建星星元素
    for (let i = 0; i < data.starCount; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.setAttribute('data-star-index', i);
        star.style.left = data.positions[i].left;
        star.style.top = data.positions[i].top;
        container.appendChild(star);
        starElements.push(star);
    }

    drawConstellationLines(data);

    litStatus = getLitStatus(constellationId).slice();

    litStatus.forEach((isLit, idx) => {
        if (isLit && starElements[idx]) starElements[idx].classList.add('lit');
        else if (starElements[idx]) starElements[idx].classList.remove('lit');
    });

    checkAllStarsLit();
}

function drawConstellationLines(data) {
    const container = document.getElementById('star-chart');
    if (!data.connections) return;

    data.connections.forEach((connection, index) => {
        const [startIndex, endIndex] = connection;
        const startStar = starElements[startIndex];
        const endStar = starElements[endIndex];

        if (startStar && endStar) {
            const line = document.createElement('div');
            line.className = 'constellation-line';
            line.id = `line-${index}`;

            const startRect = startStar.getBoundingClientRect();
            const endRect = endStar.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const startX = startRect.left - containerRect.left + startRect.width / 2;
            const startY = startRect.top - containerRect.top + startRect.height / 2;
            const endX = endRect.left - containerRect.left + endRect.width / 2;
            const endY = endRect.top - containerRect.top + endRect.height / 2;

            const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

            line.style.width = `${length}px`;
            line.style.height = '2px';
            line.style.left = `${startX}px`;
            line.style.top = `${startY}px`;
            line.style.transformOrigin = '0 0';
            line.style.transform = `rotate(${angle}deg)`;

            container.appendChild(line);
        }
    });
}

// ======================= 检查所有星星是否点亮 =======================
function checkAllStarsLit() {
    const allLit = litStatus.every(status => status === true);
    if (allLit) {
        // 显示星座连线动画
        const lines = document.querySelectorAll('.constellation-line');
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('visible');
            }, index * 200);
        });

        // 显示星座图片（全亮后高亮显示）
        setTimeout(() => {
            const container = document.getElementById('star-chart');
            // 找到已有的底图并提升透明度
            const bgImg = container.querySelector('.constellation-bg-image');
            if (bgImg) {
                bgImg.classList.add('visible');
            }
        }, 1500);
    }
}

// ======================= Check-in Logic =======================
function getTodayStr() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function hasCheckedInToday() {
    const last = getLastCheckin(currentConstellation);
    return last === getTodayStr();
}

function markCheckinToday() {
    setLastCheckin(currentConstellation, getTodayStr());
}

function checkIn() {
    if (!currentUser) return;

    if (hasCheckedInToday()) {
        alert('You already checked in today, come back tomorrow! ✨');
        return;
    }

    const nextIndex = litStatus.findIndex(status => status === false);

    if (nextIndex === -1) {
        alert('Congratulations! You have lit up all the stars and completed this constellation atlas! 🎉');
        return;
    }

    litStatus[nextIndex] = true;
    if (starElements[nextIndex]) starElements[nextIndex].classList.add('lit');
    saveLitStatusForConstellation(currentConstellation, litStatus);
    markCheckinToday();

    // 每次点亮后也检查是否全部完成
    checkAllStarsLit();

    alert(`✨ Lit up star ${nextIndex + 1}! Keep going～`);
}

// ======================= Notes Sidebar =======================
function initNotesSidebar() {
    const sidebar = document.getElementById('notes-sidebar');
    const notesBtn = document.getElementById('notes-btn');
    const closeBtn = document.getElementById('close-sidebar');
    const saveBtn = document.getElementById('save-note');
    const noteTextarea = document.getElementById('note-content');
    const starSelect = document.getElementById('star-select');
    const historyList = document.getElementById('history-list');

    if (!sidebar || !notesBtn) return;

    notesBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        populateStarSelect();
        loadNoteForSelectedStar();
        loadNotesHistory();
    });

    if (starSelect) {
        starSelect.addEventListener('change', loadNoteForSelectedStar);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const starIndex = parseInt(starSelect.value);
            const note = noteTextarea.value;
            if (starIndex === -1) {
                setNoteForConstellation(currentConstellation, note);
            } else {
                setStarNote(currentConstellation, starIndex, note);
            }
            alert('Note saved 🌙');
            loadNotesHistory();
        });
    }

    function populateStarSelect() {
        if (!starSelect) return;
        starSelect.innerHTML = '<option value="-1">Constellation Global Note</option>';
        const data = constellationsData[currentConstellation];
        if (data) {
            for (let i = 0; i < data.starCount; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Star ${i + 1}`;
                starSelect.appendChild(option);
            }
        }
    }

    function loadNoteForSelectedStar() {
        if (!starSelect || !noteTextarea) return;
        const starIndex = parseInt(starSelect.value);
        if (starIndex === -1) {
            noteTextarea.value = getNoteForConstellation(currentConstellation);
        } else {
            noteTextarea.value = getStarNote(currentConstellation, starIndex);
        }
    }

    function loadNotesHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        const data = getUserDataForConstellation(currentConstellation);
        if (!data) return;

        if (data.notes) {
            const globalNoteItem = document.createElement('div');
            globalNoteItem.className = 'history-item';
            globalNoteItem.innerHTML = `
                <div class="date">Global Note</div>
                <div class="content">${data.notes.substring(0, 50)}${data.notes.length > 50 ? '...' : ''}</div>
            `;
            historyList.appendChild(globalNoteItem);
        }

        if (data.starNotes) {
            data.starNotes.forEach((note, index) => {
                if (note) {
                    const starNoteItem = document.createElement('div');
                    starNoteItem.className = 'history-item';
                    starNoteItem.innerHTML = `
                        <div class="date">Star ${index + 1}</div>
                        <div class="content">${note.substring(0, 50)}${note.length > 50 ? '...' : ''}</div>
                    `;
                    historyList.appendChild(starNoteItem);
                }
            });
        }
    }
}

// ======================= Event Binding =======================
function bindEvents() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const backBtn = document.getElementById('back-to-selector');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showView('constellation-selector');
        });
    }

    const cards = document.querySelectorAll('.constellation-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const constId = card.dataset.constellation;
            if (constId) {
                currentConstellation = constId;
                loadConstellationData(constId);
                showView('observation-view');
            }
        });
    });

    const checkinBtn = document.getElementById('checkin-btn');
    if (checkinBtn) checkinBtn.addEventListener('click', checkIn);

    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.addEventListener('click', generateShareImage);

    const certificateBtn = document.getElementById('certificate-btn');
    if (certificateBtn) certificateBtn.addEventListener('click', generateCertificate);
}

// ======================= 分享功能 =======================
async function generateShareImage() {
    const starChart = document.getElementById('star-chart');
    if (!starChart) return;

    // 创建分享容器
    const shareContainer = document.createElement('div');
    shareContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 600px;
        height: 460px;
        background: #1e1b14;
        border: 2px solid #d4af6a;
        border-radius: 32px;
        padding: 20px;
        box-sizing: border-box;
        font-family: Georgia, serif;
    `;
    document.body.appendChild(shareContainer);

    // 顶部标题
    const header = document.createElement('div');
    header.style.cssText = `
        text-align: center;
        color: #ecd9a3;
        font-size: 1.3rem;
        letter-spacing: 3px;
        margin-bottom: 12px;
    `;
    header.textContent = '✨ Starlight Atlas';
    shareContainer.appendChild(header);

    // 星图区域
    const starChartCopy = starChart.cloneNode(true);
    starChartCopy.style.cssText = `
        position: relative;
        width: 100%;
        height: 300px;
        background: #1e1b14;
        border-radius: 24px;
        border: 1px solid #70562e;
        overflow: hidden;
    `;
    shareContainer.appendChild(starChartCopy);

    // 底部信息栏
    const footer = document.createElement('div');
    footer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 12px;
        padding: 0 4px;
    `;

    // 左侧：星座名称 + 用户 + 日期
    const info = document.createElement('div');
    info.style.cssText = 'color: #bfa16c; font-size: 0.85rem; line-height: 1.8;';
    const litCount = litStatus.filter(Boolean).length;
    const totalCount = constellationsData[currentConstellation].starCount;
    info.innerHTML = `
        <div style="color:#f3d382; font-size:1rem; font-weight:bold;">
            ${constellationsData[currentConstellation].name}
        </div>
        <div>👤 ${currentUser}</div>
        <div>📅 ${new Date().toLocaleDateString()}</div>
        <div>⭐ ${litCount} / ${totalCount} stars lit</div>
    `;
    footer.appendChild(info);

    // 右侧：二维码
    const qrWrapper = document.createElement('div');
    qrWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    `;
    const qrLabel = document.createElement('div');
    qrLabel.style.cssText = 'color: #aa8b54; font-size: 0.65rem; letter-spacing: 1px;';
    qrLabel.textContent = 'Scan to visit';
    qrWrapper.appendChild(qrLabel);

    const qrImg = document.createElement('img');
    qrImg.src = QR_CODE_IMAGE_PATH;
    qrImg.style.cssText = `
        width: 72px;
        height: 72px;
        border-radius: 8px;
        border: 2px solid #d4af6a;
        background: #fff;
    `;
    qrWrapper.appendChild(qrImg);
    footer.appendChild(qrWrapper);
    shareContainer.appendChild(footer);

    // 等待二维码图片加载完成
    await new Promise(resolve => {
        if (qrImg.complete && qrImg.naturalWidth > 0) {
            resolve();
        } else {
            qrImg.onload = resolve;
            // 如果图片加载失败，1秒后也继续执行，避免卡住
            qrImg.onerror = () => {
                qrImg.style.display = 'none';
                qrLabel.textContent = '';
                resolve();
            };
            setTimeout(resolve, 1000);
        }
    });

    // 使用 html2canvas 生成图片
    try {
        const canvas = await html2canvas(shareContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#1e1b14'
        });

        const link = document.createElement('a');
        link.download = `${currentConstellation}-checkin-${getTodayStr()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        alert('打卡图片已生成，请保存！📸');
    } catch (error) {
        console.error('生成分享图片失败:', error);
        alert('生成图片失败，请重试');
    } finally {
        document.body.removeChild(shareContainer);
    }
}

// ======================= 证书功能 =======================
async function generateCertificate() {
    const allLit = litStatus.every(status => status === true);
    if (!allLit) {
        alert('Please light up all stars before generating the certificate!');
        return;
    }

    const certificateContainer = document.createElement('div');
    certificateContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        height: 560px;
        background: #1e1b14;
        border: 4px solid #d4af6a;
        border-radius: 20px;
        padding: 40px;
        box-sizing: border-box;
        text-align: center;
        font-family: Georgia, serif;
    `;
    document.body.appendChild(certificateContainer);

    // 证书标题
    const title = document.createElement('h1');
    title.style.cssText = `
        color: #ecd9a3;
        font-size: 2rem;
        margin-bottom: 16px;
        text-shadow: 0 2px 10px #000;
        letter-spacing: 3px;
    `;
    title.textContent = '✨ Starlight Atlas Completion Certificate';
    certificateContainer.appendChild(title);

    // 装饰线
    const line = document.createElement('div');
    line.style.cssText = 'width: 600px; height: 2px; background: #d4af6a; margin: 0 auto 24px;';
    certificateContainer.appendChild(line);

    // 证书内容
    const content = document.createElement('div');
    content.style.cssText = 'color: #f0e6c5; font-size: 1.1rem; line-height: 2; margin-bottom: 24px;';
    content.innerHTML = `
        <p>This is to certify that</p>
        <p style="font-size:1.6rem; color:#f3d382; font-weight:bold; margin: 8px 0;">${currentUser}</p>
        <p>has successfully completed all stars of</p>
        <p style="font-size:1.4rem; color:#ecd9a3; font-weight:bold; margin: 8px 0;">
            ${constellationsData[currentConstellation].name}
        </p>
    `;
    certificateContainer.appendChild(content);

    // 星图副本
    const starChart = document.getElementById('star-chart');
    if (starChart) {
        const starChartCopy = starChart.cloneNode(true);
        starChartCopy.style.cssText = `
            width: 360px;
            height: 200px;
            margin: 0 auto 20px;
            border-radius: 20px;
            border: 1px solid #70562e;
            overflow: hidden;
            position: relative;
            background: #1e1b14;
        `;
        certificateContainer.appendChild(starChartCopy);
    }

    // 底部：日期 + 二维码
    const bottom = document.createElement('div');
    bottom.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 8px;
    `;

    const dateEl = document.createElement('p');
    dateEl.style.cssText = 'color: #bfa16c; font-size: 0.9rem;';
    dateEl.textContent = `Date: ${new Date().toLocaleDateString()}`;
    bottom.appendChild(dateEl);

    const qrWrapper = document.createElement('div');
    qrWrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';

    const qrLabel = document.createElement('div');
    qrLabel.style.cssText = 'color: #aa8b54; font-size: 0.65rem; letter-spacing: 1px;';
    qrLabel.textContent = 'Scan to visit';
    qrWrapper.appendChild(qrLabel);

    const qrImg = document.createElement('img');
    qrImg.src = QR_CODE_IMAGE_PATH;
    qrImg.style.cssText = `
        width: 72px;
        height: 72px;
        border-radius: 8px;
        border: 2px solid #d4af6a;
        background: #fff;
    `;
    qrWrapper.appendChild(qrImg);
    bottom.appendChild(qrWrapper);
    certificateContainer.appendChild(bottom);

    // 等待二维码加载
    await new Promise(resolve => {
        if (qrImg.complete && qrImg.naturalWidth > 0) {
            resolve();
        } else {
            qrImg.onload = resolve;
            qrImg.onerror = () => {
                qrImg.style.display = 'none';
                qrLabel.textContent = '';
                resolve();
            };
            setTimeout(resolve, 1000);
        }
    });

    try {
        const canvas = await html2canvas(certificateContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#1e1b14'
        });

        const link = document.createElement('a');
        link.download = `${currentConstellation}-certificate.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        alert('Completion certificate generated! 🏆');
    } catch (error) {
        console.error('生成证书失败:', error);
        alert('Failed to generate certificate, please try again');
    } finally {
        document.body.removeChild(certificateContainer);
    }
}

// ======================= Login/Register Interface =======================
function initAuth() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginMsg = document.getElementById('login-message');
    const regMsg = document.getElementById('reg-message');

    if (!loginBtn || !registerBtn) {
        console.error('找不到登录/注册按钮，请检查HTML');
        return;
    }

       loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const result = login(username, password);
        if (result === 'success') {
            initUserData(currentUser);
            showView('constellation-selector');
            bindEvents();
            initNotesSidebar();
        } else {
            if (loginMsg) {
                loginMsg.textContent = result;
                loginMsg.style.color = '#e07070';
            }
        }
    });

    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const result = register(username, password);
        if (result === 'success') {
            if (regMsg) {
                regMsg.textContent = 'Registration successful! Please log in.';
                regMsg.style.color = '#7ec8a0';
            }
            // 自动切换到登录页
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            if (regMsg) {
                regMsg.textContent = result;
                regMsg.style.color = '#e07070';
            }
        }
    });
}

// ======================= Page Init =======================
document.addEventListener('DOMContentLoaded', () => {
    // 默认只显示登录页
    showView('auth-view');

    // 检查是否有自动登录
    if (checkAutoLogin()) {
        showView('constellation-selector');
        bindEvents();
        initNotesSidebar();
    } else {
        initAuth();
    }
});

    