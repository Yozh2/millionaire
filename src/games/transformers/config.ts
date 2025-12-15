/**
 * Transformers Game Configuration
 *
 * Quiz game based on The Transformers comics:
 * - Megatron: Origin (Мегатрон — Восхождение)
 * - Autocracy (Автократия)
 * - Skybound (Земля)
 */

import { GameConfig, DrawCoinFunction } from '../../engine/types';
import { megatronCampaign } from './campaigns/megatron/campaign';
import { autocracyCampaign } from './campaigns/autocracy/campaign';
import { skyboundCampaign } from './campaigns/skybound/campaign';
import { megatronQuestionPool } from './campaigns/megatron/questions';
import { autocracyQuestionPool } from './campaigns/autocracy/questions';
import { skyboundQuestionPool } from './campaigns/skybound/questions';
import { MatrixIcon, BrokenSparkIcon, EnergonIcon, EnergonCoinIcon } from './icons';
import { gameRegistry } from './registry';

// ============================================
// Custom Energon Crystal Drawing - simple pink/blue crystal
// ============================================

const drawEnergonCrystal: DrawCoinFunction = (ctx, size, colorIndex) => {
  const colors = ['#FF69B4', '#00BFFF', '#DA70D6']; // Pink, Blue, Orchid
  const glowColors = ['#FFB6C1', '#87CEEB', '#DDA0DD'];

  const halfSize = size / 2;

  // Simple diamond/crystal shape
  ctx.beginPath();
  ctx.moveTo(0, -halfSize);           // Top
  ctx.lineTo(halfSize * 0.6, 0);      // Right
  ctx.lineTo(0, halfSize);            // Bottom
  ctx.lineTo(-halfSize * 0.6, 0);     // Left
  ctx.closePath();

  ctx.fillStyle = colors[colorIndex % colors.length];
  ctx.fill();
  ctx.strokeStyle = glowColors[colorIndex % glowColors.length];
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

// ============================================
// Main Config
// ============================================

export const transformersConfig: GameConfig = {
  id: 'transformers',

  title: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  subtitle: 'THE TRANSFORMERS EDITION',

  emoji: '🤖',
  registry: gameRegistry,

  // Neuropol X RG — футуристический технологичный шрифт
  fontFamily: '"Neuropol X Rg", "Roboto", "Helvetica Neue", sans-serif',

  campaigns: [megatronCampaign, autocracyCampaign, skyboundCampaign],

  questionPools: {
    megatron: megatronQuestionPool,
    autocracy: autocracyQuestionPool,
    skybound: skyboundQuestionPool,
  },

  companions: [
    { id: 'optimusprime', name: 'Оптимус Прайм', desc: 'Optimus Prime', meta: 'G1 s1', voiceFile: 'Optimus.ogg' },
    { id: 'bumblebee', name: 'Шершень', desc: 'Bumblebee', meta: 'G1 s1', voiceFile: 'Bumblebee.ogg' },
    { id: 'wheeljack', name: 'Гонщик', desc: 'Wheeljack', meta: 'G1 s1' },
    { id: 'trailbreaker', name: 'Следопыт', desc: 'Trailbreaker', meta: 'G1 s1' },
    { id: 'ironhide', name: 'Броневик', desc: 'Ironhide', meta: 'G1 s1', voiceFile: 'Ironhide.ogg'  },
    { id: 'ratchet', name: 'Храповик', desc: 'Ratchet', meta: 'G1 s1' },
    { id: 'mirage', name: 'Мираж', desc: 'Mirage', meta: 'G1 s1' },
    { id: 'prowl', name: 'Сышик', desc: 'Prowl', meta: 'G1 s1' },
    { id: 'bluestreak', name: 'Молневик', desc: 'Bluestreak', meta: 'G1 s1' },
    { id: 'jazz', name: 'Джаз', desc: 'Jazz', meta: 'G1 s1' },
    { id: 'sideswipe', name: 'Апперкот', desc: 'Sideswipe', meta: 'G1 s1' },
    { id: 'sunstreaker', name: 'Мерцатель', desc: 'Sunstreaker', meta: 'G1 s1' },
    { id: 'windcharger', name: 'Разрядник', desc: 'Windcharger', meta: 'G1 s1' },
    { id: 'brown', name: 'Силач', desc: 'Brown', meta: 'G1 s1' },
    { id: 'huffer', name: 'Нытик', desc: 'Huffer', meta: 'G1 s1' },
    { id: 'gears', name: 'Привод', desc: 'Gears', meta: 'G1 s1' },
    { id: 'cliffjumper', name: 'Скалолаз', desc: 'Cliffjumper', meta: 'G1 s1' },
    { id: 'hound', name: 'Охотник', desc: 'Hound', meta: 'G1 s1' },
    { id: 'houler', name: 'Большегруз', desc: 'Houler', meta: 'G1 s1' },
    { id: 'jetfire', name: 'Истребитель', desc: 'Jetfire / Skyfire', meta: 'G1 s1' },
    { id: 'grimlock', name: 'Смельчак', desc: 'Grimlock', meta: 'G1 s1' }, // Dinobot
    { id: 'slag', name: 'Сладж', desc: 'Slag', meta: 'G1 s1' }, // Dinobot
    { id: 'swoop', name: 'Свуп', desc: 'Swoop', meta: 'G1 s1' }, // Dinobot
    { id: 'snarl', name: 'Снорл', desc: 'Snarl', meta: 'G1 s1' }, // Dinobot
    { id: 'sludge', name: 'Сладж', desc: 'Sludge', meta: 'G1 s1' }, // Dinobot
    { id: 'orionpax', name: 'Орион Мирный', desc: 'Orion Pax', meta: 'G1 s2' },
    { id: 'dion', name: 'Дион', desc: 'Dion', meta: 'G1 s2' },
    { id: 'ariel', name: 'Ариэль', desc: 'Ariel', meta: 'G1 s2' },
    { id: 'alphatrion', name: 'Альфа Трион', desc: 'Alpha Trion', meta: 'G1 s2' },
    { id: 'perceptor', name: 'Микроскоп', desc: 'Perceptor', meta: 'G1 s2' },
    { id: 'skids', name: 'Скидз', desc: 'Skids', meta: 'G1 s2' },
    { id: 'tracks', name: 'Крах', desc: 'Tracks', meta: 'G1 s2' },
    { id: 'blaster', name: 'Бластер', desc: 'Blaster', meta: 'G1 s2' },
    { id: 'hoist', name: 'Тягач', desc: 'Hoist', meta: 'G1 s2' },
    { id: 'grapple', name: 'Гранит', desc: 'Grapple', meta: 'G1 s2' },
    { id: 'redalert', name: 'Паникёр', desc: 'Red Alert', meta: 'G1 s2' },
    { id: 'inferno', name: 'Водомёт', desc: 'Inferno', meta: 'G1 s2' },
    { id: 'smokescreen', name: 'Дымовик', desc: 'Smokescreen', meta: 'G1 s2' },
    { id: 'warpath', name: 'Томагавк', desc: 'Warpath', meta: 'G1 s2' },
    { id: 'beachcomber', name: 'Шезлонг', desc: 'Beachcomber', meta: 'G1 s2' },
    { id: 'seaspray', name: 'Спасатель', desc: 'Seaspray', meta: 'G1 s2' },
    { id: 'powerglide', name: 'Ветрорез', desc: 'Powerglide', meta: 'G1 s2' },
    { id: 'cosmos', name: 'Космос', desc: 'Cosmos', meta: 'G1 s2' },
    { id: 'omegasupreme', name: 'Омегатор / Омега Сюприм', desc: 'Omega Supreme', meta: 'G1 s2' },
    { id: 'autobotx', name: 'Автобот Икс', desc: 'Autobot X', meta: 'G1 s2' },
    { id: 'devcon', name: 'Пистон', desc: 'Devcon', meta: 'G1 s2' },
    { id: 'elitaone', name: 'Элита', desc: 'Elita-One', meta: 'G1 s2' },
    { id: 'moonracer', name: 'Медея', desc: 'Moonracer', meta: 'G1 s2' },
    { id: 'firestar', name: 'Звезда', desc: 'Firestar', meta: 'G1 s2' },
    { id: 'chromie', name: 'Хромия', desc: 'Chromie', meta: 'G1 s2' },
    { id: 'silverbolt', name: 'Сильверболт', desc: 'Silverbolt', meta: 'G1 s2' }, // Aerialbot
    { id: 'slingshot', name: 'Рогатка', desc: 'Slingshot', meta: 'G1 s2' }, // Aerialbot
    { id: 'fireflight', name: 'Огнемёт', desc: 'Fireflight', meta: 'G1 s2' }, // Aerialbot
    { id: 'airraid', name: 'Налётчик', desc: 'Air Raid', meta: 'G1 s2' }, // Aerialbot
    { id: 'skydive', name: 'Пикировщик', desc: 'Skydive', meta: 'G1 s2' }, // Aerialbot
    { id: 'superion', name: 'Суперион', desc: 'Superion', meta: 'G1 s2' }, // Aerialbot
    { id: 'hotspot', name: 'Компот', desc: 'Hot Spot', meta: 'G1 s2' }, // Protectobot
    { id: 'streetwise', name: 'Пролаза', desc: 'Streetwise', meta: 'G1 s2' }, // Protectobot
    { id: 'groove', name: 'Друг', desc: 'Groove', meta: 'G1 s2' }, // Protectobot
    { id: 'firstaid', name: 'Верстак / Санитар', desc: 'First Aid', meta: 'G1 s2' }, // Protectobot
    { id: 'blades', name: 'Порез', desc: 'Blades', meta: 'G1 s2' }, // Protectobot
    { id: 'defensor', name: 'Детектор', desc: 'Defensor', meta: 'G1 s2' }, // Protectobot
    { id: 'hotrod', name: 'Патрон', desc: 'Hot Rod', meta: 'G1 s3' },
    { id: 'rodimusprime', name: 'Радаймес Прайм', desc: 'Rodimus Prime', meta: 'G1 s3' },
    { id: 'ultramagnus', name: 'Ультра Магнус', desc: 'Ultra Magnus', meta: 'G1 s3' },
    { id: 'kup', name: 'Ворчун', desc: 'Kup', meta: 'G1 s3' },
    { id: 'arcee', name: 'Арси', desc: 'Arcee', meta: 'G1 s3' },
    { id: 'blurr', name: 'Блэр', desc: 'Blurr', meta: 'G1 s3' },
    { id: 'wheelie', name: 'Вили', desc: 'Wheelie', meta: 'G1 s3' },
    { id: 'outback', name: 'Дикарь', desc: 'Outback', meta: 'G1 s3' },
    { id: 'pipes', name: 'Гудок', desc: 'Pipes', meta: 'G1 s3' },
    { id: 'tailgate', name: 'Тэйлгейт', desc: 'Tailgate', meta: 'G1 s3' },
    { id: 'swerve', name: 'Сверв', desc: 'Swerve', meta: 'G1 s3' },
    { id: 'steeljaw', name: 'Стальной', desc: 'Steeljaw', meta: 'G1 s3' },
    { id: 'ramhorn', name: 'Бодун', desc: 'Ramhorn', meta: 'G1 s3' },
    { id: 'rewind', name: 'Реверс', desc: 'Rewind', meta: 'G1 s3' },
    { id: 'eject', name: 'Эффект', desc: 'Eject', meta: 'G1 s3' },
    { id: 'skylynx', name: 'Бравый', desc: 'Sky Lynx', meta: 'G1 s3' },
    { id: 'beta', name: 'Бета', desc: 'Beta', meta: 'G1 s3' },
    { id: 'metroplex', name: 'Метроплекс', desc: 'Metroplex', meta: 'G1 s3' },
    { id: 'sixgun', name: 'Шестизарядник', desc: 'Six-Gun', meta: 'G1 s3' },
    { id: 'slammer', name: 'Слеммер', desc: 'Slammer', meta: 'G1 s3' },
    { id: 'scomper', name: 'Скомпер', desc: 'Scomper', meta: 'G1 s3' },
    { id: 'wreckgor', name: 'Ремонтник / Мусорщик', desc: 'Wreck-Gor', meta: 'G1 s3' },
    { id: 'springer', name: 'Спринтер', desc: 'Springer', meta: 'G1 s3' }, // Triple Changer
    { id: 'sandstorm', name: 'Затвор', desc: 'Sandstorm', meta: 'G1 s3' }, // Triple Changer
    { id: 'broadside', name: 'Крутой', desc: 'Broadside', meta: 'G1 s3' }, // Triple Changer
    { id: 'goldbug', name: 'Золотой Гигант', desc: 'Goldbug', meta: 'G1 s3' }, // Throttlebot
    { id: 'rollbar', name: 'Рулевой', desc: 'Rollbar', meta: 'G1 s3' }, // Throttlebot
    { id: 'searchlight', name: 'Сёрчлайт', desc: 'Searchlight', meta: 'G1 s3' }, // Throttlebot
    { id: 'freeway', name: 'Фривей', desc: 'Freeway', meta: 'G1 s3' }, // Throttlebot
    { id: 'chase', name: 'Чейз', desc: 'Chase', meta: 'G1 s3' }, // Throttlebot
    { id: 'wideload', name: 'Вайдлоад', desc: 'Wideload', meta: 'G1 s3' }, // Throttlebot
    { id: 'scattershot', name: 'Револьвер', desc: 'Scattershot', meta: 'G1 s3' }, // Technobot
    { id: 'nosecone', name: 'Косинус', desc: 'Nosecone', meta: 'G1 s3' }, // Technobot
    { id: 'strafe', name: 'Штраф', desc: 'Strafe', meta: 'G1 s3' }, // Technobot
    { id: 'afterburner', name: 'Астрофакел', desc: 'Afterburner', meta: 'G1 s3' }, // Technobot
    { id: 'lightspeed', name: 'Световик', desc: 'Lightspeed', meta: 'G1 s3' }, // Technobot
    { id: 'computron', name: 'Компьютрон', desc: 'Computron', meta: 'G1 s3' }, // Technobot
    { id: 'megatron', name: 'Мегатрон', desc: 'Megatron', meta: 'G1 s1', voiceFile: 'Megatron.ogg' },
    { id: 'starscream', name: 'Скандалист', desc: 'Starscream', meta: 'G1 s1' },
    { id: 'thundercracker', name: 'Громовержец', desc: 'Thundercracker', meta: 'G1 s1' },
    { id: 'skyformer', name: 'Деформер', desc: 'Skyformer', meta: 'G1 s1' },
    { id: 'skywarp', name: 'Дирдж', desc: 'Skywarp', meta: 'G1 s1' },
    { id: 'soundwave', name: 'Бархан', desc: 'Soundwave', meta: 'G1 s1' },
    { id: 'laserbeak', name: 'Лазерник', desc: 'Laserbeak', meta: 'G1 s1' },
    { id: 'ravage', name: 'Грабитель', desc: 'Ravage', meta: 'G1 s1' },
    { id: 'rumble', name: 'Громила', desc: 'Rumble', meta: 'G1 s1' },
    { id: 'frenzy', name: 'Дикий', desc: 'Frenzy', meta: 'G1 s1' },
    { id: 'reflector', name: 'Рефлектор', desc: 'Reflector', meta: 'G1 s1' },
    { id: 'shockwave', name: 'Взрывала', desc: 'Shockwave', meta: 'G1 s1' },
    { id: 'shrapnel', name: 'Шрапнель', desc: 'Shrapnel', meta: 'G1 s1' }, // Insecticon
    { id: 'bombshell', name: 'Бомбомёт', desc: 'Bombshell', meta: 'G1 s1' }, // Insecticon
    { id: 'kickback', name: 'Прыгун', desc: 'Kickback', meta: 'G1 s1' }, // Insecticon
    { id: 'scrapper', name: 'Скребок', desc: 'Scrapper', meta: 'G1 s1' }, // Constructicon
    { id: 'scavenger', name: 'Мусорщик', desc: 'Scavenger', meta: 'G1 s1' }, // Constructicon
    { id: 'mixmaster', name: 'Смеситель', desc: 'Mixmaster', meta: 'G1 s1' }, // Constructicon
    { id: 'longhaul', name: 'Большегруз', desc: 'Long Haul', meta: 'G1 s1' }, // Constructicon
    { id: 'bonecrusher', name: 'Бульдозер', desc: 'Bonecrusher', meta: 'G1 s1' }, // Constructicon
    { id: 'hook', name: 'Ковш', desc: 'Hook', meta: 'G1 s1' }, // Constructicon
    { id: 'devastator', name: 'Разрушитель', desc: 'Devastator', meta: 'G1 s1' }, // Constructicon
    { id: 'thrust', name: 'Колун', desc: 'Thrust', meta: 'G1 s2' },
    { id: 'ramjet', name: 'Ревун', desc: 'Ramjet', meta: 'G1 s2' },
    { id: 'dirge', name: 'Смерть / Тупик', desc: 'Dirge', meta: 'G1 s2' },
    { id: 'buzzsaw', name: 'Лобзик', desc: 'Buzzsaw', meta: 'G1 s2' },
    { id: 'nightbird', name: 'Голубка', desc: 'Nightbird', meta: 'G1 s2' },
    { id: 'blitzwing', name: 'Разряд', desc: 'Blitzwing', meta: 'G1 s2' }, // Triple Changer
    { id: 'astrotrain', name: 'Астропоезд', desc: 'Astrotrain', meta: 'G1 s2' }, // Triple Changer
    { id: 'motormaster', name: 'Мотомастер', desc: 'Motormaster', meta: 'G1 s2' }, // Stunticon
    { id: 'deadend', name: 'Чёрт / Тупик', desc: 'Dead End', meta: 'G1 s2' }, // Stunticon
    { id: 'breakdown', name: 'Крушитель', desc: 'Breakdown', meta: 'G1 s2' }, // Stunticon
    { id: 'dragstrip', name: 'Ручник', desc: 'Drag Strip', meta: 'G1 s2' }, // Stunticon
    { id: 'wildrider', name: 'Безумец', desc: 'Wildrider', meta: 'G1 s2' }, // Stunticon
    { id: 'menasor', name: 'Мегазавр', desc: 'Menasor', meta: 'G1 s2' }, // Stunticon
    { id: 'onslaught', name: 'Осилок', desc: 'Onslaught', meta: 'G1 s2' }, // Combaticon
    { id: 'brawl', name: 'Гром', desc: 'Brawl', meta: 'G1 s2' }, // Combaticon
    { id: 'swindle', name: 'Фингал', desc: 'Swindle', meta: 'G1 s2' }, // Combaticon
    { id: 'blastoff', name: 'Взрыв', desc: 'Blast Off', meta: 'G1 s2' }, // Combaticon
    { id: 'vortex', name: 'Вихрь', desc: 'Vortex', meta: 'G1 s2' }, // Combaticon
    { id: 'bruticus', name: 'Грубикус', desc: 'Bruticus', meta: 'G1 s2' }, // Combaticon
    { id: 'galvatron', name: 'Гальватрон', desc: 'Galvatron', meta: 'G1 s3' },
    { id: 'cyclonus', name: 'Циклон', desc: 'Cyclonus', meta: 'G1 s3' },
    { id: 'scourge', name: 'Кнут / Шрам / Прилипала', desc: 'Scourge', meta: 'G1 s3' },
    { id: 'sweep', name: 'Свип', desc: 'Sweep', meta: 'G1 s3' },
    { id: 'ratbot', name: 'Крысак', desc: 'Ratbot', meta: 'G1 s3' },
    { id: 'overkill', name: 'Оверкилл', desc: 'Overkill', meta: 'G1 s3' },
    { id: 'slugfest', name: 'Слагфест', desc: 'Slugfest', meta: 'G1 s3' },
    { id: 'unicron', name: 'Юникрон', desc: 'Unicron', meta: 'G1 s3' },
    { id: 'sharkticon', name: 'Жуликон', desc: 'Sharkticon', meta: 'G1 s3' },
    { id: 'runamuck', name: 'Ранамак', desc: 'Runamuck', meta: 'G1 s3' },
    { id: 'runabout', name: 'Ранэбаут', desc: 'Runabout', meta: 'G1 s3' },
    { id: 'trypticon', name: 'Триптикон', desc: 'Trypticon', meta: 'G1 s3' },
    { id: 'octane', name: 'Октан', desc: 'Octane', meta: 'G1 s3' }, // Triple Changer
    { id: 'hungurrr', name: 'Голод', desc: 'Hun-Gurrr', meta: 'G1 s3' }, // Terrorcon
    { id: 'rippersnapper', name: 'Громкоголосый', desc: 'Rippersnapper', meta: 'G1 s3' }, // Terrorcon
    { id: 'blot', name: 'Блот', desc: 'Blot', meta: 'G1 s3' }, // Terrorcon
    { id: 'sinnertwin', name: 'Синнертвин', desc: 'Sinnertwin', meta: 'G1 s3' }, // Terrorcon
    { id: 'cutthroat', name: 'Каттроут', desc: 'Cutthroat', meta: 'G1 s3' }, // Terrorcon
    { id: 'abominus', name: 'Абломиус', desc: 'Abominus', meta: 'G1 s3' }, // Terrorcon
    { id: 'razorclaw', name: 'Резокло', desc: 'Razorclaw', meta: 'G1 s3' }, // Predacon
    { id: 'headstrong', name: 'Прятолоб', desc: 'Headstrong', meta: 'G1 s3' }, // Predacon
    { id: 'tantrum', name: 'Буйвол', desc: 'Tantrum', meta: 'G1 s3' }, // Predacon
    { id: 'divebomb', name: 'Перевал', desc: 'Divebomb', meta: 'G1 s3' }, // Predacon
    { id: 'predaking', name: 'Вредитель Король', desc: 'Predaking', meta: 'G1 s3' }, // Predacon
  ],

  strings: {
    introText:
      'Проверь свои знания о вселенной Трансформеров! Ответь на вопросы и заполучи весь энергон!',
    selectPath: 'ВЫБЕРИ КОМИКС',
    startButton: 'ПОКАТИЛИ',

    questionHeader: '#{n}',

    lifelinesHeader: 'ПОДСКАЗКИ',
    prizesHeader: 'ЭНЕРГОН',

    lifelinePhoneHeader: 'СВЯЗЬ С БАЗОЙ',
    lifelineAudienceHeader: 'СОВЕТ ОТРЯДА',
    lifelineSenderLabel: 'Сообщение от:',
    lifelineAudienceLabel: 'Отряд считает:',

    companionPhrases: {
      confident: [
        'Мои сенсоры не ошибаются — это "{answer}"',
        'Автоботы, вперёд! Ответ: "{answer}"',
        'Матрица подсказывает — "{answer}"',
        'Я сканировал все данные. Это "{answer}"',
        'Трансформируйся и побеждай! Ответ — "{answer}"',
        'Энергонные трассы ведут к "{answer}"',
        'Телеметрия ТелеТраана-1 подтверждает "{answer}"',
        'Даже Мегатрон признал бы "{answer}"',
        'Мой анализ ясен: "{answer}"',
        'Сигналы указывают на "{answer}"',
        'Я оптимизирован для этой задачи — ответ "{answer}"',
        'Моя искра говорит мне, что это "{answer}"',
        'Все системы в норме — ответ "{answer}"',
        'Это очевидно — "{answer}"',
        'Мои вычисления показывают "{answer}"',
      ],
      uncertain: [
        'Мой процессор тормозит, но думаю "{answer}"',
        'Сигнал слабый... Возможно, "{answer}"',
        'Данные повреждены, предполагаю "{answer}"',
        'Сканеры дрейфуют — предположу "{answer}"',
        'Если довериться искре, то "{answer}"',
        'Мои анализы не точны, но может быть "{answer}"',
        'Это не идеально, но я бы сказал "{answer}"',
        'Мои сенсоры сбиты помехами, но возможно "{answer}"',
        'Я не уверен, но склоняюсь к "{answer}"',
        'Моя логика запутана, но может быть "{answer}"',
        'Это лишь гипотеза, но возможно "{answer}"',
        'Мои данные фрагментированы, но думаю "{answer}"',
        'Я не могу это подтвердить, но "{answer}"',
        'Это всего лишь предположение, но "{answer}"',
      ],
    },

    wonTitle: '⚡ ПОБЕДА! ⚡',
    wonText: 'Ты достоин нести Матрицу Лидерства!',
    wonHeader: 'ТРИУМФ',

    lostTitle: 'ПОРАЖЕНИЕ',
    lostText: 'Твоя искра погасла...',
    lostHeader: 'УНИЧТОЖЕН',
    correctAnswerLabel: 'Правильный ответ:',

    tookMoneyTitle: 'ЭНЕРГОН СОБРАН',
    tookMoneyText: 'Мудрое решение — сохранить ресурсы!',
    tookMoneyHeader: 'ОТСТУПЛЕНИЕ',

    newGameButton: 'ТРАНСФОРМАЦИЯ',

    footer: '⚡ Till All Are One ⚡',

    musicOn: 'Выкл. музыку',
    musicOff: 'Вкл. музыку',
  },

  lifelines: {
    fifty: { name: '50:50', icon: '⚡', enabled: true },
    phone: { name: 'База', icon: '📡', enabled: true },
    audience: { name: 'Отряд', icon: '🤖', enabled: true },
    double: { name: 'Право на ошибку', icon: '🎯', enabled: true },
  },

  actions: {
    takeMoney: { name: 'Забрать', icon: '🔮', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: 'энергона',
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: {
    musicVolume: 0.3,
    soundVolume: 1.0,
    voiceVolume: 1.0,
    mainMenuTrack: 'MainMenu.ogg',
    gameOverTrack: 'GameOver.ogg',
    victoryTrack: 'Victory.ogg',
    takeMoneyTrack: 'TookMoney.ogg',
    sounds: {
      answerButton: 'AnswerClick.ogg',
      actionButton: 'BigButtonPress.ogg',
      lifelineFifty: 'HintReduce.ogg',
      lifelinePhone: 'HintCall.ogg',
      lifelineAudience: 'HintVote.ogg',
      correct: 'Next.ogg',
      defeat: 'Fail.ogg',
    },
  },

  endIcons: {
    won: MatrixIcon,
    lost: BrokenSparkIcon,
    tookMoney: EnergonIcon,
  },

  // Small energon crystal for prize display
  icons: {
    coin: EnergonCoinIcon,
  },

  // Energon crystals instead of coins
  drawCoinParticle: drawEnergonCrystal,

  // Enable lost spark effect on defeat screen
  enableLostSparks: true,

  // Lost spark particle colors (cyan/blue spark fragments)
  lostSparkColors: ['#00BFFF', '#87CEEB', '#00CED1', '#1E90FF'],
};

export default transformersConfig;
