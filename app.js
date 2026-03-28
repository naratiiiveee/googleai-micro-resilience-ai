// ====== Hareketli Arka Plan — Aurora + Particle Network ======
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

function resizeBg() { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; }
resizeBg();
window.addEventListener('resize', resizeBg);

// Floating aurora blobs
const blobs = [
    { x: 0.15, y: 0.25, r: 0.38, color: '34,197,94',  speed: 0.0009, phase: 0 },
    { x: 0.80, y: 0.70, r: 0.35, color: '15,118,110', speed: 0.0007, phase: 1.5 },
    { x: 0.50, y: 0.10, r: 0.28, color: '6,182,212',  speed: 0.0011, phase: 3.0 },
    { x: 0.90, y: 0.15, r: 0.22, color: '34,197,94',  speed: 0.0008, phase: 4.5 },
    { x: 0.10, y: 0.85, r: 0.25, color: '16,185,129', speed: 0.0010, phase: 2.0 },
];

let blobTime = 0;

// Small particles
const bgParts = Array.from({ length: 110 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    op: Math.random() * 0.6 + 0.15,
    phase: Math.random() * Math.PI * 2,
    type: Math.floor(Math.random() * 3), // 0=green, 1=teal, 2=cyan
}));

// DNA helix nodes along two sine waves
const helixNodes = Array.from({ length: 18 }, (_, i) => ({ t: i / 17 }));
let helixTime = 0;

