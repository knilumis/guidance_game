let gold = 1000; // Başlangıç altın miktarı
let score = 0;
let successfulHits = 0;
let level = 1;
let angle = Math.PI / 4; // Başlangıç açısı 45 derece
let currentMissile = 'PARS'; // İlk füze PARS
let missilePower = 15; // PARS füzesinin gücü
let targetSpeed = 0; // Başlangıçta hedef hızı sıfır
let targetVisible = true; // Hedef görünürlük durumu
let dragging = false;
let targetTimeout;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.25; // Yer çekimi kuvveti

// Füze bilgileri
const missiles = {
    'PARS': { power: 15 }, 
    'HAVAN': { power: 18 },
    'ALPAGU': { power: 21 },
    'DELİ MİNİ': { power: 23 },
    'DELİ': { power: 25 }
};

// Oyun başlatma fonksiyonu
function startGame() {
    setupLevel(level);
    draw();
}

// Seviye başlatma fonksiyonu
function setupLevel(currentLevel) {
    resetTargetPosition();
    document.getElementById('level').innerText = `LEVEL: ${currentLevel}`;
}

// Hedef pozisyonunu sıfırlayan fonksiyon
function resetTargetPosition() {
    let distance;
    if (level === 1) {
        distance = 600;
    } else if (level === 2) {
        distance = 800; // Mesafe ve zorluk biraz arttı
    } else if (level === 3) {
        distance = 1000; // Mesafe ve zorluk biraz arttı
    } else {
        distance = Math.floor(Math.random() * (canvas.width - 100)) + 100;
    }

    targetPosition = {
        x: Math.floor(Math.random() * (distance - 100)) + 100,
        z: Math.floor(Math.random() * (canvas.height - 100)) + 100
    };

    targetSpeed = level > 1 ? Math.floor(Math.random() * 5) + 2 : 0; // Hedef hızı biraz azaltıldı
    targetVisible = true;
    updateTargetInfo();

    clearTimeout(targetTimeout);
    targetTimeout = setTimeout(() => {
        targetVisible = false;
        resetTargetPosition();
    }, 5000); // Hedefler 5 saniye arayla çıkmaya devam ediyor
}

// Bilgi ve hedef pozisyonunu güncelleyen fonksiyon
function updateTargetInfo() {
    document.getElementById('targetX').innerText = targetPosition.x;
    document.getElementById('targetZ').innerText = targetPosition.z;
    document.getElementById('targetV').innerText = targetSpeed;
}

// Füze ateşleme fonksiyonu
function fireMissile(angle, power) {
    let missilePosition = { x: 100, z: canvas.height - 50 };
    let velocityX = Math.cos(angle) * power;
    let velocityZ = -Math.sin(angle) * power;

    const interval = setInterval(() => {
        velocityZ += gravity;
        missilePosition.x += velocityX;
        missilePosition.z += velocityZ;

        // Hedef hareketi
        targetPosition.x += targetSpeed;

        draw();
        ctx.fillStyle = 'black';
        ctx.fillRect(missilePosition.x, missilePosition.z, 10, 10);

        // Füze hedefi vurduğunda
        if (targetVisible && Math.abs(missilePosition.x - targetPosition.x) < 30 && Math.abs(missilePosition.z - targetPosition.z) < 30) {
            clearInterval(interval);
            hitTarget();
        }

        // Füze ekran dışına çıktığında
        if (missilePosition.x > canvas.width || missilePosition.z > canvas.height || missilePosition.z < 0) {
            clearInterval(interval);
        }

        updateTargetInfo();
    }, 20);
}

// Hedefi vurduğunda çalışan fonksiyon
function hitTarget() {
    score += 1;
    successfulHits += 1;
    document.getElementById('score').innerText = `SKOR: ${score}`;
    
    gold += Math.floor(Math.random() * 3) + 1;
    document.getElementById('gold').innerText = gold;
    
    targetVisible = false;
    resetTargetPosition();

    if (level === 1 && successfulHits >= 10) { // Seviye atlamak için gereken vuruş sayısı 10
        level = 2;
        successfulHits = 0;
        setupLevel(level);
    } else if (level === 2 && successfulHits >= 7) { // Seviye atlamak için gereken vuruş sayısı 7
        level = 3;
        successfulHits = 0;
        setupLevel(level);
    }
}

