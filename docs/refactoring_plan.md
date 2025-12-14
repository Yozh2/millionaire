# 🧱 Диздок рефакторинга Millionaire (Engine + Games)

Дата: 2025‑12‑13
Статус: in progress (Этапы 1–11 ✅, 12 отложен, 13 ✅, 14 ✅, 15 ✅, 16 ✅)

---

## 1 Правила работы с диздоком

### 1.1 Что это за документ

- Этот диздок фиксирует **целевую архитектуру** и **пошаговый план** рефакторинга.
- Этот диздок **не является** непосредственным списком “сделать прямо сейчас”. Реализацию начинаем только когда ты явно разрешишь.

### 1.2 Процесс перед любыми изменениями

- Перед началом работы всегда:
  - прочитать диздок полностью;
  - посмотреть файлы, которые планируем трогать, и файлы, на которые это повлияет (импорты/типы/стили/ассеты/скрипты).

### 1.3 Выполнение этапов (когда начнём реализацию)

- У каждого этапа есть чек‑статус: `⬜` (не начато) → `✅` (сделано).
- При выполнении каждого этапа:
  - запускать тесты;
  - проверять, что сборка всё ещё работает;
  - делать `git commit` **в ветку `refactoring`**;
  - записывать результат в “Журнал выполненных работ” внизу.

#### 1.3.1 Минимальный чеклист команд

- Линт: `npm run lint`
- Тесты: `npm test`
- Сборка: `npm run build`
- (опционально) формат: `npm run format:check`

### 1.4 Инвариант: непрерывная работоспособность

- На каждом коммите проект должен **запускаться** и **собираться**.
- Если нужна миграция API — делать через промежуточные `re-export`/адаптеры, а не ломать всё одним махом.

---

## 2 Терминология и единый словарь

### 2.1 Базовые термины (используем везде)

- `question` — вопрос (текст + 4 варианта).
- `answer` — вариант ответа (и “ответ игрока” как выбранный вариант).
- `prizeLadder` — призовая лестница (всегда именно так).
- `reward` — награда в конце игры (финальный результат, UI‑блок “что ты получил”).
- `rewardKind` — тип награды:
  - `trophy` — победа (кубок/приз/торт/крылатый свет).
  - `money` — забрал деньги (деньги/энергон/свечи).
  - `defeat` — проигрыш (череп/разбитая искра/нат‑1/падшая звезда).

### 2.2 Lifeline: единый термин вместо hint

Правило: всё, что относится к подсказкам/спецспособностям — это **`lifeline`**.

- В коде/типах/файлах/ассетах не используем `hint*`.
- Если это UI‑панель с результатом “подсказки” — это `Lifeline*Panel`, а не `HintPanel`.

### 2.3 Набор lifeline’ов (стандартизируем)

Формат строки: `<id> - "<EN name>" "<RU name>" (пояснение): BG3 / Transformers / Sky‑CotL`

- `fifty` - `"50:50"` `"50:50"` (убрать два неверных ответа):
  BG3: `50:50` / Transformers: `50:50` / Sky‑CotL: `50:50`

- `phone` - `"Phone-a-Friend"` `"Звонок другу"` (получить совет от персонажа/друга):
  BG3: `Послание` / Transformers: `База` / Sky‑CotL: `Ask Friend`

- `audience` - `"Ask-the-Audience"` `"Помощь зала"` (получить распределение “голосов”):
  BG3: `Таверна` / Transformers: `Отряд` / Sky‑CotL: `Ask Chat`

- `host` - `"Ask-the-Host"` `"Помощь ведущего"` (новый функционал: “ведущий” даёт совет/подсветку):
  BG3: `Мастер` / Transformers: `Праймус` / Sky‑CotL: `The Guide`

- `switch` - `"Switch-the-Question"` `"Замена вопроса"` (новый функционал: заменить вопрос без потери прогресса):
  BG3: `Вдохновение` / Transformers: `Трансформация` / Sky‑CotL: `Second Wind`

- `double` - `"Double Dip"` `"Право на ошибку"` (новый функционал: можно выбрать 2 ответа):
  BG3: `Доблесть` / Transformers: `Двойной залп` / Sky‑CotL: `Second Chance`

Примечания:
- PoC использует стандартные RU‑названия из этого раздела (без тематизации).
- Конкретные тексты/лейблы в модах должны быть ограничены этими списками, чтобы UI и ассеты не расползались.

### 2.4 Нейминг ассетов для lifeline’ов (что переименовываем)

Сейчас в коде/ассетах встречаются `HintReduce/HintVote/...`. В целевой системе:

- SFX (файлы): `LifelineFifty.*`, `LifelinePhone.*`, `LifelineAudience.*`, `LifelineHost.*`, `LifelineSwitch.*`, `LifelineDouble.*`
- Ключи звуков в конфиге: `lifelineFifty`, `lifelinePhone`, `lifelineAudience`, `lifelineHost`, `lifelineSwitch`, `lifelineDouble`

Миграция делается **этапом**: сначала поддержка старых ключей (deprecated), затем удаление.

#### 2.4.1 Таблица миграции (old → new)

Цель: убрать `hint*` из кода/типов/ассетов, зафиксировать `lifeline*` и отделить `takeMoney` как action (не lifeline).

##### 2.4.1.1 Типы и поля GameState (domain)

| Сейчас (old) | Будет (new) | Комментарий |
|---|---|---|
| `Hint` (union `phone|audience|null`) | `LifelineResult` (union `phone|audience|host|switch|double|null`) | “hint” исчезает; расширяемость под новые lifeline’ы |
| `hint` | `lifelineResult` | то, что показывается поверх UI (панель результата lifeline) |
| `clearHint()` | `clearLifelineResult()` | нейминг |
| `useFiftyFifty()` | `useLifelineFifty()` | единый `lifeline` префикс |
| `usePhoneAFriend()` | `useLifelinePhone()` | idem |
| `useAskAudience()` | `useLifelineAudience()` | idem |
| `takeTheMoney()` | `takeMoney()` (или `walkAway()`) | это **action**, не lifeline |

##### 2.4.1.2 Ключи `GameConfig.lifelines` (config)

| Сейчас (old) | Будет (new) | Комментарий |
|---|---|---|
| `fiftyFifty` | `fifty` | доменный id lifeline = `fifty` |
| `phoneAFriend` | `phone` | доменный id lifeline = `phone` |
| `askAudience` | `audience` | доменный id lifeline = `audience` |
| `takeMoney` | _(удалить из lifelines)_ | `takeMoney` переезжает в отдельный блок actions (см. ниже) |

Новый блок в `GameConfig` (предложение):

| Новый ключ | Назначение |
|---|---|
| `actions.takeMoney` | UI/label/icon для кнопки “забрать деньги” (внизу `PrizeLadderPanel`) |

##### 2.4.1.3 Ключи звуков (`GameConfig.audio.sounds`)

| Сейчас (old) | Будет (new) | Комментарий |
|---|---|---|
| `hintReduceButton` | `lifelineFifty` | SFX для lifeline `fifty` |
| `hintCallButton` | `lifelinePhone` | SFX для lifeline `phone` |
| `hintVoteButton` | `lifelineAudience` | SFX для lifeline `audience` |
| `hintTakeMoneyButton` | `takeMoneyButton` | это **не lifeline**, это action‑кнопка |

##### 2.4.1.4 Имена файлов ассетов (SFX)

| Сейчас (old) | Будет (new) | Комментарий |
|---|---|---|
| `HintReduce.ogg` | `LifelineFifty.ogg` | |
| `HintCall.ogg` | `LifelinePhone.ogg` | |
| `HintVote.ogg` | `LifelineAudience.ogg` | |
| `HintTakeMoney.ogg` | `TakeMoney.ogg` | action sound (не lifeline) |

##### 2.4.1.5 План совместимости (deprecated алиасы)

- На переходный период: `useAudio.playSoundEffect()` поддерживает и старые, и новые ключи (mapping).
- Скрипт/таблица “asset rename” хранится рядом с кодом (в docs или `scripts/`), чтобы переименование файлов было повторяемым.

---

## 3 Текущее состояние кодовой базы

### 3.1 Дерево `src/` и `scripts/` (точное, из `tree`)

#### 3.1.1 Tree output

