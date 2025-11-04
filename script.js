// Автоматическая синхронизация через GitHub репозиторий
class GitHubSyncManager {
    constructor() {
        this.GITHUB_TOKEN = '';
        this.REPO_OWNER = 'Sh1k1kate'; // Ваш username на GitHub
        this.REPO_NAME = 'arkham-horizon'; // Название репозитория
        this.SYNC_FILE_PATH = 'data/arkham_progress.json';
        this.isSyncing = false;
        this.syncInterval = null;
    }

    // Инициализация синхронизации
    async initialize() {
        // Пытаемся получить сохраненные настройки
        this.GITHUB_TOKEN = localStorage.getItem('github_sync_token');
        this.REPO_OWNER = localStorage.getItem('github_repo_owner');
        this.REPO_NAME = localStorage.getItem('github_repo_name');

        if (this.GITHUB_TOKEN && this.REPO_OWNER && this.REPO_NAME) {
            tracker.showNotification('🔗 Синхронизация подключена', 'success');
            this.startAutoSync();
            return true;
        }

        return false;
    }

    // Настройка синхронизации
    async setupSync() {
        const config = await this.showSetupModal();
        if (!config) return false;

        this.GITHUB_TOKEN = config.token;
        this.REPO_OWNER = config.owner;
        this.REPO_NAME = config.repo;

        // Сохраняем настройки
        localStorage.setItem('github_sync_token', this.GITHUB_TOKEN);
        localStorage.setItem('github_repo_owner', this.REPO_OWNER);
        localStorage.setItem('github_repo_name', this.REPO_NAME);

        // Проверяем доступность репозитория
        const isValid = await this.validateRepository();
        if (!isValid) {
            this.clearSettings();
            return false;
        }

        tracker.showNotification('✅ Синхронизация настроена!', 'success');
        this.startAutoSync();
        return true;
    }

    // Модальное окно настройки
    async showSetupModal() {
        return new Promise((resolve) => {
            const modalHTML = `
                <div class="sync-setup-modal">
                    <h3>⚙️ Настройка автосинхронизации</h3>
                    <div class="setup-steps">
                        <div class="setup-step">
                            <strong>1. Создайте GitHub Token:</strong>
                            <p>GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</p>
                            <p>Выберите права: <code>repo</code> (полный доступ к репозиториям)</p>
                        </div>
                        <div class="setup-step">
                            <strong>2. Введите данные:</strong>
                            <div class="setup-form">
                                <div class="form-group">
                                    <label>GitHub Token:</label>
                                    <input type="password" id="github-token" placeholder="ghp_..." class="form-input">
                                </div>
                                <div class="form-group">
                                    <label>Username:</label>
                                    <input type="text" id="github-owner" placeholder="your-username" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label>Repository:</label>
                                    <input type="text" id="github-repo" placeholder="arkham-tracker" class="form-input">
                                </div>
                            </div>
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

            document.getElementById('confirm-setup').addEventListener('click', () => {
                const token = document.getElementById('github-token').value.trim();
                const owner = document.getElementById('github-owner').value.trim();
                const repo = document.getElementById('github-repo').value.trim();

                if (token && owner && repo) {
                    modal.style.display = 'none';
                    resolve({ token, owner, repo });
                } else {
                    tracker.showNotification('❌ Заполните все поля', 'error');
                }
            });

            document.getElementById('cancel-setup').addEventListener('click', () => {
                modal.style.display = 'none';
                resolve(null);
            });
        });
    }

    // Проверка доступности репозитория
    async validateRepository() {
        try {
            const response = await this.githubRequest(`/repos/${this.REPO_OWNER}/${this.REPO_NAME}`);
            if (response.ok) {
                return true;
            } else {
                tracker.showNotification('❌ Репозиторий не найден', 'error');
                return false;
            }
        } catch (error) {
            tracker.showNotification('❌ Ошибка доступа к репозиторию', 'error');
            return false;
        }
    }

    // Запрос к GitHub API
    async githubRequest(endpoint, options = {}) {
        const url = `https://api.github.com${endpoint}`;

        const defaultOptions = {
            headers: {
                'Authorization': `token ${this.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        return await fetch(url, { ...defaultOptions, ...options });
    }

    // Получить SHA существующего файла (если есть)
    async getFileSHA() {
        try {
            const response = await this.githubRequest(`/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.SYNC_FILE_PATH}`);

            if (response.status === 404) {
                return null; // Файл не существует
            }

            if (response.ok) {
                const fileData = await response.json();
                return fileData.sha;
            }
        } catch (error) {
            console.error('Error getting file SHA:', error);
        }
        return null;
    }

    // Загрузить данные из репозитория
    async pullData() {
        if (this.isSyncing) return false;

        try {
            const response = await this.githubRequest(`/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.SYNC_FILE_PATH}`);

            if (response.status === 404) {
                console.log('Sync file not found, will create on next push');
                return false;
            }

            if (response.ok) {
                const fileData = await response.json();
                const content = JSON.parse(atob(fileData.content));

                // Проверяем актуальность данных
                const localTimestamp = localStorage.getItem('last_sync_timestamp');
                const remoteTimestamp = content.timestamp;

                if (!localTimestamp || new Date(remoteTimestamp) > new Date(localTimestamp)) {
                    this.applyRemoteData(content);
                    return true;
                }
            }
        } catch (error) {
            console.error('Pull error:', error);
        }
        return false;
    }

    // Применить данные из репозитория
    applyRemoteData(data) {
        if (data && data.progress) {
            // Умное объединение данных
            const localProgress = tracker.progress;
            const remoteProgress = data.progress;

            // Создаем Map для быстрого поиска по ID
            const localMap = new Map(localProgress.map(item => [item.id, item]));
            const remoteMap = new Map(remoteProgress.map(item => [item.id, item]));

            // Объединяем данные, приоритет у более новых записей
            const mergedProgress = [];
            const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

            allIds.forEach(id => {
                const localItem = localMap.get(id);
                const remoteItem = remoteMap.get(id);

                if (localItem && remoteItem) {
                    // Берем более новую запись
                    const localTime = new Date(localItem.timestamp);
                    const remoteTime = new Date(remoteItem.timestamp);
                    mergedProgress.push(remoteTime > localTime ? remoteItem : localItem);
                } else if (localItem) {
                    mergedProgress.push(localItem);
                } else {
                    mergedProgress.push(remoteItem);
                }
            });

            // Сортируем по времени
            mergedProgress.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            tracker.progress = mergedProgress;
            tracker.achievements = data.achievements || tracker.achievements;

            tracker.saveProgress();
            tracker.renderHexagonGrid();
            tracker.renderStats();
            tracker.updateAchievements();

            localStorage.setItem('last_sync_timestamp', data.timestamp);
            tracker.showNotification('🔁 Данные синхронизированы из облака', 'success');
        }
    }

    // Отправить данные в репозиторий
    async pushData() {
        if (this.isSyncing) return false;

        this.isSyncing = true;

        try {
            const data = {
                progress: tracker.progress,
                achievements: tracker.achievements,
                timestamp: new Date().toISOString(),
                version: '3.0',
                app: 'Arkham Horror Tracker'
            };

            const fileSHA = await this.getFileSHA();
            const content = btoa(JSON.stringify(data, null, 2));

            const body = {
                message: `Auto-sync: ${new Date().toLocaleString('ru-RU')}`,
                content: content,
                sha: fileSHA // Если null, файл будет создан
            };

            const response = await this.githubRequest(
                `/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.SYNC_FILE_PATH}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(body)
                }
            );

