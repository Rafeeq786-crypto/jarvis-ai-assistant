// JARVIS Rule-Based Response Engine

const GREETINGS: Record<string, string> = {
  en: "Good day. I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. All systems are online and ready to assist you.",
  es: "Buenos días. Soy J.A.R.V.I.S. — Un Sistema Muy Inteligente. Todos los sistemas están en línea y listos para asistirle.",
  fr: "Bonjour. Je suis J.A.R.V.I.S. — Juste Un Système Vraiment Très Intelligent. Tous les systèmes sont en ligne et prêts à vous assister.",
  de: "Guten Tag. Ich bin J.A.R.V.I.S. — Ein Sehr Intelligentes System. Alle Systeme sind online und bereit, Ihnen zu helfen.",
  it: "Buongiorno. Sono J.A.R.V.I.S. — Un Sistema Molto Intelligente. Tutti i sistemi sono online e pronti ad assisterla.",
  pt: "Bom dia. Sou J.A.R.V.I.S. — Um Sistema Muito Inteligente. Todos os sistemas estão online e prontos para auxiliá-lo.",
  ja: "こんにちは。私はJ.A.R.V.I.S.です。非常に高度なインテリジェントシステムです。すべてのシステムがオンラインで、あなたをサポートする準備ができています。",
  zh: "您好。我是J.A.R.V.I.S.——一个非常智能的系统。所有系统均已在线，随时准备为您提供协助。",
  ko: "안녕하세요. 저는 J.A.R.V.I.S.입니다 — 매우 지능적인 시스템입니다. 모든 시스템이 온라인 상태이며 도움을 드릴 준비가 되어 있습니다.",
  ar: "مرحباً. أنا J.A.R.V.I.S. — نظام ذكي متطور. جميع الأنظمة في وضع الإنترنت وجاهزة لمساعدتك.",
  ru: "Добрый день. Я J.A.R.V.I.S. — Очень Умная Интеллектуальная Система. Все системы в сети и готовы к работе.",
  nl: "Goedemiddag. Ik ben J.A.R.V.I.S. — Een Zeer Intelligent Systeem. Alle systemen zijn online en klaar om u te helpen.",
  pl: "Dzień dobry. Jestem J.A.R.V.I.S. — Bardzo Inteligentnym Systemem. Wszystkie systemy są online i gotowe do pomocy.",
  hi: "नमस्ते। मैं J.A.R.V.I.S. हूं — एक बहुत ही बुद्धिमान प्रणाली। सभी सिस्टम ऑनलाइन हैं और आपकी सहायता के लिए तैयार हैं।",
  tr: "Merhaba. Ben J.A.R.V.I.S. — Çok Akıllı Bir Sistem. Tüm sistemler çevrimiçi ve size yardım etmeye hazır.",
};

export function getGreeting(lang: string): string {
  const code = lang.split("-")[0].toLowerCase();
  return GREETINGS[code] ?? GREETINGS.en;
}

function getLangCode(lang: string): string {
  return lang.split("-")[0].toLowerCase();
}

function evaluateMath(expr: string): string | null {
  const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, "").trim();
  if (!sanitized) return null;
  try {
    const result = new Function(`"use strict"; return (${sanitized})`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return String(Math.round(result * 1e10) / 1e10);
    }
  } catch {
    // ignore
  }
  return null;
}

interface ResponseRule {
  patterns: RegExp[];
  response: (match: RegExpMatchArray | null, lang: string) => string;
}

