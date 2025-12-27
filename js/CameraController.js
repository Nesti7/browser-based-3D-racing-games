/**
 * CameraController - Управление камерой (вращение вокруг грузовика)
 */

export class CameraController {
    constructor(camera) {
        this.camera = camera;
        
        // Параметры камеры
        this.distance = 15;        // Расстояние от грузовика
        this.height = 8;           // Высота камеры
        this.angleH = 0;           // Горизонтальный угол (вокруг грузовика)
        this.angleV = 0.3;         // Вертикальный угол (наклон вверх/вниз)
        
        // Ограничения вертикального угла
        this.minAngleV = 0.1;      // Минимум (почти горизонтально)
        this.maxAngleV = Math.PI / 3; // Максимум (60 градусов вверх)
        
        // Чувствительность мыши/тача
        this.sensitivity = 0.003;
        
        // Состояние управления
        this.isRotating = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Для touch
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isTouchRotating = false;
        
        this.setupControls();
    }
    
    /**
     * Настройка управления камерой
     */
    setupControls() {
        const canvas = document.getElementById('gameCanvas');
        
        // === МЫШЬ (ПК) ===
        
        // Правая кнопка мыши - начало вращения
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Правая кнопка
                this.isRotating = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                e.preventDefault();
            }
        });
        
        // Движение мыши
        canvas.addEventListener('mousemove', (e) => {
            if (this.isRotating) {
                const deltaX = e.clientX - this.lastX;
                const deltaY = e.clientY - this.lastY;
                
                this.angleH -= deltaX * this.sensitivity;
                this.angleV += deltaY * this.sensitivity;
                
                // Ограничиваем вертикальный угол
                this.angleV = Math.max(this.minAngleV, Math.min(this.maxAngleV, this.angleV));
                
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            }
        });
        
        // Отпускание кнопки мыши
        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isRotating = false;
            }
        });
        
        // Отключаем контекстное меню при правом клике
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // === TOUCH (МОБИЛЬНЫЕ) ===
        
        // Начало касания (двумя пальцами для вращения камеры)
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Два пальца - вращение камеры
                this.isTouchRotating = true;
                const touch = e.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
                e.preventDefault();
            }
        });
        
        // Движение пальцев
        canvas.addEventListener('touchmove', (e) => {
            if (this.isTouchRotating && e.touches.length === 2) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.touchStartX;
                const deltaY = touch.clientY - this.touchStartY;
                
                this.angleH -= deltaX * this.sensitivity;
                this.angleV += deltaY * this.sensitivity;
                
                // Ограничиваем вертикальный угол
                this.angleV = Math.max(this.minAngleV, Math.min(this.maxAngleV, this.angleV));
                
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
                e.preventDefault();
            }
        });
        
        // Конец касания
        canvas.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                this.isTouchRotating = false;
            }
        });
        
        // Колесо мыши - приближение/отдаление
        canvas.addEventListener('wheel', (e) => {
            this.distance += e.deltaY * 0.01;
            this.distance = Math.max(5, Math.min(30, this.distance)); // Ограничиваем дистанцию
            e.preventDefault();
        }, { passive: false });
    }
    
    /**
     * Обновление позиции камеры
     * @param {THREE.Vector3} targetPosition - Позиция грузовика
     * @param {number} targetRotation - Поворот грузовика
     */
    update(targetPosition, targetRotation) {
        // Вычисляем позицию камеры относительно грузовика
        const totalAngle = targetRotation + this.angleH;
        
        const offsetX = Math.sin(totalAngle) * this.distance * Math.cos(this.angleV);
        const offsetZ = Math.cos(totalAngle) * this.distance * Math.cos(this.angleV);
        const offsetY = this.distance * Math.sin(this.angleV);
        
        const targetCameraPos = targetPosition.clone();
        targetCameraPos.x -= offsetX;
        targetCameraPos.z -= offsetZ;
        targetCameraPos.y += offsetY;
        
        // Плавное движение камеры (lerp)
        this.camera.position.lerp(targetCameraPos, 0.1);
        
        // Камера смотрит на грузовик (чуть выше)
        const lookAtPos = targetPosition.clone();
        lookAtPos.y += 1;
        this.camera.lookAt(lookAtPos);
    }
    
    /**
     * Сброс угла камеры (вернуть за грузовик)
     */
    reset() {
        this.angleH = 0;
        this.angleV = 0.3;
    }
}