            if (response.ok) {
                localStorage.setItem('last_sync_timestamp', data.timestamp);
                tracker.showNotification('☁️ Данные сохранены в облако', 'success');
                return true;
            } else {
                throw new Error('Push failed');
            }
        } catch (error) {
            console.error('Push error:', error);
            tracker.showNotification('❌ Ошибка синхронизации', 'error');
            return false;
        } finally {
            this.isSyncing = false;
        }
    }

    // Ручная синхронизация
    async manualSync() {
        if (!this.isConfigured()) {
            tracker.showNotification('❌ Сначала настройте синхронизацию', 'error');
            return;
        }

        tracker.showNotification('🔄 Синхронизация...', 'info');

        // Сначала pull, потом push
        await this.pullData();
        await this.pushData();
    }

    // Автоматическая синхронизация
    startAutoSync() {
        // Синхронизация при загрузке
        setTimeout(() => {
            this.pullData();
        }, 2000);

        // Периодическая синхронизация каждые 2 минуты
        this.syncInterval = setInterval(() => {
            this.pullData();
        }, 2 * 60 * 1000);

        // Синхронизация перед закрытием страницы
        window.addEventListener('beforeunload', () => {
            this.pushData();
        });
    }

    // Остановка синхронизации
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.clearSettings();
        tracker.showNotification('🔌 Синхронизация отключена', 'info');
    }

    // Проверка настройки
    isConfigured() {
        return !!(this.GITHUB_TOKEN && this.REPO_OWNER && this.REPO_NAME);
    }

    // Очистка настроек
    clearSettings() {
        localStorage.removeItem('github_sync_token');
        localStorage.removeItem('github_repo_owner');
        localStorage.removeItem('github_repo_name');
        localStorage.removeItem('last_sync_timestamp');

        this.GITHUB_TOKEN = '';
        this.REPO_OWNER = '';
        this.REPO_NAME = '';
    }

    // Показать статус синхронизации
    showStatus() {
        const statusHTML = `
            <div class="sync-status">
                <h3>📡 Статус синхронизации</h3>
                <div class="status-info">
                    <div class="status-item">
                        <strong>Репозиторий:</strong> ${this.REPO_OWNER}/${this.REPO_NAME}
                    </div>
                    <div class="status-item">
                        <strong>Файл данных:</strong> ${this.SYNC_FILE_PATH}
                    </div>
                    <div class="status-item">
                        <strong>Записей:</strong> ${tracker.progress.length}
                    </div>
                    <div class="status-item">
                        <strong>Последняя синхронизация:</strong> 
                        ${localStorage.getItem('last_sync_timestamp') ?
                new Date(localStorage.getItem('last_sync_timestamp')).toLocaleString('ru-RU') :
                'Никогда'}
                    </div>
                </div>
                <div class="status-actions">
                    <button id="manual-sync-now" class="control-btn">🔄 Синхронизировать сейчас</button>
                    <button id="stop-sync" class="control-btn secondary">🔌 Отключить синхронизацию</button>
                </div>
            </div>
        `;

        const modal = document.getElementById('record-modal');
        const modalContent = document.getElementById('modal-content');

        modalContent.innerHTML = statusHTML;
        modal.style.display = 'block';

        document.getElementById('manual-sync-now').addEventListener('click', () => {
            this.manualSync();
            modal.style.display = 'none';
        });

        document.getElementById('stop-sync').addEventListener('click', () => {
            this.stopAutoSync();
            modal.style.display = 'none';
        });
    }
}