function drawHelix(W, H) {
    const cx = W * 0.92, cy = H * 0.5, amp = H * 0.28, len = H * 0.55;
    for (let i = 0; i < helixNodes.length - 1; i++) {
        const t1 = helixNodes[i].t, t2 = helixNodes[i + 1].t;
        const y1 = cy - len / 2 + t1 * len, y2 = cy - len / 2 + t2 * len;
        const x1a = cx + Math.sin(t1 * Math.PI * 4 + helixTime) * amp * 0.18;
        const x1b = cx + Math.sin(t1 * Math.PI * 4 + helixTime + Math.PI) * amp * 0.18;
        const x2a = cx + Math.sin(t2 * Math.PI * 4 + helixTime) * amp * 0.18;
        const x2b = cx + Math.sin(t2 * Math.PI * 4 + helixTime + Math.PI) * amp * 0.18;
        // Strand A
        bgCtx.beginPath();
        bgCtx.strokeStyle = `rgba(34,197,94,0.12)`;
        bgCtx.lineWidth = 1;
        bgCtx.moveTo(x1a, y1); bgCtx.lineTo(x2a, y2); bgCtx.stroke();
        // Strand B
        bgCtx.beginPath();
        bgCtx.strokeStyle = `rgba(6,182,212,0.10)`;
        bgCtx.moveTo(x1b, y1); bgCtx.lineTo(x2b, y2); bgCtx.stroke();
        // Crossbars
        if (i % 2 === 0) {
            bgCtx.beginPath();
            bgCtx.strokeStyle = `rgba(34,197,94,0.07)`;
            bgCtx.moveTo(x1a, y1); bgCtx.lineTo(x1b, y1); bgCtx.stroke();
        }
        // Nodes
        [[x1a, y1, '34,197,94'], [x1b, y1, '6,182,212']].forEach(([nx, ny, c]) => {
            bgCtx.beginPath();
            bgCtx.arc(nx, ny, 2.5, 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(${c},0.35)`;
            bgCtx.fill();
        });
    }
}

function animateBg() {
    const W = bgCanvas.width, H = bgCanvas.height;
    bgCtx.clearRect(0, 0, W, H);
    blobTime += 0.012;
    helixTime += 0.018;

    // Aurora blobs
    blobs.forEach((b, i) => {
        b.phase += b.speed * 60;
        const bx = (b.x + Math.sin(b.phase) * 0.12) * W;
        const by = (b.y + Math.cos(b.phase * 0.7) * 0.10) * H;
        const br = b.r * Math.min(W, H);
        const grd = bgCtx.createRadialGradient(bx, by, 0, bx, by, br);
        const pulse = 0.04 + 0.015 * Math.sin(blobTime * 1.3 + i);
        grd.addColorStop(0, `rgba(${b.color},${pulse})`);
        grd.addColorStop(0.5, `rgba(${b.color},${pulse * 0.4})`);
        grd.addColorStop(1, `rgba(${b.color},0)`);
        bgCtx.fillStyle = grd;
        bgCtx.fillRect(0, 0, W, H);
    });

    // DNA helix (right side)
    drawHelix(W, H);

    // Particle connections
    for (let i = 0; i < bgParts.length; i++) {
        for (let j = i + 1; j < bgParts.length; j++) {
            const dx = bgParts[i].x - bgParts[j].x, dy = bgParts[i].y - bgParts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130) {
                bgCtx.beginPath();
                bgCtx.strokeStyle = `rgba(34,197,94,${0.07 * (1 - d / 130)})`;
                bgCtx.lineWidth = 0.5;
                bgCtx.moveTo(bgParts[i].x, bgParts[i].y);
                bgCtx.lineTo(bgParts[j].x, bgParts[j].y);
                bgCtx.stroke();
            }
        }
    }

    // Particles
    const colors = ['34,197,94', '15,118,110', '6,182,212'];
    bgParts.forEach(p => {
        p.phase += 0.02;
        const op = p.op + Math.sin(p.phase) * 0.15;
        // Subtle glow
        const grd = bgCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grd.addColorStop(0, `rgba(${colors[p.type]},${op * 0.7})`);
        grd.addColorStop(1, `rgba(${colors[p.type]},0)`);
        bgCtx.fillStyle = grd;
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        bgCtx.fill();
        // Core dot
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(${colors[p.type]},${op})`;
        bgCtx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = bgCanvas.width;
        if (p.x > bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = bgCanvas.height;
        if (p.y > bgCanvas.height) p.y = 0;
    });

    requestAnimationFrame(animateBg);
}
animateBg();

// ====== Toprak Mikrobiyomu Canvas Animasyonu ======
const mCanvas = document.getElementById('microbiomeCanvas');
const mCtx = mCanvas.getContext('2d');
const MX = mCanvas.width / 2, MY = mCanvas.height / 2, MR = 175;

// Soil layers
const layers = [
    { y: MY - 40, color: 'rgba(139,90,43,0.35)', w: 340 },
    { y: MY + 10, color: 'rgba(101,67,33,0.4)', w: 340 },
    { y: MY + 60, color: 'rgba(74,48,22,0.45)', w: 340 },
];

// Microorganism particles inside the sphere
const microPs = Array.from({ length: 70 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const rr = Math.random() * MR * 0.82;
    return {
        x: MX + Math.cos(angle) * rr, y: MY + Math.sin(angle) * rr,
        r: Math.random() * 4 + 1.5,
        color: ['#22c55e', '#16a34a', '#0f766e', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2, op: Math.random() * 0.6 + 0.3, isSpore: Math.random() > 0.75,
    };
});

// Mycelium network nodes
const mycelNodes = Array.from({ length: 12 }, () => {
    const angle = Math.random() * Math.PI * 2, rr = Math.random() * MR * 0.7 + 20;
    return { x: MX + Math.cos(angle) * rr, y: MY + Math.sin(angle) * rr };
});

let mTime = 0;

function animateMicro() {
    mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
    mTime += 0.012;

    // Clipping to circle
    mCtx.save();
    mCtx.beginPath();
    mCtx.arc(MX, MY, MR, 0, Math.PI * 2);
    mCtx.clip();

    // Deep earth gradient background
    const earthGrad = mCtx.createRadialGradient(MX - 30, MY - 50, 10, MX, MY, MR);
    earthGrad.addColorStop(0, '#1a2e1a');
    earthGrad.addColorStop(0.4, '#0f1f12');
    earthGrad.addColorStop(0.7, '#0a1a10');
    earthGrad.addColorStop(1, '#060d08');
    mCtx.fillStyle = earthGrad;
    mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);

    // Soil horizon layers
    layers.forEach(l => {
        mCtx.fillStyle = l.color;
        mCtx.fillRect(MX - l.w / 2, l.y, l.w, 28);
    });

    // Mycelium network (glowing lines)
    for (let i = 0; i < mycelNodes.length; i++) {
        for (let j = i + 1; j < mycelNodes.length; j++) {
            const dx = mycelNodes[i].x - mycelNodes[j].x, dy = mycelNodes[i].y - mycelNodes[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 120) {
                mCtx.beginPath();
                mCtx.strokeStyle = `rgba(34,197,94,${0.25 * (1 - d / 120) * (0.7 + 0.3 * Math.sin(mTime + i))})`;
                mCtx.lineWidth = 0.8;
                mCtx.moveTo(mycelNodes[i].x, mycelNodes[i].y);
                mCtx.lineTo(mycelNodes[j].x, mycelNodes[j].y);
                mCtx.stroke();
            }
        }
    }

    // Slowly drift mycelium nodes
    mycelNodes.forEach((n, i) => {
        n.x += Math.sin(mTime * 0.5 + i) * 0.15;
        n.y += Math.cos(mTime * 0.4 + i) * 0.15;
        const dx = n.x - MX, dy = n.y - MY;
        if (Math.sqrt(dx * dx + dy * dy) > MR * 0.8) { n.x = MX + dx * 0.5; n.y = MY + dy * 0.5; }
    });

    // Microorganism particles
    microPs.forEach((p, i) => {
        p.phase += 0.02;
        const glow = mCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        const op = p.op * (0.8 + 0.2 * Math.sin(p.phase));
        glow.addColorStop(0, p.color + 'cc');
        glow.addColorStop(0.4, p.color + '55');
        glow.addColorStop(1, 'transparent');
        mCtx.fillStyle = glow;
        mCtx.beginPath();
        mCtx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        mCtx.fill();

        mCtx.beginPath();
        if (p.isSpore) {
            mCtx.ellipse(p.x, p.y, p.r * 1.5, p.r * 0.8, Math.sin(mTime + i) * 0.5, 0, Math.PI * 2);
        } else {
            mCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        mCtx.fillStyle = p.color;
        mCtx.globalAlpha = op;
        mCtx.fill();
        mCtx.globalAlpha = 1;

        p.x += p.vx + Math.sin(mTime + i * 0.7) * 0.1;
        p.y += p.vy + Math.cos(mTime + i * 0.5) * 0.1;
        const dx = p.x - MX, dy = p.y - MY;
        if (Math.sqrt(dx * dx + dy * dy) > MR * 0.9) { p.vx *= -1; p.vy *= -1; p.x += p.vx * 2; p.y += p.vy * 2; }
    });

    // Outer glow ring
    const outerGlow = mCtx.createRadialGradient(MX, MY, MR * 0.75, MX, MY, MR);
    outerGlow.addColorStop(0, 'transparent');
    outerGlow.addColorStop(1, `rgba(34,197,94,${0.15 + 0.08 * Math.sin(mTime)})`);
    mCtx.fillStyle = outerGlow;
    mCtx.beginPath();
    mCtx.arc(MX, MY, MR, 0, Math.PI * 2);
    mCtx.fill();

    // Scanning line
    const scanY = MY - MR + ((mTime * 40) % (MR * 2));
    if (scanY < MY + MR) {
        mCtx.beginPath();
        mCtx.strokeStyle = `rgba(34,197,94,0.15)`;
        mCtx.lineWidth = 1;
        const half = Math.sqrt(Math.max(0, MR * MR - (scanY - MY) ** 2));
        mCtx.moveTo(MX - half, scanY);
        mCtx.lineTo(MX + half, scanY);
        mCtx.stroke();
    }

    mCtx.restore();

    // Circle border glow
    mCtx.beginPath();
    mCtx.arc(MX, MY, MR, 0, Math.PI * 2);
    mCtx.strokeStyle = `rgba(34,197,94,${0.5 + 0.2 * Math.sin(mTime)})`;
    mCtx.lineWidth = 2;
    mCtx.stroke();

    requestAnimationFrame(animateMicro);
}
animateMicro();

// ====== Harita İşlemleri (Leaflet) ======
let map = L.map('map').setView([39.0, 35.2], 6);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

let currentMarker = null;
const provinceSelect = document.getElementById('provinceSelect');
const districtSelect = document.getElementById('districtSelect');
const coordsDisplay = document.getElementById('coords');
let currentDistricts = [];

const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#22c55e;width:15px;height:15px;border-radius:50%;box-shadow:0 0 15px #22c55e;border:2px solid #fff'></div>",
    iconSize: [15, 15], iconAnchor: [7.5, 7.5]
});

provincesData.forEach(p => { provinceSelect.appendChild(new Option(p.name, p.id)); });

function loadDistricts() {
    const selectedId = provinceSelect.value;
    districtSelect.innerHTML = '<option value="">İlçe Seçin...</option>';
    if (selectedId) {
        const province = provincesData.find(p => p.id == selectedId);
        currentDistricts = generateMockDistricts(province.name);
        currentDistricts.forEach(d => { districtSelect.appendChild(new Option(d.name, d.id)); });
        districtSelect.disabled = false;
        updateMapAndCoords(province.lat, province.lng, province.name);
    } else {
        districtSelect.disabled = true;
        if (currentMarker) map.removeLayer(currentMarker);
        map.setView([39.0, 35.2], 6);
        coordsDisplay.textContent = 'Enlem: -, Boylam: -';
    }
}

function focusDistrict() {
    const pId = provinceSelect.value, dId = districtSelect.value;
    if (pId && dId) {
        const province = provincesData.find(p => p.id == pId);
        const district = currentDistricts.find(d => d.id == dId);
        const lat = province.lat + district.latOffset, lng = province.lng + district.lngOffset;
        updateMapAndCoords(lat, lng, `${province.name}, ${district.name}`);
        document.getElementById('resultLocation').textContent = `${province.name}, ${district.name}`;
    }
}

function updateMapAndCoords(lat, lng, popupText) {
    if (currentMarker) map.removeLayer(currentMarker);
    currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
        .bindPopup(`<b>${popupText}</b>`).openPopup();
    map.setView([lat, lng], 10);
    coordsDisplay.textContent = `Enlem: ${lat.toFixed(4)}, Boylam: ${lng.toFixed(4)}`;
}

// ====== Sayfa Yönlendirme (SPA) ======
function navigateTo(sectionId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active-section'));
    document.getElementById(sectionId).classList.add('active-section');
    window.scrollTo(0, 0);
    if (sectionId === 'analysis') setTimeout(() => { map.invalidateSize(); }, 300);
}

// ====== Sekme Değiştirme ======
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const tabEl = document.getElementById(tabId + 'Tab');
    if (tabEl) tabEl.style.display = 'block';
    if (btn) btn.classList.add('active');
}

// ====== Dosya Yükleme ======
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); }));
['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('dragover')));
['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('dragover')));
dropZone.addEventListener('drop', e => handleFiles({ target: { files: e.dataTransfer.files } }), false);
fileInput.addEventListener('change', handleFiles, false);
function handleFiles(e) { if (e.target.files.length > 0) startAnalysis('file'); }

// ====== Analiz ======
function startAnalysis(method) {
    if (provinceSelect.value === '') { alert('Lütfen haritadan analiz edilecek ili seçin!'); return; }
    let analysisData = {};
    if (method === 'survey') {
        analysisData = {
            soil: document.getElementById('q-soil').value,
            crop: document.getElementById('q-crop').value || 'Belirtilmedi',
            climate: document.getElementById('q-climate').value,
            fert: document.getElementById('q-fert').value,
            type: 'Anket (Saha Gözlem Formu)'
        };
    } else {
        analysisData = { type: 'Laboratuvar Analiz Raporu (CSV/PDF)' };
    }
    document.getElementById('inputSteps').classList.remove('active');
    document.getElementById('loadingStep').classList.add('active');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress > 100) progress = 100;
        document.getElementById('progressFill').style.width = progress + '%';
        if (progress === 100) { clearInterval(interval); setTimeout(() => showResults(analysisData), 800); }
    }, 300);
}