```text
src
├── .DS_Store
├── app
│   ├── components
│   │   ├── GameSelector.test.tsx
│   │   ├── GameSelector.tsx
│   │   └── index.ts
│   └── registry
│       ├── gameRegistry.ts
│       └── index.ts
├── App.tsx
├── engine
│   ├── .DS_Store
│   ├── assets
│   │   └── paths.ts
│   ├── audio
│   │   ├── useMusicPlayer.ts
│   │   └── useSoundPlayer.ts
│   ├── constants.ts
│   ├── index.ts
│   ├── services
│   │   ├── AssetLoader.ts
│   │   ├── index.ts
│   │   ├── logger.ts
│   │   └── types.ts
│   ├── types
│   │   └── index.ts
│   ├── ui
│   │   ├── components
│   │   │   ├── cards
│   │   │   │   └── campaign
│   │   │   │       └── CampaignCard.tsx
│   │   │   ├── errors
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── panel
│   │   │       ├── index.ts
│   │   │       ├── Panel.tsx
│   │   │       └── PanelHeader.tsx
│   │   ├── effects
│   │   │   └── ParticleCanvas.tsx
│   │   ├── hooks
│   │   │   ├── index.ts
│   │   │   ├── useAssetPreloader.ts
│   │   │   ├── useAudio.ts
│   │   │   ├── useEffects.ts
│   │   │   ├── useFavicon.ts
│   │   │   └── useGameState.ts
│   │   ├── icons
│   │   │   └── DefaultIcons.tsx
│   │   ├── layout
│   │   │   └── header
│   │   │       ├── HeaderPanel.tsx
│   │   │       └── HeaderSlideshow.tsx
│   │   ├── MillionaireGame.tsx
│   │   ├── panels
│   │   │   ├── AnswersPanel.tsx
│   │   │   ├── CampaignSelectionPanel.tsx
│   │   │   ├── LifelineResultPanel.tsx
│   │   │   ├── lifelines
│   │   │   │   ├── LifelineAudiencePanel.tsx
│   │   │   │   └── LifelinePhonePanel.tsx
│   │   │   ├── LifelinesPanel.tsx
│   │   │   ├── PrizeLadderPanel.tsx
│   │   │   ├── QuestionPanel.tsx
│   │   │   └── ResultPanel.tsx
│   │   ├── screens
│   │   │   ├── EndScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── StartScreen.tsx
│   │   └── theme
│   │       ├── index.ts
│   │       └── ThemeContext.tsx
│   └── utils
│       ├── assetLoader.ts
│       ├── audioPlayer.ts
│       ├── index.ts
│       └── questionGenerator.ts
├── games
│   ├── .DS_Store
│   ├── bg3
│   │   ├── campaigns
│   │   │   ├── darkUrge
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   ├── hero
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   └── mindFlayer
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   ├── index.ts
│   ├── poc
│   │   ├── campaigns
│   │   │   ├── easy
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   └── hard
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   ├── sky-cotl
│   │   ├── campaigns
│   │   │   └── journey
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   └── transformers
│       ├── campaigns
│       │   ├── autocracy
│       │   │   ├── campaign.ts
│       │   │   ├── questions.ts
│       │   │   └── theme.ts
│       │   ├── megatron
│       │   │   ├── campaign.ts
│       │   │   ├── questions.ts
│       │   │   └── theme.ts
│       │   └── skybound
│       │       ├── campaign.ts
│       │       ├── questions.ts
│       │       └── theme.ts
│       ├── config.ts
│       ├── icons.tsx
│       ├── index.ts
│       ├── questions.ts
│       └── themes.ts
├── index.css
├── main.tsx
├── pages
│   ├── EffectsSandboxPage.tsx
│   ├── index.ts
│   ├── RegisteredGamePage.tsx
│   └── SandboxPage.tsx
├── styles
│   ├── animations.css
│   ├── base.css
│   ├── buttons.css
│   ├── fonts.css
│   ├── glare.css
│   └── prize-ladder.css
├── tailwind.css
└── vite-env.d.ts

45 directories, 116 files

scripts
├── comics_parser.py
├── convert_mp3_to_ogg.sh
├── generate-asset-manifest.js
├── generate-image-manifest.js
└── sandbox
    ├── g1_names_to_json.py
    ├── G1_translations.csv
    ├── millionaire-sounds.html
    └── test-prizes.js

2 directories, 8 files
```

#### 3.1.1.1 Tree output (обновлено 2025‑12‑14)

```text
src
├── .DS_Store
├── app
│   ├── components
│   │   ├── GameSelector.test.tsx
│   │   ├── GameSelector.tsx
│   │   └── index.ts
│   └── registry
│       ├── gameRegistry.ts
│       └── index.ts
├── App.tsx
├── engine
│   ├── .DS_Store
│   ├── assets
│   │   └── paths.ts
│   ├── audio
│   │   ├── useMusicPlayer.ts
│   │   └── useSoundPlayer.ts
│   ├── constants.ts
│   ├── game
│   │   ├── index.ts
│   │   ├── lifelines
│   │   │   ├── audience.ts
│   │   │   ├── fifty.ts
│   │   │   ├── host.ts
│   │   │   ├── index.ts
│   │   │   ├── phone.ts
│   │   │   └── switch.ts
│   │   ├── prizes
│   │   │   ├── calculatePrizeLadder.ts
│   │   │   ├── getGuaranteedPrize.ts
│   │   │   └── index.ts
│   │   ├── questions
│   │   │   ├── getQuestionDifficulty.ts
│   │   │   ├── index.ts
│   │   │   └── selectQuestionsFromPool.ts
│   │   ├── session
│   │   │   ├── createGameSession.ts
│   │   │   └── index.ts
│   │   ├── state
│   │   │   ├── actions.ts
│   │   │   ├── index.ts
│   │   │   ├── lifelines.v1.test.ts
│   │   │   ├── machine.ts
│   │   │   ├── reducer.ts
│   │   │   ├── resolveAnswer.ts
│   │   │   ├── selectors.ts
│   │   │   └── types.ts
│   │   └── utils
│   │       └── shuffleArray.ts
│   ├── index.ts
│   ├── services
│   │   ├── AssetLoader.ts
│   │   ├── index.ts
│   │   ├── logger.ts
│   │   └── types.ts
│   ├── types
│   │   └── index.ts
│   ├── ui
│   │   ├── components
│   │   │   ├── buttons
│   │   │   │   ├── ActionButton.tsx
│   │   │   │   ├── AnswerButton.tsx
│   │   │   │   ├── BaseButton.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── LifelineButton.tsx
│   │   │   │   ├── types.ts
│   │   │   │   ├── useButtonFsm.ts
│   │   │   │   └── VolumeButton.tsx
│   │   │   ├── cards
│   │   │   │   └── campaign
│   │   │   │       ├── CampaignCard.tsx
│   │   │   │       └── useCampaignCardFsm.ts
│   │   │   ├── errors
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── panel
│   │   │       ├── index.ts
│   │   │       ├── Panel.tsx
│   │   │       └── PanelHeader.tsx
│   │   ├── effects
│   │   │   └── ParticleCanvas.tsx
│   │   ├── hooks
│   │   │   ├── index.ts
│   │   │   ├── useAssetPreloader.ts
│   │   │   ├── useAudio.ts
│   │   │   ├── useEffects.ts
│   │   │   ├── useFavicon.ts
│   │   │   └── useGameState.ts
│   │   ├── icons
│   │   │   └── DefaultIcons.tsx
│   │   ├── layout
│   │   │   └── header
│   │   │       ├── HeaderPanel.tsx
│   │   │       └── HeaderSlideshow.tsx
│   │   ├── MillionaireGame.tsx
│   │   ├── panels
│   │   │   ├── AnswersPanel.tsx
│   │   │   ├── CampaignSelectionPanel.tsx
│   │   │   ├── LifelineResultPanel.tsx
│   │   │   ├── lifelines
│   │   │   │   ├── LifelineAudiencePanel.tsx
│   │   │   │   ├── LifelineDoublePanel.tsx
│   │   │   │   ├── LifelineHostPanel.tsx
│   │   │   │   ├── LifelinePhonePanel.tsx
│   │   │   │   └── LifelineSwitchPanel.tsx
│   │   │   ├── LifelinesPanel.tsx
│   │   │   ├── PrizeLadderPanel.tsx
│   │   │   ├── QuestionPanel.tsx
│   │   │   └── ResultPanel.tsx
│   │   ├── screens
│   │   │   ├── EndScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── StartScreen.tsx
│   │   └── theme
│   │       ├── index.ts
│   │       └── ThemeContext.tsx
│   └── utils
│       ├── assetLoader.ts
│       ├── audioPlayer.ts
│       ├── index.ts
│       └── questionGenerator.ts
├── games
│   ├── .DS_Store
│   ├── bg3
│   │   ├── campaigns
│   │   │   ├── darkUrge
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   ├── hero
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   └── mindFlayer
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   ├── index.ts
│   ├── poc
│   │   ├── campaigns
│   │   │   ├── easy
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   └── hard
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   ├── sky-cotl
│   │   ├── campaigns
│   │   │   └── journey
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   └── transformers
│       ├── campaigns
│       │   ├── autocracy
│       │   │   ├── campaign.ts
│       │   │   ├── questions.ts
│       │   │   └── theme.ts
│       │   ├── megatron
│       │   │   ├── campaign.ts
│       │   │   ├── questions.ts
│       │   │   └── theme.ts
│       │   └── skybound
│       │       ├── campaign.ts
│       │       ├── questions.ts
│       │       └── theme.ts
│       ├── config.ts
│       ├── icons.tsx
│       ├── index.ts
│       ├── questions.ts
│       └── themes.ts
├── index.css
├── main.tsx
├── pages
│   ├── EffectsSandboxPage.tsx
│   ├── index.ts
│   ├── RegisteredGamePage.tsx
│   └── SandboxPage.tsx
├── styles
│   ├── animations.css
│   ├── base.css
│   ├── buttons.css
│   ├── fonts.css
│   ├── glare.css
│   └── prize-ladder.css
├── tailwind.css
└── vite-env.d.ts

53 directories, 152 files

scripts
├── comics_parser.py
├── convert_mp3_to_ogg.sh
├── generate-asset-manifest.js
├── generate-image-manifest.js
└── sandbox
    ├── floating_card.html
    ├── g1_names_to_json.py
    ├── G1_translations.csv
    ├── millionaire-sounds.html
    └── test-prizes.js

2 directories, 9 files
```

