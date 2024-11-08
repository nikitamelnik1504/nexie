export default class QueueManager {
    constructor(maxConcurrentRequests = 5) {
        this.maxConcurrentRequests = maxConcurrentRequests; // Максимальное количество параллельных задач
        this.activeRequests = 0; // Количество активных задач
        this.queue = []; // Очередь задач
    }

    // Метод добавления задачи в очередь
    addTask(task) {
        this.queue.push(task);
        this._checkQueue(); // Проверяем очередь на наличие задач
    }

    // Метод выполнения задач из очереди
    _checkQueue() {
        while (this.activeRequests < this.maxConcurrentRequests && this.queue.length > 0) {
            const task = this.queue.shift();
            this._runTask(task);
        }
    }

    // Метод для выполнения отдельной задачи
    async _runTask(task) {
        this.activeRequests++; // Увеличиваем счетчик активных задач
        try {
            await task(); // Выполняем задачу
        } catch (error) {
            console.error('Task error:', error);
        } finally {
            this.activeRequests--; // Уменьшаем счетчик активных задач
            this._checkQueue(); // Проверяем очередь для запуска следующей задачи
        }
    }

    // Метод ожидания завершения всех задач
    async waitForCompletion() {
        while (this.activeRequests > 0 || this.queue.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Небольшая задержка перед повторной проверкой
        }
    }
}