// Topu ve yörüngeyi çizen fonksiyon
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCannon();
    if (targetVisible) {
        drawTarget();
    }
    drawTrajectory(angle, missilePower);
    drawAngleSelector();
}

// Füze atarı çizen fonksiyon
function drawCannon() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(50, canvas.height - 50, 100, 50);
}

// Hedefi çizen fonksiyon
function drawTarget() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(targetPosition.x, targetPosition.z, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Yörüngeyi çizen fonksiyon
function drawTrajectory(angle, power) {
    ctx.beginPath();
    ctx.moveTo(100, canvas.height - 50);
    const trajectoryLength = power * 10;
    const endX = 100 + Math.cos(angle) * trajectoryLength;
    const endZ = canvas.height - 50 - Math.sin(angle) * trajectoryLength;
    ctx.lineTo(endX, endZ);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Açı ayar çemberini ve sürgüyü çizen fonksiyon
function drawAngleSelector() {
    const centerX = 100;
    const centerZ = canvas.height - 50;
    const radius = 100 + (missilePower - 5) * 2; 

    ctx.beginPath();
    ctx.arc(centerX, centerZ, radius, 0, Math.PI, true);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    const sliderX = centerX + Math.cos(angle) * radius;
    const sliderZ = centerZ - Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(sliderX, sliderZ, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Fare ile sürgü ayarlama işlemi
canvas.addEventListener('mousedown', (e) => {
    const centerX = 100;
    const centerZ = canvas.height - 50;
    const radius = 100 + (missilePower - 5) * 2;

    const mouseX = e.clientX;
    const mouseZ = e.clientY;

    const dist = Math.sqrt((mouseX - centerX) ** 2 + (mouseZ - centerZ) ** 2);

    if (Math.abs(dist - radius) < 10) {
        dragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const centerX = 100;
        const centerZ = canvas.height - 50;
        const mouseX = e.clientX;
        const mouseZ = e.clientY;

        angle = Math.atan2(centerZ - mouseZ, mouseX - centerX);
        angle = Math.max(0, Math.min(Math.PI, angle)); 

        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    dragging = false;
});

// Atış butonuna tıklama olayını dinle
document.getElementById('fireButton').addEventListener('click', () => {
    fireMissile(angle, missilePower);
});

// Menü elemanlarına tıklama işlemleri
document.querySelectorAll('.dropdown-content a').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault(); // Sayfa yenilemesini engeller

        console.log("Butona tıklama olayı çalıştı"); // Tıklama olayının çalışıp çalışmadığını kontrol ediyoruz

        const price = parseInt(e.target.getAttribute('data-price')); // Fiyatı tıklanan öğeden alıyoruz
        const missileName = e.target.textContent.split(' - ')[0].trim(); // Füze adını tıklanan öğeden alıyoruz

        console.log("Seçilen füze: ", missileName); // Füze adını konsolda kontrol ediyoruz

        if (price && missileName) {
            if (gold >= price) {
                gold -= price;
                document.getElementById('gold').innerText = gold;
                currentMissile = missileName;
                missilePower = missiles[currentMissile].power;

                document.getElementById('currentMissile').innerText = currentMissile;
                console.log("Yeni füze: ", currentMissile); // Konsolda güncellenen füze ismini kontrol ediyoruz
                alert(`${currentMissile} füzesini aldınız!`);
            } else {
                alert('Yeterli altınınız yok!');
            }
        } else {
            console.log("Fiyat veya füze adı alınamadı.");
        }
    });
});

// Altın ve füze adını başlangıçta göster
document.getElementById('currentMissile').innerText = currentMissile;
document.getElementById('gold').innerText = gold;

// Oyunu başlat
startGame();