#### 3.1.1.2 Изменения после Этапа 14 (styles)

- `src/styles/*` переехали в `src/engine/ui/styles/*` (директория `src/styles/` теперь пустая и не используется).
- Engine‑CSS подключается из `src/engine/index.ts` (engine сам тянет свои стили), а `src/index.css` содержит только `tailwind.css`.
- Wrapper‑класс engine: `.engine` (вместо `.millionaire-engine`).

#### 3.1.1.3 Tree output (обновлено 2025‑12‑14)

```text
src
├── .DS_Store
├── app
│   ├── components
│   │   ├── GameSelector.test.tsx
│   │   ├── GameSelector.tsx
│   │   └── index.ts
│   └── registry
│       ├── gameRegistry.ts
│       └── index.ts
├── App.tsx
├── engine
│   ├── .DS_Store
│   ├── assets
│   │   └── paths.ts
│   ├── audio
│   │   ├── useMusicPlayer.ts
│   │   └── useSoundPlayer.ts
│   ├── constants.ts
│   ├── game
│   │   ├── index.ts
│   │   ├── lifelines
│   │   │   ├── audience.ts
│   │   │   ├── fifty.ts
│   │   │   ├── host.ts
│   │   │   ├── index.ts
│   │   │   ├── phone.ts
│   │   │   └── switch.ts
│   │   ├── prizes
│   │   │   ├── calculatePrizeLadder.ts
│   │   │   ├── getGuaranteedPrize.ts
│   │   │   ├── index.ts
│   │   │   └── prizes.v0.test.ts
│   │   ├── questions
│   │   │   ├── getQuestionDifficulty.ts
│   │   │   ├── index.ts
│   │   │   └── selectQuestionsFromPool.ts
│   │   ├── session
│   │   │   ├── createGameSession.ts
│   │   │   └── index.ts
│   │   ├── state
│   │   │   ├── actions.ts
│   │   │   ├── index.ts
│   │   │   ├── lifelines.v1.test.ts
│   │   │   ├── machine.ts
│   │   │   ├── reducer.ts
│   │   │   ├── resolveAnswer.ts
│   │   │   ├── selectors.ts
│   │   │   ├── selectors.v0.test.ts
│   │   │   ├── state.v0.test.ts
│   │   │   └── types.ts
│   │   └── utils
│   │       └── shuffleArray.ts
│   ├── index.ts
│   ├── services
│   │   ├── AssetLoader.ts
│   │   ├── index.ts
│   │   ├── logger.ts
│   │   └── types.ts
│   ├── types
│   │   └── index.ts
│   ├── ui
│   │   ├── components
│   │   │   ├── buttons
│   │   │   │   ├── ActionButton.tsx
│   │   │   │   ├── AnswerButton.tsx
│   │   │   │   ├── BaseButton.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── LifelineButton.tsx
│   │   │   │   ├── types.ts
│   │   │   │   ├── useButtonFsm.ts
│   │   │   │   └── VolumeButton.tsx
│   │   │   ├── cards
│   │   │   │   └── campaign
│   │   │   │       ├── CampaignCard.tsx
│   │   │   │       └── useCampaignCardFsm.ts
│   │   │   ├── errors
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── panel
│   │   │       ├── index.ts
│   │   │       ├── Panel.tsx
│   │   │       └── PanelHeader.tsx
│   │   ├── effects
│   │   │   └── ParticleCanvas.tsx
│   │   ├── hooks
│   │   │   ├── index.ts
│   │   │   ├── useAssetPreloader.ts
│   │   │   ├── useAudio.ts
│   │   │   ├── useEffects.ts
│   │   │   ├── useFavicon.ts
│   │   │   └── useGameState.ts
│   │   ├── icons
│   │   │   └── DefaultIcons.tsx
│   │   ├── layout
│   │   │   └── header
│   │   │       ├── HeaderPanel.tsx
│   │   │       └── HeaderSlideshow.tsx
│   │   ├── MillionaireGame.tsx
│   │   ├── panels
│   │   │   ├── AnswersPanel.tsx
│   │   │   ├── CampaignSelectionPanel.tsx
│   │   │   ├── LifelineResultPanel.tsx
│   │   │   ├── lifelines
│   │   │   │   ├── LifelineAudiencePanel.tsx
│   │   │   │   ├── LifelineDoublePanel.tsx
│   │   │   │   ├── LifelineHostPanel.tsx
│   │   │   │   ├── LifelinePhonePanel.tsx
│   │   │   │   └── LifelineSwitchPanel.tsx
│   │   │   ├── LifelinesPanel.tsx
│   │   │   ├── PrizeLadderPanel.tsx
│   │   │   ├── QuestionPanel.tsx
│   │   │   └── ResultPanel.tsx
│   │   ├── screens
│   │   │   ├── EndScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── StartScreen.tsx
│   │   ├── styles
│   │   │   ├── animations.css
│   │   │   ├── base.css
│   │   │   ├── buttons.css
│   │   │   ├── campaign-card.css
│   │   │   ├── engine.css
│   │   │   ├── fonts.css
│   │   │   ├── glare.css
│   │   │   ├── panels.css
│   │   │   └── prize-ladder.css
│   │   └── theme
│   │       ├── index.ts
│   │       └── ThemeContext.tsx
│   └── utils
│       ├── assetLoader.ts
│       ├── audioPlayer.ts
│       ├── index.ts
│       └── questionGenerator.ts
├── games
│   ├── .DS_Store
│   ├── bg3
│   │   ├── campaigns
│   │   │   ├── darkUrge
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   ├── hero
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   └── mindFlayer
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   ├── index.ts
│   ├── poc
│   │   ├── campaigns
│   │   │   ├── easy
│   │   │   │   ├── campaign.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── theme.ts
│   │   │   └── hard
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   ├── sky-cotl
│   │   ├── campaigns
│   │   │   └── journey
│   │   │       ├── campaign.ts
│   │   │       ├── questions.ts
│   │   │       └── theme.ts
│   │   ├── config.ts
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── questions.ts
│   │   └── themes.ts
│   └── transformers
│       ├── campaigns
│       │   ├── autocracy
│       │   │   ├── campaign.ts
│       │   │   ├── questions.ts
│       │   │   └── theme.ts
│       │   ├── megatron
│       │   │   ├── campaign.ts
│       │   │   ├── questions.ts
│       │   │   └── theme.ts
│       │   └── skybound
│       │       ├── campaign.ts
│       │       ├── questions.ts
│       │       └── theme.ts
│       ├── config.ts
│       ├── icons.tsx
│       ├── index.ts
│       ├── questions.ts
│       └── themes.ts
├── index.css
├── main.tsx
├── pages
│   ├── EffectsSandboxPage.tsx
│   ├── index.ts
│   ├── RegisteredGamePage.tsx
│   └── SandboxPage.tsx
├── styles
├── tailwind.css
└── vite-env.d.ts

54 directories, 158 files

scripts
├── comics_parser.py
├── convert_mp3_to_ogg.sh
├── generate-asset-manifest.js
├── generate-image-manifest.js
└── sandbox
    ├── floating_card.html
    ├── g1_names_to_json.py
    ├── G1_translations.csv
    ├── millionaire-sounds.html
    └── test-prizes.js

2 directories, 9 files
```

#### 3.1.2 Комментарии по структуре (что сейчас смущает)

- Проблема “двух UI” устранена: весь React‑UI живёт в `src/engine/ui/**` (Этап 9).
- Вне `engine/ui/**` оставляем только не‑UI: audio/assets/services/types/utils (+ `engine/game/**`).
- Доменный слой уже выделен в `src/engine/game/**`; следующий шаг — расширять покрытие (lifelines/prizes/session) и добавлять unit‑тесты на домен.

### 3.2 Комментарии по каждому файлу (назначение + заметка для рефакторинга)

#### 3.2.1 `src/`

- `src/.DS_Store` — мусор (macOS), удалить и запретить в репозитории.
- `src/App.tsx` — маршрутизация SPA; цель: генерировать роуты из `GameRegistry` вместо ручного списка.
- `src/main.tsx` — вход, `BrowserRouter basename`, обработка GitHub Pages 404; оставить, но вынести базовые константы/роутер‑хелперы при необходимости.
- `src/index.css` — агрегатор app‑CSS; сейчас импортирует только `tailwind.css` (engine‑styles подключаются внутри engine).
- `src/tailwind.css` — tailwind layers; ок.
- `src/vite-env.d.ts` — типы Vite; ок.

#### 3.2.2 `src/app/components/`

- `src/app/components/GameSelector.tsx` — селектор игр (UI приложения); цель: переименовать концепт и опереться на `GameRegistry` (единый источник правды).
- `src/app/components/GameSelector.test.tsx` — smoke‑тест селектора; расширять, когда появится registry.
- `src/app/components/index.ts` — barrel export; после появления `GameRegistry` возможно станет не нужен.

#### 3.2.3 `src/pages/`