function showResults(data) {
    document.getElementById('loadingStep').classList.remove('active');
    document.getElementById('resultStep').classList.add('active');
    document.getElementById('progressFill').style.width = '0%';

    const isDrought = data.climate?.includes('Kurak');
    let baseScore = isDrought ? Math.floor(Math.random() * 20) + 40 : Math.floor(Math.random() * 20) + 65;
    const scoreEl = document.getElementById('overallScore');
    const statusEl = document.getElementById('scoreStatus');
    scoreEl.textContent = baseScore;
    statusEl.className = 'status ' + (baseScore < 50 ? 'danger' : baseScore < 75 ? 'warning' : 'success');
    statusEl.textContent = baseScore < 50 ? 'Kritik Seviye' : baseScore < 75 ? 'Gelişime Açık' : 'Optimal Sağlık';
    document.getElementById('resStress').textContent = isDrought ? 'Yüksek Kuraklık ve Tuzlanma' : 'Nitrojen Eksikliği İhtimali';
    document.getElementById('resEnzyme').textContent = isDrought ? 'Lipaz (Baskılanmış)' : 'Proteaz (Aktif)';

    let locationStr = document.getElementById('resultLocation').textContent;
    let summaryHtml = `
        <p>${locationStr} bölgesi için gerçekleştirilen mikrobiyom adaptasyon ve toprak sağlığı analizleri tamamlanmıştır.</p>
        <p>Bölgedeki ${isDrought ? 'şiddetli kuraklık etkileri' : 'mevcut iklim koşulları'}, toprak florasındaki faydalı enzimlerin aktivasyonunu <strong>%${Math.floor(Math.random() * 30) + 15} oranında etkilemektedir</strong>. Hesaplanan kümülatif İklim Direnç Skorunuz <strong>${baseScore}/100</strong> olarak ölçülmüştür.</p>
        <p>Araştırma sonuçları, ilgili toprağın uzun vadeli sürdürülebilirliği için mikrobiyotal floranın spesifik inokülantlar (bakteri aşıları) ile desteklenmesi gerektiğine işaret etmektedir.</p>
    `;
    let reportHtml = `
        <p><strong>RAPOR ÖZETİ — ${new Date().toLocaleDateString('tr-TR')}</strong></p>
        <p>Analiz tipi: <em>${data.type} baz alınmıştır.</em></p>
        ${summaryHtml}
    `;
    document.getElementById('reportText').innerHTML = reportHtml;

    let recs = `
        <li><strong>Biyoteknolojik Müdahale:</strong> Pseudomonas kökenli ACC deaminaz aktivitesi yüksek rhizobakteriler toprağa aşılanmalıdır.</li>
        <li><strong>Stres Yönetimi:</strong> Toprak yapısı göz önüne alındığında, yüzey buharlaşmasını önleyici organik malçlama uygulaması tavsiye edilir.</li>
        <li><strong>Mikrobiyal Çeşitlilik:</strong> Phyto-ekstraksiyon kapasitesini artırmak için düşük dozlu leonardit (Hümik Fulvik asit) takviyesi yapın.</li>
    `;
    document.getElementById('recommendationsList').innerHTML = recs;
    if (currentMarker) currentMarker.setPopupContent(`<b>Analiz Tamamlandı</b><br>Skor: ${baseScore}/100`).openPopup();

    document.getElementById('pdf-date').textContent = new Date().toLocaleDateString('tr-TR');
    document.getElementById('pdf-id').textContent = 'MR-' + Math.floor(Math.random() * 90000 + 10000);
    document.getElementById('pdf-location').textContent = locationStr;
    document.getElementById('pdf-type').textContent = data.type + ' üzerinden';
    document.getElementById('pdf-score').textContent = baseScore;
    document.getElementById('pdf-score').style.color = baseScore < 50 ? '#ef4444' : baseScore < 75 ? '#f59e0b' : '#22c55e';
    document.getElementById('pdf-stress').textContent = isDrought ? 'Yüksek Kuraklık ve Tuzlanma' : 'Ortalama Stres, Olası Nitrojen Açığı';
    document.getElementById('pdf-ai-summary').innerHTML = summaryHtml;
    document.getElementById('pdf-recs').innerHTML = recs;
}

