document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    const restartBtn = document.getElementById('restartBtn');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Элементы статистики
    const scoreStat = document.getElementById('score-stat');
    const oxygenStat = document.getElementById('oxygen-stat');
    const targetStat = document.getElementById('target-stat');
    const controlInfo = document.getElementById('control-info');
    const restartInfo = document.getElementById('restart-info');
    
    // Мобильные кнопки управления
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    // Возврат на главную страницу
    backBtn.addEventListener('click', function() {
        window.location.href = 'main.html';
    });
    
    // Перезапуск игры
    restartBtn.addEventListener('click', function() {
        restartGame();
    });
    
    // Определяем тип устройства
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Настройка информации в зависимости от устройства
    if (isMobile) {
        controlInfo.textContent = 'Собирайте сокровища (💰) и избегайте акул!';
        restartInfo.textContent = 'Коснитесь станции 🎯 справа для кислорода';
        restartBtn.style.display = 'block';
    } else {
        controlInfo.textContent = 'Собирайте сокровища (10-100 очков) и избегайте акул! Подплывайте к станции справа для пополнения кислорода.';
        restartInfo.textContent = 'Управление: стрелки или WASD | Нажмите R для перезапуска';
        restartBtn.style.display = 'none';
    }
    
    // Цвета
    const OCEAN_BLUE = '#2e86ab';
    const DARK_BLUE = '#1b4f72';
    const SAND_COLOR = '#e6bc57';
    const CORAL_COLOR = '#ff6b6b';
    
    // Переменные для плавной анимации
    let lastTime = 0;
    const fps = 60;
    const frameInterval = 1000 / fps;
    
    // Класс водолаза
    class Diver {
        constructor() {
            this.width = 35;
            this.height = 50;
            this.x = canvas.width / 2;
            this.y = canvas.height - 80;
            this.speed = 4;
            this.oxygen = 100;
            this.score = 0;
            this.isMoving = false;
        }
        
        draw() {
            // Тело водолаза
            ctx.fillStyle = '#FF6B35';
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            
            // Шлем
            ctx.fillStyle = '#4A90E2';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.height/2, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Ласты
            ctx.fillStyle = '#34495e';
            ctx.fillRect(this.x - 20, this.y + this.height/2 - 8, 40, 12);
            
            // Пузырьки дыхания
            if (this.isMoving) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(this.x + 12, this.y + 8, 2, 0, Math.PI * 2);
                ctx.arc(this.x - 4, this.y + 12, 1.5, 0, Math.PI * 2);
                ctx.arc(this.x + 4, this.y + 16, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        move(keys) {
            this.isMoving = false;
            
            if (keys['ArrowUp'] || keys['w'] || keys['W'] || keys['ц'] || keys['Ц']) {
                this.y -= this.speed;
                this.isMoving = true;
            }
            if (keys['ArrowDown'] || keys['s'] || keys['S'] || keys['ы'] || keys['Ы']) {
                this.y += this.speed;
                this.isMoving = true;
            }
            if (keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['ф'] || keys['Ф']) {
                this.x -= this.speed;
                this.isMoving = true;
            }
            if (keys['ArrowRight'] || keys['d'] || keys['D'] || keys['в'] || keys['В']) {
                this.x += this.speed;
                this.isMoving = true;
            }
            
            // Ограничение границами
            this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));
            this.y = Math.max(this.height/2, Math.min(canvas.height - this.height/2, this.y));
        }
        
        updateOxygen() {
            if (this.isMoving) {
                this.oxygen -= 0.08;
            } else {
                this.oxygen -= 0.03;
            }
            
            if (this.oxygen <= 0) {
                this.oxygen = 0;
                return true;
            }
            return false;
        }
        
        refillOxygen() {
            this.oxygen = Math.min(100, this.oxygen + 40);
        }
        
        getBounds() {
            return {
                x: this.x - this.width/2,
                y: this.y - this.height/2,
                width: this.width,
                height: this.height
            };
        }
    }
    
    // Класс сокровища
    class Treasure {
        constructor() {
            this.size = 25;
            this.x = Math.random() * (canvas.width - 80) + 40;
            this.y = Math.random() * (canvas.height - 150) + 50;
            this.type = Math.floor(Math.random() * 4);
            this.value = [10, 25, 50, 100][this.type];
            this.colors = ['#FFD700', '#C0C0C0', '#FF6B35', '#9B59B6'];
        }
        
        draw() {
            ctx.save();
            
            switch(this.type) {
                case 0: // Золотая монета
                    ctx.fillStyle = this.colors[0];
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#B8860B';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size/3, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 1: // Серебряный слиток
                    ctx.fillStyle = this.colors[1];
                    ctx.fillRect(this.x - this.size/2, this.y - this.size/4, this.size, this.size/2);
                    break;
                    
                case 2: // Драгоценный камень
                    ctx.fillStyle = this.colors[2];
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - this.size/2);
                    ctx.lineTo(this.x + this.size/2, this.y);
                    ctx.lineTo(this.x, this.y + this.size/2);
                    ctx.lineTo(this.x - this.size/2, this.y);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 3: // Жемчужина
                    ctx.fillStyle = this.colors[3];
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.beginPath();
                    ctx.arc(this.x - this.size/4, this.y - this.size/4, this.size/4, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
            
            ctx.restore();
        }
        
        getBounds() {
            return {
                x: this.x - this.size/2,
                y: this.y - this.size/2,
                width: this.size,
                height: this.size
            };
        }
    }
    
    // Класс акулы
    class Shark {
        constructor() {
            this.width = 70;
            this.height = 25;
            this.x = -this.width;
            this.y = Math.random() * (canvas.height - 80) + 40;
            this.speed = Math.random() * 1.5 + 1;
            this.direction = 1;
        }
        
        draw() {
            ctx.save();
            
            // Тело акулы
            ctx.fillStyle = '#95a5a6';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.width/2, this.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Хвост
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            if (this.direction === 1) {
                ctx.moveTo(this.x - this.width/2, this.y);
                ctx.lineTo(this.x - this.width, this.y - 12);
                ctx.lineTo(this.x - this.width, this.y + 12);
            } else {
                ctx.moveTo(this.x + this.width/2, this.y);
                ctx.lineTo(this.x + this.width, this.y - 12);
                ctx.lineTo(this.x + this.width, this.y + 12);
            }
            ctx.closePath();
            ctx.fill();
            
            // Плавник
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.moveTo(this.x + (this.direction * this.width/4), this.y - this.height/2);
            ctx.lineTo(this.x + (this.direction * this.width/2), this.y - this.height);
            ctx.lineTo(this.x + (this.direction * this.width/1.5), this.y - this.height/2);
            ctx.closePath();
            ctx.fill();
            
            // Глаз
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x + (this.direction * this.width/3), this.y - 4, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        move() {
            this.x += this.speed * this.direction;
            
            if (this.x > canvas.width + this.width) {
                this.direction = -1;
                this.y = Math.random() * (canvas.height - 80) + 40;
            } else if (this.x < -this.width) {
                this.direction = 1;
                this.y = Math.random() * (canvas.height - 80) + 40;
            }
        }
        
        getBounds() {
            return {
                x: this.x - this.width/2,
                y: this.y - this.height/2,
                width: this.width,
                height: this.height
            };
        }
    }
    
    // Класс станции пополнения кислорода
    class OxygenStation {
        constructor() {
            this.x = canvas.width - 50;
            this.y = canvas.height - 50;
            this.size = 35;
        }
        
        draw() {
            // Основание станции
            ctx.fillStyle = '#34495e';
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
            
            // Кислородный баллон
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x - 8, this.y - 15, 16, 25);
            
            // Шланг
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 15);
            ctx.lineTo(this.x, this.y - 35);
            ctx.stroke();
            
            // Пузырьки
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(this.x + Math.sin(Date.now()/500 + i) * 8, this.y - 40 - i * 4, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        getBounds() {
            return {
                x: this.x - this.size/2,
                y: this.y - this.size/2,
                width: this.size,
                height: this.size
            };
        }
    }
    
    // Создание объектов
    let diver = new Diver();
    let treasures = [];
    let sharks = [];
    let oxygenStation = new OxygenStation();
    let gameOver = false;
    let gameWon = false;
    
    // Таймеры
    let treasureTimer = 0;
    let sharkTimer = 0;
    
    // Переменные для управления
    let keys = {};
    
    // Функция перезапуска игры
    function restartGame() {
        diver = new Diver();
        treasures = [];
        sharks = [];
        oxygenStation = new OxygenStation();
        gameOver = false;
        gameWon = false;
        treasureTimer = 0;
        sharkTimer = 0;
        keys = {};
        if (!isMobile) {
            restartBtn.style.display = 'none';
        }
        updateStats();
    }
    
    // Функция обновления статистики
    function updateStats() {
        scoreStat.textContent = `💰: ${diver.score}`;
        oxygenStat.textContent = `🫁: ${Math.round(diver.oxygen)}%`;
        targetStat.textContent = `🎯: 500`;
    }
    
    // Функция проверки столкновений
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Функция отрисовки дна океана
    function drawOceanFloor() {
        // Песчаное дно
        ctx.fillStyle = SAND_COLOR;
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        
        // Водоросли
        ctx.fillStyle = '#27ae60';
        for (let i = 0; i < 8; i++) {
            const x = (canvas.width / 8) * i + 15;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 40);
            ctx.quadraticCurveTo(x - 8, canvas.height - 80, x, canvas.height - 120);
            ctx.quadraticCurveTo(x + 8, canvas.height - 80, x, canvas.height - 40);
            ctx.fill();
        }
        
        // Кораллы
        ctx.fillStyle = CORAL_COLOR;
        for (let i = 0; i < 6; i++) {
            const x = (canvas.width / 6) * i + 30;
            ctx.beginPath();
            ctx.arc(x, canvas.height - 40, 12, Math.PI, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Функция отрисовки пузырьков
    function drawBubbles() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Функция отрисовки интерфейса
    function drawUI() {
        // Уровень кислорода (индикатор в игре)
        const oxygenWidth = 120;
        const oxygenHeight = 8;
        const oxygenX = 10;
        const oxygenY = 10;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(oxygenX, oxygenY, oxygenWidth, oxygenHeight);
        
        if (diver.oxygen > 30) {
            ctx.fillStyle = '#2ecc71';
        } else if (diver.oxygen > 15) {
            ctx.fillStyle = '#f39c12';
        } else {
            ctx.fillStyle = '#e74c3c';
        }
        ctx.fillRect(oxygenX, oxygenY, (diver.oxygen / 100) * oxygenWidth, oxygenHeight);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(oxygenX, oxygenY, oxygenWidth, oxygenHeight);
    }
    
    // Функция отрисовки экрана окончания игры
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        if (gameWon) {
            ctx.fillText('🎉 ПОБЕДА!', canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = '18px Arial';
            ctx.fillText(`Собрано сокровищ: ${diver.score}`, canvas.width / 2, canvas.height / 2);
        } else {
            ctx.fillText('💀 КИСЛОРОД ЗАКОНЧИЛСЯ', canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = '18px Arial';
            ctx.fillText(`Счёт: ${diver.score}`, canvas.width / 2, canvas.height / 2);
        }
        
        ctx.font = '16px Arial';
        if (isMobile) {
            ctx.fillText('Нажмите "Перезапуск"', canvas.width / 2, canvas.height / 2 + 30);
        } else {
            ctx.fillText('Нажмите R для перезапуска', canvas.width / 2, canvas.height / 2 + 30);
        }
        ctx.textAlign = 'left';
        
        if (isMobile) {
            restartBtn.style.display = 'block';
        }
    }
    
    // Настройка мобильного управления
    function setupMobileControls() {
        if (!isMobile) return;
        
        const mobileButtons = {
            'ArrowUp': upBtn,
            'ArrowDown': downBtn,
            'ArrowLeft': leftBtn,
            'ArrowRight': rightBtn
        };
        
        Object.entries(mobileButtons).forEach(([key, button]) => {
            const handleStart = (e) => {
                e.preventDefault();
                keys[key] = true;
            };
            
            const handleEnd = (e) => {
                e.preventDefault();
                keys[key] = false;
            };
            
            button.addEventListener('touchstart', handleStart);
            button.addEventListener('touchend', handleEnd);
            button.addEventListener('touchcancel', handleEnd);
        });
    }
    
    // Настройка клавиатурного управления
    function setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
    }
    
    // Адаптация размера канваса
    function resizeCanvas() {
        const container = document.getElementById('game-container');
        const maxWidth = Math.min(800, container.clientWidth - 20);
        
        let maxHeight;
        if (window.innerHeight > window.innerWidth) {
            // Портретная ориентация
            maxHeight = Math.min(500, window.innerHeight * 0.5);
        } else {
            // Ландшафтная ориентация
            maxHeight = Math.min(400, window.innerHeight * 0.7);
        }
        
        // Устанавливаем фиксированный размер
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        // Обновляем позицию станции
        oxygenStation.x = canvas.width - 50;
        oxygenStation.y = canvas.height - 50;
        
        // Обновляем позицию водолаза
        diver.x = canvas.width / 2;
        diver.y = canvas.height - 80;
    }
    
    // Основной игровой цикл с контролем FPS
    function gameLoop(timestamp) {
        // Контроль FPS для плавной анимации
        if (timestamp - lastTime < frameInterval) {
            requestAnimationFrame(gameLoop);
            return;
        }
        lastTime = timestamp;
        
        // Очистка экрана
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = OCEAN_BLUE;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем фон
        drawOceanFloor();
        drawBubbles();
        
        if (!gameOver && !gameWon) {
            // Управление водолазом
            diver.move(keys);
            
            // Обновление кислорода
            if (diver.updateOxygen()) {
                gameOver = true;
            }
            
            // Создание новых сокровищ
            treasureTimer++;
            if (treasureTimer > 80 && treasures.length < 6) {
                treasures.push(new Treasure());
                treasureTimer = 0;
            }
            
            // Создание акул
            sharkTimer++;
            if (sharkTimer > 150 && sharks.length < 2) {
                sharks.push(new Shark());
                sharkTimer = 0;
            }
            
            // Движение акул
            sharks.forEach(shark => shark.move());
            
            // Проверка столкновений с сокровищами
            const diverBounds = diver.getBounds();
            for (let i = treasures.length - 1; i >= 0; i--) {
                if (checkCollision(diverBounds, treasures[i].getBounds())) {
                    diver.score += treasures[i].value;
                    treasures.splice(i, 1);
                    updateStats();
                    
                    if (diver.score >= 500) {
                        gameWon = true;
                    }
                }
            }
            
            // Проверка столкновений с акулами
            for (let i = sharks.length - 1; i >= 0; i--) {
                if (checkCollision(diverBounds, sharks[i].getBounds())) {
                    diver.oxygen -= 15;
                    sharks.splice(i, 1);
                    updateStats();
                    if (diver.oxygen <= 0) {
                        gameOver = true;
                    }
                }
            }
            
            // Проверка столкновения со станцией кислорода
            if (checkCollision(diverBounds, oxygenStation.getBounds())) {
                diver.refillOxygen();
                updateStats();
            }
        }
        
        // Рисуем игровые объекты
        treasures.forEach(treasure => treasure.draw());
        sharks.forEach(shark => shark.draw());
        oxygenStation.draw();
        diver.draw();
        
        // Рисуем интерфейс
        drawUI();
        
        // Если игра окончена
        if (gameOver || gameWon) {
            drawGameOver();
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    // Обработчик перезапуска для компьютера
    window.addEventListener('keydown', (e) => {
        if (!isMobile && (gameOver || gameWon) && (e.key === 'r' || e.key === 'R')) {
            restartGame();
        }
    });
    
    // Инициализация
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    setupMobileControls();
    setupKeyboardControls();
    updateStats();
    
    // Запуск игры
    requestAnimationFrame(gameLoop);
});