- `src/pages/index.ts` — barrel export страниц; в будущем можно убрать и импортировать напрямую.
- `src/pages/RegisteredGamePage.tsx` — универсальная страница запуска игры по `:gameId` из `GameRegistry`.
- `src/pages/SandboxPage.tsx` — отладка `HeaderSlideshow`; цель: пометить как devOnly и вынести из prod navigation.
- `src/pages/EffectsSandboxPage.tsx` — демо визуальных эффектов; цель: devOnly.

#### 3.2.4 `src/styles/`

- `src/styles/` — устаревшая директория (после Этапа 14): файлы переехали в `src/engine/ui/styles/`, `src/styles/` можно удалить.

Новый дом для engine‑CSS:
- `src/engine/ui/styles/base.css` — базовые правила engine, scoped под `.engine`.
- `src/engine/ui/styles/animations.css` — анимации экранов (screen transitions + win/lose), scoped.
- `src/engine/ui/styles/panels.css` — анимации панелей (enter/exit/stagger), scoped.
- `src/engine/ui/styles/campaign-card.css` — стили/анимации `CampaignCard` (glow/rays/tilt vars), scoped.
- `src/engine/ui/styles/glare.css` — универсальный `glare` (right/left), scoped.
- `src/engine/ui/styles/buttons.css` — состояния кнопок и эффекты, scoped.
- `src/engine/ui/styles/prize-ladder.css` — стили `prizeLadder`, scoped.
- `src/engine/ui/styles/fonts.css` — `@font-face` (глобально, но используется только если выбран соответствующий fontFamily).
- `src/engine/ui/styles/engine.css` — агрегатор стилей движка.

#### 3.2.5 `src/engine/` (публичный движок)

- `src/engine/.DS_Store` — мусор (macOS), удалить и запретить.
- `src/engine/index.ts` — публичный API движка (barrel); цель: сузить API, стабилизировать, не раздувать бандл.
- `src/engine/constants.ts` — общие константы; цель: расширять и использовать как “single source of truth”.

##### 3.2.5.1 Assets

- `src/engine/assets/paths.ts` — единая логика `baseUrl` и построения путей; цель: engine запускается без `public/`.

##### 3.2.5.2 Audio

- `src/engine/audio/useMusicPlayer.ts` — управление музыкой (loop/track switching); цель: правила переключений постепенно “переезжают” в доменный слой `engine/game`.
- `src/engine/audio/useSoundPlayer.ts` — SFX/voice + stop‑handles/tagging; цель: сохранять мгновенную остановку звуков для UX.

##### 3.2.5.3 Game (domain)

- `src/engine/game/**` — чистая доменная логика (state machine, session, lifelines, prizes, selectors) без React.
- Цель: именно этот слой покрывать unit‑тестами (быстро, без DOM), а UI держать тонким оркестратором.

##### 3.2.5.4 UI (весь React слой)

- `src/engine/ui/MillionaireGame.tsx` — UI‑точка входа engine (компоновка экранов + wiring hooks).
- `src/engine/ui/screens/*` — экраны (Start/Game/End/Loading).
- `src/engine/ui/panels/*` — панели, которые оркестрирует `GameScreen`.
- `src/engine/ui/components/*` — UI‑примитивы (Panel, CampaignCard, ErrorBoundary, …).
- `src/engine/ui/layout/*` — layout‑слой (header и будущие shells).
- `src/engine/ui/effects/*` — canvas/визуальные эффекты.
- `src/engine/ui/icons/*` — DefaultIcons (дефолтный icon pack).
- `src/engine/ui/theme/*` — ThemeContext/ThemeProvider.
- `src/engine/ui/hooks/*` — UI hooks (в т.ч. фасады к аудио/эффектам/домену).

##### 3.2.5.5 Services

- `src/engine/services/index.ts` — barrel.
- `src/engine/services/logger.ts` — logger; цель: постепенно заменить `console.*` в engine.
- `src/engine/services/types.ts` — типы манифеста/уровней; цель: оформить как `engine/assets/manifest/*`.
- `src/engine/services/AssetLoader.ts` — manifest‑based loader; цель: стать единственной точкой preload + единая система путей.

##### 3.2.5.6 Types

- `src/engine/types/index.ts` — договор API движка (GameConfig, ThemeColors, etc.); цель: переименовать `hint*` → `lifeline*`, формализовать `rewardKind`, не ломая совместимость сразу.

##### 3.2.5.7 Utils

- `src/engine/utils/index.ts` — barrel.
- `src/engine/utils/questionGenerator.ts` — генерация вопросов/ladder; цель: остаток логики перенести в `engine/game/*` и удалить/свести к thin‑wrapper.
- `src/engine/utils/assetLoader.ts` — path helpers + HEAD exists; цель: слить с `AssetLoader`/`paths.ts`, оставить fallback.
- `src/engine/utils/audioPlayer.ts` — низкоуровневое аудио; цель: разделить на `SoundPlayer`/декодирование/кеш/oscillator.

#### 3.2.6 `src/games/` (моды/контент)

- `src/games/.DS_Store` — мусор (macOS), удалить и запретить.
- `src/games/index.ts` — barrel export игр; цель: заменить на `GameRegistry` как источник правды.

##### 3.2.6.1 BG3

- `src/games/bg3/index.ts` — barrel; цель: после ввода `campaigns/` станет “тонким”.
- `src/games/bg3/config.ts` — конфиг игры; цель: разделить на game‑level и campaign‑level части.
- `src/games/bg3/themes.ts` — темы кампаний; цель: переехать в `campaigns/*/theme.ts`.
- `src/games/bg3/questions.ts` — пул вопросов; цель: переехать в `campaigns/*/questions.*`.
- `src/games/bg3/icons.tsx` — иконки; цель: часть общая для игры, часть — для кампаний.

##### 3.2.6.2 PoC

- `src/games/poc/index.ts` — barrel.
- `src/games/poc/config.ts` — PoC‑конфиг; цель: остаться “без public”, oscillator only, использовать стандартные lifeline‑названия.
- `src/games/poc/themes.ts` — темы; цель: можно оставить как есть.
- `src/games/poc/questions.ts` — вопросы; цель: можно оставить как есть.
- `src/games/poc/icons.tsx` — emoji‑иконки; цель: ок.

##### 3.2.6.3 Sky‑CotL

- `src/games/sky-cotl/index.ts` — barrel.
- `src/games/sky-cotl/config.ts` — конфиг (англ. строки + `systemStrings`); цель: привести lifeline‑терминологию и имена в registry.
- `src/games/sky-cotl/themes.ts` — light‑theme, расширенные поля ThemeColors; цель: закрепить “light theme contract” в engine UI.
- `src/games/sky-cotl/questions.ts` — вопросы (EN); цель: можно оставить как отдельный пул.
- `src/games/sky-cotl/icons.tsx` — SVG/emoji‑иконки; цель: ок.

##### 3.2.6.4 Transformers

- `src/games/transformers/index.ts` — barrel.
- `src/games/transformers/config.ts` — конфиг (очень большой); цель: вынести companions/questions по кампании, затем `campaigns/*`.
- `src/games/transformers/themes.ts` — темы; цель: переехать в `campaigns/*/theme.ts` (или оставить game‑level если общие).
- `src/games/transformers/questions.ts` — большой пул; цель: разбить по кампании.
- `src/games/transformers/icons.tsx` — иконки; цель: ок.

#### 3.2.7 `scripts/`

- `scripts/generate-asset-manifest.js` — генератор `public/asset-manifest.json`; цель: не падать без `public/` (mkdir/skip), и разделить на `scripts/build/*`.
- `scripts/generate-image-manifest.js` — генератор `manifest.json` для слайдшоу; цель: тоже устойчивость без `public/`.
- `scripts/convert_mp3_to_ogg.sh` — конвертер медиа; цель: перенести в `scripts/media/`.
- `scripts/comics_parser.py` — парсер данных; цель: перенести в `scripts/data/` и задокументировать зависимость от сети.
- `scripts/sandbox/millionaire-sounds.html` — ручная песочница звуков; цель: оставить в sandbox.
- `scripts/sandbox/test-prizes.js` — ручная проверка ladder; цель: возможно заменить unit‑тестами в `engine/game/prizes`.
- `scripts/sandbox/g1_names_to_json.py` — data утилита; цель: `scripts/data/`.
- `scripts/sandbox/G1_translations.csv` — данные для утилит; цель: `scripts/data/`.

---

### 3.3 Что осталось “хвостами” и нужно ли это делать

Ниже — вещи, которые всё ещё имеют смысл делать (и поэтому включены в этапы), и вещи, которые считаем не приоритетом прямо сейчас:

- Актуально и включено в план:
  - `glare`‑миграция (`shine` → `glare`) + унификация кнопочных состояний (Этап 7).
  - Разбор CSS на слои/`engine/ui/styles` и ревизия шрифтов (Этап 7).
  - Консолидация ассет‑путей/манифестов и устойчивость без `public/` (Этап 6).
  - Декомпозиция монолитов (`GameScreen`, `useAudio`, `audioPlayer`, `AssetLoader`) (Этап 3/5/6).
- Не делаем специально “в отрыве”:
  - Массовое добавление тестов “на всё” — расширяем тесты точечно по мере выноса домена/машины (Этап 3+).
  - Полная замена всех `console.*` — переводим на `logger` постепенно вместе с рефакторингом затрагиваемых модулей.