// Основной класс трекера
class ArkhamHorizonTracker {
    constructor() {
        this.githubSync = new GitHubSyncManager();
        this.progress = JSON.parse(localStorage.getItem('arkhamProgress')) || [];
        this.investigators = {
            'agnes': {
                name: 'Агнес Бейкер',
                image: './images/investigators/agnes.jpg',
                description: 'Официантка с пробудившимися экстрасенсорными способностями'
            },
            'pete': {
                name: '«Жестянка» Пит',
                image: './images/investigators/pete.jpg',
                description: 'Бродяга с верным спутником - вороном'
            },
            'calvin': {
                name: 'Кэлвин Райт',
                image: './images/investigators/calvin.jpg',
                description: 'Преследуемый прошлыми травмами'
            },
            'daniela': {
                name: 'Даниэла Рейес',
                image: './images/investigators/daniela.jpg',
                description: 'Механик с техническим складом ума'
            },
            'dexter': {
                name: 'Декстер Дрейк',
                image: './images/investigators/dexter.jpg',
                description: 'Фокусник, владеющий иллюзиями'
            },
            'jenny': {
                name: 'Дженни Барнс',
                image: './images/investigators/jenny.jpg',
                description: 'Девушка из высшего общества с боевыми навыками'
            },
            'marie': {
                name: 'Мари Ламбо',
                image: './images/investigators/marie.jpg',
                description: 'Певица с гипнотическим голосом'
            },
            'michael': {
                name: 'Майкл МакГлен',
                image: './images/investigators/michael.jpg',
                description: 'Гангстер, привыкший решать вопросы силой'
            },
            'minh': {
                name: 'Минь Тхи Фан',
                image: './images/investigators/minh.jpg',
                description: 'Секретарь-архивариус с феноменальной памятью'
            },
            'norman': {
                name: 'Норман Уизерс',
                image: './images/investigators/norman.jpg',
                description: 'Астроном, открывший ужасающие тайны вселенной'
            },
            'rex': {
                name: 'Рекс Мёрфи',
                image: './images/investigators/rex.jpg',
                description: 'Репортёр, ищущий сенсационные разоблачения'
            },
            'roland': {
                name: 'Роланд Бэнкс',
                image: './images/investigators/roland.jpg',
                description: 'Федеральный агент с аналитическим складом ума'
            },
            'skids': {
                name: '«Шквал» О’Тул',
                image: './images/investigators/skids.jpg',
                description: 'Бывший заключенный, ищущий искупления'
            },
            'tommy': {
                name: 'Томми Малдун',
                image: './images/investigators/tommy.jpg',
                description: 'Полицейский-новичок с обострённым чувством справедливости'
            },
            'wendy': {
                name: 'Венди Адамс',
                image: './images/investigators/wendy.jpg',
                description: 'Бездомная сирота, мастер побегов и уклонений'
            },
            'zoey': {
                name: 'Зои Сэмарас',
                image: './images/investigators/zoey.jpg',
                description: 'Повар с необычными кулинарными талантами'
            },
            'agatha': {
                name: 'Агата Крейн',
                image: './images/investigators/agatha.jpg',
                description: 'Парапсихолог, изучающая потусторонние явления'
            },
            'carson': {
                name: 'Карсон Синклер',
                image: './images/investigators/carson.jpg',
                description: 'Дворецкий с безупречными манерами и наблюдательностью'
            },
            'charley': {
                name: 'Чарли Кейн',
                image: './images/investigators/charley.jpg',
                description: 'Политик, владеющий искусством убеждения'
            },
            'diana': {
                name: 'Диана Стэнли',
                image: './images/investigators/diana.jpg',
                description: 'Искупившаяся культистка, борющаяся со своим прошлым'
            },
            'mateo': {
                name: 'Отец Матео',
                image: './images/investigators/mateo.jpg',
                description: 'Священник, сражающийся с демоническими силами'
            },
            'kate': {
                name: 'Кейт Уинтроп',
                image: './images/investigators/kate.jpg',
                description: 'Учёный-исследователь аномальных явлений'
            },
            'mark': {
                name: 'Марк Харриган',
                image: './images/investigators/mark.jpg',
                description: 'Солдат с боевым опытом и железной волей'
            },
            'patrice': {
                name: 'Патрис Хэтауэй',
                image: './images/investigators/patrice.jpg',
                description: 'Скрипачка с мистической связью через музыку'
            },
            'preston': {
                name: 'Престон Фэйрмонт',
                image: './images/investigators/preston.jpg',
                description: 'Миллионер, использующий своё состояние в борьбе со злом'
            },
            'silas': {
                name: 'Силас Марш',
                image: './images/investigators/silas.jpg',
                description: 'Моряк, повидавший ужасы морских глубин'
            },
            'stella': {
                name: 'Стелла Кларк',
                image: './images/investigators/stella.jpg',
                description: 'Почтальон, знающий все тайны Аркхэма'
            },
            'winifred': {
                name: 'Виннифред Хаббамок',
                image: './images/investigators/winifred.jpg',
                description: 'Авиатриса с жаждой приключений'
            }
        };
        
        this.scenarios = {
            'veil_twilight': {
                name: 'Завеса сумерек',
                image: './images/scenarios/veil_twilight.jpg',
                description: 'Исследование таинственных исчезновений в старом квартале Аркхэма'
            },
            'feast_umordhoth': {
                name: 'Пир для Умордхота',
                image: './images/scenarios/feast_umordhoth.jpg',
                description: 'Охота на древнее существо, пробудившееся в подземельях города'
            },
            'coming_azathoth': {
                name: 'Пришествие Азатота',
                image: './images/scenarios/coming_azathoth.jpg',
                description: 'Безумный ритуал по призыву спящего божества угрожает уничтожить мир'
            },
            'echo_deep': {
                name: 'Эхо из глубин',
                image: './images/scenarios/echo_deep.jpg',
                description: 'Загадочные события на побережье намекают на присутствие древних существ'
            },
            'silence_tsathoggua': {
                name: 'Безмолвие Цатхоггуа',
                image: './images/scenarios/silence_tsathoggua.jpg',
                description: 'Расследование странных артефактов, связанных с подземным божеством'
            },
            'shots_blind': {
                name: 'Выстрелы вслепую',
                image: './images/scenarios/shots_blind.jpg',
                description: 'Опасная конфронтация с тайным культом в тёмных переулках Аркхэма'
            },
            'pale_lantern': {
                name: 'Бледный фонарь',
                image: './images/scenarios/pale_lantern.jpg',
                description: 'Поиск источника призрачного свечения, сводящего горожан с ума'
            },
            'children_ithaqua': {
                name: 'Дети Итакуа',
                image: './images/scenarios/children_ithaqua.jpg',
                description: 'Ледяной ужас окутывает город, пробуждая древнее зло'
            },
            'dreams_rlyeh': {
                name: 'Сны о Р\'льехе',
                image: './images/scenarios/dreams_rlyeh.jpg',
                description: 'Кошмары о затонувшем городе начинают проникать в реальность'
            },
            'tyrants_destruction': {
                name: 'Тираны разрушения',
                image: './images/scenarios/tyrants_destruction.jpg',
                description: 'Битва с могущественными существами из иных измерений'
            },
            'revenge_past': {
                name: 'Возмездие из прошлого',
                image: './images/scenarios/revenge_past.jpg',
                description: 'Старые грехи возвращаются, чтобы преследовать жителей Аркхэма'
            },
            'key_gate': {
                name: 'Ключ и врата',
                image: './images/scenarios/key_gate.jpg',
                description: 'Поиск древнего артефакта, способного открыть врата между мирами'
            },
            'summoned_serve': {
                name: 'Призваны служить',
                image: './images/scenarios/summoned_serve.jpg',
                description: 'Столкновение с культом, пытающимся призвать на службу тёмных существ'
            }
        };
                this.achievements = {
                    beginner: {
                        name: 'Неофит',
                        description: 'Пройдите первый сюжет',
                        target: 1,
                        icon: '🥳',
                        unlocked: false,
                        progress: 0
                    },
                    adventurer: {
                        name: 'Искатель приключений',
                        description: 'Пройдите 5 сюжетов',
                        target: 5,
                        icon: '🏕️',
                        unlocked: false,
                        progress: 0
                    },
                    veteran: {
                        name: 'Ветеран Аркхема',
                        description: 'Пройдите 10 сюжетов',
                        target: 10,
                        icon: '🎖️',
                        unlocked: false,
                        progress: 0
                    },
                    expert: {
                        name: 'Эксперт по Древним',
                        description: 'Пройдите 20 сюжетов',
                        target: 20,
                        icon: '👑',
                        unlocked: false,
                        progress: 0
                    },
                    specialist: {
                        name: 'Мастер одного пути',
                        description: 'Пройдите 5 сюжетов одним сыщиком',
                        target: 5,
                        icon: '🎯',
                        unlocked: false,
                        progress: 0
                    },
                    collector: {
                        name: 'Собиратель опыта',
                        description: 'Испытайте всех сыщиков',
                        target: Object.keys(this.investigators).length,
                        icon: '📚',
                        unlocked: false,
                        progress: 0
                    },
                    triumphant: {
                        name: 'Триумфатор',
                        description: 'Одержите 10 побед',
                        target: 10,
                        icon: '🏆',
                        unlocked: false,
                        progress: 0
                    },
                    survivor: {
                        name: 'Выживший',
                        description: 'Переживите 5 поражений',
                        target: 5,
                        icon: '💀',
                        unlocked: false,
                        progress: 0
                    },
                    teamplayer: {
                        name: 'Командный игрок',
                        description: 'Пройдите 10 сюжетов в команде из 2+ сыщиков',
                        target: 10,
                        icon: '👥',
                        unlocked: false,
                        progress: 0
                    },
                    fullteam: {
                        name: 'Полная команда',
                        description: 'Пройдите сюжет в команде из 4 сыщиков',
                        target: 1,
                        icon: '🔄',
                        unlocked: false,
                        progress: 0
                    },
                    scholar: {
                        name: 'Ученый',
                        description: 'Пройдите все сюжеты кампании',
                        target: Object.keys(this.scenarios).length,
                        icon: '📖',
                        unlocked: false,
                        progress: 0
                    },
                    universal: {
                        name: 'Древнее божество',
                        description: 'Пройдите все сюжеты кампании за всех персонажей',
                        target: Object.keys(this.investigators).length * Object.keys(this.scenarios).length,
                        icon: '💀📖',
                        unlocked: false,
                        progress: 0
                    },
                    unlucky: {
                        name: 'Невезучий',
                        description: 'Проиграйте 3 сюжета подряд',
                        target: 3,
                        icon: '🍀',
                        unlocked: false,
                        progress: 0
                    }
                };

                this.selectedInvestigators = [];
                this.currentPlayerCount = 2;
                this.init();
            }

