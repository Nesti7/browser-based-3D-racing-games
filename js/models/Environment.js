/**
 * Environment - Окружение (дорога, деревья, камни)
 * Процедурная генерация low-poly окружения
 */

import * as THREE from 'three';

export class Environment {
    constructor(performanceSettings) {
        this.settings = performanceSettings;
        this.group = new THREE.Group();
        this.group.name = 'Environment';
        
        this.createEnvironment();
    }
    
    /**
     * Создание окружения
     */
    createEnvironment() {
        this.createRoad();
        this.createTrees();
        this.createGround();
    }
    
    /**
     * Создание дороги
     */
    createRoad() {
        const roadMaterial = new THREE.MeshToonMaterial({ 
            color: 0x444444  // Тёмно-серая дорога
        });
        roadMaterial.flatShading = true;
        
        // Длинная дорога
        const roadGeometry = new THREE.PlaneGeometry(8, 200);
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2; // Поворачиваем горизонтально
        road.position.y = 0.01; // Чуть выше земли
        road.receiveShadow = this.settings.shadows;
        this.group.add(road);
        
        // Разметка дороги (белые полосы)
        const stripeMaterial = new THREE.MeshToonMaterial({ 
            color: 0xffffff
        });
        stripeMaterial.flatShading = true;
        
        const stripeGeometry = new THREE.PlaneGeometry(0.3, 3);
        
        // Создаём пунктирную линию по центру
        for (let i = -50; i < 50; i += 8) {
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(0, 0.02, i);
            this.group.add(stripe);
        }
    }
    
    /**
     * Создание земли по бокам дороги
     */
    createGround() {
        const groundMaterial = new THREE.MeshToonMaterial({ 
            color: 0x5a8f3a  // Зелёная трава
        });
        groundMaterial.flatShading = true;
        
        const groundGeometry = new THREE.PlaneGeometry(100, 200);
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = this.settings.shadows;
        this.group.add(ground);
    }
    
    /**
     * Создание деревьев по бокам дороги
     */
    createTrees() {
        const treeCount = Math.min(this.settings.maxTreeCount, 40);
        
        for (let i = 0; i < treeCount; i++) {
            // Случайная позиция по бокам дороги
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (6 + Math.random() * 10); // От 6 до 16 метров от центра
            const z = (Math.random() - 0.5) * 180; // Вдоль дороги
            
            const tree = this.createTree();
            tree.position.set(x, 0, z);
            
            // Случайный поворот
            tree.rotation.y = Math.random() * Math.PI * 2;
            
            // Случайный масштаб (0.8 - 1.2)
            const scale = 0.8 + Math.random() * 0.4;
            tree.scale.set(scale, scale, scale);
            
            this.group.add(tree);
        }
    }
    
    /**
     * Создание одного дерева (ствол + крона)
     */
    createTree() {
        const treeGroup = new THREE.Group();
        
        // Ствол (цилиндр)
        const trunkMaterial = new THREE.MeshToonMaterial({ 
            color: 0x8b4513  // Коричневый ствол
        });
        trunkMaterial.flatShading = true;
        
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = this.settings.shadows;
        trunk.receiveShadow = this.settings.shadows;
        treeGroup.add(trunk);
        
        // Крона (конус)
        const crownMaterial = new THREE.MeshToonMaterial({ 
            color: 0x2d5016  // Тёмно-зелёная крона
        });
        crownMaterial.flatShading = true;
        
        const crownGeometry = new THREE.ConeGeometry(1.5, 3, 6);
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 3.5;
        crown.castShadow = this.settings.shadows;
        treeGroup.add(crown);
        
        // Дополнительный ярус кроны (для объёма)
        const crown2 = new THREE.Mesh(
            new THREE.ConeGeometry(1.2, 2.5, 6), 
            crownMaterial
        );
        crown2.position.y = 4.5;
        crown2.castShadow = this.settings.shadows;
        treeGroup.add(crown2);
        
        return treeGroup;
    }
    
    /**
     * Создание камней (опционально, для разнообразия)
     */
    createRock() {
        const rockMaterial = new THREE.MeshToonMaterial({ 
            color: 0x808080
        });
        rockMaterial.flatShading = true;
        
        // Используем додекаэдр для камня
        const rockGeometry = new THREE.DodecahedronGeometry(0.5, 0);
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.castShadow = this.settings.shadows;
        rock.receiveShadow = this.settings.shadows;
        
        return rock;
    }
    
    /**
     * Добавление камней вдоль дороги
     */
    addRocks(count = 10) {
        for (let i = 0; i < count; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (5 + Math.random() * 8);
            const z = (Math.random() - 0.5) * 180;
            
            const rock = this.createRock();
            rock.position.set(x, 0.25, z);
            
            // Случайный поворот и масштаб
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            const scale = 0.5 + Math.random() * 1.5;
            rock.scale.set(scale, scale, scale);
            
            this.group.add(rock);
        }
    }
    
    /**
     * Получить группу Three.js
     */
    getGroup() {
        return this.group;
    }
    
    /**
     * Обновление окружения (для анимаций, если нужно)
     */
    update(truckPosition) {
        // Можно добавить LOD (Level of Detail) здесь
        // Например, скрывать дальние деревья на LOW устройствах
        
        if (this.settings.performanceClass === 'LOW') {
            // Упрощённая логика для слабых устройств
            this.group.children.forEach(child => {
                if (child.name === 'Tree') {
                    const distance = child.position.distanceTo(truckPosition);
                    child.visible = distance < this.settings.lodDistance;
                }
            });
        }
    }
}