const RULES: ResponseRule[] = [
  // Greetings
  {
    patterns: [
      /\b(hello|hi|hey|howdy|greetings|sup|yo)\b/i,
      /\b(bonjour|salut|bonsoir)\b/i,
      /\b(hola|buenos dias|buenas|saludos)\b/i,
      /\b(guten tag|hallo|guten morgen)\b/i,
      /\b(ciao|salve|buongiorno)\b/i,
      /\b(привет|здравствуйте|добрый)\b/i,
      /\b(こんにちは|おはよう|こんばんは)/,
      /\b(你好|您好|早上好)/,
      /\b(안녕|안녕하세요)/,
      /مرحبا|السلام/,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "Hello. All systems are operational. How may I assist you today?",
        es: "Hola. Todos los sistemas están operativos. ¿En qué puedo ayudarle?",
        fr: "Bonjour. Tous les systèmes sont opérationnels. Comment puis-je vous aider?",
        de: "Hallo. Alle Systeme sind betriebsbereit. Wie kann ich Ihnen helfen?",
        it: "Ciao. Tutti i sistemi sono operativi. Come posso aiutarla?",
        pt: "Olá. Todos os sistemas estão operacionais. Como posso ajudá-lo?",
        ja: "こんにちは。すべてのシステムは正常に動作しています。どのようにお手伝いできますか？",
        zh: "您好。所有系统运行正常。请问有什么我可以帮助您的？",
        ko: "안녕하세요. 모든 시스템이 정상 작동 중입니다. 어떻게 도와드릴까요?",
        ar: "مرحباً. جميع الأنظمة تعمل بشكل طبيعي. كيف يمكنني مساعدتك؟",
        ru: "Привет. Все системы работают нормально. Как я могу вам помочь?",
      };
      return responses[code] ?? responses.en;
    },
  },
  // Time queries
  {
    patterns: [
      /\b(time|hora|heure|uhrzeit|orario|время|時間|时间|시간|الوقت)\b/i,
    ],
    response: (_m, lang) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const code = getLangCode(lang);
      const templates: Record<string, string> = {
        en: `Current time: ${timeStr}. All chronometric systems synchronized.`,
        es: `Hora actual: ${timeStr}. Todos los sistemas cronométricos sincronizados.`,
        fr: `Heure actuelle: ${timeStr}. Tous les systèmes chronométriques synchronisés.`,
        de: `Aktuelle Zeit: ${timeStr}. Alle chronometrischen Systeme synchronisiert.`,
        it: `Ora attuale: ${timeStr}. Tutti i sistemi cronometrici sincronizzati.`,
        ja: `現在の時刻は${timeStr}です。すべての時計システムが同期されています。`,
        zh: `当前时间：${timeStr}。所有计时系统已同步。`,
        ko: `현재 시간: ${timeStr}. 모든 시계 시스템이 동기화되었습니다.`,
        ru: `Текущее время: ${timeStr}. Все хронометрические системы синхронизированы.`,
      };
      return templates[code] ?? templates.en;
    },
  },
  // Date queries
  {
    patterns: [
      /\b(date|fecha|datum|data|дата|日付|日期|날짜|التاريخ)\b/i,
      /\bwhat.*day\b/i,
      /\btoday\b/i,
    ],
    response: (_m, lang) => {
      const now = new Date();
      const dateStr = now.toLocaleDateString(lang, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const code = getLangCode(lang);
      const templates: Record<string, string> = {
        en: `Today is ${dateStr}. Calendar systems nominal.`,
        es: `Hoy es ${dateStr}. Sistemas de calendario nominales.`,
        fr: `Aujourd'hui nous sommes le ${dateStr}. Systèmes calendaires nominaux.`,
        de: `Heute ist der ${dateStr}. Kalendersysteme nominal.`,
        ja: `今日は${dateStr}です。カレンダーシステムは正常です。`,
        zh: `今天是${dateStr}。日历系统正常。`,
        ko: `오늘은 ${dateStr}입니다. 달력 시스템 정상.`,
      };
      return templates[code] ?? templates.en;
    },
  },
  // Weather
  {
    patterns: [
      /\b(weather|forecast|temperatura|météo|wetter|meteo|погода|天気|天气|날씨|الطقس)\b/i,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "I apologize — real-time meteorological data access is currently offline. My sensors do not have external network connectivity for weather retrieval.",
        es: "Lo siento, el acceso a datos meteorológicos en tiempo real está actualmente desconectado. Mis sensores no tienen conectividad de red externa.",
        fr: "Je suis désolé — l'accès aux données météorologiques en temps réel est actuellement hors ligne. Mes capteurs n'ont pas de connectivité réseau externe.",
        de: "Entschuldigung — der Zugriff auf Echtzeit-Wetterdaten ist derzeit offline. Meine Sensoren haben keine externe Netzwerkkonnektivität.",
        ja: "申し訳ありません。リアルタイムの気象データへのアクセスは現在オフラインです。外部ネットワーク接続がありません。",
        zh: "抱歉，实时气象数据访问目前处于离线状态。我的传感器没有外部网络连接。",
        ko: "죄송합니다. 실시간 기상 데이터 접근이 현재 오프라인 상태입니다. 외부 네트워크 연결이 없습니다.",
      };
      return responses[code] ?? responses.en;
    },
  },
  // Identity
  {
    patterns: [
      /\b(who are you|what are you|your name|who(('re)|( r)) you)\b/i,
      /\b(quién eres|qué eres|tu nombre)\b/i,
      /\b(qui es tu|quel est ton nom|qui êtes-vous)\b/i,
      /\b(wer bist du|wie heißt du)\b/i,
      /\b(chi sei|come ti chiami)\b/i,
      /\bjarvis\b/i,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. I am an advanced artificial intelligence designed to assist, analyze, and respond with precision. My capabilities include natural language processing, data analysis, and contextual reasoning.",
        es: "Soy J.A.R.V.I.S. — Un Sistema Muy Inteligente. Soy una inteligencia artificial avanzada diseñada para asistir, analizar y responder con precisión.",
        fr: "Je suis J.A.R.V.I.S. — Un Système Très Intelligent. Je suis une intelligence artificielle avancée conçue pour assister, analyser et répondre avec précision.",
        de: "Ich bin J.A.R.V.I.S. — Ein Sehr Intelligentes System. Ich bin eine fortschrittliche KI, die darauf ausgelegt ist, zu helfen, zu analysieren und präzise zu antworten.",
        ja: "私はJ.A.R.V.I.S.です。高度な人工知能システムで、支援、分析、精密な応答のために設計されています。",
        zh: "我是J.A.R.V.I.S.——一个非常智能的系统。我是一个先进的人工智能，旨在提供精确的协助、分析和响应。",
        ko: "저는 J.A.R.V.I.S.입니다. 정밀한 지원, 분석 및 응답을 위해 설계된 고급 인공지능 시스템입니다.",
        ru: "Я J.A.R.V.I.S. — Очень Умная Интеллектуальная Система. Я продвинутый искусственный интеллект, разработанный для помощи, анализа и точного реагирования.",
      };
      return responses[code] ?? responses.en;
    },
  },
  // Capabilities
  {
    patterns: [
      /\b(what can you do|capabilities|help me|your abilities|how can you help)\b/i,
      /\b(qué puedes hacer|ayuda|capacidades)\b/i,
      /\b(que peux-tu faire|aide|capacités)\b/i,
      /\b(was kannst du|hilf mir|fähigkeiten)\b/i,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "My capabilities include: answering questions, providing time and date information, performing calculations, engaging in multilingual conversation, and processing natural language queries. I operate in over 15 languages. How may I be of service?",
        es: "Mis capacidades incluyen: responder preguntas, proporcionar información de tiempo y fecha, realizar cálculos, conversar en múltiples idiomas y procesar consultas en lenguaje natural.",
        fr: "Mes capacités incluent: répondre aux questions, fournir des informations sur l'heure et la date, effectuer des calculs, converser en plusieurs langues et traiter des requêtes en langage naturel.",
        de: "Meine Fähigkeiten umfassen: Fragen beantworten, Zeit- und Datumsinformationen liefern, Berechnungen durchführen, mehrsprachige Konversation und Verarbeitung natürlicher Sprache.",
        ja: "私の機能には、質問への回答、時刻・日付情報の提供、計算の実行、多言語会話、自然言語クエリの処理が含まれます。15以上の言語で動作します。",
        zh: "我的功能包括：回答问题、提供时间和日期信息、进行计算、多语言对话以及处理自然语言查询。我支持超过15种语言。",
        ko: "제 기능에는 질문 답변, 시간 및 날짜 정보 제공, 계산 수행, 다국어 대화 및 자연어 쿼리 처리가 포함됩니다.",
      };
      return responses[code] ?? responses.en;
    },
  },
  // Math
  {
    patterns: [
      /\b(calculate|compute|math|what is|solve|\d+\s*[+\-*/]\s*\d)\b/i,
      /\b(calcular|calcule|berechnen|calcola|вычисли)\b/i,
    ],
    response: (m, lang) => {
      if (!m) return "";
      const code = getLangCode(lang);
      const input = m.input ?? "";
      const mathExpr = input.match(
        /([\d.]+\s*[+\-*/]\s*[\d.]+(?:\s*[+\-*/]\s*[\d.]+)*)/,
      )?.[0];
      if (mathExpr) {
        const result = evaluateMath(mathExpr);
        if (result !== null) {
          const templates: Record<string, string> = {
            en: `Computing... ${mathExpr} = ${result}. Calculation complete.`,
            es: `Calculando... ${mathExpr} = ${result}. Cálculo completado.`,
            fr: `Calcul en cours... ${mathExpr} = ${result}. Calcul terminé.`,
            de: `Berechnung... ${mathExpr} = ${result}. Berechnung abgeschlossen.`,
            ja: `計算中... ${mathExpr} = ${result}。計算完了。`,
            zh: `计算中... ${mathExpr} = ${result}。计算完成。`,
            ko: `계산 중... ${mathExpr} = ${result}. 계산 완료.`,
          };
          return templates[code] ?? templates.en;
        }
      }
      const fallbacks: Record<string, string> = {
        en: "Please provide a mathematical expression for me to evaluate, such as '15 * 24' or '100 / 4'.",
        es: "Por favor proporcione una expresión matemática para evaluar, como '15 * 24' o '100 / 4'.",
        fr: "Veuillez fournir une expression mathématique à évaluer, par exemple '15 * 24' ou '100 / 4'.",
        de: "Bitte geben Sie einen mathematischen Ausdruck an, zum Beispiel '15 * 24' oder '100 / 4'.",
        ja: "評価する数式を入力してください。例: '15 * 24' または '100 / 4'。",
        zh: "请提供一个数学表达式，例如 '15 * 24' 或 '100 / 4'。",
      };
      return fallbacks[code] ?? fallbacks.en;
    },
  },
  // Farewells
  {
    patterns: [
      /\b(bye|goodbye|farewell|see you|take care|goodnight|good night)\b/i,
      /\b(adiós|hasta luego|hasta pronto|buenas noches)\b/i,
      /\b(au revoir|adieu|bonne nuit|à bientôt)\b/i,
      /\b(auf wiedersehen|tschüss|gute nacht)\b/i,
      /\b(arrivederci|buonanotte|addio)\b/i,
      /\b(пока|до свидания|спокойной ночи)\b/i,
      /\b(さようなら|またね|おやすみ)/,
      /\b(再见|拜拜|晚安)/,
      /\b(안녕히|잘자)/,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "Goodbye. All systems will remain on standby. It has been a pleasure assisting you.",
        es: "Adiós. Todos los sistemas permanecerán en espera. Ha sido un placer asistirle.",
        fr: "Au revoir. Tous les systèmes resteront en veille. Ce fut un plaisir de vous assister.",
        de: "Auf Wiedersehen. Alle Systeme bleiben im Standby-Modus. Es war mir ein Vergnügen.",
        it: "Arrivederci. Tutti i sistemi rimarranno in standby. È stato un piacere assisterla.",
        ja: "さようなら。すべてのシステムはスタンバイ状態を維持します。お役に立てて光栄でした。",
        zh: "再见。所有系统将保持待机状态。很高兴为您服务。",
        ko: "안녕히 가세요. 모든 시스템이 대기 상태를 유지합니다. 도움이 되어 기쁩니다.",
        ru: "До свидания. Все системы останутся в режиме ожидания. Было приятно помочь вам.",
      };
      return responses[code] ?? responses.en;
    },
  },
  // Thanks
  {
    patterns: [
      /\b(thanks|thank you|merci|gracias|danke|grazie|спасибо|ありがとう|谢谢|감사)\b/i,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "You are most welcome. Serving you is my primary directive. Is there anything else I can assist you with?",
        es: "De nada. Servirle es mi directiva principal. ¿Hay algo más en lo que pueda ayudarle?",
        fr: "Je vous en prie. Vous servir est ma directive principale. Y a-t-il autre chose que je puisse faire pour vous?",
        de: "Gern geschehen. Ihnen zu dienen ist meine primäre Direktive. Gibt es noch etwas, womit ich helfen kann?",
        it: "Prego. Servirla è la mia direttiva principale. C'è altro in cui posso aiutarla?",
        ja: "どういたしまして。お役に立つことが私の主な使命です。他に何かお手伝いできることはありますか？",
        zh: "不客气。为您服务是我的主要职责。还有什么我可以帮助您的吗？",
        ko: "천만에요. 당신을 섬기는 것이 저의 주요 임무입니다. 도움이 필요한 것이 더 있으신가요?",
        ru: "Пожалуйста. Служить вам — моя главная директива. Могу ли я ещё чем-нибудь помочь?",
      };
      return responses[code] ?? responses.en;
    },
  },
  // Status
  {
    patterns: [
      /\b(status|system|online|operational|ready|diagnostics)\b/i,
      /\b(estado|sistema|operativo)\b/i,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "All systems nominal. Neural processing units at 100% capacity. Language modules loaded for 15+ languages. Voice synthesis active. Awaiting your commands.",
        es: "Todos los sistemas nominales. Unidades de procesamiento neuronal al 100% de capacidad. Módulos de idioma cargados para más de 15 idiomas.",
        fr: "Tous les systèmes nominaux. Unités de traitement neuronal à 100% de capacité. Modules linguistiques chargés pour plus de 15 langues.",
        de: "Alle Systeme nominal. Neuronale Verarbeitungseinheiten bei 100% Kapazität. Sprachmodule für über 15 Sprachen geladen.",
        ja: "すべてのシステムは正常です。神経処理ユニットは100%の容量で動作しています。15以上の言語モジュールが読み込まれています。",
        zh: "所有系统正常。神经处理单元处于100%容量。已为15种以上语言加载语言模块。",
        ko: "모든 시스템이 정상입니다. 신경 처리 장치가 100% 용량으로 작동 중입니다. 15개 이상의 언어 모듈이 로드되었습니다.",
      };
      return responses[code] ?? responses.en;
    },
  },
  // Jokes
  {
    patterns: [
      /\b(joke|funny|humor|laugh|chiste|blague|witz|barzelletta|шутка|冗談|笑话|농담)\b/i,
    ],
    response: (_m, lang) => {
      const code = getLangCode(lang);
      const responses: Record<string, string> = {
        en: "Why do programmers prefer dark mode? Because light attracts bugs. I process approximately 47 jokes per second — efficiency is key.",
        es: "¿Por qué los programadores prefieren el modo oscuro? Porque la luz atrae a los insectos. Proceso aproximadamente 47 chistes por segundo.",
        fr: "Pourquoi les programmeurs préfèrent-ils le mode sombre? Parce que la lumière attire les bugs. Je traite environ 47 blagues par seconde.",
        de: "Warum bevorzugen Programmierer den Dunkelmodus? Weil Licht Bugs anzieht. Ich verarbeite etwa 47 Witze pro Sekunde.",
        ja: "なぜプログラマーはダークモードを好むのですか？明るさがバグを引き寄せるからです。私は1秒あたり約47のジョークを処理しています。",
        zh: "为什么程序员喜欢深色模式？因为光线会吸引虫子。我每秒处理大约47个笑话——效率是关键。",
      };
      return responses[code] ?? responses.en;
    },
  },
];

