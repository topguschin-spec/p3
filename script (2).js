// Основной JavaScript код приложения
class SpaceMonitoringApp {
    constructor() {
        this.isConnected = false;
        this.missionStartTime = new Date();
        this.sensorData = {};
        this.charts = {};
        this.animations = {};
        this.emergencyMode = false;
        this.gameActive = false;
        this.currentPanel = 'main';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initCharts();
        this.startMissionTimer();
        this.simulateSensorData();
        this.init3DScene();
        this.hideLoadingScreen();
        this.startBackgroundAnimations();
    }

    setupEventListeners() {
        // Кнопка аварийного протокола
        document.getElementById('emergency-protocol').addEventListener('click', () => {
            this.toggleEmergencyPanel();
        });

        // Управление вентилятором
        document.getElementById('fan-control').addEventListener('change', (e) => {
            this.sendCommand('fan_control', { status: e.target.checked });
            this.showNotification('Система вентиляции', 
                e.target.checked ? 'Вентилятор включен' : 'Вентилятор выключен');
        });

        // Управление освещением
        document.getElementById('light-control').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('light-value').textContent = value + '%';
            this.sendCommand('light_control', { intensity: value });
        });

        // Кнопки коммуникаций
        document.querySelectorAll('.cmd-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleCommsAction(action);
            });
        });

        // Навигационные кнопки
        document.getElementById('course-adjust').addEventListener('click', () => {
            this.startCourseAdjustment();
        });

        document.getElementById('auto-pilot').addEventListener('click', () => {
            this.toggleAutopilot();
        });

        // Научные эксперименты
        document.getElementById('start-experiment').addEventListener('click', () => {
            this.startExperiment();
        });

        document.getElementById('spectrum-toggle').addEventListener('click', () => {
            this.toggleSpectrumAnalysis();
        });

        // Аварийные действия
        document.querySelectorAll('.emergency-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.executeEmergencyAction(e.target.dataset.action);
            });
        });

        // Боковое меню
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPanel(e.target.dataset.panel);
            });
        });

        // Игровые кнопки
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.startGame(e.target.dataset.game);
            });
        });

        document.getElementById('close-game').addEventListener('click', () => {
            this.closeGame();
        });

        // Уровень аварийности
        document.getElementById('emergency-level').addEventListener('change', (e) => {
            this.setEmergencyLevel(parseInt(e.target.value));
        });

        // Глобальные обработчики
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    initCharts() {
        this.initOrbitChart();
        this.initSpectrumChart();
        this.initSensorGraphs();
    }

    initOrbitChart() {
        const ctx = document.getElementById('orbit-chart').getContext('2d');
        this.charts.orbit = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 50}, (_, i) => i),
                datasets: [{
                    label: 'Орбитальная траектория',
                    data: this.generateOrbitData(),
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }

    initSpectrumChart() {
        const ctx = document.getElementById('spectrum-canvas').getContext('2d');
        this.charts.spectrum = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 32}, (_, i) => i * 100),
                datasets: [{
                    data: Array.from({length: 32}, () => Math.random() * 100),
                    backgroundColor: '#00ff00',
                    borderColor: '#00cc00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500,
                    easing: 'easeOutQuart'
                },
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }

    initSensorGraphs() {
        ['temp-graph', 'rad-graph'].forEach(id => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 40;
            document.getElementById(id).appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            this.animateSensorGraph(ctx, id);
        });
    }

    animateSensorGraph(ctx, type) {
        const data = Array.from({length: 50}, () => Math.random() * 40 + 10);
        let frame = 0;

        const draw = () => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Рисуем график
            ctx.beginPath();
            ctx.moveTo(0, ctx.canvas.height / 2);
            
            data.forEach((value, index) => {
                const x = (index / data.length) * ctx.canvas.width;
                const y = (value / 60) * ctx.canvas.height;
                ctx.lineTo(x, ctx.canvas.height - y);
            });
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Анимируем данные
            data.shift();
            data.push(Math.random() * 40 + 10);
            
            frame++;
            requestAnimationFrame(draw);
        };

        draw();
    }

    generateOrbitData() {
        return Array.from({length: 50}, (_, i) => {
            return Math.sin(i * 0.2) * 20 + Math.cos(i * 0.1) * 10 + 50;
        });
    }

    startMissionTimer() {
        setInterval(() => {
            const now = new Date();
            const diff = now - this.missionStartTime;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            document.getElementById('mission-timer').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    simulateSensorData() {
        setInterval(() => {
            this.updateSensorData();
        }, 2000);
    }

    updateSensorData() {
        const sensors = {
            'temp-value': () => `${(24.5 + Math.random() * 2 - 1).toFixed(1)}°C`,
            'rad-value': () => `${Math.floor(12500 + Math.random() * 1000 - 500).toLocaleString()} лк`,
            'oxy-value': () => `${(98 + Math.random() * 2).toFixed(1)}%`
        };

        Object.entries(sensors).forEach(([id, generator]) => {
            const element = document.getElementById(id);
            if (element) {
                gsap.to(element, {
                    duration: 0.5,
                    scale: 1.2,
                    onComplete: () => {
                        element.textContent = generator();
                        gsap.to(element, { duration: 0.5, scale: 1 });
                    }
                });
            }
        });

        const progressBars = {
            'oxy-bar': 85 + Math.random() * 10
        };

        Object.entries(progressBars).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                gsap.to(element, {
                    duration: 1,
                    width: `${value}%`
                });
            }
        });
    }

    init3DScene() {
        try {
            if (typeof THREE === 'undefined') {
                console.warn('Three.js не загружен, пропускаем 3D сцену');
                return;
            }

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                alpha: true, 
                antialias: true 
            });
            
            const container = document.getElementById('space-scene');
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            renderer.setClearColor(0x000000, 0);
            container.appendChild(renderer.domElement);

            // Создание звездного поля
            const starsGeometry = new THREE.BufferGeometry();
            const starsCount = 10000;
            const positions = new Float32Array(starsCount * 3);

            for (let i = 0; i < starsCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 2000;
                positions[i + 1] = (Math.random() - 0.5) * 2000;
                positions[i + 2] = (Math.random() - 0.5) * 2000;
            }

            starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const starsMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 1,
                sizeAttenuation: true
            });
            const starField = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(starField);

            // Создание Земли
            const earthGeometry = new THREE.SphereGeometry(50, 32, 32);
            const earthMaterial = new THREE.MeshBasicMaterial({
                color: 0x2233ff,
                wireframe: true
            });
            const earth = new THREE.Mesh(earthGeometry, earthMaterial);
            scene.add(earth);

            // Создание орбитальной станции
            const stationGeometry = new THREE.BoxGeometry(10, 5, 15);
            const stationMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true
            });
            const station = new THREE.Mesh(stationGeometry, stationMaterial);
            station.position.x = 100;
            scene.add(station);

            camera.position.z = 200;

            // Анимация сцены
            const animate = () => {
                requestAnimationFrame(animate);

                earth.rotation.y += 0.001;
                station.rotation.y += 0.005;
                station.position.x = 100 * Math.cos(Date.now() * 0.001);
                station.position.z = 100 * Math.sin(Date.now() * 0.001);

                starField.rotation.y += 0.0001;

                renderer.render(scene, camera);
            };

            animate();

            this.threeScene = { scene, camera, renderer, earth, station, starField };
        } catch (error) {
            console.error('Ошибка инициализации 3D сцены:', error);
        }
    }

    startBackgroundAnimations() {
        // Анимация голографического земного шара
        this.animateHologram();
        
        // Анимация частиц
        this.startParticleEffects();
    }

    animateHologram() {
        const hologram = document.querySelector('.hologram-globe');
        if (!hologram) return;

        let rotation = 0;
        const animate = () => {
            rotation += 0.5;
            hologram.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            requestAnimationFrame(animate);
        };
        animate();
    }

    startParticleEffects() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        document.getElementById('main-interface').appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: #00ff00;
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.1};
        `;

        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        
        particle.style.left = startX + 'vw';
        particle.style.top = startY + 'vh';

        container.appendChild(particle);

        // Анимация частицы
        gsap.to(particle, {
            x: `+=${(Math.random() - 0.5) * 100}`,
            y: `+=${(Math.random() - 0.5) * 100}`,
            opacity: 0,
            duration: Math.random() * 10 + 5,
            ease: "power1.out",
            onComplete: () => {
                particle.remove();
                this.createParticle(container);
            }
        });
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const mainInterface = document.getElementById('main-interface');
            
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    loadingScreen.classList.add('hidden');
                    mainInterface.classList.remove('hidden');
                    this.showNotification('Система', 'Мониторинг активирован');
                }
            });
        }, 3000);
    }

    // Методы управления
    sendCommand(command, data) {
        // Эмуляция отправки команды в Telegram бот
        console.log(`Отправка команды: ${command}`, data);
        
        // В реальном приложении здесь будет отправка данных в бот
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify({
                action: command,
                ...data
            }));
        }
    }

    handleCommsAction(action) {
        const actions = {
            'comms-on': () => {
                this.showNotification('Коммуникации', 'Система связи активирована');
                document.getElementById('global-status').textContent = 'СВЯЗЬ АКТИВНА';
                document.getElementById('global-status').style.background = '#006600';
            },
            'comms-off': () => {
                this.showNotification('Коммуникации', 'Система связи отключена');
                document.getElementById('global-status').textContent = 'СВЯЗЬ ОТКЛ';
                document.getElementById('global-status').style.background = '#660000';
            },
            'comms-test': () => {
                this.showNotification('Тест связи', 'Проверка каналов связи...');
                setTimeout(() => {
                    this.showNotification('Тест связи', 'Все каналы связи функционируют нормально');
                }, 2000);
            }
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    startCourseAdjustment() {
        this.showNotification('Навигация', 'Запуск корректировки курса');
        
        // Анимация корректировки
        gsap.to('.hologram-globe', {
            rotation: 360,
            duration: 3,
            ease: "power2.inOut"
        });

        setTimeout(() => {
            this.showNotification('Навигация', 'Корректировка курса завершена');
        }, 3000);
    }

    toggleAutopilot() {
        const autopilotBtn = document.getElementById('auto-pilot');
        const isActive = autopilotBtn.classList.contains('active');
        
        if (isActive) {
            autopilotBtn.classList.remove('active');
            autopilotBtn.style.background = '#0066cc';
            this.showNotification('Автопилот', 'Система отключена');
        } else {
            autopilotBtn.classList.add('active');
            autopilotBtn.style.background = '#00cc00';
            this.showNotification('Автопилот', 'Система активирована');
        }
    }

    startExperiment() {
        const experiment = document.getElementById('experiment-select').value;
        const experiments = {
            'spectrum': 'Спектральный анализ атмосферы',
            'radiation': 'Измерение радиационного фона',
            'atmosphere': 'Забор атмосферных проб',
            'gravity': 'Гравитационные измерения'
        };

        this.showNotification('Научный эксперимент', `Запуск: ${experiments[experiment]}`);
        
        // Анимация эксперимента
        const experimentProgress = document.createElement('div');
        experimentProgress.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 50, 100, 0.9);
            padding: 20px;
            border: 2px solid #00ff00;
            border-radius: 10px;
            z-index: 1000;
        `;
        experimentProgress.innerHTML = `
            <div style="color: #00ff00; text-align: center;">
                <div>🚀 ЗАПУСК ЭКСПЕРИМЕНТА</div>
                <div style="margin: 10px 0; font-size: 14px;">${experiments[experiment]}</div>
                <div class="progress-bar" style="width: 100%; height: 20px; background: #000; border-radius: 10px; overflow: hidden;">
                    <div class="progress-fill" style="width: 0%; height: 100%; background: #00ff00; transition: width 5s;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(experimentProgress);

        // Анимация прогресса
        setTimeout(() => {
            document.querySelector('.progress-fill').style.width = '100%';
        }, 100);

        setTimeout(() => {
            experimentProgress.remove();
            this.showNotification('Эксперимент', 'Успешно завершен! Данные получены.');
        }, 5000);
    }

    toggleSpectrumAnalysis() {
        const toggleBtn = document.getElementById('spectrum-toggle');
        const isPlaying = toggleBtn.textContent === '⏸️';
        
        if (isPlaying) {
            toggleBtn.textContent = '▶️';
            this.showNotification('Спектральный анализ', 'Приостановлен');
        } else {
            toggleBtn.textContent = '⏸️';
            this.showNotification('Спектральный анализ', 'Активирован');
            this.startSpectrumAnimation();
        }
    }

    startSpectrumAnimation() {
        if (!this.charts.spectrum) return;

        const animate = () => {
            if (document.getElementById('spectrum-toggle').textContent === '▶️') return;

            this.charts.spectrum.data.datasets[0].data = 
                Array.from({length: 32}, () => Math.random() * 100);
            this.charts.spectrum.update();

            setTimeout(animate, 200);
        };

        animate();
    }

    // Аварийные системы
    toggleEmergencyPanel() {
        const panel = document.getElementById('emergency-panel');
        const isVisible = !panel.classList.contains('hidden');
        
        if (isVisible) {
            panel.classList.add('hidden');
            this.emergencyMode = false;
            document.body.style.background = '#000';
        } else {
            panel.classList.remove('hidden');
            this.emergencyMode = true;
            document.body.style.background = 'linear-gradient(45deg, #330000, #660000)';
            this.showNotification('АВАРИЙНЫЙ РЕЖИМ', 'Активирована панель экстренного управления');
        }
    }

    setEmergencyLevel(level) {
        const levels = {
            1: { color: '#006600', text: 'НЕЗНАЧИТЕЛЬНЫЙ' },
            2: { color: '#666600', text: 'ПОВЫШЕННЫЙ' },
            3: { color: '#996600', text: 'ВЫСОКИЙ' },
            4: { color: '#cc0000', text: 'КРИТИЧЕСКИЙ' }
        };

        const status = document.getElementById('global-status');
        status.textContent = `УРОВЕНЬ ${level} - ${levels[level].text}`;
        status.style.background = levels[level].color;

        this.showNotification('Аварийный уровень', `Установлен уровень ${level}`);
    }

    executeEmergencyAction(action) {
        const actions = {
            'isolate': {
                title: 'Изоляция отсеков',
                message: 'Активирована система изоляции отсеков'
            },
            'backup': {
                title: 'Резервные системы',
                message: 'Переключение на резервное питание'
            },
            'sos': {
                title: 'SOS сигнал',
                message: 'Аварийный сигнал активирован'
            },
            'evacuate': {
                title: 'Эвакуация',
                message: 'Инициирован протокол аварийного покидания'
            }
        };

        if (actions[action]) {
            const { title, message } = actions[action];
            this.showNotification(`🚨 ${title}`, message, true);
            
            // Визуальные эффекты для аварийных действий
            if (action === 'sos') {
                this.activateSOSSignal();
            }
        }
    }

    activateSOSSignal() {
        let blinkCount = 0;
        const maxBlinks = 10;
        
        const blink = () => {
            if (blinkCount >= maxBlinks * 2) return;
            
            document.body.style.background = blinkCount % 2 === 0 ? '#ff0000' : '#000000';
            blinkCount++;
            setTimeout(blink, 500);
        };
        
        blink();

        // Восстановление фона после сигнала
        setTimeout(() => {
            document.body.style.background = 'linear-gradient(45deg, #330000, #660000)';
        }, maxBlinks * 1000 + 1000);
    }

    // Игровой режим
    startGame(gameType) {
        this.gameActive = true;
        const gamePanel = document.getElementById('game-panel');
        gamePanel.classList.remove('hidden');

        const games = {
            'orbit': 'Орбитальный полет',
            'repair': 'Ремонт в открытом космосе',
            'navigation': 'Навигация по астероидам',
            'docking': 'Стыковка с станцией'
        };

        this.showNotification('Игровой режим', `Запуск: ${games[gameType]}`);
        
        // Инициализация игровой сцены
        this.initGameScene(gameType);
    }

    initGameScene(gameType) {
        const gameScene = document.getElementById('game-scene');
        gameScene.innerHTML = `
            <div style="color: #00ff00; text-align: center; padding: 20px;">
                <h3>🎮 ${this.getGameTitle(gameType)}</h3>
                <div style="margin: 20px 0; font-size: 16px;">
                    ${this.getGameDescription(gameType)}
                </div>
                <div style="background: #001122; padding: 20px; border-radius: 10px; border: 1px solid #00ff00;">
                    <div>🕹️ Управление:</div>
                    <div style="font-size: 14px; margin-top: 10px;">${this.getGameControls(gameType)}</div>
                </div>
                <button onclick="spaceApp.startGameSession('${gameType}')" 
                        style="margin-top: 20px; padding: 10px 20px; background: #00cc00; color: black; border: none; border-radius: 5px; cursor: pointer;">
                    🚀 НАЧАТЬ ИГРУ
                </button>
            </div>
        `;
    }

    getGameTitle(gameType) {
        const titles = {
            'orbit': 'ОРБИТАЛЬНЫЙ ПОЛЕТ',
            'repair': 'РЕМОНТ EVA',
            'navigation': 'НАВИГАЦИЯ',
            'docking': 'СТЫКОВКА'
        };
        return titles[gameType] || 'ИГРА';
    }

    getGameDescription(gameType) {
        const descriptions = {
            'orbit': 'Управляйте космическим кораблем на орбите Земли',
            'repair': 'Выполните ремонтные работы в открытом космосе',
            'navigation': 'Проведите корабль через поле астероидов',
            'docking': 'Выполните точную стыковку с космической станцией'
        };
        return descriptions[gameType] || '';
    }

    getGameControls(gameType) {
        const controls = {
            'orbit': 'WASD - движение | Space - ускорение | Mouse - камера',
            'repair': 'Mouse - инструменты | E - взаимодействие | R - смена инструмента',
            'navigation': 'Mouse - наведение | ЛКМ - пуск | ПКМ - щит',
            'docking': 'WASD - ориентация | Shift - маневры | Space - стыковка'
        };
        return controls[gameType] || '';
    }

    startGameSession(gameType) {
        this.showNotification('Игра', 'Сессия началась!');
        // Здесь будет логика конкретной игры
    }

    closeGame() {
        this.gameActive = false;
        document.getElementById('game-panel').classList.add('hidden');
        this.showNotification('Игровой режим', 'Сессия завершена');
    }

    // Панели управления
    switchPanel(panelName) {
        this.currentPanel = panelName;
        
        // Обновляем активные кнопки меню
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');

        // Здесь будет логика переключения панелей
        this.showNotification('Навигация', `Переход в раздел: ${this.getPanelTitle(panelName)}`);
    }

    getPanelTitle(panelName) {
        const titles = {
            'main': 'Главная',
            'systems': 'Системы',
            'science': 'Наука',
            'navigation': 'Навигация',
            'communication': 'Связь',
            'game': 'Игра',
            'settings': 'Настройки'
        };
        return titles[panelName] || panelName;
    }

    // Уведомления
    showNotification(title, message, isEmergency = false) {
        const template = document.getElementById('notification-template');
        const notification = template.cloneNode(true);
        notification.id = '';
        notification.style.display = 'flex';

        const icon = notification.querySelector('.notification-icon');
        const notifTitle = notification.querySelector('.notification-title');
        const notifMessage = notification.querySelector('.notification-message');
        const closeBtn = notification.querySelector('.notification-close');

        icon.textContent = isEmergency ? '🚨' : 'ℹ️';
        notifTitle.textContent = title;
        notifMessage.textContent = message;

        if (isEmergency) {
            notification.style.background = 'rgba(255, 0, 0, 0.9)';
            notification.style.borderColor = '#ff0000';
        }

        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        document.querySelector('.notification-center').appendChild(notification);

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                gsap.to(notification, {
                    opacity: 0,
                    x: 100,
                    duration: 0.5,
                    onComplete: () => notification.remove()
                });
            }
        }, 5000);
    }

    // Обработчики событий
    handleKeyPress(event) {
        if (event.code === 'F1') {
            event.preventDefault();
            this.showNotification('Помощь', 'F1 - Помощь | F2 - Режим | Space - Пауза | E - Аварийный протокол');
        } else if (event.code === 'F2') {
            event.preventDefault();
            this.toggleEmergencyPanel();
        } else if (event.code === 'Space' && !event.target.matches('input, textarea')) {
            event.preventDefault();
            this.toggleSimulationPause();
        } else if (event.code === 'KeyE' && !event.target.matches('input, textarea')) {
            event.preventDefault();
            this.toggleEmergencyPanel();
        } else if (event.code === 'KeyG' && !event.target.matches('input, textarea')) {
            event.preventDefault();
            this.startGame('orbit');
        }
    }

    toggleSimulationPause() {
        const isPaused = document.body.classList.contains('paused');
        
        if (isPaused) {
            document.body.classList.remove('paused');
            this.showNotification('Симуляция', 'Возобновлена');
        } else {
            document.body.classList.add('paused');
            this.showNotification('Симуляция', 'Приостановлена');
        }
    }

    handleResize() {
        if (this.threeScene) {
            this.threeScene.camera.aspect = window.innerWidth / window.innerHeight;
            this.threeScene.camera.updateProjectionMatrix();
            this.threeScene.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // Публичные методы для взаимодействия с ботом
    updateFromBot(data) {
        if (data.sensors) {
            this.sensorData = { ...this.sensorData, ...data.sensors };
            this.updateSensorDisplays();
        }
        
        if (data.emergency) {
            this.setEmergencyLevel(data.emergency.level);
        }
    }

    updateSensorDisplays() {
        // Обновление интерфейса на основе данных от бота
        Object.entries(this.sensorData).forEach(([sensor, value]) => {
            const element = document.getElementById(`${sensor}-value`);
            if (element) {
                element.textContent = value;
            }
        });
    }
}

// Инициализация приложения
let spaceApp;

document.addEventListener('DOMContentLoaded', () => {
    spaceApp = new SpaceMonitoringApp();
    
    // Глобальный объект для взаимодействия с Telegram
    window.spaceApp = spaceApp;
    
    // Обработка данных от Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Обработка данных от бота
        Telegram.WebApp.onEvent('webAppData', (data) => {
            if (data && data.sensors) {
                spaceApp.updateFromBot(data);
            }
        });
    }
});

// Глобальные функции для взаимодействия
window.sendToTelegram = (data) => {
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify(data));
    }
};

// Service Worker для оффлайн работы (опционально)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker зарегистрирован'))
        .catch(err => console.log('Ошибка Service Worker:', err));
}