function downloadPDF() {
    const element = document.getElementById('printable-report');
    const opt = {
        margin: 10, filename: 'MicroResilience_Zirai_Rapor.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function resetAnalysis() {
    document.getElementById('resultStep').classList.remove('active');
    document.getElementById('inputSteps').classList.add('active');
}

// ====== Chatbot (Gelişmiş) ======
const chatWindow = document.getElementById('chatWindow');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
let chatOpen = false;
let micoMessageCount = 0;
let lastTopic = null;

function toggleChat() {
    chatOpen = !chatOpen;
    chatWindow.style.display = chatOpen ? 'flex' : 'none';
    if (chatOpen) { const badge = document.querySelector('.chat-badge'); if (badge) badge.style.display = 'none'; }
}
function handleChatPress(e) { if (e.key === 'Enter') sendChatMessage(); }

// ────── Resmi Kurumlar Yönlendirme Mesajı ──────
function officialReferral() {
    return `Bu konu uzman değerlendirmesi gerektiren teknik bir alan. Size en doğru bilgiyi sunabilmek için aşağıdaki resmi kurumları öneririm:<br><br>
    🏛️ <b>T.C. Tarım ve Orman Bakanlığı</b><br>
    <span style="opacity:0.7;font-size:0.85rem;">→ <a href="https://www.tarimorman.gov.tr" target="_blank" style="color:var(--primary)">tarimorman.gov.tr</a></span><br><br>
    🔬 <b>TÜBİTAK – Bilimsel Araştırma Projeleri</b><br>
    <span style="opacity:0.7;font-size:0.85rem;">→ <a href="https://www.tubitak.gov.tr" target="_blank" style="color:var(--primary)">tubitak.gov.tr</a></span><br><br>
    🌾 <b>Ziraat Mühendisleri Odası (ZMO)</b><br>
    <span style="opacity:0.7;font-size:0.85rem;">→ <a href="https://www.zmo.org.tr" target="_blank" style="color:var(--primary)">zmo.org.tr</a></span><br><br>
    🧬 <b>Toprak Gübre ve Su Kaynakları Merkez Araştırma Enstitüsü</b><br>
    <span style="opacity:0.7;font-size:0.85rem;">→ <a href="https://toprakgubre.tarimorman.gov.tr" target="_blank" style="color:var(--primary)">toprakgubre.tarimorman.gov.tr</a></span><br><br>
    <span style="opacity:0.6;font-size:0.82rem;">💡 Ben yalnızca genel bilgi sunabilirim. Kesin tanı ve reçete için yetkili ziraat mühendisi veya araştırma kuruluşuna başvurulması zorunludur.</span>`;
}

// ────── Detaylı Chatbot Yanıt Motoru ──────
const micoReplies = {
    selamlama: [
        'Merhaba! Ben Mico 🌿 — MicroResilience AI\'nin toprak uzmanı asistanıyım. Toprağınızın sağlığı, analiz raporunuz, mikrobiyom yapısı veya iklim stres faktörleri hakkında bana soru sorabilirsiniz.',
        'Selam! Mico burada 👋 Araziyle ilgili aklınıza takılan her şeyi sorabilirsiniz — toprak pH\'ı, bakteri türleri, gübre seçimi, kuraklık yönetimi... Neyle başlayalım?',
        'Hoş geldiniz! 🌱 Ben Mico, mikrobiyom ve sürdürülebilir tarım konularında eğitimli bir AI asistanıyım. Size nasıl yardımcı olabilirim?'
    ],
    rapor: [
        'Analiz raporunuz; harita üzerinde seçtiğiniz il/ilçe\'nin iklim verileri, saha anket yanıtlarınız ve algoritmik enzim-skor eşleştirmeleri kullanılarak hesaplanmıştır.<br><br><b>Skoru nasıl yorumlamalısınız?</b><br>• <b>75-100:</b> Toprak sağlıklı, koruyucu önlemler yeterli.<br>• <b>50-74:</b> Gelişime açık; organik takviye ve biyostimülant uygulaması önerilir.<br>• <b>50 altı:</b> Kritik seviye — mutlaka biyolojik müdahale ve uzman danışmanlığı gerektirir.',
        'Raporunuzdaki <b>İklim Direnç Skoru</b> birden fazla parametrenin bileşimidir:<br><br>① Toprak türü ve geçirgenlik<br>② Bölgesel kuraklık/yağış endeksi<br>③ Kimyasal gübre yükü (mikrofloraya etkisi)<br>④ Mahsul tipi ve ekim dönemi<br><br>75 altı skorlarda sistem otomatik olarak yüksek riskli stres faktörlerini baskın olarak işaretlemektedir.'
    ],
    bakteri: [
        '🔬 Toprağınız için en etkili <b>PGPR (Plant Growth Promoting Rhizobacteria)</b> türleri:<br><br>• <b>Azotobacter chroococcum:</b> Serbest azot fiksasyonu yaparak kimyasal azot gübreye olan ihtiyacı %40\'a kadar azaltır.<br>• <b>Rhizobium leguminosarum:</b> Baklagil köklerinde nodül oluşturarak biyolojik azot sağlar.<br>• <b>Pseudomonas fluorescens:</b> Kök bölgesinde patojenlere karşı antibiyotik üretir, bitkiyi korur.<br>• <b>Bacillus megaterium:</b> Fosfat çözücü özelliğiyle toprağın fosfor kullanımını artırır.<br>• <b>Trichoderma asperellum:</b> Fungal patojenlere karşı biyolojik mücadelede en etkili türlerden biridir.',
        '🧫 Mikoriza (Mycorrhizal Fungi) hakkında bilmeniz gerekenler:<br><br><b>Glomus intraradices</b> ve <b>Rhizophagus irregularis</b> türleri, bitki kökünün emme yüzeyini 100-1000 kat genişletir. Bu sayede;<br>• Su stresine karşı tolerans artar<br>• Fosfor alım verimliliği %50-80 yükselir<br>• Toprak agregası kuvvetlenir (erozyon azalır)<br><br>Toprağa mikoriza inokulumu sürücü dönemde kök bölgesine uygulanmalıdır.'
    ],
    kuraklık: [
        '🌵 <b>Kuraklık Stres Yönetimi (Drought Stress Management)</b><br><br>Kuraklık dönemlerinde toprak mikrobiyotasının %60-80\'i ölüme gidebilir. Önlem stratejileri:<br><br>① <b>Humik & Fulvik Asit Takviyesi:</b> Leonardit kaynaklı ürünler, toprak nem tutma kapasitesini %20-35 artırır.<br>② <b>Mikoriza İnokulasyonu:</b> Kök yüzeyinin genişlemesiyle bitki kuyu suyu erişimini artırır.<br>③ <b>Organik Malçlama:</b> Yüzey buharlaşmasını %40-60 oranında önler.<br>④ <b>Damla Sulama:</b> Su verimini optimize eder, tuzlanmayı engeller.<br><br>Yapay zeka analizinizde kuraklık indeksi yüksek çıkmışsa bu adımların tamamı öncelikli uygulanmalıdır.',
        '💧 <b>Su Stresi Belirteçleri — Toprağınızı tanıyın:</b><br><br>• Toprak yüzeyinde beyazımsı tuz kabuğu → Tuzlanma başlamış olabilir<br>• Bitki yapraklarında deforme kenar → Osmotik stres sinyali<br>• Pamuklu veya küf görünümlü yüzey → Anaerobik bakteri baskınlığı<br><br>Bu belirtiler varsa derhal toprak pH ve EC (elektrik iletkenliği) ölçümü yaptırın. EC değeri 4 dS/m\'yi aştığında çoğu kültür bitkisi için kritik eşiğe girilmiş demektir.'
    ],
    gubre: [
        '🌿 <b>Organik ve Biyolojik Gübre Rehberi:</b><br><br>• <b>Kompost Çayı (Compost Tea):</b> 24-36 saat havalandırılmış olgun kompostun özü — canlı bakteri sayısını toprağa direkt aktarır.<br>• <b>Biyostimülantlar:</b> Deniz yosunu ekstraktı (Ascophyllum nodosum) ve aminoasit bazlı ürünler köklerin stres toleransını artırır.<br>• <b>Vermikompost:</b> Solucan gübresi, toprak mikrobiyomunu en hızlı destekleyen organik materyaldir.<br>• <b>Mikrobiyal Gübreler (Bakteri Aşıları):</b> Rhizobium, Azospirillum, PSB (fosfat çözücü bakteriler) içeren karışımlar toprağa doğrudan inoküle edilir.<br><br>⚠️ Kimyasal NPK gübreyi aniden kesmek toprak florasında şok yaratır. Geçiş en az 2-3 sezon sürmeli.',
        '⚗️ <b>Toprak pH\'ı ve Gübre Seçimi arasındaki kritik ilişki:</b><br><br>• <b>pH 5.5-6.0 (Asidik):</b> Azot kaybı artar, alüminyum toksisitesi riski — Kireçleme gerekebilir.<br>• <b>pH 6.0-7.0 (İdeal):</b> En yüksek besin alım verimliliği — Standart organik gübre yeterli.<br>• <b>pH 7.5+ (Alkali):</b> Demir, çinko, mangan kilitlenir — Asitleştirici kükürt ve humik asit şart.<br><br>pH düzeltmesi yapılmadan uygulanan gübre büyük ölçüde boşa harcanır.'
    ],
    tuzlanma: [
        '🧂 <b>Toprak Tuzlanması (Soil Salinization) — Ciddi bir tehdit:</b><br><br>Tuzlanma özellikle aşırı sulama ve sentetik gübre birikmesiyle oluşur. Yönetim stratejisi:<br><br>① <b>Halotolerant Bakteri Aşısı:</b> Bacillus subtilis ve Halobacterium türleri yüksek tuz ortamında dahi büyümeye devam eder, bitkinin etilen stresini kırar (ACC deaminaz mekanizması).<br>② <b>Drenaj Islahı:</b> Drip-sulama ve yüzey drenaj kanalları tuz birikimini durdurur.<br>③ <b>Kükürt Uygulaması:</b> Sodyum karbonatlı (alkali-tuzlu) topraklarda eleman kükürt H₂SO₄ döngüsü başlatır, sodyu çözümler.<br>④ <b>Alçı (Gypsum – CaSO₄) Uygulaması:</b> Na⁺ iyonlarını Ca²⁺ ile değiştirir, toprak yapısını düzeltir.',
    ],
    ph: [
        '⚗️ <b>Toprak pH\'ı neden bu kadar kritik?</b><br><br>pH, toprağın besin elementlerinin "kapısını" açan veya kapatan kimyasal anahtardır.<br><br>• <b>pH altında 5.5:</b> Alüminyum ve mangan toksik forma geçer, kök gelişimi durur.<br>• <b>pH 6.0-7.2 arası:</b> Azot, fosfor, potasyum ve mikro elementlerin tamamı maksimum biyoyararlanımda.<br>• <b>pH 7.5 üstü:</b> Demir, çinko, bakır çekilemez hale gelir — yapraklarda kloroz (sararma) görülür.<br><br>📌 Toprağınızın pH\'ını yılda en az 1 kez, sezon başında ölçtürün.',
    ],
    enzim: [
        '🔬 <b>Toprak Enzimlerinin Önemi:</b><br><br>Enzimler, toprak mikrobiyomunun "solunum" sisteminin bir parçasıdır. Temel enzimler ve anlamları:<br><br>• <b>Urease:</b> Üre gübreyi bitki alabilir NH₄⁺ formuna çevirir. Aktivitesi düşerse azot kaybı artar.<br>• <b>Phosphatase:</b> Organik fosfor bileşiklerini PO₄³⁻ formuna hidrolize eder. Aktivitesi <200 mmol/g/h altına düşerse fosfor açığı başlar.<br>• <b>Dehydrogenase:</b> Genel mikrobiyal aktivite göstergesidir. Bu enzimin düşüklüğü toprağın "ölüme yattığı" anlamına gelir.<br>• <b>β-glucosidase:</b> Karbon döngüsünün anahtarı — organik madde parçalanmasını yönetir.',
    ],
    iklim: [
        '🌡️ <b>İklim Değişikliğinin Toprak Mikrobiyomuna Etkisi:</b><br><br>Araştırmalar, yüzey toprak sıcaklığının +2°C artışının mikrobiyom çeşitliliğini %15-30 oranında azaltabileceğini göstermektedir.<br><br>Kritik etkiler:<br>• Yüksek sıcaklık → Faydalı fungal ağların çöküşü<br>• Değişen yağış rejimi → Anaerobik dönemlerin artışı (metan üretici arke baskınlığı)<br>• Kar örtüsü kaybı → İlkbahar toprak sıcaklık şoku<br><br>📍 Bu nedenle raporunuzdaki "İklim Direnç Skoru" kritik bir göstergedir — toprağın iklim değişikliğine ne kadar hazır olduğunu ölçmektedir.',
    ],
    organik: [
        '♻️ <b>Organik Madde (OM) ve Toprak Sağlığı:</b><br><br>Toprakta organik madde oranı %1 arttığında, her hektar başına 144.000 litre fazladan su tutma kapasitesi kazanılır.<br><br>Organik madde artırma yöntemleri:<br>• <b>Yeşil Gübre (Green Manure):</b> Baklagil çeşitleri (fiğ, mürdümük) toprağa sürülür.<br>• <b>Anız Sürümten Kaçınma:</b> Toprak üstü organik artıklar parçalanmaya bırakılır.<br>• <b>Biyochar (Biochar):</b> 300-700°C piroliz sıcaklığında üretilen çarbon materyali, toprağa 1000+ yıl kalıcı organik katkı sağlar.<br>• <b>Solucan Gübresi (Vermikompost):</b> N:P:K dengesi en yüksek organik gübre formudur.',
    ],
    hastalık: [
        '🦠 <b>Toprak Kaynaklı Bitki Hastalıkları:</b><br><br>En yaygın toprak patojenleri ve biyolojik mücadele stratejileri:<br><br>• <b>Fusarium oxysporum (Solgunluk):</b> → Trichoderma harzianum ve Bacillus subtilis inokulumu ile baskılanır.<br>• <b>Pythium spp. (Kök çürüklüğü):</b> → Pseudomonas fluorescens ve B. amyloliquefaciens uygulaması.<br>• <b>Rhizoctonia solani (Damping-off):</b> → Streptomyces spp. içeren biyolojik fungisitler etkilidir.<br>• <b>Sclerotinia (Beyaz çürüklük):</b> → Coniothyrium minitans ticari preparatları mücadelede kullanılır.<br><br>⚠️ Kimyasal fungisit kullanımı tüm toprak florasını olumsuz etkiler — biyolojik alternatifler önceliklendirilmeli.',
    ],
    analiz: [
        '🗺️ <b>Analizi nasıl kullanmalısınız?</b><br><br>① <b>Haritadan il/ilçe seçin</b> — Bölgesel iklim ve arazi verisi otomatik yüklenir.<br>② <b>Anket sekmesini doldurun</b> — Toprak tipi, yetiştirilen ürün, iklim gözleminiz ve gübre kullanımınızı girin.<br>③ <b>Analizi başlatın</b> — AI sistemi saniyeler içinde İklim Direnç Skorunuzu hesaplar.<br>④ <b>Raporu indirin</b> — Resmi PDF formatında kaydedin ve arşivleyin.<br><br>💡 Daha hassas sonuç için anket yerine laboratuvar CSV raporunuzu "Analiz Raporu Yükle" sekmesinden sisteme yükleyebilirsiniz.',
    ],
    erozyon: [
        '🌊 <b>Toprak Erozyonu ve Koruma:</b><br><br>Türkiye arazilerinin ~%54 erozyon riski altındadır.<br><br>• <b>Mikoriza Ağları:</b> Toprak agregatını 3-5x kuvvetlendirir<br>• <b>Örtü Bitkisi:</b> Fiğ, mürdümük — yüzey koruma + kök tutunma<br>• <b>Şerit Ekim (Contour Farming):</b> Eğimde su akışını keser<br>• <b>Biyochar:</b> Toprak ağırlığı artar, taşınma azalır<br>• <b>No-till (Sürümsüz Tarım):</b> Toprak yapısını ve fungal ağları korur',
    ],
    verim: [
        '📈 <b>Biyolojik Verim Artışı:</b><br><br>• <b>PGPR Aşısı:</b> Ortalama %15-30 verim artışı<br>• <b>Mikoriza:</b> Fosfor alımı +%50-80<br>• <b>Biyostimülantlar (Deniz yosunu + amino asit):</b> Strese dirençli bitki<br>• <b>Humik/Fulvik Asit:</b> Toprak CEC artışı → besin tutma kapasitesi<br><br>⚠️ Yalnızca kimyasal gübre kısa vadeli — toprak yorulması uzun vadede kayıp yaratır.',
    ],
    zararli: [
        '🐛 <b>Biyolojik Zararlı Mücadelesi:</b><br><br>• <b>Entomopatojen Nematodlar:</b> Toprak zararlılarına karşı doğal avcı<br>• <b>Beauveria bassiana:</b> Böcek patojeni fungus<br>• <b>Kırmızı Örümcek:</b> Phytoseiulus persimilis avcı akarı<br>• <b>Afid:</b> Aphidius colemani parazitoidi<br>• <b>Kök-ur Nematodu:</b> Tagetes (kadife çiçeği) nematosidal etki<br><br>⚠️ Kimyasal pestisit mikrobiyomu %40-70 bozabilir.',
    ],
    sulama: [
        '💧 <b>Sulama Sistemleri:</b><br><br>• <b>Damla Sulama:</b> %90+ etkinlik — kök bölgesine direkt ✅<br>• <b>Yağmurlama:</b> %75 etkinlik — yaprak hastalık riski<br>• <b>Salma Sulama:</b> %40-60 — toprak sıkışması + tuzlanma ⚠️<br>• <b>Mikro Yağmurlama:</b> Sera ve bağ için ideal<br><br>💡 Nem sensörü + otomatik damla = en az su, en yüksek verim.',
    ],
    bitki: [
        '🌾 <b>Bitki Türü ve Toprak Mikrobiyomu:</b><br><br>• <b>Baklagiller:</b> Rhizobium ile azot fiksasyonu<br>• <b>Tahıllar (buğday, mısır):</b> Azospirillum PGPR ile uyumlu<br>• <b>Sebzeler (domates, biber):</b> Yüksek fungal çeşitlilik — mikoriza öncelikli<br>• <b>Meyve Ağaçları:</b> Mikorizal ağ kurulumu uzun — erken inokulasyon şart<br><br>📌 Ekim Nöbeti (Crop Rotation): Mikrobiyom çeşitliliğini korumanın en ucuz yöntemi.',
    ],
    toprakTip: [
        '🏔️ <b>Toprak Tipi ve Yönetim Rehberi:</b><br><br>• <b>Kumlu:</b> Su tutma ↓ → Vermikompost + humik asit + sık damla sulama<br>• <b>Killi:</b> Havalanma ↓ → Kum + perlit + drenaj iyileştirme<br>• <b>Tınlı:</b> İdeal ✅ → Organik madde koruma düzeyinde devam<br>• <b>Kireçli (Yüksek pH):</b> Fe-Zn-Mn kilidi → Kükürt + humik asit önce<br>• <b>Tuzlu-Alkali:</b> Yüksek EC → Alçı + halotolerant bakteri + drenaj<br>• <b>Organik/Bataklık:</b> Yüksek O.M. + asidik → pH düzeltme + drenaj',
    ],
    kompost: [
        '♻️ <b>Kompost Yapımı:</b><br><br>İdeal C:N oranı = 25-30:1<br><br>• <b>Yeşil (N kaynağı):</b> Taze bitki, mutfak atığı, çim<br>• <b>Kahverengi (C kaynağı):</b> Dal, karton, saman, kuru yaprak<br><br><b>Aşamalar:</b><br>① Termofilik (55-70°C, 2-4 hafta) → patojenler ölür<br>② Mezofilik (25-40°C, 4-8 hafta) → organik sindirim<br>③ Olgunlaşma (<20°C, 2-4 hafta)<br><br>✅ Hazır kompost: koyu kahve, toprak kokulu.',
    ],
};

// ── Türkçe Normalleştirici ──
function normalizeTR(s) {
    return (s||'').toLowerCase()
        .replace(/[ğĞ]/g,'g').replace(/[şŞ]/g,'s').replace(/[ıİ]/g,'i')
        .replace(/[öÖ]/g,'o').replace(/[üÜ]/g,'u').replace(/[çÇ]/g,'c')
        .replace(/â/g,'a').replace(/î/g,'i').replace(/û/g,'u');
}

// ── Konu Anahtar Kelime Tablosu ──
const topicKeywords = {
    selamlama: ['merhaba','selam','hey','naber','gunaydin','iyi gunler','hosgeldin','nasilsin','nasil','iyi aksamlar'],
    rapor:     ['rapor','skor','sonuc','puan','deger','ne anlam','analiz sonuc','raporumu','degerlendirme','direnc skoru'],
    bakteri:   ['bakteri','mikroorganizma','mikoriza','fungi','mantar','rhizobium','trichoderma','pseudomonas','bacillus','azotobacter','pgpr','inokul','biyolojik ajan','azospirillum'],
    kurak:     ['kurak','susuz','nem','su stres','su azl','drought','sulama yetersiz','toprak kurudu'],
    tuzlanma:  ['tuz','tuzluluk','tuzlanma','salinizasyon','ec degeri','sodyum','corak','gypsum','alcı','saline'],
    gubre:     ['gubre','kompost cayi','vermikompost','biyostimulant','npk','organik gubre','kimyasal gubre','azot gubre','fosfor','potasyum','leonardit','humik','fulvik','solucan gubre'],
    ph:        ['ph','asit','bazik','alkali','kirec','kirecleme','kloroz','sararma','toprak phsi','nötr'],
    enzim:     ['enzim','urease','phosphatase','dehydrogenase','glucosidase','amilaz','enzim aktivite','toprak solunumu','katalaz'],
    iklim:     ['iklim','sicaklik','kuresel isinma','karbon','sera gazi','iklim degisikligi','warming','iklim krizi'],
    organik:   ['organik madde','humus','biyochar','yesil gubre','aniz','organik karbon','no-till','surumsen'],
    hastalik:  ['hastalik','patojen','fusarium','pythium','rhizoctonia','kuf','curukluk','solgunluk','fungal','alternaria'],
    analiz:    ['nasil kullanil','nasil basla','harita','nasil yapilir','il sec','anket','platform','ne yapabilirim','nasil'],
    erozyon:   ['erozyon','toprak kaybi','yikanma','su erozyonu','ruzgar erozyonu','toprak tasinmasi'],
    verim:     ['verim','urun','hasat','rekolte','mahsul','verimlilik','verim artir','hasat artir'],
    zararli:   ['zararli','bocek','kurt','nematod','pest','istila','kirmizi orumcek','afid','yaprak biti'],
    sulama:    ['damla sulama','yagmurlama','salma sulama','sulama sistemi','drip','sulama yontemi','sulama miktari'],
    bitki:     ['bitki','mahsul cesidi','ekim','tohum','agac','meyve','sebze','tahil','bugday','misir','domates','pamuk','fasulye'],
    toprakTip: ['kil','kum','mil','tin','kumlu tin','killi toprak','toprak tipi','agregat','milli toprak','laterit','kizil toprak'],
    kompost:   ['kompost yapimi','kompostlama','organik atik','mutfak atigi','kompost yigini','fermentasyon'],
};

// ── Skor Tabanlı Konu Tespiti ──
function detectTopic(rawText) {
    const t = normalizeTR(rawText);
    let best = null, bestScore = 0;
    for (const [topic, kws] of Object.entries(topicKeywords)) {
        let score = 0;
        for (const kw of kws) { if (t.includes(normalizeTR(kw))) score += (kw.length > 6 ? 2 : 1); }
        if (score > bestScore) { bestScore = score; best = topic; }
    }
    if (bestScore === 0 && lastTopic && /daha|peki|ya|neden|nasil|ne zaman|hangi|devam|anlat|acikla/.test(t)) return lastTopic;
    return bestScore > 0 ? best : null;
}

function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, 'user-message');
    chatInput.value = '';
    micoMessageCount++;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" style="opacity:0.5;font-size:0.85rem"></i> <span style="opacity:0.4">yanıtlanıyor...</span>';
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        typingDiv.remove();
        const topic = detectTopic(text);
        let reply;
        if (topic && micoReplies[topic]) {
            lastTopic = topic;
            const arr = micoReplies[topic];
            reply = arr[Math.floor(Math.random() * arr.length)];
        } else {
            lastTopic = null;
            const fallbacks = [
                `Bu konuda yeterli bilgim yok. Uzman ve resmi kurumları öneririm:<br><br>${officialReferral()}`,
                `Bu soruyu tam yanıtlamak için uzman değerlendirmesi gerekiyor:<br><br>${officialReferral()}`,
                `Yanılmamak adına sizi doğru kaynaklara yönlendireyim:<br><br>${officialReferral()}`,
            ];
            reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
        addMessage(reply, 'ai-message');

        if (micoMessageCount % 6 === 0) {
            setTimeout(() => {
                addMessage('💡 <b>Hatırlatma:</b> Ben genel tarım bilgisi sunan bir AI yardımcısıyım. Kesin tanı veya reçete için yetkili bir <b>Ziraat Mühendisi</b> ile görüşün.', 'ai-message');
            }, 1800);
        }
    }, Math.random() * 600 + 500);
}