---

## 4 Цели и принципы целевой архитектуры

### 4.1 Слои ответственности

- `engine/game` — чистый домен (без React/DOM): правила, переходы, генераторы.
- `engine/ui` — React UI: панели, кнопки, layout, header, theme, icons, effects.
- `engine/assets` — ассеты: пути, манифесты, preload.
- `engine/audio` — аудио: music/sfx/voice + stop‑handles.
- `engine/services` — logger и прочее.

### 4.2 Инкрементальность и совместимость

- Переезды делаем через адаптеры/ре‑экспорты.
- Большие файлы дробим, но поведение сохраняем.

### 4.3 Принятые решения (v0)

- `takeMoney` — это **не lifeline**, а action‑кнопка внизу `PrizeLadderPanel`.
- Тайминги reveal/анимаций в v0 живут в `src/engine/constants.ts` (например, `ANSWER_REVEAL_DURATION_MS`), UI использует их напрямую; позже можно вынести в “commands/effects” домена.
- `glare` — CSS‑примитив (custom properties + `:hover/:active`), press‑вариант обязан быть “влево” (reverse).
- `systemStrings` (пока) — часть `GameConfig` (без отдельной i18n‑подсистемы).
- CampaignCard: у кампаний **нет `glare`** (для них будет отдельный спец‑эффект); сейчас выбранная кампания подсвечивается отдельным glow/rays‑эффектом.

---

## 5 GameRegistry (единый источник правды для приложения)

### 5.1 Почему registry лучше, чем GameSelector

- `GameSelector` — UI.
- `GameRegistry` — **данные и правила**: какие игры существуют, какие роуты, какие карточки, какие devOnly.

Цель: UI селектора будет “рендерить registry”, а не жить отдельной ручной конфигурацией.

### 5.2 Предлагаемая форма registry

- `GameDefinition`:
  - `id` (совпадает с `GameConfig.id`)
  - `routePath`
  - `title/subtitle/emoji` (для карточки)
  - `available`/`devOnly`
  - `getConfig(): Promise<GameConfig>` (lazy import, code splitting)

---

## 6 Engine: GameState и объяснение `machine.ts` / `reducer.ts` / `selectors.ts`

### 6.1 Что именно мы хотим от GameState

- Явная модель состояния (phase + контекст).
- Явные события (events).
- Явные правила переходов (guards).
- Инварианты (нельзя кликать ответ после выбора, нельзя lifeline после ответа и т.д.).
- Возможность unit‑тестов без React.

### 6.2 Зачем разносить на три файла

#### 6.2.1 `machine.ts` (правила переходов)

Это “таблица законов”: какие `event` допустимы из каких `phase` и к чему приводят, включая guards.

- Пример: `phase: playing` + `event: ANSWER_SELECTED` → `phase: reveal` (или остаёмся playing, но с таймером).
- Пример guard: `TAKE_MONEY` запрещён на `currentQuestion === 0`.

`machine.ts` не обязан быть сторонней lib; это просто модуль с `transition(state, event)` и таблицей переходов.

#### 6.2.2 `reducer.ts` (механика изменения контекста)

Это “как менять данные”, когда переход уже разрешён.

Два варианта:
- `machine.ts` вызывает `applyEvent(state, event)` и получает новый state (redux‑style).
- или `machine.ts` возвращает “эффект/команду”, а reducer применяет.

Смысл: отделить “разрешено/запрещено” от “как именно обновить массивы/индексы/вычисления”.

#### 6.2.3 `selectors.ts` (derived данные для UI)

UI не должен сам вычислять сложные derived вещи.

Примеры:
- `selectRewardKind(state)`
- `selectVisiblePanels(state)`
- `selectCurrentPrize(state)`
- `selectQuestionDifficulty(state)`
- `selectLifelineAvailability(state)`

`selectors.ts` делает UI тоньше, а тесты — проще (проверяем селекторы отдельно).

---

### 6.3 Предлагаемая модель GameState (v0, для старта)

Цель: описать состояние так, чтобы:
- UI (панели) включались/выключались через селекторы;
- задержки/переходы были формализованы;
- расширение новыми lifeline’ами не ломало модель.

#### 6.3.1 Основные сущности состояния

- `phase` — крупная фаза игры (какой “режим” сейчас активен).
- `session` — контекст с вопросами/ladder/выбором кампании/состоянием lifeline’ов.
- `ui` — то, что временно показываем поверх (lifeline result panel, errors).

#### 6.3.2 Phase (предложение)

```
type Phase =
  | 'campaign'        // выбор кампании (до старта)
  | 'playing'         // игрок отвечает на текущий question
  | 'reveal'          // выбран answer, идёт reveal-анимация/таймер
  | 'result';         // игра завершена, показываем reward
```

Примечания:
- “загрузка ассетов” не обязана быть phase GameState: это инфраструктура (`AssetLoader`) и может отображаться отдельным overlay/экраном.

#### 6.3.3 Состояние (примерная структура)

```
interface GameState {
  phase: Phase;

  selectedCampaignId: string | null;

  questions: Question[];
  currentQuestionIndex: number;     // 0-based
  shuffledAnswerOrder: number[];    // отображение A/B/C/D → 0..3

  selectedAnswerIndex: number | null;   // display index (0..3)
  eliminatedAnswerIndices: number[];    // display indices removed by fifty

  lifelines: {
    fifty: { available: boolean; usedAtQuestionIndex?: number };
    phone: { available: boolean; usedAtQuestionIndex?: number };
    audience: { available: boolean; usedAtQuestionIndex?: number };
    host: { available: boolean; usedAtQuestionIndex?: number };
    switch: { available: boolean; usedAtQuestionIndex?: number };
    double: { available: boolean; usedAtQuestionIndex?: number };
  };

  lifelineResult: LifelineResult | null; // данные для Lifeline*Panel

  prizeLadder: PrizeLadder;
  reward: { kind: 'trophy' | 'money' | 'defeat'; amount: string };

  reveal: null | {
    startedAtMs: number;
    answerDisplayIndex: number;
  };

  error: null | { message: string; details?: unknown };
}
```

#### 6.3.4 События (Events)

Минимальный набор событий для v0:

- `CAMPAIGN_SELECTED(campaignId)`
- `GAME_STARTED`
- `ANSWER_PRESSED(displayIndex)`
- `REVEAL_FINISHED`
- `LIFELINE_USED(kind)` (например, `fifty|phone|audience`)
- `LIFELINE_RESULT_CLOSED`
- `TAKE_MONEY_REQUESTED` (action, не lifeline)
- `NEW_GAME_REQUESTED`
- `ERROR_RAISED(payload)` / `ERROR_CLEARED`

#### 6.3.5 Переходы (упрощённая таблица)

- `campaign`:
  - `CAMPAIGN_SELECTED` → остаёмся `campaign` (selectedCampaignId обновлён)
  - `GAME_STARTED` (guard: campaign selected) → `playing`

- `playing`:
  - `ANSWER_PRESSED` (guard: selectedAnswerIndex == null) → `reveal` (+selectedAnswerIndex, +reveal.startedAt)
  - `LIFELINE_USED(fifty)` (guard: available, selectedAnswerIndex==null) → `playing` (+eliminated)
  - `LIFELINE_USED(phone|audience|host)` → `playing` (+lifelineResult открыт)
  - `LIFELINE_USED(switch)` → `playing` (+заменить вопрос, reset answer state)
  - `LIFELINE_USED(double)` → `playing` (+режим “двойного выбора” — уточнить в v1)
  - `TAKE_MONEY_REQUESTED` (guard: currentQuestionIndex>0) → `result` (reward.kind=`money`)

- `reveal`:
  - `REVEAL_FINISHED` → либо `playing` (если correct и не последний), либо `result` (reward.kind=`trophy`), либо `result` (reward.kind=`defeat`)

- `result`:
  - `NEW_GAME_REQUESTED` → `campaign` (reset session)

#### 6.3.6 Инварианты (v0)

- Нельзя `ANSWER_PRESSED` если `phase != playing`.
- Нельзя `LIFELINE_USED(*)` если `selectedAnswerIndex != null` (после выбора ответа).
- `TAKE_MONEY_REQUESTED` только если `currentQuestionIndex > 0`.
- `reward.kind` вычисляется детерминированно (селектором) и не хранится “вручную” в нескольких местах.

#### 6.3.7 Статус реализации (как сейчас)

- Доменные части вынесены в `src/engine/game/**` (questions/prizes/lifelines/state/session).
- `phase` в текущей реализации соответствует `GameState` (`start|playing|won|lost|took_money`).
- Reveal‑пауза в v0 — UI‑таймер по `ANSWER_REVEAL_DURATION_MS`, домен возвращает outcome через `resolveAnswer()`. В vNext можно сделать отдельную `reveal` phase в домене.

---

## 7 UI: панели, кнопки, header, эффекты, тема, иконки

### 7.1 Где живёт `Header`

Решение: `Header` — это UI. Держим его в `engine/ui/layout/header/*` (а не отдельным верхним модулем), чтобы всё визуальное было в одном месте.

### 7.2 Куда девать `effects`, `theme`, `icons`

Это всё “presentation/UI”, поэтому:
- `engine/ui/effects/*`
- `engine/ui/theme/*`
- `engine/ui/icons/*`

