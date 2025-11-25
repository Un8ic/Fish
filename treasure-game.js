document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    const restartBtn = document.getElementById('restartBtn');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
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
    
    // Цвета
    const OCEAN_BLUE = '#2e86ab';
    const DARK_BLUE = '#1b4f72';
    const SAND_COLOR = '#e6bc57';
    const CORAL_COLOR = '#ff6b6b';
    
    // Эмодзи
    const DIVER_EMOJI = '🧜‍♂️';
    const TREASURE_EMOJI = '💰';
    const SHARK_EMOJI = '🦈';
    const OXYGEN_STATION_EMOJI = '⚡';
    
    // Проверка типа устройства
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Класс водолаза
    class Diver {
        constructor() {
            this.size = 50;
            this.x = canvas.width / 2;
            this.y = canvas.height - 100;
            this.speed = 5;
            this.oxygen = 100;
            this.score = 0;
            this.isMoving = false;
            this.emoji = DIVER_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, this.x, this.y);
            
            // Пузырьки дыхания
            if (this.isMoving) {
                ctx.font = '20px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText('💨', this.x + 20, this.y - 10);
            }
            
            ctx.restore();
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
            this.x = Math.max(this.size/2, Math.min(canvas.width - this.size/2, this.x));
            this.y = Math.max(this.size/2, Math.min(canvas.height - this.size/2, this.y));
        }
        
        updateOxygen() {
            if (this.isMoving) {
                this.oxygen -= 0.1;
            } else {
                this.oxygen -= 0.05;
            }
            
            if (this.oxygen <= 0) {
                this.oxygen = 0;
                return true; // Кислород закончился
            }
            return false;
        }
        
        refillOxygen() {
            this.oxygen = Math.min(100, this.oxygen + 30);
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
    
    // Класс сокровища
    class Treasure {
        constructor() {
            this.size = 35;
            this.x = Math.random() * (canvas.width - 100) + 50;
            this.y = Math.random() * (canvas.height - 200) + 50;
            this.type = Math.floor(Math.random() * 3); // 0-2 разные типы сокровищ
            this.value = [10, 25, 50][this.type];
            this.emoji = TREASURE_EMOJI;
            // Разные варианты сокровищ для визуального разнообразия
            this.variants = ['💰', '💎', '🔱'];
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.variants[this.type], this.x, this.y);
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
            this.size = 60;
            this.x = -this.size;
            this.y = Math.random() * (canvas.height - 100) + 50;
            this.speed = Math.random() * 2 + 1;
            this.direction = 1; // 1 - вправо, -1 - влево
            this.emoji = SHARK_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Отражаем акулу если движется влево
            if (this.direction === -1) {
                ctx.translate(this.x, this.y);
                ctx.scale(-1, 1);
                ctx.fillText(this.emoji, 0, 0);
            } else {
                ctx.fillText(this.emoji, this.x, this.y);
            }
            
            ctx.restore();
        }
        
        move() {
            this.x += this.speed * this.direction;
            
            // Если акула вышла за границы, меняем направление
            if (this.x > canvas.width + this.size) {
                this.direction = -1;
                this.y = Math.random() * (canvas.height - 100) + 50;
            } else if (this.x < -this.size) {
                this.direction = 1;
                this.y = Math.random() * (canvas.height - 100) + 50;
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
    
    // Класс станции пополнения кислорода
    class OxygenStation {
        constructor() {
            this.x = canvas.width - 60;
            this.y = canvas.height - 60;
            this.size = 50;
            this.emoji = OXYGEN_STATION_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, this.x, this.y);
            
            // Анимация пузырьков
            ctx.font = '20px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const time = Date.now() / 500;
            for (let i = 0; i < 3; i++) {
                ctx.fillText('💨', 
                    this.x + Math.sin(time + i) * 15, 
                    this.y - 30 - i * 8
                );
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
        restartBtn.style.display = 'none';
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
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        
        // Водоросли (эмодзи)
        ctx.font = '30px Arial';
        ctx.fillStyle = '#27ae60';
        for (let i = 0; i < 8; i++) {
            const x = (canvas.width / 8) * i + 40;
            ctx.fillText('🌿', x, canvas.height - 35);
        }
        
        // Ракушки и камни
        ctx.font = '20px Arial';
        const decorations = ['🐚', '🪸', '🪨'];
        for (let i = 0; i < 6; i++) {
            const x = (canvas.width / 6) * i + 20;
            const emoji = decorations[Math.floor(Math.random() * decorations.length)];
            ctx.fillText(emoji, x, canvas.height - 25);
        }
    }
    
    // Функция отрисовки пузырьков
    function drawBubbles() {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillText('💨', x, y);
        }
    }
    
    // Функция отрисовки интерфейса
    function drawUI() {
        // Счет
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Сокровища: ${diver.score}`, 10, 30);
        
        // Уровень кислорода
        ctx.fillText('Кислород:', 10, 60);
        ctx.fillStyle = 'white';
        ctx.fillRect(100, 45, 150, 20);
        ctx.fillStyle = diver.oxygen > 30 ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(100, 45, (diver.oxygen / 100) * 150, 20);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 45, 150, 20);
        
        // Цель игры
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.fillText(`Цель: 500 очков`, canvas.width - 120, 30);
        
        // Подсказка по управлению
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '14px Arial';
        if (isMobile) {
            ctx.fillText('Касайтесь кнопок для движения', 10, canvas.height - 10);
        } else {
            ctx.fillText('Управление: стрелки или WASD | Подплывите к ⚡ для пополнения кислорода', 10, canvas.height - 10);
        }
    }
    
    // Функция отрисовки экрана окончания игры
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        
        if (gameWon) {
            ctx.fillText('🎉 ПОБЕДА! 🎉', canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '24px Arial';
            ctx.fillText(`Вы собрали сокровищ на ${diver.score} очков!`, canvas.width / 2, canvas.height / 2);
        } else {
            ctx.fillText('💀 ИГРА ОКОНЧЕНА 💀', canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '24px Arial';
            ctx.fillText('Закончился кислород!', canvas.width / 2, canvas.height / 2);
        }
        
        if (isMobile) {
            ctx.fillText('Нажмите "Перезапустить"', canvas.width / 2, canvas.height / 2 + 40);
        } else {
            ctx.fillText('Нажмите R для перезапуска', canvas.width / 2, canvas.height / 2 + 40);
        }
        ctx.textAlign = 'left';
        
        // Показываем кнопку перезапуска на мобильных
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
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                keys[key] = true;
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                keys[key] = false;
            });
            
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                keys[key] = false;
            });
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
        const maxWidth = Math.min(800, container.clientWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        // Обновляем позицию станции
        oxygenStation.x = canvas.width - 60;
        oxygenStation.y = canvas.height - 60;
    }
    
    // Основной игровой цикл
    function gameLoop() {
        // Очистка экрана
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
            if (treasureTimer > 90 && treasures.length < 8) {
                treasures.push(new Treasure());
                treasureTimer = 0;
            }
            
            // Создание акул
            sharkTimer++;
            if (sharkTimer > 180 && sharks.length < 3) {
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
                    
                    // Проверка победы
                    if (diver.score >= 500) {
                        gameWon = true;
                    }
                }
            }
            
            // Проверка столкновений с акулами
            for (let i = sharks.length - 1; i >= 0; i--) {
                if (checkCollision(diverBounds, sharks[i].getBounds())) {
                    // При столкновении с акулой теряем кислород
                    diver.oxygen -= 20;
                    sharks.splice(i, 1);
                    if (diver.oxygen <= 0) {
                        gameOver = true;
                    }
                }
            }
            
            // Проверка столкновения со станцией кислорода
            if (checkCollision(diverBounds, oxygenStation.getBounds())) {
                diver.refillOxygen();
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
    
    // Обработчик перезапуска
    window.addEventListener('keydown', (e) => {
        if ((gameOver || gameWon) && (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К')) {
            restartGame();
        }
    });
    
    // Инициализация
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    setupMobileControls();
    setupKeyboardControls();
    
    // Обновляем информацию об управлении
    const controlInfo = document.getElementById('control-info');
    const restartInfo = document.getElementById('restart-info');
    
    if (isMobile) {
        controlInfo.textContent = 'Собирайте сокровища (💰💎🔱) и избегайте акул! Подплывайте к ⚡ для пополнения кислорода.';
        restartInfo.textContent = 'Используйте кнопку "Перезапустить" для новой игры';
    } else {
        controlInfo.textContent = 'Собирайте сокровища (💰💎🔱 = 10-50 очков) и избегайте акул! Подплывайте к ⚡ для пополнения кислорода.';
        restartInfo.textContent = 'Наберите 500 очков для победы! Нажмите R для перезапуска';
    }
    
    // Запуск игры
    gameLoop();
});