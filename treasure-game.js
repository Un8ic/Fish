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
    const WATER_COLOR = '#1e6ea7';
    const SAND_COLOR = '#e6bc57';
    const DARK_SAND = '#d4a83c';
    
    // Эмодзи
    const DIVER_EMOJI = '🧜‍♂️';
    const TREASURE_EMOJI = '💰';
    const SHARK_EMOJI = '🦈';
    
    // Проверка типа устройства
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Обновляем информацию об управлении
    const controlInfo = document.getElementById('control-info');
    const restartInfo = document.getElementById('restart-info');
    
    if (isMobile) {
        controlInfo.textContent = 'Собирайте сокровища 💰 и избегайте акул 🦈!';
        restartInfo.textContent = 'Используйте кнопку "Перезапустить" для новой игры';
    } else {
        controlInfo.textContent = 'Управление: стрелки ←↑→↓ | Собирайте сокровища 💰 и избегайте акул 🦈!';
        restartInfo.textContent = 'Нажми R для перезапуска игры';
    }
    
    // Класс игрока (водолаз)
    class Diver {
        constructor() {
            this.size = 50;
            this.x = canvas.width / 2;
            this.y = canvas.height - 150;
            this.speed = 5;
            this.oxygen = 100;
            this.score = 0;
            this.treasures = 0;
            this.oxygenDecreaseRate = 0.08;
            this.emoji = DIVER_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, this.x, this.y);
            
            // Пузырьки воздуха
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for(let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(this.x + 15 - i * 10, this.y - 25, 3 + i, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        move(keys) {
            if (keys['ArrowUp'] || keys['w'] || keys['W'] || keys['ц'] || keys['Ц']) {
                this.y -= this.speed;
            }
            if (keys['ArrowDown'] || keys['s'] || keys['S'] || keys['ы'] || keys['Ы']) {
                this.y += this.speed;
            }
            if (keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['ф'] || keys['Ф']) {
                this.x -= this.speed;
            }
            if (keys['ArrowRight'] || keys['d'] || keys['D'] || keys['в'] || keys['В']) {
                this.x += this.speed;
            }
            
            // Ограничение границами
            this.x = Math.max(this.size/2, Math.min(canvas.width - this.size/2, this.x));
            this.y = Math.max(this.size/2, Math.min(canvas.height - 100 - this.size/2, this.y));
            
            // Уменьшение кислорода
            this.oxygen -= this.oxygenDecreaseRate;
        }
        
        getBounds() {
            return {
                x: this.x - this.size/2,
                y: this.y - this.size/2,
                width: this.size,
                height: this.size
            };
        }
        
        refillOxygen() {
            this.oxygen = Math.min(100, this.oxygen + 40);
        }
    }
    
    // Класс сокровища
    class Treasure {
        constructor() {
            this.size = 35;
            this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
            this.y = canvas.height - 70;
            this.value = Math.floor(Math.random() * 30) + 10;
            this.emoji = TREASURE_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, this.x, this.y);
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
            this.x = Math.random() < 0.5 ? -this.size : canvas.width + this.size;
            this.y = Math.random() * (canvas.height - 200) + 50;
            this.speed = Math.random() * 3 + 2;
            this.direction = this.x < 0 ? 1 : -1;
            this.emoji = SHARK_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Отражаем акулу если движется справа налево
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
            return (this.direction === 1 && this.x > canvas.width + this.size) || 
                   (this.direction === -1 && this.x < -this.size);
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
    
    // Класс кислородной станции
    class OxygenStation {
        constructor() {
            this.size = 40;
            this.x = Math.random() * (canvas.width - 100) + 50;
            this.y = canvas.height - 120;
        }
        
        draw() {
            ctx.save();
            
            // Баллон
            ctx.fillStyle = '#4A90E2';
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
            
            // Верх баллона
            ctx.fillStyle = '#357ABD';
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, 10);
            
            // Индикатор кислорода
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.x - this.size/2 + 5, this.y - this.size/2 + 15, this.size - 10, 15);
            
            // Пузырьки
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for(let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(this.x, this.y - this.size/2 - 10 - i * 8, 4, 0, Math.PI * 2);
                ctx.fill();
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
    let diver;
    let treasures = [];
    let sharks = [];
    let oxygenStations = [];
    let gameOver = false;
    let gameWon = false;
    
    // Таймеры
    let treasureTimer = 0;
    let sharkTimer = 0;
    let oxygenTimer = 0;
    
    // Переменные для управления
    let keys = {};
    
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
            if (button) {
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
            }
        });
    }
    
    // Функция перезапуска игры
    function restartGame() {
        diver = new Diver();
        treasures = [];
        sharks = [];
        oxygenStations = [];
        gameOver = false;
        gameWon = false;
        treasureTimer = 0;
        sharkTimer = 0;
        oxygenTimer = 0;
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
    
    // Функция отрисовки дна
    function drawSeaBed() {
        // Песок
        ctx.fillStyle = SAND_COLOR;
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
        
        // Текстура песка
        ctx.fillStyle = DARK_SAND;
        for(let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = canvas.height - 100 + Math.random() * 100;
            const size = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Водоросли
        ctx.strokeStyle = '#2E8B57';
        ctx.lineWidth = 2;
        for(let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 100);
            for(let j = 0; j < 8; j++) {
                ctx.lineTo(x + Math.sin(j * 0.5) * 8, canvas.height - 100 - j * 12);
            }
            ctx.stroke();
        }
    }
    
    // Функция отрисовки пузырьков
    function drawBubbles() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for(let i = 0; i < 25; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 5 + 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Функция отрисовки интерфейса
    function drawUI() {
        // Счет и кислород
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Сокровища: ${diver.treasures}/10`, 10, 30);
        ctx.fillText(`Счет: ${diver.score}`, 10, 60);
        
        // Полоска кислорода
        ctx.fillStyle = '#333';
        ctx.fillRect(10, 80, 200, 20);
        ctx.fillStyle = diver.oxygen > 30 ? '#4CAF50' : '#FF5252';
        ctx.fillRect(10, 80, (diver.oxygen / 100) * 200, 20);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 80, 200, 20);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`Кислород: ${Math.round(diver.oxygen)}%`, 15, 95);
        
        // Подсказки
        ctx.font = '16px Arial';
        ctx.fillText(`💡 Собирайте ${TREASURE_EMOJI}`, canvas.width - 200, 30);
        ctx.fillText(`💡 Избегайте ${SHARK_EMOJI}`, canvas.width - 200, 55);
    }
    
    // Функция отрисовки экрана окончания игры
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        
        if (gameWon) {
            ctx.fillText('🎉 ПОБЕДА! 🎉', canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '24px Arial';
            ctx.fillText(`Вы собрали ${diver.treasures} сокровищ!`, canvas.width / 2, canvas.height / 2);
            ctx.fillText(`Общий счет: ${diver.score}`, canvas.width / 2, canvas.height / 2 + 30);
        } else {
            ctx.fillText('💀 ИГРА ОКОНЧЕНА! 💀', canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '24px Arial';
            ctx.fillText('Закончился кислород!', canvas.width / 2, canvas.height / 2);
            ctx.fillText(`Собрано сокровищ: ${diver.treasures}`, canvas.width / 2, canvas.height / 2 + 30);
        }
        
        if (isMobile) {
            ctx.fillText('Нажмите "Перезапустить"', canvas.width / 2, canvas.height / 2 + 70);
            restartBtn.style.display = 'block';
        } else {
            ctx.fillText('Нажмите R для перезапуска', canvas.width / 2, canvas.height / 2 + 70);
        }
        
        ctx.textAlign = 'left';
    }
    
    // Адаптация размера канваса
    function resizeCanvas() {
        const container = document.getElementById('game-container');
        const maxWidth = Math.min(800, container.clientWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        // Пересоздаем игрока если он существует
        if (diver) {
            diver.x = canvas.width / 2;
            diver.y = canvas.height - 150;
        }
    }
    
    // Настройка управления клавиатурой
    function setupKeyboardControls() {
        if (isMobile) return;
        
        window.addEventListener('keydown', function(e) {
            keys[e.key] = true;
        });
        
        window.addEventListener('keyup', function(e) {
            keys[e.key] = false;
        });
    }
    
    // Основной игровой цикл
    function gameLoop() {
        // Проверяем, что игра инициализирована
        if (!diver) {
            diver = new Diver();
        }
        
        // Очистка экрана
        ctx.fillStyle = WATER_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем фон
        drawBubbles();
        drawSeaBed();
        
        if (!gameOver && !gameWon) {
            // Управление
            diver.move(keys);
            
            // Создание новых сокровищ
            treasureTimer++;
            if (treasureTimer > 90 && treasures.length < 5) {
                treasures.push(new Treasure());
                treasureTimer = 0;
            }
            
            // Создание новых акул
            sharkTimer++;
            if (sharkTimer > 120 && sharks.length < 3) {
                sharks.push(new Shark());
                sharkTimer = 0;
            }
            
            // Создание кислородных станций
            oxygenTimer++;
            if (oxygenTimer > 300 && oxygenStations.length < 2) {
                oxygenStations.push(new OxygenStation());
                oxygenTimer = 0;
            }
            
            // Движение акул
            for (let i = sharks.length - 1; i >= 0; i--) {
                if (sharks[i].move()) {
                    sharks.splice(i, 1);
                }
            }
            
            // Проверка столкновений с сокровищами
            const diverBounds = diver.getBounds();
            for (let i = treasures.length - 1; i >= 0; i--) {
                if (checkCollision(diverBounds, treasures[i].getBounds())) {
                    diver.score += treasures[i].value;
                    diver.treasures += 1;
                    treasures.splice(i, 1);
                    
                    // Проверка победы
                    if (diver.treasures >= 10) {
                        gameWon = true;
                    }
                }
            }
            
            // Проверка столкновений с акулами
            for (let i = sharks.length - 1; i >= 0; i--) {
                if (checkCollision(diverBounds, sharks[i].getBounds())) {
                    sharks.splice(i, 1);
                    diver.oxygen -= 20; // Потеря кислорода при столкновении с акулой
                }
            }
            
            // Проверка столкновений с кислородными станциями
            for (let i = oxygenStations.length - 1; i >= 0; i--) {
                if (checkCollision(diverBounds, oxygenStations[i].getBounds())) {
                    diver.refillOxygen();
                    oxygenStations.splice(i, 1);
                }
            }
            
            // Проверка окончания кислорода
            if (diver.oxygen <= 0) {
                gameOver = true;
            }
        }
        
        // Рисуем объекты
        oxygenStations.forEach(station => station.draw());
        treasures.forEach(treasure => treasure.draw());
        sharks.forEach(shark => shark.draw());
        diver.draw();
        
        // Рисуем интерфейс
        drawUI();
        
        // Если игра окончена
        if (gameOver || gameWon) {
            drawGameOver();
        }
        
        // Запускаем следующий кадр
        requestAnimationFrame(gameLoop);
    }
    
    // Обработчики событий для перезапуска игры
    window.addEventListener('keydown', function(e) {
        if (isMobile) return;
        
        if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
            if (gameOver || gameWon) {
                restartGame();
            }
        }
    });
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', resizeCanvas);
    
    // Инициализация
    function initGame() {
        resizeCanvas();
        setupMobileControls();
        setupKeyboardControls();
        
        // Создаем начальные объекты
        diver = new Diver();
        
        // Создаем несколько начальных сокровищ
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                treasures.push(new Treasure());
            }, i * 500);
        }
        
        // Скрываем кнопку перезапуска при старте
        restartBtn.style.display = 'none';
        
        // Запускаем игровой цикл
        gameLoop();
    }
    
    // Запускаем игру после полной загрузки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
});