`assets` и `audio` остаются отдельными подсистемами, потому что это инфраструктура.

### 7.3 Панели (панельная архитектура вместо “экран‑монолита”)

Минимальный набор панелей для рефакторинга:

- `CampaignSelectionPanel`
- `QuestionPanel`
- `AnswersPanel`
- `LifelinesPanel`
- `PrizeLadderPanel`
- `ResultPanel` (варианты: `trophy|money|defeat`)
- `ErrorPanel` (overlay)

Панели “результата lifeline” (замена старого HintPanel):

- `LifelinePhonePanel`
- `LifelineAudiencePanel`
- (в будущем) `LifelineHostPanel`
- (в будущем) `LifelineSwitchPanel`
- (в будущем) `LifelineDoublePanel`

Да, они похожи, но общая логика появления/скрытия должна быть общей для Panel‑системы (анимации/тайминги), а не зашита в один “HintPanel”.

### 7.4 Компонента карточки кампании

Добавить и развивать:

- `src/engine/ui/components/cards/campaign/CampaignCard.tsx`

Цель: выделить кастомизацию/анимации/свечения/эффекты вокруг карточки кампании без раздувания `CampaignSelectionPanel`.

### 7.5 Состояния кнопок (унифицированная модель)

Все кнопки в engine UI имеют состояния (Button FSM):

- `Appear` — появление (часто пусто). Input включаем после `AppearDone`.
- `Idle` — нейтральное состояние (можно idle‑анимации).
- `Hover` — hover + подъём + `glare(right)`.
- `Press` — вдавливание + затемнение + `glare(left)` + звук “press”.
- `Ease` — возврат из Press в Idle (если отпустили/увели курсор).
- `Activate` — подтверждение: fireAction + (опц.) звук “click” + короткая anim.
- `Disappear` — исчезновение (анимация выхода), блокируем input.

#### 7.5.1 Таблица переходов (v0, high‑level)

Ключевая идея: в `Press` мы **держим pointer capture** и обновляем `isOver` через hit‑test на `pointermove`. Это обеспечивает корректный “press‑cancel при уводе” (не полагаемся на `pointerleave` под capture).

##### 7.5.1.1 Global

| Current | Event | Guard | Next | Actions / Notes |
|---|---|---|---|---|
| `*` | `disable` / `forceDisappear` | — | `Disappear` | Запуск анимации исчезновения, блок input |
| `*` | `destroy` | — | — | Удаление объекта (обычно после `DisappearDone`) |

##### 7.5.1.2 Appear / Disappear

| Current | Event | Guard | Next | Actions / Notes |
|---|---|---|---|---|
| `Appear` | `AppearDone` | — | `Idle` | Включить input, перейти в neutral |
| `Disappear` | `DisappearDone` | — | — | hidden/destroy (по политике UI) |

##### 7.5.1.3 Idle / Hover

| Current | Event | Guard | Next | Actions / Notes |
|---|---|---|---|---|
| `Idle` | `pointerenter` | — | `Hover` | hover: lift + `glare(right)` |
| `Idle` | `pointerdown` | — | `Press` | `capture`; press anim; darken; `glare(left)`; sfx(press) |
| `Idle` | `programmaticDown` | — | `Press` | Для геймпада/клавы: имитировать down |
| `Hover` | `pointerleave` | — | `Idle` | вернуть neutral |
| `Hover` | `pointerdown` | — | `Press` | `capture`; press anim; darken; `glare(left)`; sfx(press) |

##### 7.5.1.4 Press (pointer capture + cancel логика)

| Current | Event | Guard | Next | Actions / Notes |
|---|---|---|---|---|
| `Press` | `pointermove` | — | `Press` | обновлять `isOver = hitTest(pointerPos)` |
| `Press` | `pointerup` | `isOver = true` | `Activate` | `release`; activate anim; `fireAction`; sfx(click?) |
| `Press` | `pointerup` | `isOver = false` | `Ease` | `release`; ease anim (возврат из press) |
| `Press` | `pointercancel` | — | `Ease` | `release` (если нужно); отмена нажатия |
| `Press` | `lostpointercapture` | — | `Ease` | гарантированный safe-return |

##### 7.5.1.5 Ease (возврат из Press)

| Current | Event | Guard | Next | Actions / Notes |
|---|---|---|---|---|
| `Ease` | `EaseDone` | `isOver = true` | `Hover` | если курсор вернулся над кнопкой |
| `Ease` | `EaseDone` | `isOver = false` | `Idle` | иначе нейтраль |
| `Ease` | `pointerdown` | — | `Press` | (опц.) “пережатие”: `capture` + press |

##### 7.5.1.6 Activate (активация/подтверждение)

| Current | Event | Guard | Next | Actions / Notes |
|---|---|---|---|---|
| `Activate` | `ActivateDone` | `isOver = true` | `Hover` | остались наведены |
| `Activate` | `ActivateDone` | `isOver = false` | `Idle` | курсор ушёл |
| `Activate` | `pointerdown` | — | `Press` | (опц.) быстрое повторное нажатие |

#### 7.5.2 Синонимы (для миграции нейминга)

- `Spawn` → `Appear`
- `Click` → `Activate`
- `Kill` → `Disappear`

#### 7.5.3 Примечания по реализации

- Не полагаться только на `pointerleave` под capture: корректнее вычислять `isOver` через hit‑test на `pointermove`.
- Для клавиатуры/геймпада: `programmaticDown`/`programmaticUp`, чтобы можно было переиспользовать тот же FSM.

### 7.6 Glare (единый термин и единая реализация)

Правило: эффект блика называется **`glare`**.

Цель реализации:
- одна “универсальная” реализация с настройками:
  - направление: right/left
  - ширина
  - скорость
  - интенсивность/прозрачность
- без отдельных `shine`/`shine-reverse` неймингов.

План по стилям:
- заменить `src/styles/glare.css` на `engine/ui/styles/glare.css`
- использовать CSS custom properties для параметризации (например: `--glare-from`, `--glare-to`, `--glare-width`, `--glare-duration`, `--glare-alpha`)

### 7.7 Предложение: целевое дерево `src/engine` (UI в одном месте)

Цель: **весь React‑UI** лежит внутри `src/engine/ui/*`.
В `src/engine/*` вне `ui/` остаются только “движковые” штуки: state, audio, assets, services, types, utils.

#### 7.7.1 Предлагаемая структура (vNext)

```text
src/engine
├── index.ts                    # public API engine (минимальный)
├── types/                      # публичные типы (GameConfig, Campaign, etc.)
├── game/                       # домен: GameState + правила + transitions (без React)
│   ├── state/                  # machine/reducer/selectors/actions/types
│   ├── lifelines/              # доменная логика lifeline'ов
│   └── prizes/                 # prizeladder/reward rules
├── assets/                     # base path + asset helpers
├── audio/                      # MusicPlayer/SoundPlayer + audio types
├── services/                   # AssetLoader, logger, etc.
├── utils/                      # чистые утилиты (без React)
└── ui/                         # ВСЁ React/UI здесь
    ├── screens/                # StartScreen/GameScreen/EndScreen/LoadingScreen
    ├── panels/                 # CampaignSelectionPanel, QuestionPanel, etc.
    │   └── lifelines/          # LifelinePhonePanel, LifelineAudiencePanel, ...
    ├── layout/                 # Header (slideshow), Footer, shells
    ├── components/             # переиспользуемые UI-примитивы
    │   ├── panel/              # Panel, PanelHeader, ...
    │   ├── buttons/            # ActionButton, AnswerButton, LifelineButton, ...
    │   └── cards/              # CampaignCard, ...
    ├── effects/                # ParticleCanvas, визуальные эффекты
    ├── theme/                  # ThemeContext, theme helpers
    ├── hooks/                  # UI-hooks (useGameState facade, useEffects, etc.)
    └── styles/                 # glare/base/buttons/prize-ladder CSS (по желанию)
```

#### 7.7.2 Правила (чтобы больше не плодить “components vs ui/components”)

- TSX‑компоненты UI живут только в `src/engine/ui/**`.
- `src/engine/components/**` после миграции **удаляем** (это сейчас главный источник путаницы).
- `src/engine/ui/components/**` — только переиспользуемые атомы/примитивы, не “экраны”.
- `src/engine/ui/screens/**` — “страницы игры” (Start/Game/End/Loading).
- `src/engine/ui/panels/**` — панели, которые оркестрируются `GameScreen`.
- `src/engine/game/**` — чистая логика (без React), её проще тестировать и расширять.

#### 7.7.3 Карта миграции (минимальная, чтобы убрать текущую неоднозначность)

- `src/engine/components/StartScreen.tsx` → `src/engine/ui/screens/StartScreen.tsx`
- `src/engine/components/GameScreen.tsx` → `src/engine/ui/screens/GameScreen.tsx`
- `src/engine/components/EndScreen.tsx` → `src/engine/ui/screens/EndScreen.tsx`
- `src/engine/components/LoadingScreen.tsx` → `src/engine/ui/screens/LoadingScreen.tsx`
- `src/engine/components/panels/*` → `src/engine/ui/panels/*`
- `src/engine/components/HeaderPanel.tsx` + `HeaderSlideshow.tsx` → `src/engine/ui/layout/header/*`
- `src/engine/components/ParticleCanvas.tsx` → `src/engine/ui/effects/ParticleCanvas.tsx`
- `src/engine/context/*` → `src/engine/ui/theme/*`
- `src/engine/hooks/*` → split:
  - UI‑хуки → `src/engine/ui/hooks/*`
  - доменные части/переиспользуемая логика → `src/engine/game/*` (по мере появления)