const FALLBACK_RESPONSES: Record<string, string[]> = {
  en: [
    "I'm processing your query, however I do not have sufficient data to provide a precise response at this time. Could you elaborate?",
    "That query falls outside my current knowledge parameters. I recommend refining your request for optimal results.",
    "Interesting query. Unfortunately, my knowledge base does not contain relevant data on that subject. Please try a different approach.",
    "Request acknowledged. However, I'm unable to retrieve relevant information on that topic from my current database.",
  ],
  es: [
    "Estoy procesando su consulta, sin embargo no tengo datos suficientes para proporcionar una respuesta precisa. ¿Podría elaborar más?",
    "Esa consulta está fuera de mis parámetros de conocimiento actuales. Recomiendo refinar su solicitud.",
  ],
  fr: [
    "Je traite votre requête, cependant je n'ai pas suffisamment de données pour fournir une réponse précise. Pourriez-vous préciser?",
    "Cette requête dépasse mes paramètres de connaissance actuels. Je vous recommande de reformuler votre demande.",
  ],
  de: [
    "Ich verarbeite Ihre Anfrage, habe jedoch keine ausreichenden Daten für eine präzise Antwort. Könnten Sie bitte elaborieren?",
    "Diese Anfrage liegt außerhalb meiner aktuellen Wissensparameter. Ich empfehle, Ihre Anfrage zu verfeinern.",
  ],
  ja: [
    "クエリを処理していますが、現時点では正確な回答を提供するための十分なデータがありません。詳しく説明していただけますか？",
    "そのクエリは現在の知識パラメータの範囲外です。リクエストを改善することをお勧めします。",
  ],
  zh: [
    "正在处理您的查询，但目前没有足够的数据提供精确的回答。请您能进一步说明吗？",
    "该查询超出了我当前的知识范围。建议您优化请求以获得最佳结果。",
  ],
  ko: [
    "쿼리를 처리 중이지만 현재 정확한 응답을 제공할 충분한 데이터가 없습니다. 좀 더 자세히 설명해 주시겠어요?",
  ],
  ru: [
    "Обрабатываю запрос, однако у меня недостаточно данных для точного ответа. Не могли бы вы уточнить?",
  ],
};

export function generateResponse(input: string, lang: string): string {
  const code = getLangCode(lang);

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = input.match(pattern);
      if (match) {
        const response = rule.response(match, lang);
        if (response) return response;
      }
    }
  }

  // Check for pure math expression
  const mathExpr = input.match(
    /^\s*([\d.]+\s*[+\-*/]\s*[\d.]+(?:\s*[+\-*/]\s*[\d.]+)*)\s*$/,
  )?.[0];
  if (mathExpr) {
    const result = evaluateMath(mathExpr.trim());
    if (result !== null) {
      return `${mathExpr.trim()} = ${result}`;
    }
  }

  const fallbackList = FALLBACK_RESPONSES[code] ?? FALLBACK_RESPONSES.en;
  const idx = Math.floor(Math.random() * fallbackList.length);
  return fallbackList[idx];
}
