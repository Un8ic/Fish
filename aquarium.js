document.addEventListener('DOMContentLoaded', function() {
    const aquarium = document.getElementById('aquarium');
    const feedBtn = document.getElementById('feedBtn');
    const backBtn = document.getElementById('backBtn');
    const fishTypes = ['🐠', '🐟', '🐡', '🦈', '🐋', '🐬', '🦑', '🐙'];
    const fishArray = [];
    let isFeeding = false;
    let animationId;

    // Возврат на главную страницу
    backBtn.addEventListener('click', function() {
        window.location.href = 'main.html';
    });

    // Инициализация аквариума
    function initAquarium() {
        createBubbles();
        createFish();
        updateFish();
        
        // Создаем пузырьки каждые 15 секунд
        setInterval(createBubbles, 15000);
    }

    // Создаем пузырьки
    function createBubbles() {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                const size = Math.random() * 20 + 10;
                bubble.style.width = `${size}px`;
                bubble.style.height = `${size}px`;
                bubble.style.left = `${Math.random() * 100}vw`;
                bubble.style.animationDuration = `${Math.random() * 10 + 5}s`;
                aquarium.appendChild(bubble);
                
                // Удаляем пузырек после анимации
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 15000);
            }, i * 500);
        }
    }

    // Создаем рыбок
    function createFish() {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const fish = document.createElement('div');
                fish.className = 'fish';
                const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
                fish.textContent = type;
                
                // Начальная позиция и направление
                const startX = Math.random() * window.innerWidth;
                const startY = Math.random() * window.innerHeight;
                
                // Определяем правильное направление для каждого типа рыб
                let direction = 1; // по умолчанию вправо
                
                // Для рыб с лицом слева (🐠, 🐟, 🐡, 🦈, 🐋, 🐬) устанавливаем направление влево
                const leftFacedFish = ['🐠', '🐟', '🐡', '🦈', '🐋', '🐬'];
                if (leftFacedFish.includes(type)) {
                    direction = -1; // влево
                }
                
                fish.style.left = `${startX}px`;
                fish.style.top = `${startY}px`;
                fish.style.transform = `scaleX(${direction})`;
                
                // Скорость движения (сделана медленнее)
                const speed = Math.random() * 0.5 + 0.3;
                
                aquarium.appendChild(fish);
                
                // Сохраняем данные о рыбке
                fishArray.push({
                    element: fish,
                    x: startX,
                    y: startY,
                    speed: speed,
                    direction: direction,
                    vx: (Math.random() - 0.5) * speed,
                    vy: (Math.random() - 0.5) * speed,
                    type: type,
                    isFast: false // флаг ускорения
                });
            }, i * 300);
        }
    }

    // Обновляем позиции рыбок
    function updateFish() {
        fishArray.forEach(fish => {
            // Обновляем позицию
            fish.x += fish.vx;
            fish.y += fish.vy;
            
            // Проверяем границы
            if (fish.x <= 0 || fish.x >= window.innerWidth - 50) {
                fish.vx *= -1;
                fish.direction *= -1;
                fish.element.style.transform = `scaleX(${fish.direction})`;
            }
            
            if (fish.y <= 0 || fish.y >= window.innerHeight - 50) {
                fish.vy *= -1;
            }
            
            // Устанавливаем новую позицию
            fish.element.style.left = `${fish.x}px`;
            fish.element.style.top = `${fish.y}px`;
        });
        
        animationId = requestAnimationFrame(updateFish);
    }

    // Функция кормления
    function feedFish() {
        if (isFeeding) return;
        
        isFeeding = true;
        feedBtn.disabled = true;
        
        // Создаем корм
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const food = document.createElement('div');
                food.className = 'food';
                food.textContent = '•';
                food.style.color = '#FFD700';
                food.style.left = `${Math.random() * 100}vw`;
                food.style.animationDuration = `${Math.random() * 2 + 1}s`;
                aquarium.appendChild(food);
                
                // Удаляем корм после падения
                setTimeout(() => {
                    if (food.parentNode) {
                        food.parentNode.removeChild(food);
                    }
                }, 3000);
            }, i * 200);
        }
        
        // Увеличиваем скорость рыбок на время
        fishArray.forEach(fish => {
            // Сохраняем оригинальную скорость
            const originalVx = fish.vx;
            const originalVy = fish.vy;
            
            // Увеличиваем скорость в 2 раза
            fish.vx *= 2;
            fish.vy *= 2;
            fish.isFast = true;
            
            // Возвращаем нормальную скорость через 5 секунд
            setTimeout(() => {
                fish.vx = originalVx;
                fish.vy = originalVy;
                fish.isFast = false;
            }, 5000);
        });
        
        // Включаем кнопку через 5 секунд
        setTimeout(() => {
            isFeeding = false;
            feedBtn.disabled = false;
        }, 5000);
    }

    // Обработчик клика в аквариуме
    function handleAquariumClick(x, y) {
        // Создаем эффект пузырька в месте клика
        const bubble = document.createElement('div');
        bubble.className = 'click-bubble';
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        aquarium.appendChild(bubble);
        
        // Удаляем пузырек после анимации
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, 500);
        
        // Обрабатываем реакцию рыбок
        fishArray.forEach(fish => {
            const fishRect = fish.element.getBoundingClientRect();
            const fishCenterX = fishRect.left + fishRect.width / 2;
            const fishCenterY = fishRect.top + fishRect.height / 2;
            
            // Проверяем, была ли рыбка рядом с местом клика
            const distance = Math.sqrt(
                Math.pow(x - fishCenterX, 2) + 
                Math.pow(y - fishCenterY, 2)
            );
            
            if (distance < 150) { // Если рыбка была в радиусе 150px от клика
                // Вычисляем вектор от рыбки к точке клика
                const dx = fishCenterX - x;
                const dy = fishCenterY - y;
                
                // Нормализуем вектор и задаем новое направление
                const length = Math.sqrt(dx * dx + dy * dy);
                const speedMultiplier = fish.isFast ? 3 : 2; // Если рыбка уже ускорена, убегает быстрее
                fish.vx = (dx / length) * fish.speed * speedMultiplier;
                fish.vy = (dy / length) * fish.speed * speedMultiplier;
                
                // Меняем направление рыбки, если нужно
                if (fish.vx > 0 && fish.direction === -1) {
                    fish.direction = 1;
                    fish.element.style.transform = 'scaleX(1)';
                } else if (fish.vx < 0 && fish.direction === 1) {
                    fish.direction = -1;
                    fish.element.style.transform = 'scaleX(-1)';
                }
                
                // Возвращаем нормальную скорость через 2 секунды
                setTimeout(() => {
                    if (fish.isFast) {
                        // Если рыбка все еще ускорена от кормления
                        fish.vx = (Math.random() - 0.5) * fish.speed * 2;
                        fish.vy = (Math.random() - 0.5) * fish.speed * 2;
                    } else {
                        // Возвращаем к обычной скорости
                        fish.vx = (Math.random() - 0.5) * fish.speed;
                        fish.vy = (Math.random() - 0.5) * fish.speed;
                    }
                }, 2000);
            }
        });
    }

    // Обработчики событий для десктопа и мобильных устройств
    aquarium.addEventListener('click', function(e) {
        handleAquariumClick(e.clientX, e.clientY);
    });

    // Обработчик для сенсорных устройств
    aquarium.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        handleAquariumClick(touch.clientX, touch.clientY);
    }, { passive: false });

    // Обработчик кнопки кормления
    feedBtn.addEventListener('click', feedFish);

    // Обработчик для сенсорных устройств на кнопке
    feedBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        feedFish();
    }, { passive: false });

    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        // Обновляем позиции рыбок при изменении размера окна
        fishArray.forEach(fish => {
            if (fish.x > window.innerWidth - 50) {
                fish.x = window.innerWidth - 50;
            }
            if (fish.y > window.innerHeight - 50) {
                fish.y = window.innerHeight - 50;
            }
        });
    });

    // Инициализация аквариума
    initAquarium();
});