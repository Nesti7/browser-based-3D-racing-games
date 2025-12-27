/**
 * Game - Основной игровой класс
 * Управляет сценой Three.js, рендерингом и игровым циклом
 */

import * as THREE from 'three';
import { PerformanceManager } from './PerformanceManager.js';
import { Truck } from './models/Truck.js';
import { Environment } from './models/Environment.js';
import { TruckController } from './TruckController.js';
import { CameraController } from './CameraController.js';

export class Game {
    constructor() {
        // Менеджер производительности
        this.perfManager = new PerformanceManager();
        this.settings = this.perfManager.getSettings();
        
        // Three.js компоненты
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cameraController = null;
        
        // Игровые объекты
        this.truck = null;
        this.truckController = null;
        this.environment = null;
        
        // Время
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        
        this.init();
    }
    
    /**
     * Инициализация игры
     */
    init() {
        console.log('[Game] Инициализация...');
        
        try {
            console.log('[Game] 1. Настройка сцены...');
            this.setupScene();
            
            console.log('[Game] 2. Настройка освещения...');
            this.setupLights();
            
            console.log('[Game] 3. Настройка камеры...');
            this.setupCamera();
            
            console.log('[Game] 4. Настройка рендерера...');
            this.setupRenderer();
            
            console.log('[Game] 5. Создание игровых объектов...');
            this.createGameObjects();
            
            console.log('[Game] 6. Настройка тумана...');
            this.setupFog();
            
            console.log('[Game] 7. Запуск мониторинга FPS...');
            this.perfManager.createFPSMonitor();
            
            console.log('[Game] 8. Настройка управления камерой...');
            this.cameraController = new CameraController(this.camera);
            
            // Обработка изменения размера окна
            window.addEventListener('resize', () => this.onWindowResize());
            
            console.log('[Game] ✅ Инициализация завершена успешно');
        } catch (error) {
            console.error('[Game] ❌ Ошибка при инициализации:', error);
            throw error;
        }
    }
    
    /**
     * Настройка сцены
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Голубое небо
    }
    
    /**
     * Настройка освещения
     */
    setupLights() {
        // Ambient light (общее освещение)
        const ambientLight = new THREE.HemisphereLight(
            0xffffff,  // Цвет неба
            0x444444,  // Цвет земли
            0.6
        );
        this.scene.add(ambientLight);
        
        // Directional light (солнце)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        
        // Настройка теней (если включены)
        if (this.settings.shadows) {
            directionalLight.castShadow = true;
            directionalLight.shadow.camera.left = -50;
            directionalLight.shadow.camera.right = 50;
            directionalLight.shadow.camera.top = 50;
            directionalLight.shadow.camera.bottom = -50;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 200;
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
        }
        
        this.scene.add(directionalLight);
    }
    
    /**
     * Настройка камеры
     */
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 8, 15); // Позиция за грузовиком (выше и дальше)
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Настройка рендерера
     */
    setupRenderer() {
        const canvas = document.getElementById('gameCanvas');
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: this.settings.antialias,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(this.settings.pixelRatio);
        
        // Включаем тени (если поддерживается)
        if (this.settings.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Тон маппинг для лучших цветов
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }
    
    /**
     * Настройка тумана
     */
    setupFog() {
        if (this.settings.fogEnabled) {
            this.scene.fog = new THREE.Fog(
                0x87ceeb,  // Цвет тумана (как небо)
                this.settings.fogNear,
                this.settings.fogFar
            );
        }
    }
    
    /**
     * Создание игровых объектов
     */
    createGameObjects() {
        try {
            console.log('[Game] Создание грузовика...');
            this.truck = new Truck(this.settings);
            const truckGroup = this.truck.getGroup();
            console.log('[Game] Грузовик создан, дочерних объектов:', truckGroup.children.length);
            this.scene.add(truckGroup);
            
            console.log('[Game] Создание контроллера грузовика...');
            this.truckController = new TruckController(this.truck);
            
            console.log('[Game] Создание окружения...');
            this.environment = new Environment(this.settings);
            const envGroup = this.environment.getGroup();
            console.log('[Game] Окружение создано, дочерних объектов:', envGroup.children.length);
            this.scene.add(envGroup);
            
            console.log('[Game] Всего объектов в сцене:', this.scene.children.length);
        } catch (error) {
            console.error('[Game] ❌ Ошибка при создании объектов:', error);
            throw error;
        }
    }
    
    /**
     * Обновление камеры (следит за грузовиком с возможностью вращения)
     */
    updateCamera() {
        const truckPos = this.truckController.getPosition();
        const truckRot = this.truckController.getRotation();
        
        // Используем CameraController для управления камерой
        this.cameraController.update(truckPos, truckRot);
    }
    
    /**
     * Игровой цикл (вызывается каждый кадр)
     */
    update() {
        this.deltaTime = this.clock.getDelta();
        
        // Обновляем контроллер грузовика
        this.truckController.update(this.deltaTime);
        
        // Обновляем камеру
        this.updateCamera();
        
        // Обновляем окружение (LOD и т.д.)
        this.environment.update(this.truckController.getPosition());
        
        // Рендерим сцену
        this.renderer.render(this.scene, this.camera);
        
        // Следующий кадр
        requestAnimationFrame(() => this.update());
    }
    
    /**
     * Обработка изменения размера окна
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    /**
     * Запуск игры
     */
    start() {
        console.log('[Game] Запуск игрового цикла');
        this.update();
    }
    
    /**
     * Получить информацию о производительности
     */
    getPerformanceInfo() {
        return {
            class: this.perfManager.getPerformanceClass(),
            settings: this.settings
        };
    }
}

