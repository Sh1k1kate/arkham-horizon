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
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderCardsList();
        this.updateCardsCount();
    }

    async loadData() {
        try {
            const response = await fetch('data/cards.json');
            if (response.ok) {
                this.data = await response.json();
            } else {
                // Если файла нет, создаем пустую структуру
                this.data = this.getEmptyData();
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.data = this.getEmptyData();
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

        // Выбор файла для загрузки
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
    }

    setupDragAndDrop() {
        const dropArea = document.getElementById('drop-area');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

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
            
            // Сохраняем данные изображения для последующей загрузки
            this.currentImage = {
                name: file.name,
                data: e.target.result.split(',')[1], // base64 данные
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

        // Создаем карточку
        const card = {
            id: cardId,
            name: name,
            description: description,
            expansion: expansion,
            type: category,
            image: `./images/${category}s/${cardId}.jpg`
        };

        // Добавляем дополнительные поля в зависимости от категории
        const extraFields = this.getExtraFields();
        Object.assign(card, extraFields);

        // Добавляем в соответствующую категорию
        const categoryKey = this.getCategoryKey(category);
        this.data[categoryKey].push(card);

        // Сохраняем изображение
        if (this.currentImage) {
            await this.saveImage(this.currentImage.data, `images/${category}s/${cardId}.jpg`);
        }

        // Сохраняем JSON
        await this.saveData();

        this.showNotification(`Карта "${name}" успешно добавлена!`, 'success');
        this.clearForm();
        this.renderCardsList();
        this.updateCardsCount();
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

    getExtraFields() {
        // Здесь можно добавить специфические поля для разных категорий
        return {};
    }

    async saveImage(base64Data, path) {
        // В реальном проекте здесь должен быть запрос к серверу
        // Для GitHub Pages это сохранится в localStorage
        const savedImages = JSON.parse(localStorage.getItem('arkham_images') || '{}');
        savedImages[path] = base64Data;
        localStorage.setItem('arkham_images', JSON.stringify(savedImages));
    }

    async saveData() {
        // Сохраняем в localStorage для GitHub Pages
        localStorage.setItem('arkham_cards', JSON.stringify(this.data));
        
        // Для реального сервера здесь был бы fetch POST
        this.showNotification('Данные сохранены локально. Для сохранения на сервере нужен бэкенд.', 'info');
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

    deleteCard(cardId) {
        if (!confirm('Удалить эту карту?')) return;

        for (let category in this.data) {
            const index = this.data[category].findIndex(c => c.id === cardId);
            if (index !== -1) {
                this.data[category].splice(index, 1);
                break;
            }
        }

        this.saveData();
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
        this.currentImage = null;
    }

    batchUpload() {
        try {
            const jsonText = document.getElementById('batch-json').value;
            const newData = JSON.parse(jsonText);
            
            // Объединяем с существующими данными
            for (let category in newData) {
                if (this.data[category]) {
                    this.data[category] = [...this.data[category], ...newData[category]];
                }
            }
            
            this.saveData();
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