---

## 8 Games: структура по кампаниям

### 8.1 Проблема текущего состояния

Сейчас у игры обычно плоско: `config.ts / themes.ts / questions.ts / icons.tsx`.
Это плохо масштабируется, когда у кампаний разный контент и становится много файлов.

### 8.2 Целевая структура для игр

```
src/games/<gameId>/
  game.ts                      # game-level config composer
  registry.ts                  # метаданные для GameRegistry (опционально)
  shared/
    icons.tsx
    audio.ts
    strings.ts
  campaigns/
    <campaignId>/
      campaign.ts              # Campaign meta (id/name/label/icon/theme hooks)
      theme.ts
      questions.ts
      assets.ts                # campaign-specific asset mapping (optional)
```

### 8.3 Применение к текущим играм

- BG3:
  - `campaigns/hero`, `campaigns/mindFlayer`, `campaigns/darkUrge`
- Transformers:
  - `campaigns/megatron`, `campaigns/autocracy`, `campaigns/skybound`
- Sky‑CotL:
  - `campaigns/journey` (пока одна)
- PoC:
  - можно оставить упрощённо (но тоже можно сделать `campaigns/easy`/`campaigns/hard` для симметрии).

---

## 9 Assets и “движок без public/”

### 9.1 Требование

PoC и базовый engine должны запускаться без `public/`.

### 9.2 Что это значит технически

- Скрипты генерации манифестов должны:
  - создавать `public/` при необходимости, или
  - корректно пропускать генерацию, если ассетов нет.
- Runtime `AssetLoader`/`useAssetPreloader` должны:
  - не падать, если манифест отсутствует;
  - не блокировать UI навсегда.

---

## 10 План работ (этапы)

### 10.1 Принципы этапов

- Каждый этап — самостоятельный, рабочий результат.
- Каждый этап заканчивается:
  - тестами;
  - сборкой;
  - коммитом в `refactoring`.

### 10.2 Этапы

- ✅ **Этап 1. Архитектурные правила и терминология**
  - Зафиксировать терминологию в коде (план миграции `hint*` → `lifeline*`).
  - Добавить `rewardKind` (`trophy|money|defeat`) и привести EndScreen/ResultPanel контракт к этому.
  - Acceptance: диздок актуален, типы не ломаются, есть список deprecated алиасов.

- ✅ **Этап 2. GameRegistry**
  - Ввести `GameRegistry` и перевести `App.tsx`/селектор на него.
  - Маркировать devOnly страницы (EffectsSandbox/SandboxPage) и скрывать в UI.
  - Acceptance: добавление новой игры = одна запись в registry.

- ✅ **Этап 3. Engine UI: панели и CampaignCard**
  - Разрезать `GameScreen` на панели (`QuestionPanel`, `AnswersPanel`, `LifelinesPanel`, `PrizeLadderPanel`).
  - Ввести `CampaignSelectionPanel` + `CampaignCard`.
  - CampaignCard: фиксированный размер, иконка скейлится в пределах, длинный текст режется (truncate), выбранная кампания приподнята + glow/rays.
  - `EndScreen` заменить на `ResultPanel(variant)`.
  - Acceptance: `GameScreen.tsx` становится оркестратором, панели тестируемы.

- ✅ **Этап 4. Lifeline panels и новая модель lifeline результата**
  - `HintPanel` → `LifelinePhonePanel`/`LifelineAudiencePanel` (+ общий механизм показа/скрытия).
  - Подготовить места для `host/switch/double`.
  - Acceptance: UI использует `lifelineResult`/`lifelineState`, нигде нет `hint*` в новых местах.

- ✅ **Этап 5. Audio: MusicPlayer + SoundPlayer**
  - Разделить обязанности: музыка отдельно, SFX/voice отдельно.
  - Ввести stop‑handles/tagging (для мгновенной остановки выбора кампании).
  - Переименовать “hint” SFX в “lifeline” (с алиасами).
  - Acceptance: `playCampaignSelectSound` становится частным случаем (tagged sound), stop работает.