function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// ====== AUTH MODAL ======
function openAuthModal(tab = 'login') {
    const overlay = document.getElementById('authOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAuthTab(tab);
}

function closeAuthModal() {
    document.getElementById('authOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function closeAuthOnBg(e) {
    if (e.target === document.getElementById('authOverlay')) closeAuthModal();
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('loginTabBtn');
    const registerBtn = document.getElementById('registerTabBtn');
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginBtn.classList.remove('active');
        registerBtn.classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pw = document.getElementById('loginPassword').value;
    if (!email || !pw) return;
    // Demo login simulation
    closeAuthModal();
    showToast(`✅ Hoş geldiniz! ${email} ile giriş yapıldı.`);
}

function handleRegister(e) {
    e.preventDefault();
    const pw = document.getElementById('regPassword').value;
    const pwc = document.getElementById('regPasswordConfirm').value;
    const terms = document.getElementById('termsCheck').checked;
    if (pw !== pwc) { alert('Şifreler eşleşmiyor!'); return; }
    if (!terms) { alert('Kullanım koşullarını kabul etmeniz gerekiyor.'); return; }
    if (pw.length < 8) { alert('Şifre en az 8 karakter olmalıdır.'); return; }
    const name = document.getElementById('regName').value;
    closeAuthModal();
    showToast(`🎉 Hesabınız oluşturuldu! Hoş geldiniz, ${name}!`);
}

function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function checkPwStrength(pw) {
    const bar = document.getElementById('pwBar');
    const hint = document.getElementById('pwHint');
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4'];
    const labels = ['Çok Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
    bar.style.width = (strength * 25) + '%';
    bar.style.background = colors[strength - 1] || '#ef4444';
    hint.textContent = strength > 0 ? labels[strength - 1] : '';
}

function socialLogin() {
    showToast('🔗 Google entegrasyonu yakında eklenecek!', 'info');
}

function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// Escape key to close modal
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuthModal(); });
