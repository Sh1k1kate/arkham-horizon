// admin.js
class CardAdmin {
    constructor() {
        this.data = {
            investigators: [],
            scenarios: [],
            ancient: [],
            items: [],
            spells: [],
            allies: [],
            conditions: []
        };
        this.currentCategory = 'investigator';
        this.githubSync = null;
        this.currentImage = null;
        this.init();
    }

    async init() {
        // Инициализируем GitHub синхронизатор
        this.githubSync = new GitHubSyncManager(this);
        
        // Проверяем подключение к GitHub
        this.updateGitHubStatus();
        
        // Загружаем данные
        await this.loadData();
        
        this.setupEventListeners();
        this.renderCardsList();
        this.updateCardsCount();
    }

    updateGitHubStatus() {
        const statusEl = document.getElementById('github-connection-status');
        const infoEl = document.getElementById('github-info');
        
        if (this.githubSync && this.githubSync.isConfigured()) {
            statusEl.className = 'connected';
            statusEl.innerHTML = '● Подключено';
            infoEl.textContent = `${this.githubSync.owner}/${this.githubSync.repo}`;
        } else {
            statusEl.className = 'disconnected';
            statusEl.innerHTML = '● Не подключено';
            infoEl.textContent = '';
        }
    }

    async loadData() {
        try {
            if (this.githubSync && this.githubSync.isConfigured()) {
                // Загружаем с GitHub
                const response = await this.githubSync.githubRequest(
                    `/repos/${this.githubSync.owner}/${this.githubSync.repo}/contents/data/cards.json`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const content = this.githubSync.decodeBase64(data.content);
                    this.data = JSON.parse(content);
                    this.showNotification('Данные загружены с GitHub', 'success');
                } else {
                    // Файл не найден, создаем пустую структуру
                    this.data = this.getEmptyData();
                }
            } else {
                // Пытаемся загрузить из localStorage
                const savedData = localStorage.getItem('arkham_cards');
                if (savedData) {
                    this.data = JSON.parse(savedData);
                } else {
                    this.data = this.getEmptyData();
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.data = this.getEmptyData();
            this.showNotification('Ошибка загрузки данных', 'error');
        }
    }

    getEmptyData() {
        return {
            investigators: [],
            scenarios: [],
            ancient: [],
            items: [],
            spells: [],
            allies: [],
            conditions: []
        };
    }

    async saveData() {
        try {
            if (this.githubSync && this.githubSync.isConfigured()) {
                // Сохраняем на GitHub
                await this.saveToGitHub();
            } else {
                // Сохраняем в localStorage
                localStorage.setItem('arkham_cards', JSON.stringify(this.data));
                this.showNotification('Данные сохранены локально', 'success');
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            this.showNotification('Ошибка сохранения данных', 'error');
        }
    }

    async saveToGitHub() {
        const content = this.githubSync.encodeBase64(JSON.stringify(this.data, null, 2));
        
        // Проверяем существование файла
        const response = await this.githubSync.githubRequest(
            `/repos/${this.githubSync.owner}/${this.githubSync.repo}/contents/data/cards.json`
        );
        
        const body = {
            message: `🃏 Обновление картотеки: ${new Date().toLocaleString('ru-RU')}`,
            content: content
        };
        
        if (response.ok) {
            const data = await response.json();
            body.sha = data.sha;
        }
        
        const saveResponse = await this.githubSync.githubRequest(
            `/repos/${this.githubSync.owner}/${this.githubSync.repo}/contents/data/cards.json`,
            {
                method: 'PUT',
                body: JSON.stringify(body)
            }
        );
        
        if (saveResponse.ok) {
            this.showNotification('✅ Данные сохранены на GitHub', 'success');
        } else {
            throw new Error('Ошибка сохранения на GitHub');
        }
    }

    async saveImageToGitHub(imageData, path) {
        try {
            const content = imageData; // уже base64
            
            // Проверяем существование файла
            const response = await this.githubSync.githubRequest(
                `/repos/${this.githubSync.owner}/${this.githubSync.repo}/contents/${path}`
            );
            
            const body = {
                message: `🖼️ Добавление изображения: ${path}`,
                content: content
            };
            
            if (response.ok) {
                const data = await response.json();
                body.sha = data.sha;
            }
            
            const saveResponse = await this.githubSync.githubRequest(
                `/repos/${this.githubSync.owner}/${this.githubSync.repo}/contents/${path}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(body)
                }
            );
            
            return saveResponse.ok;
        } catch (error) {
            console.error('Ошибка сохранения изображения:', error);
            return false;
        }
    }

    setupEventListeners() {
        // Переключение вкладок
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderCardsList();
            });
        });

        // Форма добавления карты
        document.getElementById('card-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCard();
        });

        // Drag & drop для изображений
        this.setupDragAndDrop();

        // Очистка формы
        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearForm();
        });

        // Пакетная загрузка
        document.getElementById('batch-upload').addEventListener('click', () => {
            this.batchUpload();
        });

        // Экспорт JSON
        document.getElementById('export-json').addEventListener('click', () => {
            this.exportJSON();
        });

        // Импорт из трекера
        document.getElementById('import-from-tracker').addEventListener('click', () => {
            this.importFromTracker();
        });

        // Настройка GitHub
        document.getElementById('setup-github').addEventListener('click', () => {
            this.setupGitHub();
        });

        // Синхронизация с GitHub
        document.getElementById('sync-github').addEventListener('click', () => {
            this.syncWithGitHub();
        });
    }

    async setupGitHub() {
        const modalHTML = `
            <div class="sync-setup-modal">
                <h3>⚙️ Настройка GitHub для картотеки</h3>
                <div class="setup-instructions">
                    <p><strong>Как получить GitHub Token:</strong></p>
                    <ol>
                        <li>Зайдите на <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Tokens</a></li>
                        <li>Нажмите "Generate new token" → "Generate new token (classic)"</li>
                        <li>Введите название: "Arkham Cards Admin"</li>
                        <li>Выберите права: <strong>repo</strong> (полный доступ)</li>
                        <li>Скопируйте токен (начинается с ghp_)</li>
                    </ol>
                </div>
                <div class="setup-form">
                    <div class="form-group">
                        <label>GitHub Token:</label>
                        <input type="password" id="github-token" class="form-control" value="${this.githubSync?.token || ''}">
                    </div>
                    <div class="form-group">
                        <label>Username:</label>
                        <input type="text" id="github-owner" class="form-control" value="${this.githubSync?.owner || 'sh1k1kate'}">
                    </div>
                    <div class="form-group">
                        <label>Repository:</label>
                        <input type="text" id="github-repo" class="form-control" value="${this.githubSync?.repo || 'arkham-horizon'}">
                    </div>
                </div>
            </div>
        `;

        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close">&times;</span>
                <div class="modal-body">${modalHTML}</div>
                <div style="padding: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="control-btn" id="save-github">Сохранить</button>
                    <button class="control-btn secondary" id="cancel-github">Отмена</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        modal.querySelector('.close').onclick = () => modal.remove();
        document.getElementById('cancel-github').onclick = () => modal.remove();

        document.getElementById('save-github').onclick = async () => {
            const token = document.getElementById('github-token').value;
            const owner = document.getElementById('github-owner').value;
            const repo = document.getElementById('github-repo').value;

            localStorage.setItem('github_token', token);
            localStorage.setItem('github_owner', owner);
            localStorage.setItem('github_repo', repo);

            this.githubSync = new GitHubSyncManager(this);
            this.githubSync.token = token;
            this.githubSync.owner = owner;
            this.githubSync.repo = repo;

            this.updateGitHubStatus();
            await this.loadData();
            this.renderCardsList();
            this.updateCardsCount();

            modal.remove();
            this.showNotification('Настройки GitHub сохранены', 'success');
        };
    }

    async syncWithGitHub() {
        if (!this.githubSync || !this.githubSync.isConfigured()) {
            this.showNotification('Сначала настройте GitHub', 'error');
            return;
        }

        await this.loadData();
        this.renderCardsList();
        this.updateCardsCount();
    }

    setupDragAndDrop() {
        const dropArea = document.getElementById('drop-area');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('dragover');
            });
        });

        dropArea.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            this.handleFileSelect(file);
        });

        dropArea.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
    }

    async handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showNotification('Пожалуйста, выберите изображение', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Файл слишком большой (макс. 5 МБ)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            
            // Сохраняем base64 данные (убираем префикс)
            this.currentImage = {
                name: file.name,
                data: e.target.result.split(',')[1],
                type: file.type
            };
        };
        reader.readAsDataURL(file);
    }

    async addCard() {
        const name = document.getElementById('card-name').value;
        const description = document.getElementById('card-description').value;
        const expansion = document.getElementById('card-expansion').value;
        const cardId = document.getElementById('card-id').value || this.generateId(name);
        const category = document.getElementById('card-category').value;

        if (!name) {
            this.showNotification('Введите название карты', 'error');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Сохранение...';

        // Показываем прогресс
        document.getElementById('upload-progress').style.display = 'block';

        try {
            // Создаем карточку
            const card = {
                id: cardId,
                name: name,
                description: description,
                expansion: expansion,
                type: category,
                image: `./images/${category}s/${cardId}.jpg`
            };

            // Добавляем в соответствующую категорию
            const categoryKey = this.getCategoryKey(category);
            this.data[categoryKey].push(card);

            // Сохраняем изображение, если есть
            if (this.currentImage && this.githubSync && this.githubSync.isConfigured()) {
                document.getElementById('progress-text').textContent = 'Загрузка изображения...';
                document.getElementById('progress-fill').style.width = '50%';
                
                const imagePath = `images/${category}s/${cardId}.jpg`;
                await this.saveImageToGitHub(this.currentImage.data, imagePath);
            }

            // Сохраняем JSON
            document.getElementById('progress-text').textContent = 'Сохранение данных...';
            document.getElementById('progress-fill').style.width = '80%';
            await this.saveData();

            document.getElementById('progress-fill').style.width = '100%';
            document.getElementById('progress-text').textContent = 'Готово!';

            this.showNotification(`Карта "${name}" успешно добавлена!`, 'success');
            
            setTimeout(() => {
                document.getElementById('upload-progress').style.display = 'none';
                document.getElementById('progress-fill').style.width = '0%';
            }, 1000);
            
            this.clearForm();
            this.renderCardsList();
            this.updateCardsCount();

        } catch (error) {
            this.showNotification('Ошибка при сохранении: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '💾 Сохранить карту';
        }
    }

    getCategoryKey(category) {
        const map = {
            'investigator': 'investigators',
            'scenario': 'scenarios',
            'ancient': 'ancient',
            'item': 'items',
            'spell': 'spells',
            'ally': 'allies',
            'condition': 'conditions'
        };
        return map[category] || category + 's';
    }

    generateId(name) {
        return name.toLowerCase()
            .replace(/[^a-zа-яё\s]/gi, '')
            .replace(/\s+/g, '_')
            .replace(/[ьъ]/g, '')
            .substring(0, 30);
    }

    renderCardsList() {
        const container = document.getElementById('cards-list');
        const categoryKey = this.getCategoryKey(this.currentCategory);
        const cards = this.data[categoryKey] || [];

        if (cards.length === 0) {
            container.innerHTML = '<div class="no-results-message">Нет карт в этой категории</div>';
            return;
        }

        container.innerHTML = cards.map(card => `
            <div class="admin-card">
                <img src="${card.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCd0LXRgiBpbWFnZTwvdGV4dD48L3N2Zz4='}" 
                     alt="${card.name}" 
                     class="admin-card-image"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCd0LXRgiBpbWFnZTwvdGV4dD48L3N2Zz4='">
                <div class="admin-card-info">
                    <div class="admin-card-title">${card.name}</div>
                    <div class="admin-card-type">${card.expansion || 'Без дополнения'}</div>
                </div>
                <div class="admin-card-actions">
                    <button class="admin-btn" onclick="admin.editCard('${card.id}')">✏️</button>
                    <button class="admin-btn delete" onclick="admin.deleteCard('${card.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    updateCardsCount() {
        const total = Object.values(this.data).reduce((sum, arr) => sum + arr.length, 0);
        document.getElementById('cards-count').textContent = total;
    }

    async deleteCard(cardId) {
        if (!confirm('Удалить эту карту?')) return;

        for (let category in this.data) {
            const index = this.data[category].findIndex(c => c.id === cardId);
            if (index !== -1) {
                this.data[category].splice(index, 1);
                break;
            }
        }

        await this.saveData();
        this.renderCardsList();
        this.updateCardsCount();
        this.showNotification('Карта удалена', 'success');
    }

    editCard(cardId) {
        // Находим карту
        let card = null;
        for (let category in this.data) {
            card = this.data[category].find(c => c.id === cardId);
            if (card) break;
        }

        if (!card) return;

        // Заполняем форму
        document.getElementById('card-name').value = card.name;
        document.getElementById('card-description').value = card.description || '';
        document.getElementById('card-expansion').value = card.expansion || '';
        document.getElementById('card-id').value = card.id;
        
        // Устанавливаем категорию
        const categorySelect = document.getElementById('card-category');
        const category = card.type || 'investigator';
        categorySelect.value = category;
        
        // Показываем превью
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `<img src="${card.image}" alt="${card.name}">`;
    }

    clearForm() {
        document.getElementById('card-form').reset();
        document.getElementById('image-preview').innerHTML = '<span style="color: var(--text-dark);">Предпросмотр</span>';
        document.getElementById('upload-progress').style.display = 'none';
        this.currentImage = null;
    }

    async batchUpload() {
        try {
            const jsonText = document.getElementById('batch-json').value;
            const newData = JSON.parse(jsonText);
            
            // Объединяем с существующими данными
            for (let category in newData) {
                if (this.data[category]) {
                    this.data[category] = [...this.data[category], ...newData[category]];
                }
            }
            
            await this.saveData();
            this.renderCardsList();
            this.updateCardsCount();
            this.showNotification('Данные загружены успешно!', 'success');
        } catch (error) {
            this.showNotification('Ошибка в JSON: ' + error.message, 'error');
        }
    }

    exportJSON() {
        const jsonString = JSON.stringify(this.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'arkham_cards_backup.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importFromTracker() {
        // Импортируем сыщиков и сценарии из трекера
        if (window.tracker) {
            const investigators = Object.entries(window.tracker.investigators).map(([id, data]) => ({
                id: id,
                name: data.name,
                description: data.description,
                image: data.image,
                type: 'investigator',
                expansion: 'Базовый набор'
            }));
            
            const scenarios = Object.entries(window.tracker.scenarios).map(([id, data]) => ({
                id: id,
                name: data.name,
                description: data.description,
                image: data.image,
                type: 'scenario',
                expansion: 'Базовый набор'
            }));
            
            this.data.investigators = investigators;
            this.data.scenarios = scenarios;
            
            this.saveData();
            this.renderCardsList();
            this.updateCardsCount();
            this.showNotification('Данные импортированы из трекера', 'success');
        } else {
            this.showNotification('Трекер не найден', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация
const admin = new CardAdmin();