- ✅ **Этап 6. Assets: единая система путей + устойчивость без public/**
  - Вынести `paths.ts` как единую точку `baseUrl` и построения путей.
  - `AssetLoader` умеет работать с отсутствующим манифестом.
  - Скрипты генерации манифестов устойчивы без `public/`.
  - Acceptance: `npm run dev` стартует при пустом `public/`.

- ✅ **Этап 7. Styles: glare + слои CSS + чистка шрифтов**
  - `shine` → `glare`: единая реализация, миграция классов.
  - Разложить стили по слоям `engine/ui/styles/*` или `@layer`.
  - Проверить шрифты: удалить неиспользуемые, синхронизировать с темами/играми.
  - Acceptance: нейминг `glare` единый, нет “shine”.

- ✅ **Этап 8. Games: campaigns/***
  - Перестроить игры на `campaigns/<id>/*`.
  - Разбить большие Transformers файлы.
  - Acceptance: структура игры масштабируется, меньше монолитов.

- ✅ **Этап 8.5. Stabilization: исправление накопившихся регрессий**
  - Удалить устаревшие docs (например, `ENGINE_PLAN.md`), если они больше не используются.
  - Сверить `tree src` с диздоком и убрать “дубликаты” директорий (например, `engine/components/ui` vs `engine/ui/*`).
  - Починить `glare` на `:active`: press‑блик должен идти “влево” и не перекрываться hover‑бликом.
  - Campaign cards: одинаковая высота + одинаковая ширина, равная самой широкой карточке (с адаптацией под узкий экран).
  - Acceptance: `npm test`, `npm run lint`, `npm run build` зелёные; визуальные регрессии устранены.

- ✅ **Этап 9. Engine: свести весь UI в `engine/ui`**
  - Перенести `src/engine/components/*` → `src/engine/ui/screens|panels|layout|effects`.
  - Перенести `src/engine/context/*` → `src/engine/ui/theme/*`.
  - Перенести UI‑хуки из `src/engine/hooks/*` → `src/engine/ui/hooks/*` (а доменную часть — в `src/engine/game/*`).
  - Удалить `src/engine/components/` после миграции, чтобы не осталось “двух UI”.
  - Acceptance: `npm test`, `npm run lint`, `npm run build` зелёные; импортов из `engine/components/*` больше нет.

- ✅ **Этап 10. Engine: GameState machine (v0) и вынос домена**
  - Ввести `src/engine/game/state/*`: `types/actions/reducer/selectors/machine` (v0).
  - Постепенно вынести доменную логику из `useGameState` в `src/engine/game/**` (questions/prizes/lifelines).
  - Acceptance:
    - `npm test`, `npm run lint`, `npm run build` зелёные.
    - Визуальная проверка: на кнопках **press‑`glare-left` заметен** (не “как hover”), hover остаётся `glare-right`.

- ✅ **Этап 11. Engine UI: кнопки как компоненты**
  - Ввести `src/engine/ui/components/buttons/*`: `ActionButton`, `AnswerButton`, `LifelineButton`, `VolumeButton`.
  - Формализовать состояния кнопки (Appear/Idle/Hover/Press/Ease/Activate/Disappear) в одном контракте.
  - Убрать дубли CSS‑логики из панелей: панели только композируют кнопки.
  - Acceptance: кнопки переиспользуемы, `glare` и press‑cancel работают одинаково везде.

- ✅ **Этап 13. Lifelines v1: host/switch/double**
  - Реализовать доменную механику + UI‑панели для `host`, `switch`, `double`.
  - Привести `GameConfig.lifelines`/`strings`/`audio.sounds` к финальному набору ключей (deprecated алиасы оставить на переходный период).
  - Acceptance: новые lifelines работают end‑to‑end, тестируются на уровне `engine/game`.

- ✅ **Этап 14. Styles/portability: `engine` без глобального `src/styles`**
  - Переехать с `src/styles/*` в `src/engine/ui/styles/*` (или собрать в `@layer` внутри engine), чтобы “голый engine” подключался без внешнего app‑CSS.
  - Удалить `.DS_Store` из репозитория и запретить через `.gitignore`.
  - Acceptance: engine можно импортировать в другое приложение без “утечек” глобальных стилей.

- ✅ **Этап 15. Тесты домена**
  - Добавить unit‑тесты для `src/engine/game/state/*` (reducers/selectors/machine), `lifelines/*`, `prizes/*`.
  - Acceptance: тесты ловят регрессии логики без React, CI остаётся быстрым.

- ✅ **Этап 16. Public API engine (оптимизация)**
  - Сузить/структурировать `src/engine/index.ts` (минимальный публичный API, меньше случайных re‑export).
  - Acceptance: нет случайного подтягивания “всего engine”, импорт‑путь очевиден и стабилен.

- ⬜ **Этап 12. Header v1: настоящий layout‑header (не Panel) (отложено)**
  - ✅ Вынести header из экранов в `src/engine/ui/layout/header/*` как глобальный layout‑слой.
  - ⬜ Стабилизировать “портал”/слойность: изображения под панели, анимации смены, виньетка/маски.
  - ⬜ Acceptance: header живёт поверх экранов, меняется по `GameState` и кампании без дерганий.

---

## 11 Риски и стратегии снижения

### 11.1 Риск: массовые переименования `hint*` → `lifeline*`

Стратегия:
- делать через алиасы/депрекейты по этапам;
- держать таблицу соответствий “старое → новое” (ключи конфигов + имена файлов ассетов).

### 11.2 Риск: “engine без public/” ломает текущий dev workflow

Стратегия:
- скрипты генерации манифестов должны быть noop, если ассетов нет;
- preload‑хуки не должны блокировать экран и должны корректно завершаться.

### 11.3 Риск: распухание `engine/index.ts` и случайное подтягивание лишнего

Стратегия:
- держать `engine/index.ts` минимальным;
- избегать barrel exports в горячих местах, где это увеличивает бандл.

---

## 12 Журнал выполненных работ

### 12.1 Записи

- 2025‑12‑13 (codex): обновлён диздок (v2): добавлена строгая терминология (`lifeline`, `prizeLadder`, `rewardKind`), описан `GameRegistry`, уточнена структура `games/campaigns`, добавлены правила работы и этапы.
- 2025‑12‑13 (codex): актуализирован `tree src` (появились `app/registry`, `games/*/campaigns`, `engine/ui/components/panel`), добавлено предложение целевой структуры `src/engine` (UI только в `engine/ui/**`) и введён новый плановый этап “Engine: свести весь UI в `engine/ui`”.
- 2025‑12‑13 (codex): перенесены актуальные пункты из старого анализа в этапы диздока; старый файл анализа удалён.
- 2025‑12‑13 (codex): исправлена ссылка “см. раздел …”, добавлены разделы про решения/риски и ведение журнала.
- 2025‑12‑13 (codex): добавлена таблица миграции `hint* → lifeline*`, предложена явная модель `GameState` (v0), зафиксированы решения: `takeMoney`=action в `PrizeLadderPanel`, `glare`=CSS‑примитив, `systemStrings`=часть `GameConfig`.
- 2025‑12‑13 (codex): старт реализации: `refactoring` синхронизирован с `main` (Sky‑CotL), поправлен тест `GameSelector`.
- 2025‑12‑13 (codex): ✅ Этап 1: введены `LifelineKind/LifelineResult/RewardKind`, добавлены алиасы `hint* → lifeline*` (types + audio), `GameScreen` переведён на новые ключи SFX и новые имена (с fallback на старые строки/иконки/ключи).
- 2025‑12‑13 (codex): ✅ Этап 2: введён `GameRegistry` (routes + карточки), `App.tsx` и `GameSelector` переведены на registry; per‑game `*Page.tsx` удалены; devOnly ссылки скрыты вне `import.meta.env.DEV`.
- 2025‑12‑13 (codex): ✅ Этап 3: введены панели (`QuestionPanel`, `AnswersPanel`, `LifelinesPanel`, `PrizeLadderPanel`, `LifelineResultPanel`), добавлены `CampaignSelectionPanel` + `CampaignCard`, `takeMoney` переехал в низ `PrizeLadderPanel`, `EndScreen` переведён на `ResultPanel(variant)`.
- 2025‑12‑13 (codex): ✅ Этап 4: `LifelinePhonePanel` и `LifelineAudiencePanel` вынесены в отдельные компоненты, анимация и общий механизм показа результата lifeline перенесены в `LifelineResultPanel`; Transformers активирован в `GameRegistry`.
- 2025‑12‑13 (codex): ✅ Этап 5: аудио разделено на `useMusicPlayer` и `useSoundPlayer` (`src/engine/audio/*`), `useAudio` стал фасадом, `playCampaignSelectSound` реализован как tagged‑sound с мгновенной остановкой, алиасы `hint* → lifeline*` сохранены.
- 2025‑12‑13 (codex): ✅ Этап 6: добавлен `src/engine/assets/paths.ts` (единый `getBasePath`), `AssetLoader.loadManifest()` стал устойчивым к отсутствующему `asset-manifest.json`, `scripts/generate-asset-manifest.js` создаёт `public/` при необходимости.
- 2025‑12‑13 (codex): ✅ Этап 7: `shine`‑нейминг заменён на `glare` (CSS‑примитив + кастом‑проперти), `src/styles/shine.css` → `src/styles/glare.css`, стили разнесены по `@layer`, удалён неиспользуемый шрифт `Aeromatics NC`.
- 2025‑12‑13 (codex): ✅ Этап 8: игры переведены на структуру `src/games/<gameId>/campaigns/<campaignId>/*` (campaign/theme/questions); Transformers `questions.ts` разбит на 3 кампании, конфиги переведены на импорт из campaign‑модулей; `npm test/lint/build` зелёные.
- 2025‑12‑13 (codex): ✅ Этап 8.5: удалён `docs/ENGINE_PLAN.md`, `Panel/PanelHeader` перенесены в `src/engine/ui/components/panel/*` (убран дубль `engine/components/ui`), исправлен press‑`glare` (hover не перекрывает `:active`), campaign cards получили одинаковую ширину по самой широкой карточке.
- 2025‑12‑13 (codex): ✅ Этап 9: UI‑слой полностью перенесён в `src/engine/ui/**` (screens/panels/layout/effects/icons/theme/hooks), удалены `src/engine/components|context|hooks`, обновлены импорты/`src/engine/index.ts`; `npm test/lint/build` зелёные.
- 2025‑12‑13 (codex): Этап 10 (частично): начат вынос доменной логики в `src/engine/game/**` (questions/prizes), `useGameState` переведён на импорт из `engine/game`.
- 2025‑12‑13 (codex): ✅ Этап 10: добавлены `src/engine/game/state/**` (machine/reducer/selectors) и `src/engine/game/session/**`, `useGameState` переведён на `useReducer(gameReducer)`, доменная логика questions/prizes/lifelines вынесена в `engine/game/**`; тайминги привязаны к `ANSWER_REVEAL_DURATION_MS`; press‑`glare-left` восстановлен.
- 2025‑12‑13 (codex): ✅ Этап 11: добавлены `src/engine/ui/components/buttons/*` (Action/Answer/Lifeline/Volume + BaseButton) и общий pointer‑capture FSM (`Appear/Idle/Hover/Press/Ease/Activate/Disappear`), панели переведены на компоненты, `glare` поддерживает `data-btn-state`.
- 2025‑12‑13 (codex): Этап 12 (частично): `HeaderPanel` вынесен в общий layout (`src/engine/ui/MillionaireGame.tsx`), удалены дубли из `StartScreen/GameScreen/EndScreen`, screen-transition класс поднят на layout (header не размонтируется при смене экранов).
- 2025‑12‑13 (codex): UI polish: CampaignCard — фиксированный размер, без `glare`, выбранная кампания приподнимается и подсвечивается glow/rays‑эффектом; иконки приведены к единому контракту `CampaignIconProps`.
- 2025‑12‑14 (codex): диздок: Этап 12 помечен как отложенный и перенесён в конец списка этапов.
- 2025‑12‑14 (codex): Этап 13 (начало): добавлены доменные типы/действия для `host/switch/double`, `double` поддерживает “один промах” (`retry`), UI показывает кнопки/оверлеи для новых lifeline’ов (если они включены в `GameConfig.lifelines`).
- 2025‑12‑14 (codex): Этап 13 (продолжение): `GameConfig.lifelines` переведён на v2 ключи (`fifty/phone/audience`), `takeMoney` перенесён в `GameConfig.actions.takeMoney`, `strings` переведены на `lifeline*` поля, в играх обновлены `audio.sounds` на `lifeline*`/`takeMoneyButton`; добавлены доменные утилиты `getHostSuggestion`/`pickSwitchQuestionIndex` и unit‑тесты `src/engine/game/state/lifelines.v1.test.ts` (npm test/lint/build зелёные).
- 2025‑12‑14 (codex): ✅ Этап 14: стили переехали в `src/engine/ui/styles/*` и подключаются самим engine (`src/engine/index.ts`), все engine‑классы/примитивы scoped под `.engine` (минимум конфликтов при встраивании); `src/styles/` больше не используется (пустая), `.DS_Store` уже игнорируется `.gitignore` (tracked файлов нет), `npm test/lint/build` зелёные.
- 2025‑12‑14 (codex): ✅ Этап 15: добавлены быстрые unit‑тесты домена для `state/machine`, `state/reducer`, `state/selectors`, `lifelines` и `prizes` (без React), `npm test/lint/build` зелёные.
- 2025‑12‑14 (codex): ✅ Этап 16: `src/engine/index.ts` сужен до минимального публичного API (основные компоненты/хуки/иконки/константы), убраны случайные реэкспорты низкоуровневых `utils/audioPlayer` и `engine/game/*`.
- 2025‑12‑14 (codex): фикс SFX: `useSoundPlayer.playSoundEffect()` теперь резолвит `lifeline*`/`takeMoneyButton` и корректно фолбэчится на legacy `hint*` **только если** v2 ключ отсутствует (исправляет проигрывание кастомных звуков в BG3/Transformers).
