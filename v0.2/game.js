let gold = 1000;
let brainPoints = 0; // Yeni para birimi: 🧠
let score = 0;
let successfulHits = 0;
let level = 1;
let angle = Math.PI / 4;
let currentMissile = 'PARS';
let missilePower = 18;
let dragging = false;
let targetTimeout;
let bonusActive = false;
let targetSpeedMultiplier = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.25;

// Füze bilgileri
const missiles = {
    'PARS': { power: 18, explosionRadius: 0 }, 
    'ALPAGU': { power: 21, explosionRadius: 10 },
    'DELİ MİNİ': { power: 21, explosionRadius: 15 },
    'DELİ': { power: 21, explosionRadius: 20 }
};

// Hedefler için rastgele hız ve boyutlar belirleme
const targetTypes = [
    { size: 20, speed: 2, color: 'red', score: 1 },
    { size: 15, speed: 3, color: 'blue', score: 2 },
    { size: 10, speed: 4, color: 'green', score: 3 },
    { size: 25, speed: 1, color: 'gold', score: 10 } // Bonus hedef (altın renkli)
];

let target = generateTarget();

// Rastgele hedef oluşturma fonksiyonu
function generateTarget() {
    let type;
    if (bonusActive) {
        type = targetTypes[3]; // Bonus hedef
    } else {
        type = targetTypes[Math.floor(Math.random() * 3)]; // Normal hedefler
    }

    let distance = 300 + (score * 20); // Başlangıçta 300 birim mesafede, skor arttıkça daha uzak
    if (distance > canvas.width - 200) distance = canvas.width - 200; // Maksimum mesafe kontrolü

    return {
        x: Math.random() * distance + 100,
        z: Math.random() * (canvas.height - 200) + 100,
        size: type.size,
        speed: type.speed,
        color: type.color,
        score: type.score,
        directionX: Math.random() < 0.5 ? 1 : -1, // Rastgele yön belirleme
        directionZ: Math.random() < 0.5 ? 1 : -1  // Rastgele yön belirleme
    };
}

// Oyun başlatma fonksiyonu
function startGame() {
    setupLevel(level);
    draw();
}

// Seviye başlatma fonksiyonu
function setupLevel(currentLevel) {
    resetTargetPosition();
    document.getElementById('level').innerText = `LEVEL: ${currentLevel}`;
    bonusActive = currentLevel % 5 === 0;
}

// Hedef pozisyonunu sıfırlayan fonksiyon
function resetTargetPosition() {
    target = generateTarget();
    updateTargetInfo();

    clearTimeout(targetTimeout);
    targetTimeout = setTimeout(() => {
        targetVisible = false;
        resetTargetPosition();
    }, 5000);
}

// Bilgi ve hedef pozisyonunu güncelleyen fonksiyon
function updateTargetInfo() {
    document.getElementById('targetX').innerText = Math.round(target.x);
    document.getElementById('targetZ').innerText = Math.round(target.z);
    document.getElementById('targetV').innerText = target.speed * targetSpeedMultiplier;
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
        target.x += target.speed * target.directionX * targetSpeedMultiplier;
        target.z += target.speed * target.directionZ * targetSpeedMultiplier;

        // Hedef duvarlara çarptığında yön değiştirir
        if (target.x < 0 || target.x > canvas.width - target.size) {
            target.directionX *= -1;
        }
        if (target.z < 0 || target.z > canvas.height - target.size) {
            target.directionZ *= -1;
        }

        draw();
        drawMissile(missilePosition.x, missilePosition.z);

        // Füze hedefi vurduğunda veya patlama etkisi
        if (Math.abs(missilePosition.x - target.x) < target.size + missiles[currentMissile].explosionRadius && 
            Math.abs(missilePosition.z - target.z) < target.size + missiles[currentMissile].explosionRadius) {
            clearInterval(interval);
            hitTarget();
            if (missiles[currentMissile].explosionRadius > 0) {
                drawExplosion(missilePosition.x, missilePosition.z, missiles[currentMissile].explosionRadius);
            }
        }

        // Füze ekran dışına çıktığında
        if (missilePosition.x > canvas.width || missilePosition.z > canvas.height || missilePosition.z < 0) {
            clearInterval(interval);
        }

        updateTargetInfo();
    }, 20);
}

// Füze ateşleme efekti
function drawMissile(x, z) {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(x, z, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(x - 10, z, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Patlama efekti
function drawExplosion(x, z, radius) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, z, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Hedefi vurduğunda çalışan fonksiyon
function hitTarget() {
    score += target.score;
    successfulHits += 1;
    document.getElementById('score').innerText = `SKOR: ${score}`;
    
    gold += Math.floor(Math.random() * 3) + 1;
    
    // %30 ihtimalle 🧠 kazanın
    if (Math.random() < 0.3) {
        brainPoints += 1;
    }

    document.getElementById('gold').innerText = gold;
    document.getElementById('brainPoints').innerText = brainPoints;

    // Zorluk seviyesini artır
    if (score >= 20) {
        targetSpeedMultiplier = 2; // Skor 20'yi geçerse daha hızlı hareket
    } else if (score >= 10) {
        targetSpeedMultiplier = 1; // Skor 10'u geçerse hareket etmeye başlar
    }
    
    resetTargetPosition();

    if (level === 1 && successfulHits >= 10) {
        level = 2;
        successfulHits = 0;
        setupLevel(level);
    } else if (level === 2 && successfulHits >= 7) {
        level = 3;
        successfulHits = 0;
        setupLevel(level);
    }
}

// Topu ve yörüngeyi çizen fonksiyon
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCannon();
    drawTarget();
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
    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(target.x, target.z, target.size, 0, Math.PI * 2);
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
        e.preventDefault();

        const price = parseInt(e.target.getAttribute('data-price'));
        const itemName = e.target.textContent.split(' - ')[0].trim();

        if (price && itemName) {
            // Altın ile satılan füze kontrolü
            if (missiles[itemName]) {
                if (gold >= price) {
                    gold -= price;
                    document.getElementById('gold').innerText = gold;
                    currentMissile = itemName;
                    missilePower = missiles[currentMissile].power;

                    document.getElementById('currentMissile').innerText = currentMissile;
                    alert(`${currentMissile} aldınız!`);
                } else {
                    alert('Yeterli altınınız yok!');
                }
            // Beyin puanı ile alınan ögeler kontrolü
            } else if (features[itemName]) {
                if (brainPoints >= price) {
                    brainPoints -= price;
                    document.getElementById('brainPoints').innerText = brainPoints;
                    alert(`${itemName} aldınız!`);
                } else {
                    alert('Yeterli beyin puanınız yok!');
                }
            }
        }
    });
});

// Altın ve füze adını başlangıçta göster
document.getElementById('currentMissile').innerText = currentMissile;
document.getElementById('gold').innerText = gold;
document.getElementById('brainPoints').innerText = brainPoints;

// Mağaza açıklamalarını ekle
function updateStoreDescriptions() {
    document.querySelectorAll('.dropdown-content a').forEach(item => {
        const itemName = item.textContent.split(' - ')[0].trim();
        const missile = missiles[itemName];
        const feature = features[itemName];

        if (missile) {
            item.innerHTML = `${itemName} - ${item.getAttribute('data-price')} 🪙<br>Güç: ${missile.power}, Patlama: ${missile.explosionRadius}`;
        } else if (feature) {
            item.innerHTML = `${itemName} - ${item.getAttribute('data-price')} 🧠<br>${feature.description}`;
        }
    });
}

// Mağaza açıklamalarını güncelle
updateStoreDescriptions();

// Oyunu başlat
startGame();

