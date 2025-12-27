/**
 * PerformanceManager - Управление производительностью и адаптация графики
 * под разные устройства (LOW/AVERAGE/HIGH)
 */

export class PerformanceManager {
    constructor() {
        this.performanceClass = 'AVERAGE'; // По умолчанию средняя производительность
        this.settings = {};
        
        this.detectPerformance();
        this.applySettings();
    }
    
    /**
     * Определение класса производительности устройства
     */
    detectPerformance() {
        // Проверяем Telegram WebApp API
        if (window.Telegram && window.Telegram.WebApp) {
            const tgData = window.Telegram.WebApp.initDataUnsafe;
            
            // Получаем performance_class из Telegram (если доступно)
            if (tgData && tgData.device && tgData.device.performance_class) {
                const perfClass = tgData.device.performance_class.toUpperCase();
                this.performanceClass = perfClass;
                console.log(`[PerformanceManager] Telegram performance_class: ${perfClass}`);
                return;
            }
        }
        
        // Fallback: определяем производительность по характеристикам устройства
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const memory = navigator.deviceMemory || 4; // GB RAM (если доступно)
        const cores = navigator.hardwareConcurrency || 4;
        
        // Эвристика для определения класса
        if (isMobile && memory <= 2) {
            this.performanceClass = 'LOW';
        } else if (isMobile && memory <= 4) {
            this.performanceClass = 'AVERAGE';
        } else if (!isMobile || memory > 4) {
            this.performanceClass = 'HIGH';
        }
        
        console.log(`[PerformanceManager] Detected: ${this.performanceClass} (RAM: ${memory}GB, Cores: ${cores}, Mobile: ${isMobile})`);
    }
    
    /**
     * Применение настроек графики в зависимости от класса производительности
     */
    applySettings() {
        switch (this.performanceClass) {
            case 'LOW':
                this.settings = {
                    pixelRatio: 0.75,           // Снижаем разрешение
                    targetFPS: 30,              // 30 FPS для слабых устройств
                    shadows: false,             // Отключаем тени
                    antialias: false,           // Отключаем сглаживание
                    maxLights: 2,               // Максимум 2 источника света
                    particlesEnabled: false,    // Отключаем частицы
                    postProcessing: false,      // Отключаем пост-эффекты
                    lodDistance: 30,            // Дистанция LOD (Level of Detail)
                    maxTreeCount: 20,           // Максимум деревьев
                    fogEnabled: true,           // Туман включен (скрывает дальние объекты)
                    fogNear: 20,
                    fogFar: 50
                };
                break;
                
            case 'AVERAGE':
                this.settings = {
                    pixelRatio: 1.0,
                    targetFPS: 60,
                    shadows: true,              // Включаем тени
                    antialias: true,
                    maxLights: 3,
                    particlesEnabled: true,
                    postProcessing: false,
                    lodDistance: 50,
                    maxTreeCount: 40,
                    fogEnabled: true,
                    fogNear: 40,
                    fogFar: 100
                };
                break;
                
            case 'HIGH':
                this.settings = {
                    pixelRatio: Math.min(window.devicePixelRatio, 2), // Максимум 2x
                    targetFPS: 60,
                    shadows: true,
                    antialias: true,
                    maxLights: 4,
                    particlesEnabled: true,
                    postProcessing: true,       // Пост-эффекты (bloom, etc.)
                    lodDistance: 80,
                    maxTreeCount: 60,
                    fogEnabled: true,
                    fogNear: 60,
                    fogFar: 150
                };
                break;
        }
        
        console.log('[PerformanceManager] Settings:', this.settings);
    }
    
    /**
     * Получить настройки производительности
     */
    getSettings() {
        return this.settings;
    }
    
    /**
     * Получить класс производительности
     */
    getPerformanceClass() {
        return this.performanceClass;
    }
    
    /**
     * Мониторинг FPS (для отладки)
     */
    createFPSMonitor() {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 0;
        
        const update = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                // Обновляем UI
                const fpsElement = document.getElementById('fps');
                if (fpsElement) {
                    fpsElement.textContent = `FPS: ${fps}`;
                    
                    // Цветовая индикация
                    if (fps >= 55) {
                        fpsElement.style.color = '#00ff00'; // Зелёный
                    } else if (fps >= 30) {
                        fpsElement.style.color = '#ffff00'; // Жёлтый
                    } else {
                        fpsElement.style.color = '#ff0000'; // Красный
                    }
                }
            }
            
            requestAnimationFrame(update);
        };
        
        update();
        
        // Отображаем класс производительности
        const perfClassElement = document.getElementById('perfClass');
        if (perfClassElement) {
            perfClassElement.textContent = `Performance: ${this.performanceClass}`;
        }
    }
}

