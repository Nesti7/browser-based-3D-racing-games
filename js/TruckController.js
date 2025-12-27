/**
 * TruckController - Управление грузовиком и простая физика
 * Обрабатывает ввод пользователя и обновляет позицию/скорость грузовика
 */

import * as THREE from 'three';

export class TruckController {
    constructor(truck) {
        this.truck = truck;
        
        // Физические параметры
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = 0; // Угол поворота (radians)
        this.speed = 0; // Текущая скорость
        
        // Параметры управления
        this.maxSpeed = 0.5;        // Максимальная скорость
        this.acceleration = 0.01;   // Ускорение
        this.braking = 0.02;        // Торможение
        this.friction = 0.98;       // Трение (замедление)
        this.turnSpeed = 0.03;      // Скорость поворота
        
        // Состояние кнопок
        this.controls = {
            gas: false,
            brake: false,
            left: false,
            right: false
        };
        
        this.setupControls();
    }
    
    /**
     * Настройка управления (touch-кнопки)
     */
    setupControls() {
        // Получаем кнопки
        const btnGas = document.getElementById('btnGas');
        const btnBrake = document.getElementById('btnBrake');
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        
        // Обработчики для кнопки "Газ"
        this.addButtonListeners(btnGas, 'gas');
        this.addButtonListeners(btnBrake, 'brake');
        this.addButtonListeners(btnLeft, 'left');
        this.addButtonListeners(btnRight, 'right');
        
        // Клавиатура (для тестирования на ПК)
        document.addEventListener('keydown', (e) => {
            // Предотвращаем прокрутку страницы стрелками
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            
            // Используем e.code для WASD (не зависит от раскладки)
            const key = e.key.toLowerCase();
            const code = e.code;
            
            if (key === 'arrowup' || code === 'KeyW') {
                this.controls.gas = true;
            } else if (key === 'arrowdown' || code === 'KeyS') {
                this.controls.brake = true;
            } else if (key === 'arrowleft' || code === 'KeyA') {
                this.controls.left = true;
            } else if (key === 'arrowright' || code === 'KeyD') {
                this.controls.right = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // Используем e.code для WASD (не зависит от раскладки)
            const key = e.key.toLowerCase();
            const code = e.code;
            
            if (key === 'arrowup' || code === 'KeyW') {
                this.controls.gas = false;
            } else if (key === 'arrowdown' || code === 'KeyS') {
                this.controls.brake = false;
            } else if (key === 'arrowleft' || code === 'KeyA') {
                this.controls.left = false;
            } else if (key === 'arrowright' || code === 'KeyD') {
                this.controls.right = false;
            }
        });
    }
    
    /**
     * Добавление обработчиков для touch-кнопок
     */
    addButtonListeners(button, controlName) {
        if (!button) return;
        
        // Touch события
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.controls[controlName] = true;
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.controls[controlName] = false;
        });
        
        // Mouse события (для тестирования на ПК)
        button.addEventListener('mousedown', () => {
            this.controls[controlName] = true;
        });
        
        button.addEventListener('mouseup', () => {
            this.controls[controlName] = false;
        });
        
        button.addEventListener('mouseleave', () => {
            this.controls[controlName] = false;
        });
    }
    
    /**
     * Обновление физики и позиции грузовика
     */
    update(deltaTime) {
        // Ускорение/торможение
        if (this.controls.gas) {
            this.speed += this.acceleration;
        } else if (this.controls.brake) {
            this.speed -= this.braking;
        } else {
            // Естественное замедление (трение)
            this.speed *= this.friction;
        }
        
        // Ограничение скорости
        this.speed = THREE.MathUtils.clamp(this.speed, -this.maxSpeed * 0.5, this.maxSpeed);
        
        // Повороты (только если грузовик движется)
        if (Math.abs(this.speed) > 0.01) {
            const turnDirection = this.speed > 0 ? 1 : -1; // При движении назад инвертируем управление
            
            if (this.controls.left) {
                this.rotation += this.turnSpeed * Math.abs(this.speed) / this.maxSpeed * turnDirection;
            }
            if (this.controls.right) {
                this.rotation -= this.turnSpeed * Math.abs(this.speed) / this.maxSpeed * turnDirection;
            }
        }
        
        // Обновление позиции на основе скорости и направления
        this.velocity.x = Math.sin(this.rotation) * this.speed;
        this.velocity.z = Math.cos(this.rotation) * this.speed;
        
        this.position.add(this.velocity);
        
        // Ограничение движения по дороге (не даём съехать слишком далеко)
        this.position.x = THREE.MathUtils.clamp(this.position.x, -3, 3);
        
        // Обновляем модель грузовика
        this.truck.update(this.position, this.rotation);
        
        // Анимация вращения колёс
        this.truck.updateWheels(this.speed);
    }
    
    /**
     * Получить текущую позицию грузовика
     */
    getPosition() {
        return this.position.clone();
    }
    
    /**
     * Получить текущую скорость
     */
    getSpeed() {
        return this.speed;
    }
    
    /**
     * Получить текущий угол поворота
     */
    getRotation() {
        return this.rotation;
    }
    
    /**
     * Сброс позиции (для рестарта)
     */
    reset() {
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation = 0;
        this.speed = 0;
        
        this.controls = {
            gas: false,
            brake: false,
            left: false,
            right: false
        };
    }
}