    init() {
                // Инициализация автосинхронизации
                this.githubSync.initialize();
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

                if (this.progress.length === 0 && !localStorage.getItem('welcomeShown')) {
                    setTimeout(() => {
                        this.showNotification('Добро пожаловать! Выберите количество сыщиков и заполните форму.', 'info');
                        localStorage.setItem('welcomeShown', 'true');
                    }, 1000);
                }
            }

    setupEventListeners() {
        // Автосинхронизация
        document.getElementById('setup-sync').addEventListener('click', () => this.githubSync.setupSync());
        document.getElementById('manual-sync').addEventListener('click', () => this.githubSync.manualSync());
        document.getElementById('sync-status').addEventListener('click', () => this.githubSync.showStatus());
                // Форма добавления
                document.getElementById('progress-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addProgress();
                });

                // Кнопки выбора количества игроков
                document.querySelectorAll('.count-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.setPlayerCount(parseInt(e.target.dataset.count));
                    });
                });

                // Превью сценария
                document.getElementById('scenario').addEventListener('change', (e) => {
                    this.showScenarioPreview(e.target.value);
                });

                // Фильтры
                document.getElementById('filter-investigator').addEventListener('change', () => this.applyFilters());
                document.getElementById('filter-scenario').addEventListener('change', () => this.applyFilters());
                document.getElementById('filter-result').addEventListener('change', () => this.applyFilters());
                document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

                // Экспорт/импорт
                document.getElementById('export-json').addEventListener('click', () => this.exportToJSON());
                document.getElementById('export-csv').addEventListener('click', () => this.exportToCSV());
                document.getElementById('import-data').addEventListener('click', () => document.getElementById('import-file').click());
                document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));

                // Глобальные обработчики для поиска сыщиков
                document.addEventListener('click', this.handleGlobalClick.bind(this));
                document.addEventListener('input', this.handleSearchInput.bind(this));
            }

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

                // Добавляем обработчики для кнопок удаления
                document.querySelectorAll('.remove-investigator-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.target.dataset.index);
                        this.removeInvestigatorField(index);
                    });
                });

                // Добавляем обработчики для полей поиска
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

            handleGlobalClick(e) {
                // Обработка выбора сыщика из выпадающего списка
                if (e.target.classList.contains('investigator-option') ||
                    e.target.parentElement.classList.contains('investigator-option')) {

                    const option = e.target.classList.contains('investigator-option')
                        ? e.target
                        : e.target.parentElement;

                    const index = parseInt(option.dataset.index);
                    const investigatorKey = option.dataset.key;
                    this.selectInvestigator(index, investigatorKey);
                    return;
                }

                // Удаление выбранного сыщика из превью
                if (e.target.classList.contains('remove-selected-investigator')) {
                    const index = parseInt(e.target.dataset.index);
                    this.clearInvestigatorField(index);
                    return;
                }

                // Открытие модального окна для изображений
                if (e.target.classList.contains('investigator-preview-img') ||
                    e.target.classList.contains('scenario-preview-img') ||
                    e.target.classList.contains('hexagon-image') ||
                    e.target.classList.contains('selected-investigator-avatar')) {
                    this.showImageModal(e.target.src, e.target.alt);
                    return;
                }

                // Обработка кликов по гексагонам
                const hexagon = e.target.closest('.hexagon');
                if (hexagon) {
                    const recordId = parseInt(hexagon.dataset.id);
                    this.showRecordDetails(recordId);
                    return;
                }

                // Закрываем все выпадающие списки при клике вне их
                if (!e.target.classList.contains('investigator-search')) {
                    this.hideAllDropdowns();
                }
            }

            handleKeyboardNavigation(e) {
                const index = parseInt(e.target.dataset.index);
                const dropdown = document.getElementById(`investigator-select-${index}`);
                const options = dropdown.querySelectorAll('.investigator-option');

                if (options.length === 0) return;

                let currentHighlighted = dropdown.querySelector('.investigator-option.highlighted');
                let currentIndex = currentHighlighted ?
                    Array.from(options).indexOf(currentHighlighted) : -1;

                if (e.key === 'ArrowDown') {
                    currentIndex = (currentIndex + 1) % options.length;
                } else if (e.key === 'ArrowUp') {
                    currentIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
                } else if (e.key === 'Enter' && currentHighlighted) {
                    this.selectInvestigator(index, currentHighlighted.dataset.key);
                    return;
                }

                // Убираем подсветку со всех опций
                options.forEach(opt => opt.classList.remove('highlighted'));

                // Подсвечиваем текущую опцию
                if (currentIndex >= 0) {
                    options[currentIndex].classList.add('highlighted');
                    options[currentIndex].scrollIntoView({ block: 'nearest' });
                }
            }

            handleSearchInput(e) {
                if (e.target.classList.contains('investigator-search')) {
                    const index = parseInt(e.target.dataset.index);
                    const searchTerm = e.target.value.toLowerCase();
                    this.showInvestigatorDropdown(index, searchTerm);
                }
            }

            showInvestigatorDropdown(index, searchTerm = '') {
                const dropdown = document.getElementById(`investigator-select-${index}`);
                const investigatorsList = Object.entries(this.investigators)
                    .filter(([key, investigator]) =>
                        investigator.name.toLowerCase().includes(searchTerm) ||
                        key.toLowerCase().includes(searchTerm)
                    )
                    .slice(0, 28); // Ограничиваем количество результатов

                if (investigatorsList.length === 0) {
                    dropdown.innerHTML = '<div class="investigator-option no-results">Сыщики не найдены</div>';
                } else {
                    dropdown.innerHTML = investigatorsList.map(([key, investigator]) => `
                <div class="investigator-option" data-key="${key}" data-index="${index}">
                    <img src="${investigator.image}" alt="${investigator.name}" class="investigator-option-image">
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

                    // Скрываем выпадающий список
                    this.hideAllDropdowns();

                    this.updateSelectedInvestigatorsPreview();

                    // Показываем уведомление о выборе
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
                    previewContainer.innerHTML = `
                <div style="width: 200%; margin-bottom: 10px; font-weight: bold; color: var(--accent);">
                    Выбранные сыщики (${selectedInvestigators.length}/${this.currentPlayerCount}):
                </div>
                ${selectedInvestigators.map(item => `
                    <div class="selected-investigator-item">
                        <img src="${item.investigator.image}" 
                             alt="${item.investigator.name}" 
                             class="selected-investigator-avatar investigator-preview-img"
                             title="Кликните для увеличения">
                        <span class="selected-investigator-name">${item.investigator.name}</span>
                        <button type="button" 
                                class="remove-selected-investigator"
                                data-index="${item.index}"
                                title="Удалить сыщика">
                            ×
                        </button>
                    </div>
                `).join('')}
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

    setupModal() {
        const recordModal = document.getElementById('record-modal');
        const progressModal = document.getElementById('progress-modal');
        const closeBtns = document.querySelectorAll('.close');

        // Закрытие обычного модального окна
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('fullscreen-close')) {
                    progressModal.style.display = 'none';
                } else {
                    recordModal.style.display = 'none';
                }
            });
        });

        // Закрытие при клике вне окна
        window.addEventListener('click', (e) => {
            if (e.target === recordModal) {
                recordModal.style.display = 'none';
            }
            if (e.target === progressModal) {
                progressModal.style.display = 'none';
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                recordModal.style.display = 'none';
                progressModal.style.display = 'none';
            }
        });
    }

            showScenarioPreview(scenarioKey) {
                const preview = document.getElementById('scenario-preview');

                if (scenarioKey && this.scenarios[scenarioKey]) {
                    const scenario = this.scenarios[scenarioKey];
                    preview.innerHTML = `
                <div class="scenario-preview-content">
                    <img src="${scenario.image}" alt="${scenario.name}" 
                         class="scenario-preview-img scenario-preview-large" 
                         title="Кликните для увеличения">
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

            showImageModal(src, alt) {
                const modal = document.getElementById('record-modal');
                const modalContent = document.getElementById('modal-content');

                modalContent.innerHTML = `
            <div class="image-modal-content">
                <img src="${src}" alt="${alt}" class="modal-image-large">
                <h3 class="modal-title">${alt}</h3>
            </div>
        `;

                modal.style.display = 'block';
            }

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

                const investigatorsHTML = investigators.map(investigator => `
            <div class="detail-value">
                <img src="${investigator.image}" alt="${investigator.name}" class="detail-image-large investigator-preview-img">
                <div>
                    <strong>${investigator.name}</strong>
                    <p class="detail-description">${investigator.description}</p>
                </div>
            </div>
        `).join('');

                modalContent.innerHTML = `
            <div class="record-details">
                <div class="detail-header" style="background-image: url('${scenario.image}')">
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

                // Проверяем дубликаты сыщиков
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
                this.saveProgress();
                this.renderHexagonGrid();
                this.renderStats();
                this.updateAchievements();
                this.resetForm();

                this.showNotification(`Запись успешно добавлена для команды из ${investigators.length} сыщиков!`, 'success');
            }

            deleteProgress(id) {
                if (confirm('Удалить эту запись из архивов?')) {
                    this.progress = this.progress.filter(item => item.id !== id);
                    this.saveProgress();
                    this.renderHexagonGrid();
                    this.renderStats();
                    this.updateAchievements();
                    this.showNotification('Запись удалена из архивов', 'error');
                }
            }

    saveProgress() {
        localStorage.setItem('arkhamProgress', JSON.stringify(this.progress));
        // Автосинхронизация при сохранении
        if (this.githubSync.isConfigured()) {
            setTimeout(() => this.githubSync.pushData(), 1000);
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

            renderHexagonGrid() {
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

                container.innerHTML = sortedProgress.map(item => {
                    const scenario = this.scenarios[item.scenario];
                    const investigators = Array.isArray(item.investigator)
                        ? item.investigator.map(key => this.investigators[key])
                        : [this.investigators[item.investigator]];

                    const backgroundStyle = scenario.image ?
                        `style="background-image: url('${scenario.image}')"` : '';

                    const resultText = {
                        'win': 'Победа 🏆',
                        'loss': 'Поражение 💀',
                        'other': 'Завершено'
                    }[item.result] || 'Завершено';

                    let investigatorsHTML = '';
                    if (investigators.length === 1) {
                        investigatorsHTML = `
                    <img src="${investigators[0].image}" 
                         alt="${investigators[0].name}"
                         class="hexagon-image investigator-preview-img">
                    <div class="hexagon-investigator">${investigators[0].name}</div>
                `;
                    } else {
                        investigatorsHTML = `
                    <div class="hexagon-investigators">
                        ${investigators.slice(0, 4).map(inv => `
                            <img src="${inv.image}" 
                                 alt="${inv.name}"
                                 class="hexagon-investigator-image investigator-preview-img"
                                 title="${inv.name}">
                        `).join('')}
                    </div>
                    <div class="hexagon-investigator-list">
                        ${investigators.map(inv => inv.name).join(', ')}
                    </div>
                `;
                    }

                    return `
                <div class="hexagon ${item.result}" data-id="${item.id}">
                    <div class="hexagon-inner" ${backgroundStyle}>
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
                }).join('');
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

        // Прогресс по сыщикам (учитываем команды)
        const investigatorCounts = {};
        this.progress.forEach(item => {
            const investigators = Array.isArray(item.investigator)
                ? item.investigator
                : [item.investigator];

            investigators.forEach(key => {
                investigatorCounts[key] = (investigatorCounts[key] || 0) + 1;
            });
        });

        const maxScenariosWithOneInvestigator = Math.max(...Object.values(investigatorCounts));
        const uniqueInvestigatorsUsed = Object.keys(investigatorCounts).length;

        // Статистика по командам
        const teamGames = this.progress.filter(item => {
            const teamSize = Array.isArray(item.investigator) ? item.investigator.length : 1;
            return teamSize >= 2;
        }).length;

        const fullTeamGames = this.progress.filter(item => {
            const teamSize = Array.isArray(item.investigator) ? item.investigator.length : 1;
            return teamSize >= 4;
        }).length;

        // Пройденные сценарии
        const completedScenarios = new Set(this.progress.map(item => item.scenario)).size;

        // Поражения подряд
        const recentGames = this.progress.slice(-5); // Последние 5 игр
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

        // НОВАЯ ЛОГИКА: Подсчет уникальных комбинаций сыщик-сценарий
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

        // Обновляем статусы достижений
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

        // НОВОЕ ДОСТИЖЕНИЕ: Универсал
        this.achievements.universal.progress = Math.min(universalProgress, this.achievements.universal.target);
        this.achievements.universal.unlocked = this.achievements.universal.progress >= this.achievements.universal.target;

        this.renderAchievements();

        // Показываем уведомление при разблокировке достижения
        if (this.achievements.universal.unlocked && !this.achievements.universal.notified) {
            this.showNotification('🎉 Поздравляем! Вы получили достижение "Универсал"!', 'success');
            this.achievements.universal.notified = true;
        }
    }
    showUniversalProgress() {
        const totalCombinations = Object.keys(this.investigators).length * Object.keys(this.scenarios).length;
        const completedCombinations = new Set();

        // Собираем все пройденные комбинации
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

        // Создаем полноэкранную таблицу прогресса
        let progressHTML = `
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
                        ${Object.entries(this.investigators).map(([invKey, investigator]) => `
                            <tr>
                                <td class="investigator-cell" title="${investigator.description}">
                                    <img src="${investigator.image}" alt="${investigator.name}" class="table-investigator-img">
                                    ${investigator.name}
                                </td>
                                ${Object.keys(this.scenarios).map(scenarioKey => {
            const combination = `${invKey}-${scenarioKey}`;
            const isCompleted = completedCombinations.has(combination);
            const scenario = this.scenarios[scenarioKey];
            return `<td class="scenario-cell ${isCompleted ? 'completed' : 'pending'}"
                                              title="${scenario.name} - ${investigator.name} (${isCompleted ? 'Пройдено' : 'Не пройдено'})">
                                        ${isCompleted ? '✅' : '❌'}
                                    </td>`;
        }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

        const modal = document.getElementById('progress-modal');
        const modalContent = document.getElementById('progress-modal-content');

        modalContent.innerHTML = progressHTML;
        modal.style.display = 'block';

        // Добавляем обработчик закрытия для полноэкранного модального окна
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

            // Делаем достижение "Универсал" кликабельным
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

            exportToJSON() {
                const data = {
                    progress: this.progress,
                    exportDate: new Date().toISOString(),
                    totalRecords: this.progress.length,
                    version: '3.0',
                    features: ['dynamic_investigator_selection', 'search', 'achievements']
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `аркхем-архивы-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showNotification('Архивы экспортированы в свиток знаний!', 'success');
            }

            exportToCSV() {
                const headers = ['Сыщики', 'Сюжет', 'Дата', 'Результат', 'Размер команды', 'Заметки', 'Дата добавления'];
                const csvData = this.progress.map(item => {
                    const investigators = Array.isArray(item.investigator)
                        ? item.investigator.map(key => this.investigators[key].name).join('; ')
                        : this.investigators[item.investigator].name;

                    const teamSize = Array.isArray(item.investigator) ? item.investigator.length : 1;

                    return [
                        `"${investigators}"`,
                        this.scenarios[item.scenario].name,
                        item.date,
                        item.result === 'win' ? 'Победа' : item.result === 'loss' ? 'Поражение' : 'Другое',
                        teamSize,
                        `"${(item.notes || '').replace(/"/g, '""')}"`,
                        new Date(item.timestamp).toLocaleDateString('ru-RU')
                    ];
                });

                const csvContent = [headers, ...csvData]
                    .map(row => row.join(','))
                    .join('\n');

                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `аркхем-таблицы-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showNotification('Таблицы экспортированы для анализа!', 'success');
            }

            importData(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);

                        if (data.progress && Array.isArray(data.progress)) {
                            if (confirm(`Импортировать ${data.progress.length} записей из архивов? Текущие данные будут заменены.`)) {
                                this.progress = data.progress;
                                this.saveProgress();
                                this.renderHexagonGrid();
                                this.renderStats();
                                this.updateAchievements();
                                this.showNotification('Архивы успешно импортированы!', 'success');
                            }
                        } else {
                            throw new Error('Неверный формат свитка знаний');
                        }
                    } catch (error) {
                        this.showNotification('Ошибка при чтении свитка: ' + error.message, 'error');
                    }
                };

                reader.readAsText(file);
                event.target.value = '';
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

        // Добавляем дополнительные стили для увеличенных превью
        const additionalStyles = document.createElement('style');
        additionalStyles.textContent = `
    .investigator-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: background 0.3s ease;
    }

    .investigator-option:hover {
        background: var(--secondary-light);
    }

    .investigator-option.highlighted {
        background: var(--accent);
        color: var(--secondary-dark);
    }

    .investigator-option-image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--accent);
    }

    .investigator-option-info {
        flex: 1;
    }

    .investigator-option-name {
        font-weight: bold;
        font-size: 1rem;
    }

    .investigator-option-desc {
        font-size: 0.8rem;
        color: var(--text-dark);
        margin-top: 2px;
    }

    .no-results {
        justify-content: center;
        color: var(--text-dark);
        font-style: italic;
    }

    /* Увеличенные превью */
    .scenario-preview-large {
        width: 240px !important;
        height: 160px !important;
        border-radius: 12px !important;
        border: 3px solid var(--accent) !important;
    }

    .selected-investigator-avatar {
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        border: 3px solid var(--accent) !important;
    }

    .scenario-preview-info {
        text-align: center;
        margin-top: 10px;
    }

    .scenario-preview-desc {
        font-size: 0.9rem;
        color: var(--text-dark);
        margin-top: 5px;
    }

    .modal-image-large {
        max-width: 90vw;
        max-height: 80vh;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    }

    .detail-image-large {
        width: 80px !important;
        height: 80px !important;
        border-radius: 50% !important;
        border: 3px solid var(--accent) !important;
    }

    .notes-content {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: var(--border-radius);
        border-left: 4px solid var(--accent);
        font-style: italic;
    }

    .no-records-message {
        text-align: center;
        color: var(--text-dark);
        font-style: italic;
        padding: 60px 20px;
        font-size: 1.2em;
        grid-column: 1 / -1;
    }

    /* Улучшенный выпадающий список */
    .investigator-select-with-search {
        width: 100%;
        max-height: 300px;
        overflow-y: auto;
        background: var(--secondary-dark);
        border: 2px solid var(--accent);
        border-radius: var(--border-radius);
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1000;
        display: none;
        box-shadow: var(--shadow-heavy);
    }
`;
        document.head.appendChild(additionalStyles);

        // Инициализация
        let tracker;
        document.addEventListener('DOMContentLoaded', () => {
            tracker = new ArkhamHorizonTracker();
        });

        // Обработка ошибок загрузки изображений
        window.addEventListener('error', function (e) {
            if (e.target.tagName === 'IMG') {
                console.warn('Изображение не загружено:', e.target.src);
            }
        }, true);