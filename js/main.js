/**
 * main.js - Точка входа в приложение
 * Инициализация Telegram WebApp и запуск игры
 */

import { Game } from './Game.js';

/**
 * Инициализация Telegram Mini App
 */
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Разворачиваем приложение на весь экран
        tg.expand();
        
        // Отключаем вертикальные свайпы (чтобы не закрывать приложение)
        tg.enableClosingConfirmation();
        
        // Устанавливаем цвет заголовка
        tg.setHeaderColor('#1a1a2e');
        
        // Логируем данные пользователя (для отладки)
        console.log('[Telegram] WebApp initialized');
        console.log('[Telegram] User:', tg.initDataUnsafe.user);
        console.log('[Telegram] Platform:', tg.platform);
        console.log('[Telegram] Version:', tg.version);
        
        // Готовность приложения
        tg.ready();
        
        return true;
    } else {
        console.warn('[Telegram] WebApp API не найден. Запуск в обычном режиме.');
        return false;
    }
}

/**
 * Главная функция запуска
 */
function main() {
    console.log('=== 3D Гонки на Грузовиках ===');
    console.log('Инициализация...');
    
    // Инициализируем Telegram WebApp (если доступен)
    const isTelegramApp = initTelegramWebApp();
    
    if (isTelegramApp) {
        console.log('[Main] Запуск в Telegram Mini App');
    } else {
        console.log('[Main] Запуск в обычном браузере');
    }
    
    // Создаём и запускаем игру
    try {
        console.log('[Main] Создание игры...');
        const game = new Game();
        
        // Выводим информацию о производительности
        const perfInfo = game.getPerformanceInfo();
        console.log('[Main] Performance Class:', perfInfo.class);
        console.log('[Main] Settings:', perfInfo.settings);
        
        // Запускаем игровой цикл
        console.log('[Main] Запуск игрового цикла...');
        game.start();
        
        console.log('[Main] Игра запущена успешно! ✅');
        
        // Делаем игру доступной глобально (для отладки)
        window.game = game;
        
    } catch (error) {
        console.error('[Main] ❌ Ошибка при запуске игры:', error);
        console.error('[Main] Stack trace:', error.stack);
        
        // Показываем ошибку пользователю
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-family: monospace;
                max-width: 80%;
                text-align: center;
                z-index: 10000;
            ">
                <h2>❌ Ошибка загрузки игры</h2>
                <p>${error.message}</p>
                <pre style="font-size: 10px; margin-top: 10px; text-align: left; overflow: auto; max-height: 200px;">
${error.stack}
                </pre>
                <p style="font-size: 12px; margin-top: 10px;">
                    Откройте консоль браузера (F12) для подробностей
                </p>
            </div>
        `;
    }
}

// Ждём полной загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

