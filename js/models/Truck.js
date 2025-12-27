/**
 * Truck - Процедурная модель грузовика в low-poly стиле
 * Простая модель из кубиков и цилиндров, готовая к замене на .glb
 */

import * as THREE from 'three';

export class Truck {
    constructor(performanceSettings) {
        this.settings = performanceSettings;
        this.group = new THREE.Group();
        this.group.name = 'Truck';
        
        this.createTruck();
    }
    
    /**
     * Создание процедурной модели грузовика
     */
    createTruck() {
        // Создаём отдельную группу для корпуса (чтобы повернуть только его)
        const bodyGroup = new THREE.Group();
        
        // Материалы с toon shading (мультяшный стиль)
        const cabinMaterial = new THREE.MeshToonMaterial({ 
            color: 0xff4444  // Красная кабина
        });
        cabinMaterial.flatShading = true; // Плоское затенение для low-poly эффекта
        
        const cargoBedMaterial = new THREE.MeshToonMaterial({ 
            color: 0x3366ff  // Синий кузов
        });
        cargoBedMaterial.flatShading = true;
        
        const wheelMaterial = new THREE.MeshToonMaterial({ 
            color: 0x222222  // Чёрные колёса
        });
        wheelMaterial.flatShading = true;
        
        const windowMaterial = new THREE.MeshToonMaterial({ 
            color: 0x88ccff,  // Голубые окна
            transparent: true,
            opacity: 0.6
        });
        windowMaterial.flatShading = true;
        
        // === КАБИНА ===
        const cabinGeometry = new THREE.BoxGeometry(2, 1.5, 1.8);
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 0.75, 0);
        cabin.castShadow = this.settings.shadows;
        cabin.receiveShadow = this.settings.shadows;
        bodyGroup.add(cabin);
        
        // Окна кабины
        const windowGeometry = new THREE.BoxGeometry(0.1, 0.8, 1.4);
        
        // Переднее окно
        const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        frontWindow.position.set(1.05, 1, 0);
        bodyGroup.add(frontWindow);
        
        // Боковые окна
        const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.1), windowMaterial);
        leftWindow.position.set(0, 1, 0.95);
        bodyGroup.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.1), windowMaterial);
        rightWindow.position.set(0, 1, -0.95);
        bodyGroup.add(rightWindow);
        
        // === КУЗОВ ===
        const cargoBedGeometry = new THREE.BoxGeometry(3, 1.2, 2);
        const cargoBed = new THREE.Mesh(cargoBedGeometry, cargoBedMaterial);
        cargoBed.position.set(-2.5, 0.6, 0);
        cargoBed.castShadow = this.settings.shadows;
        cargoBed.receiveShadow = this.settings.shadows;
        bodyGroup.add(cargoBed);
        
        // === КОЛЁСА ===
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        
        // Позиции колёс: [x, y, z] - координаты ДО поворота корпуса
        const wheelPositions = [
            [0.8, 0.4, 1.2],   // Переднее левое
            [0.8, 0.4, -1.2],  // Переднее правое
            [-2.5, 0.4, 1.2],  // Заднее левое
            [-2.5, 0.4, -1.2]  // Заднее правое
        ];
        
        this.wheels = [];
        
        wheelPositions.forEach((pos, index) => {
            // Создаём группу для каждого колеса (для правильного вращения)
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(pos[0], pos[1], pos[2]);
            
            // Создаём меш колеса
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            // Поворачиваем цилиндр горизонтально (по оси Z)
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = this.settings.shadows;
            
            // Добавляем меш в группу колеса
            wheelGroup.add(wheel);
            
            // Поворачиваем группу колеса, чтобы компенсировать поворот bodyGroup
            wheelGroup.rotation.y = Math.PI / 2;
            
            // Добавляем группу колеса в bodyGroup
            bodyGroup.add(wheelGroup);
            
            // Сохраняем группу для анимации вращения
            this.wheels.push(wheelGroup);
        });
        
        // === ФАРЫ (простые кубики) ===
        const headlightMaterial = new THREE.MeshToonMaterial({ 
            color: 0xffffaa,
            emissive: 0xffffaa,
            emissiveIntensity: 0.5
        });
        headlightMaterial.flatShading = true;
        
        const headlightGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.3);
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(1.1, 0.5, 0.6);
        bodyGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(1.1, 0.5, -0.6);
        bodyGroup.add(rightHeadlight);
        
        // Поворачиваем только корпус на 90 градусов (колёса остаются как есть)
        bodyGroup.rotation.y = -Math.PI / 2;
        
        // Добавляем корпус в основную группу
        this.group.add(bodyGroup);
        
        // Начальная позиция грузовика
        this.group.position.set(0, 0, 0);
    }
    
    /**
     * Анимация вращения колёс
     * @param {number} speed - Скорость грузовика
     */
    updateWheels(speed) {
        // Теперь wheels - это группы, вращаем их вокруг локальной оси X
        const rotationSpeed = speed * 2.0; // Увеличиваем скорость вращения для реалистичности
        this.wheels.forEach(wheelGroup => {
            // Вращаем группу вокруг её локальной оси X (направление движения)
            wheelGroup.rotateX(rotationSpeed);
        });
    }
    
    /**
     * Получить группу Three.js
     */
    getGroup() {
        return this.group;
    }
    
    /**
     * Обновление позиции и поворота
     * @param {THREE.Vector3} position
     * @param {number} rotation
     */
    update(position, rotation) {
        this.group.position.copy(position);
        this.group.rotation.y = rotation;
    }
    
    /**
     * Замена на готовую модель (для будущего использования)
     * @param {THREE.Group} gltfModel - Загруженная .glb модель
     */
    replaceWithGLTF(gltfModel) {
        // Удаляем процедурную модель
        this.group.clear();
        
        // Добавляем загруженную модель
        this.group.add(gltfModel);
        
        // Применяем настройки теней
        gltfModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = this.settings.shadows;
                child.receiveShadow = this.settings.shadows;
                
                // Применяем toon материал
                if (child.material) {
                    child.material = new THREE.MeshToonMaterial({
                        color: child.material.color,
                        map: child.material.map,
                        flatShading: true
                    });
                }
            }
        });
        
        console.log('[Truck] Модель заменена на GLTF');
    }
}

