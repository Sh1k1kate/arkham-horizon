// Основной класс трекера
class ArkhamHorizonTracker {
    constructor() {
        this.progress = [];
        this.investigators = {
            'agnes': { name: 'Агнес Бейкер', image: null, description: 'Официантка с пробудившимися экстрасенсорными способностями' },
            'pete': { name: '«Жестянка» Пит', image: null, description: 'Бродяга с верным спутником - вороном' },
            'calvin': { name: 'Кэлвин Райт', image: null, description: 'Преследуемый прошлыми травмами' },
            'daniela': { name: 'Даниэла Рейес', image: null, description: 'Механик с техническим складом ума' },
            'dexter': { name: 'Декстер Дрейк', image: null, description: 'Фокусник, владеющий иллюзиями' },
            'jenny': { name: 'Дженни Барнс', image: null, description: 'Девушка из высшего общества с боевыми навыками' },
            'marie': { name: 'Мари Ламбо', image: null, description: 'Певица с гипнотическим голосом' },
            'michael': { name: 'Майкл МакГлен', image: null, description: 'Гангстер, привыкший решать вопросы силой' },
            'minh': { name: 'Минь Тхи Фан', image: null, description: 'Секретарь-архивариус с феноменальной памятью' },
            'norman': { name: 'Норман Уизерс', image: null, description: 'Астроном, открывший ужасающие тайны вселенной' },
            'rex': { name: 'Рекс Мёрфи', image: null, description: 'Репортёр, ищущий сенсационные разоблачения' },
            'roland': { name: 'Роланд Бэнкс', image: null, description: 'Федеральный агент с аналитическим складом ума' },
            'skids': { name: '«Шквал» О\'Тул', image: null, description: 'Бывший заключенный, ищущий искупления' },
            'tommy': { name: 'Томми Малдун', image: null, description: 'Полицейский-новичок с обострённым чувством справедливости' },
            'wendy': { name: 'Венди Адамс', image: null, description: 'Бездомная сирота, мастер побегов и уклонений' },
            'zoey': { name: 'Зои Сэмарас', image: null, description: 'Повар с необычными кулинарными талантами' },
            'agatha': { name: 'Агата Крейн', image: null, description: 'Парапсихолог, изучающая потусторонние явления' },
            'carson': { name: 'Карсон Синклер', image: null, description: 'Дворецкий с безупречными манерами и наблюдательностью' },
            'charley': { name: 'Чарли Кейн', image: null, description: 'Политик, владеющий искусством убеждения' },
            'diana': { name: 'Диана Стэнли', image: null, description: 'Искупившаяся культистка, борющаяся со своим прошлым' },
            'mateo': { name: 'Отец Матео', image: null, description: 'Священник, сражающийся с демоническими силами' },
            'kate': { name: 'Кейт Уинтроп', image: null, description: 'Учёный-исследователь аномальных явлений' },
            'mark': { name: 'Марк Харриган', image: null, description: 'Солдат с боевым опытом и железной волей' },
            'patrice': { name: 'Патрис Хэтауэй', image: null, description: 'Скрипачка с мистической связью через музыку' },
            'preston': { name: 'Престон Фэйрмонт', image: null, description: 'Миллионер, использующий своё состояние в борьбе со злом' },
            'silas': { name: 'Силас Марш', image: null, description: 'Моряк, повидавший ужасы морских глубин' },
            'stella': { name: 'Стелла Кларк', image: null, description: 'Почтальон, знающий все тайны Аркхэма' },
            'winifred': { name: 'Виннифред Хаббамок', image: null, description: 'Авиатриса с жаждой приключений' }
        };

        this.scenarios = {
            'veil_twilight': { name: 'Завеса сумерек', image: null, description: 'Исследование таинственных исчезновений в старом квартале Аркхэма' },
            'feast_umordhoth': { name: 'Пир для Умордхота', image: null, description: 'Охота на древнее существо, пробудившееся в подземельях города' },
            'coming_azathoth': { name: 'Пришествие Азатота', image: null, description: 'Безумный ритуал по призыву спящего божества угрожает уничтожить мир' },
            'echo_deep': { name: 'Эхо из глубин', image: null, description: 'Загадочные события на побережье намекают на присутствие древних существ' },
            'silence_tsathoggua': { name: 'Безмолвие Цатхоггуа', image: null, description: 'Расследование странных артефактов, связанных с подземным божеством' },
            'shots_blind': { name: 'Выстрелы вслепую', image: null, description: 'Опасная конфронтация с тайным культом в тёмных переулках Аркхэма' },
            'pale_lantern': { name: 'Бледный фонарь', image: null, description: 'Поиск источника призрачного свечения, сводящего горожан с ума' },
            'children_ithaqua': { name: 'Дети Итакуа', image: null, description: 'Ледяной ужас окутывает город, пробуждая древнее зло' },
            'dreams_rlyeh': { name: 'Сны о Р\'льехе', image: null, description: 'Кошмары о затонувшем городе начинают проникать в реальность' },
            'tyrants_destruction': { name: 'Тираны разрушения', image: null, description: 'Битва с могущественными существами из иных измерений' },
            'revenge_past': { name: 'Возмездие из прошлого', image: null, description: 'Старые грехи возвращаются, чтобы преследовать жителей Аркхэма' },
            'key_gate': { name: 'Ключ и врата', image: null, description: 'Поиск древнего артефакта, способного открыть врата между мирами' },
            'summoned_serve': { name: 'Призваны служить', image: null, description: 'Столкновение с культом, пытающимся призвать на службу тёмных существ' }
        };

        this.achievements = {
            beginner: { name: 'Неофит', description: 'Пройдите первый сюжет', target: 1, icon: '🥳', unlocked: false, progress: 0 },
            adventurer: { name: 'Искатель приключений', description: 'Пройдите 5 сюжетов', target: 5, icon: '🏕️', unlocked: false, progress: 0 },
            veteran: { name: 'Ветеран Аркхема', description: 'Пройдите 10 сюжетов', target: 10, icon: '🎖️', unlocked: false, progress: 0 },
            expert: { name: 'Эксперт по Древним', description: 'Пройдите 20 сюжетов', target: 20, icon: '👑', unlocked: false, progress: 0 },
            specialist: { name: 'Мастер одного пути', description: 'Пройдите 5 сюжетов одним сыщиком', target: 5, icon: '🎯', unlocked: false, progress: 0 },
            collector: { name: 'Собиратель опыта', description: 'Испытайте всех сыщиков', target: 28, icon: '📚', unlocked: false, progress: 0 },
            triumphant: { name: 'Триумфатор', description: 'Одержите 100 побед', target: 100, icon: '🏆', unlocked: false, progress: 0 },
            survivor: { name: 'Выживший', description: 'Переживите 5 поражений', target: 5, icon: '💀', unlocked: false, progress: 0 },
            teamplayer: { name: 'Командный игрок', description: 'Пройдите 10 сюжетов в команде из 2+ сыщиков', target: 10, icon: '👥', unlocked: false, progress: 0 },
            fullteam: { name: 'Полная команда', description: 'Пройдите сюжет в команде из 4 сыщиков', target: 1, icon: '🔄', unlocked: false, progress: 0 },
            scholar: { name: 'Ученый', description: 'Пройдите все сюжеты кампании', target: 13, icon: '📖', unlocked: false, progress: 0 },
            universal: { name: 'Древнее божество', description: 'Пройдите все сюжеты кампании за всех персонажей', target: 364, icon: '💀📖💀', unlocked: false, progress: 0 },
            unlucky: { name: 'Невезучий', description: 'Проиграйте 3 сюжета подряд', target: 3, icon: '🍀', unlocked: false, progress: 0 }
        };

        this.selectedInvestigators = [];
        this.currentPlayerCount = 2;
        this.syncManager = new GitHubSyncManager(this);
        this.init();
    }

