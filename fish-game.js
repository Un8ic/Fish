document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    const restartBtn = document.getElementById('restartBtn');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Возврат на главную страницу
    backBtn.addEventListener('click', function() {
        window.location.href = 'main.html';
    });
    
    // Перезапуск игры
    restartBtn.addEventListener('click', function() {
        restartGame();
    });
    
    // Цвета
    const BLUE = [64, 164, 223];
    const DARK_BLUE = [0, 51, 102];
    
    // Эмодзи
    const FISH_EMOJI = '🐠';
    const OCTOPUS_EMOJI = '🐙';
    
    // Проверка типа устройства
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('isMobile:', isMobile);
    
    // Класс игрока (рыбка)
    class Fish {
        constructor() {
            this.size = 50;
            this.x = canvas.width - 100;
            this.y = canvas.height / 2;
            this.speed = 4; // Уменьшена скорость с 5 до 4
            this.score = 0;
            this.lives = 3;
            this.emoji = FISH_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Отражаем рыбку по горизонтали (-1) чтобы она смотрела влево
            ctx.translate(this.x, this.y);
            ctx.scale(-1, 1);
            ctx.fillText(this.emoji, 0, 0);
            
            ctx.restore();
        }
        
        // Движение для сенсорного управления
        moveTo(x, y) {
            // Плавное движение к целевой позиции
            const dx = x - this.x;
            const dy = y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.speed) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            } else {
                this.x = x;
                this.y = y;
            }
            
            // Ограничение границами
            this.x = Math.max(this.size/2, Math.min(canvas.width - this.size/2, this.x));
            this.y = Math.max(this.size/2, Math.min(canvas.height - this.size/2, this.y));
        }
        
        // Движение для клавиатуры
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
            this.y = Math.max(this.size/2, Math.min(canvas.height - this.size/2, this.y));
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
    
    // Класс врага (осьминог)
    class Octopus {
        constructor() {
            this.size = 60;
            // Появление справа
            this.x = canvas.width + this.size;
            this.y = Math.random() * (canvas.height - this.size) + this.size/2;
            this.speed = Math.random() * 3 + 2;
            this.emoji = OCTOPUS_EMOJI;
        }
        
        draw() {
            ctx.save();
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Отражаем осьминога по горизонтали (-1) чтобы он смотрел влево
            ctx.translate(this.x, this.y);
            ctx.scale(-1, 1);
            ctx.fillText(this.emoji, 0, 0);
            
            ctx.restore();
        }
        
        move() {
            // Движение слева направо
            this.x -= this.speed;
            return this.x < -this.size;
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
    
    // Класс монетки
    class Coin {
        constructor() {
            this.size = 25;
            // Появление справа
            this.x = canvas.width + this.size;
            this.y = Math.random() * (canvas.height - this.size) + this.size/2;
            this.speed = Math.random() * 2 + 1.5;
        }
        
        draw() {
            ctx.save();
            
            // Внешний круг (золотой)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Внутренний круг (темно-золотой)
            ctx.fillStyle = '#D4AF37';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Блик
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/6, this.y - this.size/6, this.size/6, 0, Math.PI * 2);
            ctx.fill();
            
            // Буква C (как на монетке)
            ctx.fillStyle = '#B8860B';
            ctx.font = `${this.size/2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('C', this.x, this.y);
            
            ctx.restore();
        }
        
        move() {
            // Движение слева направо
            this.x -= this.speed;
            return this.x < -this.size;
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
    let fish = new Fish();
    let octopuses = [];
    let coins = [];
    let gameOver = false;
    
    // Таймеры для создания врагов и монет
    let octopusTimer = 0;
    let coinTimer = 0;
    
    // Переменные для управления
    let keys = {};
    let isTouching = false;
    let targetX = fish.x;
    let targetY = fish.y;
    
    // Функция перезапуска игры
    function restartGame() {
        fish = new Fish();
        octopuses = [];
        coins = [];
        gameOver = false;
        octopusTimer = 0;
        coinTimer = 0;
        targetX = fish.x;
        targetY = fish.y;
        keys = {};
        
        // Скрываем кнопку перезапуска
        restartBtn.style.display = 'none';
    }
    
    // Функция проверки столкновений
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Функция отрисовки пузырьков
    function drawBubbles() {
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 6 + 2;
            
            ctx.strokeStyle = 'rgba(200, 230, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Функция отрисовки счета и жизней
    function drawUI() {
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Счет: ${fish.score}`, 10, 30);
        ctx.fillText(`Жизни: ${fish.lives}`, 10, 60);
        
        // Рисуем сердечки для жизней
        ctx.font = '30px Arial';
        for (let i = 0; i < fish.lives; i++) {
            ctx.fillText('❤️', 150 + i * 40, 45);
        }
        
        // Показываем подсказку по управлению
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        if (isMobile) {
            ctx.fillText('Управление: касание экрана', 10, canvas.height - 20);
        } else {
            ctx.fillText('Управление: стрелки ←↑→↓ или WASD', 10, canvas.height - 20);
        }
    }
    
    // Функция отрисовки экрана окончания игры
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ИГРА ОКОНЧЕНА!', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '28px Arial';
        ctx.fillText(`Ваш счет: ${fish.score}`, canvas.width / 2, canvas.height / 2);
        
        if (isMobile) {
            // На мобильных показываем инструкцию с кнопкой
            ctx.font = '24px Arial';
            ctx.fillText('Нажмите кнопку "Перезапустить"', canvas.width / 2, canvas.height / 2 + 40);
            // Показываем кнопку перезапуска
            restartBtn.style.display = 'block';
        } else {
            // На компьютере показываем инструкцию с клавишей R
            ctx.font = '24px Arial';
            ctx.fillText('Нажмите R для перезапуска', canvas.width / 2, canvas.height / 2 + 40);
        }
        
        ctx.textAlign = 'left';
    }
    
    // Функция отрисовки индикатора касания (только для мобильных)
    function drawTouchIndicator() {
        if (isMobile && isTouching) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // Адаптация размера канваса
    function resizeCanvas() {
        const container = document.getElementById('game-container');
        const maxWidth = Math.min(800, container.clientWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        // Пересоздаем рыбку в новой позиции
        if (fish) {
            fish.x = canvas.width - 100;
            fish.y = canvas.height / 2;
            targetX = fish.x;
            targetY = fish.y;
        }
    }
    
    // Настройка сенсорного управления (только для мобильных)
    function setupTouchControls() {
        if (!isMobile) return;
        
        console.log('Setting up touch controls');
        
        canvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            
            targetX = touch.clientX - rect.left;
            targetY = touch.clientY - rect.top;
            isTouching = true;
        });
        
        canvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            
            targetX = touch.clientX - rect.left;
            targetY = touch.clientY - rect.top;
        });
        
        canvas.addEventListener('touchend', function(e) {
            e.preventDefault();
            isTouching = false;
        });
        
        canvas.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            isTouching = false;
        });
    }
    
    // Настройка управления клавиатурой (только для компьютера)
    function setupKeyboardControls() {
        if (isMobile) return;
        
        console.log('Setting up keyboard controls');
        
        window.addEventListener('keydown', function(e) {
            keys[e.key] = true;
        });
        
        window.addEventListener('keyup', function(e) {
            keys[e.key] = false;
        });
        
        // Блокируем управление мышкой на компьютере
        canvas.addEventListener('mousedown', function(e) {
            e.preventDefault();
        });
        
        canvas.addEventListener('mousemove', function(e) {
            e.preventDefault();
        });
    }
    
    // Основной игровой цикл
    function gameLoop() {
        // Очистка экрана
        ctx.fillStyle = `rgb(${BLUE.join(',')})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем пузырьки
        drawBubbles();
        
        if (!gameOver) {
            // Управление в зависимости от типа устройства
            if (isMobile) {
                // Сенсорное управление
                fish.moveTo(targetX, targetY);
            } else {
                // Управление клавиатурой
                fish.move(keys);
            }
            
            // Создание новых осьминогов
            octopusTimer++;
            if (octopusTimer > 120) {
                octopuses.push(new Octopus());
                octopusTimer = 0;
            }
            
            // Создание новых монеток
            coinTimer++;
            if (coinTimer > 90) {
                coins.push(new Coin());
                coinTimer = 0;
            }
            
            // Движение осьминогов
            for (let i = octopuses.length - 1; i >= 0; i--) {
                if (octopuses[i].move()) {
                    octopuses.splice(i, 1);
                    fish.score += 1;
                }
            }
            
            // Движение монеток
            for (let i = coins.length - 1; i >= 0; i--) {
                if (coins[i].move()) {
                    coins.splice(i, 1);
                }
            }
            
            // Проверка столкновений с осьминогами
            const fishBounds = fish.getBounds();
            for (let i = octopuses.length - 1; i >= 0; i--) {
                if (checkCollision(fishBounds, octopuses[i].getBounds())) {
                    octopuses.splice(i, 1);
                    fish.lives -= 1;
                    if (fish.lives <= 0) {
                        gameOver = true;
                    }
                }
            }
            
            // Проверка столкновений с монетками
            for (let i = coins.length - 1; i >= 0; i--) {
                if (checkCollision(fishBounds, coins[i].getBounds())) {
                    coins.splice(i, 1);
                    fish.score += 5;
                }
            }
        }
        
        // Рисуем монетки
        coins.forEach(coin => coin.draw());
        
        // Рисуем осьминогов
        octopuses.forEach(octopus => octopus.draw());
        
        // Рисуем рыбку
        fish.draw();
        
        // Рисуем индикатор касания (только для мобильных)
        drawTouchIndicator();
        
        // Рисуем интерфейс
        drawUI();
        
        // Если игра окончена
        if (gameOver) {
            drawGameOver();
        }
        
        // Запускаем следующий кадр
        requestAnimationFrame(gameLoop);
    }
    
    // Обработчики событий для перезапуска игры (только для компьютера)
    window.addEventListener('keydown', function(e) {
        if (isMobile) return; // На мобильных не обрабатываем клавишу R
        
        // Перезапуск игры
        if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
            if (gameOver) {
                restartGame();
            }
        }
    });
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', resizeCanvas);
    
    // Инициализация
    resizeCanvas();
    setupTouchControls();
    setupKeyboardControls();
    
    // Скрываем кнопку перезапуска при старте
    restartBtn.style.display = 'none';
    
    // Запуск игры
    gameLoop();
});