    init() {
        this.renderPlayerCountSelector();
        this.renderInvestigatorFields();
        this.renderScenarioOptions();
        this.renderFilterOptions();
        this.setMinDate();
        this.renderHexagonGrid();
        this.renderStats();
        this.updateAchievements();
        this.setupEventListeners();
        this.setupModal();

        setTimeout(() => {
            if (this.syncManager.isConfigured()) {
                this.syncManager.pull();
            } else {
                this.renderHexagonGrid();
                this.renderStats();
                this.updateAchievements();
            }
        }, 1000);
    }

    setupEventListeners() {
        document.getElementById('progress-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProgress();
        });

        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setPlayerCount(parseInt(e.target.dataset.count));
            });
        });

        document.getElementById('scenario').addEventListener('change', (e) => {
            this.showScenarioPreview(e.target.value);
        });

        document.getElementById('filter-investigator').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-scenario').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-result').addEventListener('change', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

        document.getElementById('setup-sync').addEventListener('click', () => {
            this.syncManager.setup();
        });

        document.getElementById('manual-sync').addEventListener('click', () => {
            this.syncManager.pull();
        });

        document.getElementById('sync-status').addEventListener('click', () => {
            this.syncManager.showStatus();
        });

        document.getElementById('create-sync-file').addEventListener('click', () => {
            this.syncManager.createInitialFile();
        });

        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('input', this.handleSearchInput.bind(this));
    }

    // Упрощенная версия без изображений
    renderPlayerCountSelector() {
        const buttons = document.querySelectorAll('.count-btn');
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.count) === this.currentPlayerCount) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        document.getElementById('player-count').value = this.currentPlayerCount;
    }

    setPlayerCount(count) {
        this.currentPlayerCount = count;
        this.renderPlayerCountSelector();
        this.renderInvestigatorFields();
    }

    renderInvestigatorFields() {
        const container = document.getElementById('investigators-container');
        container.innerHTML = '';

        for (let i = 0; i < this.currentPlayerCount; i++) {
            const fieldHTML = `
                <div class="form-group investigator-field" data-index="${i}">
                    <label for="investigator-${i}" class="form-label">🕵️ Сыщик ${i + 1}:</label>
                    <div class="investigator-field-group">
                        <div class="investigator-select-container">
                            <div class="investigator-search-container">
                                <input type="text" 
                                       class="investigator-search" 
                                       id="investigator-search-${i}"
                                       placeholder="Начните вводить имя сыщика..."
                                       data-index="${i}"
                                       autocomplete="off">
                                <span class="search-icon">🔍</span>
                                <div class="investigator-select-with-search" id="investigator-select-${i}"></div>
                            </div>
                            <input type="hidden" id="investigator-${i}" name="investigator[]">
                        </div>
                        ${i > 0 ? `<button type="button" class="remove-investigator-btn" data-index="${i}">🗑️</button>` : ''}
                    </div>
                </div>
            `;
            container.innerHTML += fieldHTML;
        }

        document.querySelectorAll('.remove-investigator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeInvestigatorField(index);
            });
        });

        document.querySelectorAll('.investigator-search').forEach(input => {
            input.addEventListener('focus', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.showInvestigatorDropdown(index, '');
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                    e.preventDefault();
                    this.handleKeyboardNavigation(e);
                }
            });
        });

        this.updateSelectedInvestigatorsPreview();
    }

    removeInvestigatorField(index) {
        if (this.currentPlayerCount > 1) {
            this.currentPlayerCount--;
            this.renderInvestigatorFields();
        }
    }

    // Упрощенная версия без изображений для превью
    showInvestigatorDropdown(index, searchTerm = '') {
        const dropdown = document.getElementById(`investigator-select-${index}`);
        const investigatorsList = Object.entries(this.investigators)
            .filter(([key, investigator]) =>
                investigator.name.toLowerCase().includes(searchTerm) ||
                key.toLowerCase().includes(searchTerm)
            )
            .slice(0, 28);

        if (investigatorsList.length === 0) {
            dropdown.innerHTML = '<div class="investigator-option no-results">Сыщики не найдены</div>';
        } else {
            dropdown.innerHTML = investigatorsList.map(([key, investigator]) => `
                <div class="investigator-option" data-key="${key}" data-index="${index}">
                    <div class="investigator-option-info">
                        <div class="investigator-option-name">${investigator.name}</div>
                        <div class="investigator-option-desc">${investigator.description}</div>
                    </div>
                </div>
            `).join('');
        }

        dropdown.style.display = 'block';
    }

    hideAllDropdowns() {
        document.querySelectorAll('.investigator-select-with-search').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    selectInvestigator(index, investigatorKey) {
        const searchInput = document.getElementById(`investigator-search-${index}`);
        const hiddenInput = document.getElementById(`investigator-${index}`);

        if (this.investigators[investigatorKey]) {
            const investigator = this.investigators[investigatorKey];
            searchInput.value = investigator.name;
            hiddenInput.value = investigatorKey;
            this.hideAllDropdowns();
            this.updateSelectedInvestigatorsPreview();
            this.showNotification(`Выбран сыщик: ${investigator.name}`, 'success');
        }
    }

    clearInvestigatorField(index) {
        const searchInput = document.getElementById(`investigator-search-${index}`);
        const hiddenInput = document.getElementById(`investigator-${index}`);

        searchInput.value = '';
        hiddenInput.value = '';
        this.updateSelectedInvestigatorsPreview();
    }

    // Упрощенная версия без изображений
    updateSelectedInvestigatorsPreview() {
        let previewContainer = document.getElementById('selected-investigators-preview');

        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'selected-investigators-preview';
            previewContainer.className = 'selected-investigators-preview';
            document.getElementById('investigators-container').after(previewContainer);
        }

        const selectedInvestigators = [];
        for (let i = 0; i < this.currentPlayerCount; i++) {
            const hiddenInput = document.getElementById(`investigator-${i}`);
            if (hiddenInput && hiddenInput.value && this.investigators[hiddenInput.value]) {
                selectedInvestigators.push({
                    index: i,
                    key: hiddenInput.value,
                    investigator: this.investigators[hiddenInput.value]
                });
            }
        }

        if (selectedInvestigators.length > 0) {
            const previewsHTML = selectedInvestigators.map((item) => `
                <div class="selected-investigator-item">
                    <div class="selected-investigator-avatar">
                        <div class="investigator-placeholder">👤</div>
                    </div>
                    <span class="selected-investigator-name">${item.investigator.name}</span>
                    <button type="button" 
                            class="remove-selected-investigator"
                            data-index="${item.index}"
                            title="Удалить сыщика">
                        ×
                    </button>
                </div>
            `).join('');

            previewContainer.innerHTML = `
            <div style="width: 100%; margin-bottom: 10px; font-weight: bold; color: var(--accent);">
                Выбранные сыщики (${selectedInvestigators.length}/${this.currentPlayerCount}):
            </div>
            ${previewsHTML}
        `;
        } else {
            previewContainer.innerHTML = '<div style="color: var(--text-dark); font-style: italic;">Сыщики не выбраны</div>';
        }
    }

    getSelectedInvestigators() {
        const selected = [];
        for (let i = 0; i < this.currentPlayerCount; i++) {
            const hiddenInput = document.getElementById(`investigator-${i}`);
            if (hiddenInput && hiddenInput.value) {
                selected.push(hiddenInput.value);
            }
        }
        return selected;
    }

    // Удален метод createImagePreview

    setupModal() {
        const recordModal = document.getElementById('record-modal');
        const progressModal = document.getElementById('progress-modal');
        const imageModal = document.getElementById('image-modal');
        const closeBtns = document.querySelectorAll('.close');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('fullscreen-close')) {
                    progressModal.style.display = 'none';
                } else {
                    recordModal.style.display = 'none';
                    imageModal.style.display = 'none';
                }
                document.body.classList.remove('modal-open');
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === recordModal) {
                recordModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
            if (e.target === progressModal) {
                progressModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
            if (e.target === imageModal) {
                imageModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                recordModal.style.display = 'none';
                progressModal.style.display = 'none';
                imageModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Упрощенная версия без изображений
    showScenarioPreview(scenarioKey) {
        const preview = document.getElementById('scenario-preview');

        if (scenarioKey && this.scenarios[scenarioKey]) {
            const scenario = this.scenarios[scenarioKey];

            preview.innerHTML = `
            <div class="scenario-preview-content">
                <div class="scenario-preview-info">
                    <strong>${scenario.name}</strong>
                    <div class="scenario-preview-desc">${scenario.description}</div>
                </div>
            </div>
        `;
        } else {
            preview.innerHTML = '';
        }
    }

    // Упрощенная версия без изображений
    showImageModal(src, alt) {
        // Просто показываем информацию без изображения
        this.showNotification('Изображения будут добавлены позже', 'info');
    }

    // Упрощенная версия без изображений
    showRecordDetails(recordId) {
        const record = this.progress.find(item => item.id === recordId);
        if (!record) return;

        const investigators = Array.isArray(record.investigator)
            ? record.investigator.map(key => this.investigators[key])
            : [this.investigators[record.investigator]];

        const scenario = this.scenarios[record.scenario];
        const modal = document.getElementById('record-modal');
        const modalContent = document.getElementById('modal-content');

        const resultText = {
            'win': '🏆 Победа - Древние отступили',
            'loss': '💀 Поражение - Безумие поглотило',
            'other': '❓ Иной исход'
        }[record.result] || '❓ Иной исход';

        const investigatorsHTML = investigators.map(investigator => {
            return `
        <div class="detail-value">
            <div>
                <strong>${investigator.name}</strong>
                <p class="detail-description">${investigator.description}</p>
            </div>
        </div>
    `;
        }).join('');

        modalContent.innerHTML = `
    <div class="record-details">
        <div class="detail-header">
            <div class="detail-header-image-placeholder">
                <div class="scenario-placeholder">📜</div>
            </div>
            <div class="detail-overlay">
                <h2 class="detail-title">${scenario.name}</h2>
                <p class="detail-subtitle">Команда из ${investigators.length} исследователей</p>
            </div>
        </div>
        
        <div class="detail-content">
            <div class="detail-row">
                <div class="detail-group">
                    <h3 class="detail-label">🕵️ Сыщики (${investigators.length})</h3>
                    ${investigatorsHTML}
                </div>
                
                <div class="detail-group">
                    <h3 class="detail-label">📅 Дата расследования</h3>
                    <p class="detail-value">${this.formatDate(record.date)}</p>
                    
                    <h3 class="detail-label">⚔️ Исход</h3>
                    <p class="detail-value ${record.result}">${resultText}</p>
                </div>
            </div>
            
            <div class="detail-group full-width">
                <h3 class="detail-label">📝 Заметки архивариуса</h3>
                <p class="detail-value notes-content">${record.notes || 'Заметки отсутствуют'}</p>
            </div>
            
            <div class="detail-actions">
                <button class="control-btn secondary" onclick="tracker.deleteProgress(${record.id}); document.getElementById('record-modal').style.display='none'">
                    🗑️ Удалить запись
                </button>
            </div>
        </div>
    </div>
    `;

        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    renderScenarioOptions() {
        const select = document.getElementById('scenario');
        const filterSelect = document.getElementById('filter-scenario');

        select.innerHTML = '<option value="">Выберите сюжет...</option>';
        filterSelect.innerHTML = '<option value="all">Все сюжеты</option>';

        Object.entries(this.scenarios).forEach(([key, scenario]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = scenario.name;
            select.appendChild(option);

            const filterOption = option.cloneNode(true);
            filterSelect.appendChild(filterOption);
        });
    }

    renderFilterOptions() {
        const filterSelect = document.getElementById('filter-investigator');
        filterSelect.innerHTML = '<option value="all">Все исследователи</option>';

        Object.entries(this.investigators).forEach(([key, investigator]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = investigator.name;
            filterSelect.appendChild(option);
        });
    }

    addProgress() {
        const investigators = this.getSelectedInvestigators();
        const scenario = document.getElementById('scenario').value;
        const date = document.getElementById('date').value;
        const result = document.getElementById('result').value;
        const notes = document.getElementById('notes').value;

        if (investigators.length === 0 || !scenario || !date) {
            this.showNotification('Пожалуйста, заполните все обязательные поля и выберите сыщиков', 'warning');
            return;
        }

        if (investigators.length !== this.currentPlayerCount) {
            this.showNotification(`Пожалуйста, выберите всех ${this.currentPlayerCount} сыщиков`, 'warning');
            return;
        }

        const uniqueInvestigators = [...new Set(investigators)];
        if (uniqueInvestigators.length !== investigators.length) {
            this.showNotification('Один и тот же сыщик не может быть выбран дважды', 'warning');
            return;
        }

        const progressItem = {
            id: Date.now(),
            investigator: investigators.length === 1 ? investigators[0] : investigators,
            scenario,
            date,
            result,
            notes,
            timestamp: new Date().toISOString(),
            playerCount: investigators.length
        };

        this.progress.push(progressItem);

        if (this.syncManager.isConfigured()) {
            this.syncManager.push().then(success => {
                if (success) {
                    this.showNotification(`Запись успешно добавлена в облачные архивы!`, 'success');
                    this.renderHexagonGrid();
                    this.renderStats();
                    this.updateAchievements();
                    this.resetForm();
                } else {
                    this.progress = this.progress.filter(item => item.id !== progressItem.id);
                    this.showNotification('Ошибка сохранения в облако', 'error');
                }
            });
        } else {
            this.showNotification('Синхронизация не настроена', 'error');
            this.progress = this.progress.filter(item => item.id !== progressItem.id);
        }
    }

    deleteProgress(id) {
        if (confirm('Удалить эту запись из облачных архивов?')) {
            this.progress = this.progress.filter(item => item.id !== id);

            if (this.syncManager.isConfigured()) {
                this.syncManager.push().then(success => {
                    if (success) {
                        this.showNotification('Запись удалена из облачных архивов', 'error');
                        this.renderHexagonGrid();
                        this.renderStats();
                        this.updateAchievements();
                    } else {
                        this.syncManager.pull();
                        this.showNotification('Ошибка удаления из облака', 'error');
                    }
                });
            } else {
                this.showNotification('Синхронизация не настроена', 'error');
            }
        }
    }

    saveProgress() {
        if (this.syncManager.isConfigured()) {
            this.syncManager.push();
        }
    }

    resetForm() {
        document.getElementById('progress-form').reset();
        this.setMinDate();
        this.currentPlayerCount = 2;
        this.renderPlayerCountSelector();
        this.renderInvestigatorFields();
        document.getElementById('scenario-preview').innerHTML = '';
    }

    setMinDate() {
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // Упрощенная версия гексагонов без изображений
    async renderHexagonGrid() {
        const container = document.getElementById('hexagon-grid');
        const filteredProgress = this.getFilteredProgress();
        const recordsCount = document.getElementById('records-count');

        recordsCount.textContent = filteredProgress.length;

        if (filteredProgress.length === 0) {
            container.innerHTML = '<div class="no-records-message">Архивы пусты... Начните своё первое расследование!</div>';
            return;
        }

        const sortedProgress = filteredProgress.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        const hexagonsHTML = sortedProgress.map((item) => {
            const scenario = this.scenarios[item.scenario];
            const investigators = Array.isArray(item.investigator)
                ? item.investigator.map(key => this.investigators[key])
                : [this.investigators[item.investigator]];

            const resultText = {
                'win': 'Победа 🏆',
                'loss': 'Поражение 💀',
                'other': 'Завершено'
            }[item.result] || 'Завершено';

            let investigatorsHTML = '';
            if (investigators.length === 1) {
                investigatorsHTML = `
                <div class="hexagon-investigator-placeholder">👤</div>
                <div class="hexagon-investigator">${investigators[0].name}</div>
            `;
            } else {
                investigatorsHTML = `
                <div class="hexagon-investigators-placeholder">
                    ${'👤'.repeat(Math.min(investigators.length, 4))}
                </div>
                <div class="hexagon-investigator-list">
                    ${investigators.map(inv => inv.name).join(', ')}
                </div>
            `;
            }

            return `
            <div class="hexagon ${item.result}" data-id="${item.id}">
                <div class="hexagon-inner">
                    <div class="hexagon-actions">
                        <button class="hexagon-delete" onclick="event.stopPropagation(); tracker.deleteProgress(${item.id})" title="Удалить запись">
                            ×
                        </button>
                    </div>
                    
                    <div class="hexagon-header">
                        ${investigatorsHTML}
                        <div class="hexagon-scenario">${scenario.name}</div>
                    </div>
                    
                    <div class="hexagon-meta">
                        <div class="hexagon-date">${this.formatDate(item.date)}</div>
                        <div class="hexagon-team-size">👥 ${investigators.length}</div>
                        <div class="hexagon-result">${resultText}</div>
                    </div>
                    
                    ${item.notes ? `
                        <div class="hexagon-notes" title="${item.notes}">
                            💬 ${this.truncateText(item.notes, 60)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        });

        container.innerHTML = hexagonsHTML.join('');
    }

    getFilteredProgress() {
        const investigatorFilter = document.getElementById('filter-investigator').value;
        const scenarioFilter = document.getElementById('filter-scenario').value;
        const resultFilter = document.getElementById('filter-result').value;

        let filtered = this.progress;

        if (investigatorFilter !== 'all') {
            filtered = filtered.filter(item => {
                const investigators = Array.isArray(item.investigator)
                    ? item.investigator
                    : [item.investigator];
                return investigators.includes(investigatorFilter);
            });
        }

        if (scenarioFilter !== 'all') {
            filtered = filtered.filter(item => item.scenario === scenarioFilter);
        }

        if (resultFilter !== 'all') {
            filtered = filtered.filter(item => item.result === resultFilter);
        }

        return filtered;
    }

    applyFilters() {
        this.renderHexagonGrid();
    }

    resetFilters() {
        document.getElementById('filter-investigator').value = 'all';
        document.getElementById('filter-scenario').value = 'all';
        document.getElementById('filter-result').value = 'all';
        this.renderHexagonGrid();
    }

    renderStats() {
        const container = document.getElementById('stats-container');
        const totalScenarios = this.progress.length;

        const allInvestigators = this.progress.flatMap(item =>
            Array.isArray(item.investigator) ? item.investigator : [item.investigator]
        );
        const uniqueInvestigators = new Set(allInvestigators).size;

        const wins = this.progress.filter(p => p.result === 'win').length;
        const losses = this.progress.filter(p => p.result === 'loss').length;
        const winRate = totalScenarios > 0 ? Math.round((wins / totalScenarios) * 100) : 0;

        const teamSizes = this.progress.reduce((acc, item) => {
            const teamSize = Array.isArray(item.investigator) ? item.investigator.length : 1;
            acc[teamSize] = (acc[teamSize] || 0) + 1;
            return acc;
        }, {});

        const mostCommonTeamSize = Object.entries(teamSizes)
            .sort(([, a], [, b]) => b - a)[0];

        container.innerHTML = `
            <div class="stat-card">
                <span class="stat-value">${totalScenarios}</span>
                <span class="stat-label">Всего расследований</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${uniqueInvestigators}</span>
                <span class="stat-label">Уникальных сыщиков</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${winRate}%</span>
                <span class="stat-label">Процент побед</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${mostCommonTeamSize ? mostCommonTeamSize[0] : 1}</span>
                <span class="stat-label">Чаще всего в команде</span>
            </div>
        `;
    }

    updateAchievements() {
        const totalScenarios = this.progress.length;
        const wins = this.progress.filter(p => p.result === 'win').length;
        const losses = this.progress.filter(p => p.result === 'loss').length;

        const investigatorCounts = {};
        this.progress.forEach(item => {
            const investigators = Array.isArray(item.investigator)
                ? item.investigator
                : [item.investigator];

            investigators.forEach(key => {
                investigatorCounts[key] = (investigatorCounts[key] || 0) + 1;
            });
        });

        const maxScenariosWithOneInvestigator = Math.max(...Object.values(investigatorCounts), 0);
        const uniqueInvestigatorsUsed = Object.keys(investigatorCounts).length;

        const teamGames = this.progress.filter(item => {
            const teamSize = Array.isArray(item.investigator) ? item.investigator.length : 1;
            return teamSize >= 2;
        }).length;

        const fullTeamGames = this.progress.filter(item => {
            const teamSize = Array.isArray(item.investigator) ? item.investigator.length : 1;
            return teamSize >= 4;
        }).length;

        const completedScenarios = new Set(this.progress.map(item => item.scenario)).size;

        const recentGames = this.progress.slice(-5);
        let consecutiveLosses = 0;
        let maxConsecutiveLosses = 0;

        for (const game of recentGames) {
            if (game.result === 'loss') {
                consecutiveLosses++;
                maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
            } else {
                consecutiveLosses = 0;
            }
        }

        const uniqueCombinations = new Set();
        this.progress.forEach(item => {
            const investigators = Array.isArray(item.investigator)
                ? item.investigator
                : [item.investigator];

            investigators.forEach(investigatorKey => {
                const combination = `${investigatorKey}-${item.scenario}`;
                uniqueCombinations.add(combination);
            });
        });
        const universalProgress = uniqueCombinations.size;

        this.achievements.beginner.progress = Math.min(totalScenarios, this.achievements.beginner.target);
        this.achievements.beginner.unlocked = this.achievements.beginner.progress >= this.achievements.beginner.target;

        this.achievements.adventurer.progress = Math.min(totalScenarios, this.achievements.adventurer.target);
        this.achievements.adventurer.unlocked = this.achievements.adventurer.progress >= this.achievements.adventurer.target;

        this.achievements.veteran.progress = Math.min(totalScenarios, this.achievements.veteran.target);
        this.achievements.veteran.unlocked = this.achievements.veteran.progress >= this.achievements.veteran.target;

        this.achievements.expert.progress = Math.min(totalScenarios, this.achievements.expert.target);
        this.achievements.expert.unlocked = this.achievements.expert.progress >= this.achievements.expert.target;

        this.achievements.specialist.progress = Math.min(maxScenariosWithOneInvestigator, this.achievements.specialist.target);
        this.achievements.specialist.unlocked = this.achievements.specialist.progress >= this.achievements.specialist.target;

        this.achievements.collector.progress = Math.min(uniqueInvestigatorsUsed, this.achievements.collector.target);
        this.achievements.collector.unlocked = this.achievements.collector.progress >= this.achievements.collector.target;

        this.achievements.triumphant.progress = Math.min(wins, this.achievements.triumphant.target);
        this.achievements.triumphant.unlocked = this.achievements.triumphant.progress >= this.achievements.triumphant.target;

        this.achievements.survivor.progress = Math.min(losses, this.achievements.survivor.target);
        this.achievements.survivor.unlocked = this.achievements.survivor.progress >= this.achievements.survivor.target;

        this.achievements.teamplayer.progress = Math.min(teamGames, this.achievements.teamplayer.target);
        this.achievements.teamplayer.unlocked = this.achievements.teamplayer.progress >= this.achievements.teamplayer.target;

        this.achievements.fullteam.progress = Math.min(fullTeamGames, this.achievements.fullteam.target);
        this.achievements.fullteam.unlocked = this.achievements.fullteam.progress >= this.achievements.fullteam.target;

        this.achievements.scholar.progress = Math.min(completedScenarios, this.achievements.scholar.target);
        this.achievements.scholar.unlocked = this.achievements.scholar.progress >= this.achievements.scholar.target;

        this.achievements.unlucky.progress = Math.min(maxConsecutiveLosses, this.achievements.unlucky.target);
        this.achievements.unlucky.unlocked = this.achievements.unlucky.progress >= this.achievements.unlucky.target;

        this.achievements.universal.progress = Math.min(universalProgress, this.achievements.universal.target);
        this.achievements.universal.unlocked = this.achievements.universal.progress >= this.achievements.universal.target;

        this.renderAchievements();

        if (this.achievements.universal.unlocked && !this.achievements.universal.notified) {
            this.showNotification('🎉 Поздравляем! Вы получили достижение "Универсал"!', 'success');
            this.achievements.universal.notified = true;
        }
    }

    // Упрощенная версия таблицы прогресса без изображений
    async showUniversalProgress() {
        const totalCombinations = Object.keys(this.investigators).length * Object.keys(this.scenarios).length;
        const completedCombinations = new Set();

        this.progress.forEach(item => {
            const investigators = Array.isArray(item.investigator)
                ? item.investigator
                : [item.investigator];

            investigators.forEach(investigatorKey => {
                const combination = `${investigatorKey}-${item.scenario}`;
                completedCombinations.add(combination);
            });
        });

        const progressPercent = Math.round((completedCombinations.size / totalCombinations) * 100);

        const tableRows = Object.entries(this.investigators).map(([invKey, investigator]) => {
            const scenarioCells = Object.keys(this.scenarios).map(scenarioKey => {
                const combination = `${invKey}-${scenarioKey}`;
                const isCompleted = completedCombinations.has(combination);
                const scenario = this.scenarios[scenarioKey];
                return `<td class="scenario-cell ${isCompleted ? 'completed' : 'pending'}"
                          title="${scenario.name} - ${investigator.name} (${isCompleted ? 'Пройдено' : 'Не пройдено'})">
                    ${isCompleted ? '✅' : '❌'}
                </td>`;
            }).join('');

            return `
                <tr>
                    <td class="investigator-cell" title="${investigator.description}">
                        <div class="investigator-placeholder">👤</div>
                        ${investigator.name}
                    </td>
                    ${scenarioCells}
                </tr>
            `;
        }).join('');

        const progressHTML = `
        <div class="universal-progress">
            <div class="progress-header">
                <h3>🌍 Прогресс достижения "Древнее божество"</h3>
                <div class="progress-summary">
                    <div class="progress-stats">
                        <div>
                            <strong>Пройдено комбинаций:</strong><br>
                            <span style="font-size: 2rem; color: var(--accent);">${completedCombinations.size}</span> / <span style="font-size: 1.5rem;">${totalCombinations}</span>
                        </div>
                        <div>
                            <strong>Общий прогресс:</strong><br>
                            <span style="font-size: 2rem; color: var(--accent);">${progressPercent}%</span>
                        </div>
                        <div>
                            <strong>Сыщиков:</strong><br>
                            <span style="font-size: 1.5rem; color: var(--accent);">${Object.keys(this.investigators).length}</span>
                        </div>
                        <div>
                            <strong>Сценариев:</strong><br>
                            <span style="font-size: 1.5rem; color: var(--accent);">${Object.keys(this.scenarios).length}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="progress-table-container">
                <table class="progress-table">
                    <thead>
                        <tr>
                            <th class="investigator-header">Сыщик</th>
                            ${Object.values(this.scenarios).map(scenario =>
            `<th title="${scenario.description}">${scenario.name}</th>`
        ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;

        const modal = document.getElementById('progress-modal');
        const modalContent = document.getElementById('progress-modal-content');

        modalContent.innerHTML = progressHTML;
        modal.style.display = 'block';

        const closeBtn = modal.querySelector('.fullscreen-close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    renderAchievements() {
        const container = document.getElementById('achievements-container');

        container.innerHTML = Object.entries(this.achievements).map(([key, achievement]) => {
            const progressPercent = (achievement.progress / achievement.target) * 100;
            const isUnlocked = achievement.unlocked;

            const clickableClass = key === 'universal' ? 'clickable-achievement' : '';
            const onClick = key === 'universal' ? `onclick="tracker.showUniversalProgress()"` : '';

            return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${clickableClass}" 
                 ${onClick}
                 title="${achievement.description}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="achievement-progress-text">
                    ${achievement.progress}/${achievement.target}
                </div>
            </div>
        `;
        }).join('');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    formatDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// GitHubSyncManager остается без изменений
class GitHubSyncManager {
    constructor(tracker) {
        this.tracker = tracker;
        this.token = localStorage.getItem('github_token') || '';
        this.repo = localStorage.getItem('github_repo') || '';
        this.owner = localStorage.getItem('github_owner') || '';
        this.syncing = false;
    }

    isConfigured() {
        return this.token && this.owner && this.repo;
    }

    notify(message, type = 'info') {
        if (this.tracker && this.tracker.showNotification) {
            this.tracker.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    async setup() {
        try {
            const modalHTML = `
                <div class="sync-setup-modal">
                    <h3>⚙️ Настройка синхронизации</h3>
                    <div class="setup-instructions">
                        <p><strong>Как получить GitHub Token:</strong></p>
                        <ol>
                            <li>Зайдите на <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Tokens</a></li>
                            <li>Нажмите "Generate new token" → "Generate new token (classic)"</li>
                            <li>Введите название: "Arkham Tracker"</li>
                            <li>Выберите срок: 90 дней</li>
                            <li>В правах выберите: <strong>repo</strong> (полный доступ)</li>
                            <li>Скопируйте токен (начинается с ghp_)</li>
                        </ol>
                    </div>
                    <div class="setup-form">
                        <div class="form-group">
                            <label>GitHub Token:</label>
                            <input type="password" id="github-token" placeholder="ghp_..." class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Username:</label>
                            <input type="text" id="github-owner" placeholder="Sh1k1kate" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Repository:</label>
                            <input type="text" id="github-repo" placeholder="arkham-horizon" class="form-input">
                        </div>
                    </div>
                    <div class="setup-actions">
                        <button id="confirm-setup" class="control-btn">✅ Настроить</button>
                        <button id="cancel-setup" class="control-btn secondary">❌ Отмена</button>
                    </div>
                </div>
            `;

            const modal = document.getElementById('record-modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = modalHTML;
            modal.style.display = 'block';

            return new Promise((resolve) => {
                document.getElementById('confirm-setup').addEventListener('click', async () => {
                    const token = document.getElementById('github-token').value.trim();
                    const owner = document.getElementById('github-owner').value.trim();
                    const repo = document.getElementById('github-repo').value.trim();

                    if (!token || !owner || !repo) {
                        this.notify('Заполните все поля', 'error');
                        return;
                    }

                    if (!token.startsWith('ghp_')) {
                        this.notify('Токен должен начинаться с ghp_', 'error');
                        return;
                    }

                    modal.style.display = 'none';

                    this.notify('🔍 Проверка подключения...', 'info');

                    this.token = token;
                    this.owner = owner;
                    this.repo = repo;

                    const isValid = await this.validateConnection();
                    if (isValid) {
                        localStorage.setItem('github_token', token);
                        localStorage.setItem('github_owner', owner);
                        localStorage.setItem('github_repo', repo);

                        this.notify('✅ Синхронизация настроена!', 'success');
                        this.pull();
                        resolve(true);
                    } else {
                        this.notify('❌ Не удалось подключиться к репозиторию', 'error');
                        resolve(false);
                    }
                });

                document.getElementById('cancel-setup').addEventListener('click', () => {
                    modal.style.display = 'none';
                    resolve(false);
                });
            });

        } catch (error) {
            this.notify('❌ Ошибка настройки: ' + error.message, 'error');
            return false;
        }
    }

    async githubRequest(endpoint, options = {}) {
        const url = `https://api.github.com${endpoint}`;
        const headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, {
                headers,
                ...options
            });
            return response;
        } catch (error) {
            console.error('GitHub API Error:', error);
            throw error;
        }
    }

    async validateConnection() {
        try {
            const response = await this.githubRequest(`/repos/${this.owner}/${this.repo}`);
            if (response.ok) {
                return true;
            } else if (response.status === 404) {
                throw new Error('Репозиторий не найден');
            } else if (response.status === 401) {
                throw new Error('Неверный токен');
            } else {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.notify('❌ ' + error.message, 'error');
            return false;
        }
    }

    encodeBase64(str) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const binaryString = String.fromCharCode(...data);
            return btoa(binaryString);
        } catch (error) {
            console.error('Base64 encode error:', error);
            return btoa(unescape(encodeURIComponent(str)));
        }
    }

    decodeBase64(str) {
        try {
            const binaryString = atob(str);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decoder = new TextDecoder();
            return decoder.decode(bytes);
        } catch (error) {
            console.error('Base64 decode error:', error);
            return decodeURIComponent(escape(atob(str)));
        }
    }

    async getFileSHA() {
        try {
            const response = await this.githubRequest(
                `/repos/${this.owner}/${this.repo}/contents/arkham_progress.json`
            );
            if (response.ok) {
                const data = await response.json();
                return data.sha;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async pull() {
        if (!this.isConfigured() || this.syncing) return false;

        try {
            this.syncing = true;
            this.notify('🔁 Загрузка данных из облака...', 'info');

            const response = await this.githubRequest(
                `/repos/${this.owner}/${this.repo}/contents/arkham_progress.json`
            );

            if (response.status === 404) {
                this.notify('📝 Файл данных не найден. Будет создан при сохранении.', 'warning');
                this.tracker.progress = [];
                return false;
            }

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const content = this.decodeBase64(data.content);
            const remoteData = JSON.parse(content);

            if (remoteData && Array.isArray(remoteData.progress)) {
                this.tracker.progress = remoteData.progress;

                this.tracker.renderHexagonGrid();
                this.tracker.renderStats();
                this.tracker.updateAchievements();

                this.notify(`✅ Загружено ${remoteData.progress.length} записей из облака`, 'success');
                return true;
            } else {
                throw new Error('Неверный формат данных');
            }

        } catch (error) {
            console.error('Pull error:', error);
            this.notify('❌ Ошибка загрузки: ' + error.message, 'error');
            return false;
        } finally {
            this.syncing = false;
        }
    }

    async push() {
        if (!this.isConfigured() || this.syncing) return false;

        try {
            this.syncing = true;

            const syncData = {
                progress: this.tracker.progress,
                achievements: this.tracker.achievements,
                timestamp: new Date().toISOString(),
                version: '3.0',
                app: 'Arkham Horror Tracker'
            };

            const content = this.encodeBase64(JSON.stringify(syncData, null, 2));
            const sha = await this.getFileSHA();

            const body = {
                message: `Sync: ${new Date().toLocaleString('ru-RU')} (${syncData.progress.length} records)`,
                content: content
            };

            if (sha) {
                body.sha = sha;
            }

            const response = await this.githubRequest(
                `/repos/${this.owner}/${this.repo}/contents/arkham_progress.json`,
                {
                    method: 'PUT',
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Ошибка ${response.status}`);
            }

            this.notify('✅ Данные сохранены в облако', 'success');
            return true;

        } catch (error) {
            console.error('Push error:', error);
            this.notify('❌ Ошибка сохранения: ' + error.message, 'error');
            return false;
        } finally {
            this.syncing = false;
        }
    }

    async createInitialFile() {
        if (!this.isConfigured()) {
            this.notify('❌ Сначала настройте синхронизацию', 'error');
            return false;
        }

        try {
            this.notify('📁 Создание файла данных...', 'info');

            const syncData = {
                progress: [],
                achievements: this.tracker.achievements,
                timestamp: new Date().toISOString(),
                version: '3.0',
                app: 'Arkham Horror Tracker'
            };

            const content = this.encodeBase64(JSON.stringify(syncData, null, 2));

            const response = await this.githubRequest(
                `/repos/${this.owner}/${this.repo}/contents/arkham_progress.json`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        message: 'Initial sync file creation',
                        content: content
                    })
                }
            );

            if (response.ok) {
                this.notify('✅ Файл данных создан', 'success');
                return true;
            } else {
                throw new Error('Не удалось создать файл');
            }
        } catch (error) {
            this.notify('❌ Ошибка создания файла: ' + error.message, 'error');
            return false;
        }
    }

    showStatus() {
        const status = this.isConfigured() ?
            `✅ Настроено (${this.owner}/${this.repo})` :
            '❌ Не настроено';

        const lastSync = localStorage.getItem('last_sync_timestamp');
        const lastSyncText = lastSync ?
            new Date(lastSync).toLocaleString('ru-RU') :
            'Никогда';

        const modalHTML = `
            <div class="sync-status">
                <h3>📡 Статус синхронизации</h3>
                <div class="status-info">
                    <div class="status-item">
                        <strong>Состояние:</strong> ${status}
                    </div>
                    <div class="status-item">
                        <strong>Записей:</strong> ${this.tracker.progress.length}
                    </div>
                    <div class="status-item">
                        <strong>Последняя синхронизация:</strong> ${lastSyncText}
                    </div>
                </div>
                <div class="status-actions">
                    <button id="manual-sync-now" class="control-btn">🔄 Загрузить из облака</button>
                    <button id="test-connection" class="control-btn">🔍 Проверить подключение</button>
                    <button id="clear-sync" class="control-btn secondary">🗑️ Очистить настройки</button>
                </div>
            </div>
        `;

        const modal = document.getElementById('record-modal');
        const modalContent = document.getElementById('modal-content');

        modalContent.innerHTML = modalHTML;
        modal.style.display = 'block';

        document.getElementById('manual-sync-now').addEventListener('click', () => {
            this.pull();
            modal.style.display = 'none';
        });

        document.getElementById('test-connection').addEventListener('click', async () => {
            this.notify('🔍 Проверка подключения...', 'info');
            const isValid = await this.validateConnection();
            modal.style.display = 'none';
            if (isValid) {
                this.notify('✅ Подключение успешно', 'success');
            }
        });

        document.getElementById('clear-sync').addEventListener('click', () => {
            localStorage.removeItem('github_token');
            localStorage.removeItem('github_owner');
            localStorage.removeItem('github_repo');
            localStorage.removeItem('last_sync_timestamp');
            this.token = '';
            this.owner = '';
            this.repo = '';
            this.notify('🗑️ Настройки синхронизации очищены', 'info');
            modal.style.display = 'none';
        });
    }
}

// Инициализация
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new ArkhamHorizonTracker();
});
