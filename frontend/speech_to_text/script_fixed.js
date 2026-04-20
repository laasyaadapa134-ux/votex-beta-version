/**
 * Speech to Text Module
 * Handles speech recognition, transcription, and text export functionality
 */

// ===== Configuration =====
const CONFIG = {
 defaultLanguage: 'en-US',
  maxTranscriptLength: 50000,
  autoSaveInterval: 30000, // 30 seconds
  defaultUILanguage: 'en'
};

const BACKEND_BASE_URL = (() => {
  const configuredBase = window.VOTEX_BACKEND_URL || document.body?.dataset?.backendUrl;
  if (configuredBase) {
    return configuredBase.replace(/\/$/, '');
  }

  const isLocalStaticFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && window.location.port
    && window.location.port !== '5000';

  return isLocalStaticFrontend ? 'http://127.0.0.1:5000' : window.location.origin;
})();

const buildBackendUrl = (path) => `${BACKEND_BASE_URL}${path}`;

// ===== Translation System =====
const translations = {
  en: {
    nav: {
      home: '🏠 Home',
      textToSpeech: 'Text to speech',
      speechToText: 'Speech to text',
      translateSpeak: 'Translate & Speak',
      textToSpeechLang: 'Text to speech in another language',
      speechToTextLang: 'Speech to text in another language',
      textToSign: 'Text to sign language'
    },
    common: {
      login: 'Login'
    },
    banner: {
      recording: 'RECORDING IN PROGRESS - Speak now!'
    },
    hero: {
      title: 'Speech to Text',
      subtitle: 'Convert your voice into text instantly using advanced speech recognition'
    },
    card: {
      title: 'Record Your Voice'
    },
    status: {
      ready: 'Ready',
      recording: '🔴 Recording...',
      initializing: 'Initializing...'
    },
    settings: {
      speechLanguage: 'Speech Language:',
      continuous: 'Continuous Recording',
      interim: 'Show Interim Results'
    },
    buttons: {
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      clearText: 'Clear Text',
      uploadFile: 'Upload Audio/Video',
      loadUrl: 'Load URL',
      transcribe: 'Transcribe Audio',
      downloadTxt: 'Download as TXT',
      downloadDoc: 'Download as DOC',
      recording: 'Recording...'
    },
    transcript: {
      title: 'Transcription',
      copy: 'Copy to clipboard',
      placeholder: 'Your transcribed text will appear here...',
      words: 'Words',
      characters: 'Characters'
    },
    media: {
      playingFile: 'Playing File'
    },
    url: {
      orLoadFromUrl: 'Or load from URL (YouTube, direct video/audio links)',
      placeholder: 'Paste YouTube URL or direct media link (e.g., https://youtube.com/watch?v=...)'
    },
    tips: {
      title: 'Tips for Best Results',
      tip1: 'Speak clearly and at a moderate pace',
      tip2: 'Minimize background noise',
      tip3: 'Use a good quality microphone',
      tip4: 'Position the microphone 6-12 inches from your mouth',
      tip5: 'Speak punctuation (e.g., say "period" or "comma")'
    },
    features: {
      title: 'Features',
      feature1: '✅ Real-time transcription',
      feature2: '✅ Multiple language support',
      feature3: '✅ Continuous recording mode',
      feature4: '✅ Interim results preview',
      feature5: '✅ Editable output',
      feature6: '✅ Export to TXT/DOC formats',
      feature7: '✅ Audio/Video file transcription'
    },
    compatibility: {
      title: '⚠️ Browser Compatibility',
      message: 'This feature requires a modern browser with Web Speech API support (Chrome, Edge, Safari).'
    },
    footer: {
      copyright: '© 2026 VOTEX. All rights reserved.'
    },
    notifications: {
      recordingStarted: '🎤 Recording started! Speak now...',
      recordingStopped: '⏹️ Recording stopped',
      textCopied: 'Text copied to clipboard!',
      noTextToCopy: 'No text to copy',
      noTextToDownload: 'No text to download',
      downloaded: 'Downloaded',
      micDenied: 'Microphone access denied! Please allow microphone access in your browser settings and try again.',
      micNotFound: 'No microphone found! Please connect a microphone and try again.',
      micError: 'Failed to access microphone:',
      noSpeech: 'No speech was detected. Please try again.',
      audioCapture: 'No microphone was found. Ensure it is connected.',
      notAllowed: 'Microphone access was denied. Please allow microphone access.',
      networkError: 'Network error occurred. Please check your connection.',
      errorOccurred: 'An error occurred:',
      browserNotSupported: 'Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
    }
  },
  es: {
    nav: {
      textToSpeech: 'Texto a voz',
      speechToText: 'Voz a texto',
      textToSpeechLang: 'Texto a voz en otro idioma',
      speechToTextLang: 'Voz a texto en otro idioma',
      textToSign: 'Texto a lenguaje de señas'
    },
    common: {
      login: 'Iniciar sesión'
    },
    banner: {
      recording: 'GRABACIÓN EN CURSO - ¡Habla ahora!'
    },
    hero: {
      title: 'Voz a Texto',
      subtitle: 'Convierte tu voz en texto instantáneamente usando reconocimiento de voz avanzado'
    },
    card: {
      title: 'Graba tu Voz'
    },
    status: {
      ready: 'Listo',
      recording: '🔴 Grabando...',
      initializing: 'Inicializando...'
    },
    settings: {
      speechLanguage: 'Idioma del Habla:',
      continuous: 'Grabación Continua',
      interim: 'Mostrar Resultados Intermedios'
    },
    buttons: {
      startRecording: 'Iniciar Grabación',
      stopRecording: 'Detener Grabación',
      clearText: 'Borrar Texto',
      downloadTxt: 'Descargar como TXT',
      downloadDoc: 'Descargar como DOC',
      recording: 'Grabando...'
    },
    transcript: {
      title: 'Transcripción',
      copy: 'Copiar al portapapeles',
      placeholder: 'Tu texto transcrito aparecerá aquí...',
      words: 'Palabras',
      characters: 'Caracteres'
    },
    tips: {
      title: 'Consejos para Mejores Resultados',
      tip1: 'Habla claramente y a un ritmo moderado',
      tip2: 'Minimiza el ruido de fondo',
      tip3: 'Usa un micrófono de buena calidad',
      tip4: 'Coloca el micrófono a 15-30 cm de tu boca',
      tip5: 'Di la puntuación en voz alta (ej. di "punto" o "coma")'
    },
    features: {
      title: 'Características',
      feature1: '✅ Transcripción en tiempo real',
      feature2: '✅ Soporte para múltiples idiomas',
      feature3: '✅ Modo de grabación continua',
      feature4: '✅ Vista previa de resultados intermedios',
      feature5: '✅ Salida editable',
      feature6: '✅ Exportar a formatos TXT/DOC'
    },
    compatibility: {
      title: '⚠️ Compatibilidad del Navegador',
      message: 'Esta función requiere un navegador moderno con soporte para Web Speech API (Chrome, Edge, Safari).'
    },
    footer: {
      copyright: '© 2026 VOTEX. Todos los derechos reservados.'
    },
    notifications: {
      recordingStarted: '🎤 ¡Grabación iniciada! Habla ahora...',
      recordingStopped: '⏹️ Grabación detenida',
      textCopied: '¡Texto copiado al portapapeles!',
      noTextToCopy: 'No hay texto para copiar',
      noTextToDownload: 'No hay texto para descargar',
      downloaded: 'Descargado',
      micDenied: '¡Acceso al micrófono denegado! Por favor permite el acceso al micrófono en la configuración de tu navegador e intenta de nuevo.',
      micNotFound: '¡No se encontró micrófono! Por favor conecta un micrófono e intenta de nuevo.',
      micError: 'Error al acceder al micrófono:',
      noSpeech: 'No se detectó habla. Por favor intenta de nuevo.',
      audioCapture: 'No se encontró micrófono. Asegúrate de que esté conectado.',
      notAllowed: 'Se denegó el acceso al micrófono. Por favor permite el acceso.',
      networkError: 'Ocurrió un error de red. Por favor verifica tu conexión.',
      errorOccurred: 'Ocurrió un error:',
      browserNotSupported: 'El reconocimiento de voz no está soportado en este navegador. Por favor usa Chrome, Edge o Safari.'
    }
  },
  fr: {
    nav: {
      textToSpeech: 'Texte vers parole',
      speechToText: 'Parole vers texte',
      textToSpeechLang: 'Texte vers parole dans une autre langue',
      speechToTextLang: 'Parole vers texte dans une autre langue',
      textToSign: 'Texte vers langue des signes'
    },
    common: {
      login: 'Connexion'
    },
    banner: {
      recording: 'ENREGISTREMENT EN COURS - Parlez maintenant !'
    },
    hero: {
      title: 'Parole vers Texte',
      subtitle: 'Convertissez votre voix en texte instantanément grâce à la reconnaissance vocale avancée'
    },
    card: {
      title: 'Enregistrez votre Voix'
    },
    status: {
      ready: 'Prêt',
      recording: '🔴 Enregistrement...',
      initializing: 'Initialisation...'
    },
    settings: {
      speechLanguage: 'Langue de Parole:',
      continuous: 'Enregistrement Continu',
      interim: 'Afficher les Résultats Intermédiaires'
    },
    buttons: {
      startRecording: 'Démarrer l\'enregistrement',
      stopRecording: 'Arrêter l\'enregistrement',
      clearText: 'Effacer le Texte',
      downloadTxt: 'Télécharger en TXT',
      downloadDoc: 'Télécharger en DOC',
      recording: 'Enregistrement...'
    },
    transcript: {
      title: 'Transcription',
      copy: 'Copier dans le presse-papiers',
      placeholder: 'Votre texte transcrit apparaîtra ici...',
      words: 'Mots',
      characters: 'Caractères'
    },
    tips: {
      title: 'Conseils pour de Meilleurs Résultats',
      tip1: 'Parlez clairement et à un rythme modéré',
      tip2: 'Minimisez le bruit de fond',
      tip3: 'Utilisez un microphone de bonne qualité',
      tip4: 'Placez le microphone à 15-30 cm de votre bouche',
      tip5: 'Prononcez la ponctuation (par ex. dites "point" ou "virgule")'
    },
    features: {
      title: 'Fonctionnalités',
      feature1: '✅ Transcription en temps réel',
      feature2: '✅ Support de plusieurs langues',
      feature3: '✅ Mode d\'enregistrement continu',
      feature4: '✅ Aperçu des résultats intermédiaires',
      feature5: '✅ Sortie éditable',
      feature6: '✅ Export aux formats TXT/DOC'
    },
    compatibility: {
      title: '⚠️ Compatibilité du Navigateur',
      message: 'Cette fonctionnalité nécessite un navigateur moderne avec support de l\'API Web Speech (Chrome, Edge, Safari).'
    },
    footer: {
      copyright: '© 2026 VOTEX. Tous droits réservés.'
    },
    notifications: {
      recordingStarted: '🎤 Enregistrement commencé ! Parlez maintenant...',
      recordingStopped: '⏹️ Enregistrement arrêté',
      textCopied: 'Texte copié dans le presse-papiers !',
      noTextToCopy: 'Aucun texte à copier',
      noTextToDownload: 'Aucun texte à télécharger',
      downloaded: 'Téléchargé',
      micDenied: 'Accès au microphone refusé ! Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur et réessayer.',
      micNotFound: 'Aucun microphone trouvé ! Veuillez connecter un microphone et réessayer.',
      micError: 'Échec de l\'accès au microphone:',
      noSpeech: 'Aucune parole détectée. Veuillez réessayer.',
      audioCapture: 'Aucun microphone trouvé. Assurez-vous qu\'il est connecté.',
      notAllowed: 'L\'accès au microphone a été refusé. Veuillez autoriser l\'accès.',
      networkError: 'Une erreur réseau s\'est produite. Veuillez vérifier votre connexion.',
      errorOccurred: 'Une erreur s\'est produite:',
      browserNotSupported: 'La reconnaissance vocale n\'est pas supportée dans ce navigateur. Veuillez utiliser Chrome, Edge ou Safari.'
    }
  },
  de: {
    nav: {
      textToSpeech: 'Text zu Sprache',
      speechToText: 'Sprache zu Text',
      textToSpeechLang: 'Text zu Sprache in einer anderen Sprache',
      speechToTextLang: 'Sprache zu Text in einer anderen Sprache',
      textToSign: 'Text zur Gebärdensprache'
    },
    common: {
      login: 'Anmelden'
    },
    banner: {
      recording: 'AUFNAHME LÄUFT - Jetzt sprechen!'
    },
    hero: {
      title: 'Sprache zu Text',
      subtitle: 'Wandeln Sie Ihre Stimme sofort in Text um mit fortschrittlicher Spracherkennung'
    },
    card: {
      title: 'Nehmen Sie Ihre Stimme auf'
    },
    status: {
      ready: 'Bereit',
      recording: '🔴 Aufnahme läuft...',
      initializing: 'Initialisieren...'
    },
    settings: {
      speechLanguage: 'Sprachsprache:',
      continuous: 'Kontinuierliche Aufnahme',
      interim: 'Zwischenergebnisse anzeigen'
    },
    buttons: {
      startRecording: 'Aufnahme starten',
      stopRecording: 'Aufnahme stoppen',
      clearText: 'Text löschen',
      downloadTxt: 'Als TXT herunterladen',
      downloadDoc: 'Als DOC herunterladen',
      recording: 'Aufnahme läuft...'
    },
    transcript: {
      title: 'Transkription',
      copy: 'In Zwischenablage kopieren',
      placeholder: 'Ihr transkribierter Text wird hier erscheinen...',
      words: 'Wörter',
      characters: 'Zeichen'
    },
    tips: {
      title: 'Tipps für beste Ergebnisse',
      tip1: 'Sprechen Sie klar und in gemäßigtem Tempo',
      tip2: 'Minimieren Sie Hintergrundgeräusche',
      tip3: 'Verwenden Sie ein hochwertiges Mikrofon',
      tip4: 'Positionieren Sie das Mikrofon 15-30 cm von Ihrem Mund',
      tip5: 'Sprechen Sie Satzzeichen aus (z.B. sagen Sie "Punkt" oder "Komma")'
    },
    features: {
      title: 'Funktionen',
      feature1: '✅ Echtzeit-Transkription',
      feature2: '✅ Mehrsprachige Unterstützung',
      feature3: '✅ Kontinuierlicher Aufnahmemodus',
      feature4: '✅ Vorschau von Zwischenergebnissen',
      feature5: '✅ Bearbeitbare Ausgabe',
      feature6: '✅ Export in TXT/DOC-Formate'
    },
    compatibility: {
      title: '⚠️ Browser-Kompatibilität',
      message: 'Diese Funktion erfordert einen modernen Browser mit Web Speech API-Unterstützung (Chrome, Edge, Safari).'
    },
    footer: {
      copyright: '© 2026 VOTEX. Alle Rechte vorbehalten.'
    },
    notifications: {
      recordingStarted: '🎤 Aufnahme gestartet! Jetzt sprechen...',
      recordingStopped: '⏹️ Aufnahme gestoppt',
      textCopied: 'Text in Zwischenablage kopiert!',
      noTextToCopy: 'Kein Text zum Kopieren',
      noTextToDownload: 'Kein Text zum Herunterladen',
      downloaded: 'Heruntergeladen',
      micDenied: 'Mikrofonzugriff verweigert! Bitte erlauben Sie den Mikrofonzugriff in Ihren Browsereinstellungen und versuchen Sie es erneut.',
      micNotFound: 'Kein Mikrofon gefunden! Bitte schließen Sie ein Mikrofon an und versuchen Sie es erneut.',
      micError: 'Fehler beim Zugriff auf das Mikrofon:',
      noSpeech: 'Keine Sprache erkannt. Bitte versuchen Sie es erneut.',
      audioCapture: 'Kein Mikrofon gefunden. Stellen Sie sicher, dass es angeschlossen ist.',
      notAllowed: 'Der Mikrofonzugriff wurde verweigert. Bitte erlauben Sie den Zugriff.',
      networkError: 'Ein Netzwerkfehler ist aufgetreten. Bitte überprüfen Sie Ihre Verbindung.',
      errorOccurred: 'Ein Fehler ist aufgetreten:',
      browserNotSupported: 'Spracherkennung wird in diesem Browser nicht unterstützt. Bitte verwenden Sie Chrome, Edge oder Safari.'
    }
  },
  it: {
    nav: {
      textToSpeech: 'Testo in voce',
      speechToText: 'Voce in testo',
      textToSpeechLang: 'Testo in voce in un\'altra lingua',
      speechToTextLang: 'Voce in testo in un\'altra lingua',
      textToSign: 'Testo in lingua dei segni'
    },
    common: {
      login: 'Accedi'
    },
    banner: {
      recording: 'REGISTRAZIONE IN CORSO - Parla ora!'
    },
    hero: {
      title: 'Voce in Testo',
      subtitle: 'Converti la tua voce in testo istantaneamente usando il riconoscimento vocale avanzato'
    },
    card: {
      title: 'Registra la tua Voce'
    },
    status: {
      ready: 'Pronto',
      recording: '🔴 Registrazione...',
      initializing: 'Inizializzazione...'
    },
    settings: {
      speechLanguage: 'Lingua Vocale:',
      continuous: 'Registrazione Continua',
      interim: 'Mostra Risultati Intermedi'
    },
    buttons: {
      startRecording: 'Avvia Registrazione',
      stopRecording: 'Ferma Registrazione',
      clearText: 'Cancella Testo',
      downloadTxt: 'Scarica come TXT',
      downloadDoc: 'Scarica come DOC',
      recording: 'Registrazione...'
    },
    transcript: {
      title: 'Trascrizione',
      copy: 'Copia negli appunti',
      placeholder: 'Il tuo testo trascritto apparirà qui...',
      words: 'Parole',
      characters: 'Caratteri'
    },
    tips: {
      title: 'Consigli per Risultati Migliori',
      tip1: 'Parla chiaramente e a un ritmo moderato',
      tip2: 'Minimizza il rumore di fondo',
      tip3: 'Usa un microfono di buona qualità',
      tip4: 'Posiziona il microfono a 15-30 cm dalla bocca',
      tip5: 'Pronuncia la punteggiatura (ad es. dì "punto" o "virgola")'
    },
    features: {
      title: 'Funzionalità',
      feature1: '✅ Trascrizione in tempo reale',
      feature2: '✅ Supporto multilingua',
      feature3: '✅ Modalità di registrazione continua',
      feature4: '✅ Anteprima risultati intermedi',
      feature5: '✅ Output modificabile',
      feature6: '✅ Esportazione in formati TXT/DOC'
    },
    compatibility: {
      title: '⚠️ Compatibilità Browser',
      message: 'Questa funzione richiede un browser moderno con supporto Web Speech API (Chrome, Edge, Safari).'
    },
    footer: {
      copyright: '© 2026 VOTEX. Tutti i diritti riservati.'
    },
    notifications: {
      recordingStarted: '🎤 Registrazione avviata! Parla ora...',
      recordingStopped: '⏹️ Registrazione fermata',
      textCopied: 'Testo copiato negli appunti!',
      noTextToCopy: 'Nessun testo da copiare',
      noTextToDownload: 'Nessun testo da scaricare',
      downloaded: 'Scaricato',
      micDenied: 'Accesso al microfono negato! Per favore consenti l\'accesso al microfono nelle impostazioni del browser e riprova.',
      micNotFound: 'Nessun microfono trovato! Per favore collega un microfono e riprova.',
      micError: 'Impossibile accedere al microfono:',
      noSpeech: 'Nessun parlato rilevato. Per favore riprova.',
      audioCapture: 'Nessun microfono trovato. Assicurati che sia connesso.',
      notAllowed: 'L\'accesso al microfono è stato negato. Per favore consenti l\'accesso.',
      networkError: 'Si è verificato un errore di rete. Per favore controlla la tua connessione.',
      errorOccurred: 'Si è verificato un errore:',
      browserNotSupported: 'Il riconoscimento vocale non è supportato in questo browser. Per favore usa Chrome, Edge o Safari.'
    }
  },
  pt: {
    nav: {
      textToSpeech: 'Texto para fala',
      speechToText: 'Fala para texto',
      textToSpeechLang: 'Texto para fala em outro idioma',
      speechToTextLang: 'Fala para texto em outro idioma',
      textToSign: 'Texto para linguagem de sinais'
    },
    common: {
      login: 'Entrar'
    },
    banner: {
      recording: 'GRAVAÇÃO EM ANDAMENTO - Fale agora!'
    },
    hero: {
      title: 'Fala para Texto',
      subtitle: 'Converta sua voz em texto instantaneamente usando reconhecimento de fala avançado'
    },
    card: {
      title: 'Grave sua Voz'
    },
    status: {
      ready: 'Pronto',
      recording: '🔴 Gravando...',
      initializing: 'Inicializando...'
    },
    settings: {
      speechLanguage: 'Idioma da Fala:',
      continuous: 'Gravação Contínua',
      interim: 'Mostrar Resultados Intermediários'
    },
    buttons: {
      startRecording: 'Iniciar Gravação',
      stopRecording: 'Parar Gravação',
      clearText: 'Limpar Texto',
      downloadTxt: 'Baixar como TXT',
      downloadDoc: 'Baixar como DOC',
      recording: 'Gravando...'
    },
    transcript: {
      title: 'Transcrição',
      copy: 'Copiar para área de transferência',
      placeholder: 'Seu texto transcrito aparecerá aqui...',
      words: 'Palavras',
      characters: 'Caracteres'
    },
    tips: {
      title: 'Dicas para Melhores Resultados',
      tip1: 'Fale claramente e em ritmo moderado',
      tip2: 'Minimize o ruído de fundo',
      tip3: 'Use um microfone de boa qualidade',
      tip4: 'Posicione o microfone a 15-30 cm da sua boca',
      tip5: 'Fale a pontuação em voz alta (ex. diga "ponto" ou "vírgula")'
    },
    features: {
      title: 'Recursos',
      feature1: '✅ Transcrição em tempo real',
      feature2: '✅ Suporte para vários idiomas',
      feature3: '✅ Modo de gravação contínua',
      feature4: '✅ Visualização de resultados intermediários',
      feature5: '✅ Saída editável',
      feature6: '✅ Exportar para formatos TXT/DOC'
    },
    compatibility: {
      title: '⚠️ Compatibilidade do Navegador',
      message: 'Este recurso requer um navegador moderno com suporte à API Web Speech (Chrome, Edge, Safari).'
    },
    footer: {
      copyright: '© 2026 VOTEX. Todos os direitos reservados.'
    },
    notifications: {
      recordingStarted: '🎤 Gravação iniciada! Fale agora...',
      recordingStopped: '⏹️ Gravação parada',
      textCopied: 'Texto copiado para área de transferência!',
      noTextToCopy: 'Nenhum texto para copiar',
      noTextToDownload: 'Nenhum texto para baixar',
      downloaded: 'Baixado',
      micDenied: 'Acesso ao microfone negado! Por favor, permita o acesso ao microfone nas configurações do navegador e tente novamente.',
      micNotFound: 'Nenhum microfone encontrado! Por favor, conecte um microfone e tente novamente.',
      micError: 'Falha ao acessar o microfone:',
      noSpeech: 'Nenhuma fala detectada. Por favor, tente novamente.',
      audioCapture: 'Nenhum microfone encontrado. Certifique-se de que está conectado.',
      notAllowed: 'O acesso ao microfone foi negado. Por favor, permita o acesso.',
      networkError: 'Ocorreu um erro de rede. Por favor, verifique sua conexão.',
      errorOccurred: 'Ocorreu um erro:',
      browserNotSupported: 'O reconhecimento de fala não é suportado neste navegador. Por favor, use Chrome, Edge ou Safari.'
    }
  },
  ja: {
    nav: {
      textToSpeech: 'テキスト読み上げ',
      speechToText: '音声テキスト変換',
      textToSpeechLang: '他言語テキスト読み上げ',
      speechToTextLang: '他言語音声テキスト変換',
      textToSign: 'テキスト手話変換'
    },
    common: {
      login: 'ログイン'
    },
    banner: {
      recording: '録音中 - 今話してください！'
    },
    hero: {
      title: '音声テキスト変換',
      subtitle: '高度な音声認識を使用して、音声を即座にテキストに変換'
    },
    card: {
      title: '音声を録音'
    },
    status: {
      ready: '準備完了',
      recording: '🔴 録音中...',
      initializing: '初期化中...'
    },
    settings: {
      speechLanguage: '音声言語:',
      continuous: '連続録音',
      interim: '中間結果を表示'
    },
    buttons: {
      startRecording: '録音開始',
      stopRecording: '録音停止',
      clearText: 'テキストをクリア',
      downloadTxt: 'TXTでダウンロード',
      downloadDoc: 'DOCでダウンロード',
      recording: '録音中...'
    },
    transcript: {
      title: '文字起こし',
      copy: 'クリップボードにコピー',
      placeholder: '文字起こしされたテキストがここに表示されます...',
      words: '単語数',
      characters: '文字数'
    },
    tips: {
      title: 'より良い結果を得るためのヒント',
      tip1: 'はっきりと適度な速さで話してください',
      tip2: '背景ノイズを最小限に抑える',
      tip3: '高品質のマイクを使用する',
      tip4: 'マイクを口から15-30cm離して配置する',
      tip5: '句読点を声に出す（例：「まる」「てん」と言う）'
    },
    features: {
      title: '機能',
      feature1: '✅ リアルタイム文字起こし',
      feature2: '✅ 複数言語サポート',
      feature3: '✅ 連続録音モード',
      feature4: '✅ 中間結果プレビュー',
      feature5: '✅ 編集可能な出力',
      feature6: '✅ TXT/DOC形式でエクスポート'
    },
    compatibility: {
      title: '⚠️ ブラウザ互換性',
      message: 'この機能にはWeb Speech APIをサポートする最新のブラウザ（Chrome、Edge、Safari）が必要です。'
    },
    footer: {
      copyright: '© 2026 VOTEX. 全著作権所有。'
    },
    notifications: {
      recordingStarted: '🎤 録音を開始しました！今話してください...',
      recordingStopped: '⏹️ 録音を停止しました',
      textCopied: 'テキストをクリップボードにコピーしました！',
      noTextToCopy: 'コピーするテキストがありません',
      noTextToDownload: 'ダウンロードするテキストがありません',
      downloaded: 'ダウンロード完了',
      micDenied: 'マイクへのアクセスが拒否されました！ブラウザの設定でマイクへのアクセスを許可して、もう一度お試しください。',
      micNotFound: 'マイクが見つかりません！マイクを接続して、もう一度お試しください。',
      micError: 'マイクへのアクセスに失敗しました:',
      noSpeech: '音声が検出されませんでした。もう一度お試しください。',
      audioCapture: 'マイクが見つかりません。接続されていることを確認してください。',
      notAllowed: 'マイクへのアクセスが拒否されました。アクセスを許可してください。',
      networkError: 'ネットワークエラーが発生しました。接続を確認してください。',
      errorOccurred: 'エラーが発生しました:',
      browserNotSupported: '音声認識はこのブラウザではサポートされていません。Chrome、Edge、またはSafariをご使用ください。'
    }
  },
  zh: {
    nav: {
      textToSpeech: '文字转语音',
      speechToText: '语音转文字',
      textToSpeechLang: '其他语言文字转语音',
      speechToTextLang: '其他语言语音转文字',
      textToSign: '文字转手语'
    },
    common: {
      login: '登录'
    },
    banner: {
      recording: '正在录音 - 现在开始说话！'
    },
    hero: {
      title: '语音转文字',
      subtitle: '使用先进的语音识别技术即时将您的语音转换为文字'
    },
    card: {
      title: '录制您的声音'
    },
    status: {
      ready: '就绪',
      recording: '🔴 录音中...',
      initializing: '初始化中...'
    },
    settings: {
      speechLanguage: '语音语言:',
      continuous: '持续录音',
      interim: '显示临时结果'
    },
    buttons: {
      startRecording: '开始录音',
      stopRecording: '停止录音',
      clearText: '清除文字',
      downloadTxt: '下载为TXT',
      downloadDoc: '下载为DOC',
      recording: '录音中...'
    },
    transcript: {
      title: '转录',
      copy: '复制到剪贴板',
      placeholder: '您的转录文字将出现在这里...',
      words: '字数',
      characters: '字符数'
    },
    tips: {
      title: '获得最佳效果的提示',
      tip1: '清晰地以适中的速度说话',
      tip2: '最小化背景噪音',
      tip3: '使用高质量的麦克风',
      tip4: '将麦克风放置在距离嘴巴15-30厘米处',
      tip5: '说出标点符号（例如：说"句号"或"逗号"）'
    },
    features: {
      title: '功能',
      feature1: '✅ 实时转录',
      feature2: '✅ 多语言支持',
      feature3: '✅ 持续录音模式',
      feature4: '✅ 临时结果预览',
      feature5: '✅ 可编辑输出',
      feature6: '✅ 导出为TXT/DOC格式'
    },
    compatibility: {
      title: '⚠️ 浏览器兼容性',
      message: '此功能需要支持Web Speech API的现代浏览器（Chrome、Edge、Safari）。'
    },
    footer: {
      copyright: '© 2026 VOTEX. 保留所有权利。'
    },
    notifications: {
      recordingStarted: '🎤 录音已开始！现在开始说话...',
      recordingStopped: '⏹️ 录音已停止',
      textCopied: '文字已复制到剪贴板！',
      noTextToCopy: '没有文字可复制',
      noTextToDownload: '没有文字可下载',
      downloaded: '已下载',
      micDenied: '麦克风访问被拒绝！请在浏览器设置中允许麦克风访问，然后重试。',
      micNotFound: '未找到麦克风！请连接麦克风，然后重试。',
      micError: '访问麦克风失败:',
      noSpeech: '未检测到语音。请重试。',
      audioCapture: '未找到麦克风。请确保已连接。',
      notAllowed: '麦克风访问被拒绝。请允许访问。',
      networkError: '发生网络错误。请检查您的连接。',
      errorOccurred: '发生错误:',
      browserNotSupported: '此浏览器不支持语音识别。请使用Chrome、Edge或Safari。'
    }
  },
  ar: {
    nav: {
      textToSpeech: 'النص إلى كلام',
      speechToText: 'الكلام إلى نص',
      textToSpeechLang: 'النص إلى كلام بلغة أخرى',
      speechToTextLang: 'الكلام إلى نص بلغة أخرى',
      textToSign: 'النص إلى لغة الإشارة'
    },
    common: {
      login: 'تسجيل الدخول'
    },
    banner: {
      recording: 'التسجيل جارٍ - تحدث الآن!'
    },
    hero: {
      title: 'الكلام إلى نص',
      subtitle: 'حوّل صوتك إلى نص فوراً باستخدام التعرف المتقدم على الكلام'
    },
    card: {
      title: 'سجل صوتك'
    },
    status: {
      ready: 'جاهز',
      recording: '🔴 جارٍ التسجيل...',
      initializing: 'جارٍ التهيئة...'
    },
    settings: {
      speechLanguage: 'لغة الكلام:',
      continuous: 'التسجيل المستمر',
      interim: 'إظهار النتائج المؤقتة'
    },
    buttons: {
      startRecording: 'بدء التسجيل',
      stopRecording: 'إيقاف التسجيل',
      clearText: 'مسح النص',
      downloadTxt: 'تنزيل كـ TXT',
      downloadDoc: 'تنزيل كـ DOC',
      recording: 'جارٍ التسجيل...'
    },
    transcript: {
      title: 'النسخ',
      copy: 'نسخ إلى الحافظة',
      placeholder: 'سيظهر النص المنسوخ هنا...',
      words: 'الكلمات',
      characters: 'الأحرف'
    },
    tips: {
      title: 'نصائح لأفضل النتائج',
      tip1: 'تحدث بوضوح وبوتيرة معتدلة',
      tip2: 'قلل من الضوضاء الخلفية',
      tip3: 'استخدم ميكروفون عالي الجودة',
      tip4: 'ضع الميكروفون على بعد 15-30 سم من فمك',
      tip5: 'انطق علامات الترقيم (مثل: قل "نقطة" أو "فاصلة")'
    },
    features: {
      title: 'الميزات',
      feature1: '✅ النسخ في الوقت الفعلي',
      feature2: '✅ دعم لغات متعددة',
      feature3: '✅ وضع التسجيل المستمر',
      feature4: '✅ معاينة النتائج المؤقتة',
      feature5: '✅ إخراج قابل للتحرير',
      feature6: '✅ التصدير بتنسيقات TXT/DOC'
    },
    compatibility: {
      title: '⚠️ توافق المتصفح',
      message: 'تتطلب هذه الميزة متصفحاً حديثاً يدعم Web Speech API (Chrome، Edge، Safari).'
    },
    footer: {
      copyright: '© 2026 VOTEX. جميع الحقوق محفوظة.'
    },
    notifications: {
      recordingStarted: '🎤 بدأ التسجيل! تحدث الآن...',
      recordingStopped: '⏹️ توقف التسجيل',
      textCopied: 'تم نسخ النص إلى الحافظة!',
      noTextToCopy: 'لا يوجد نص للنسخ',
      noTextToDownload: 'لا يوجد نص للتنزيل',
      downloaded: 'تم التنزيل',
      micDenied: 'تم رفض الوصول إلى الميكروفون! يرجى السماح بالوصول إلى الميكروفون في إعدادات متصفحك والمحاولة مرة أخرى.',
      micNotFound: 'لم يتم العثور على ميكروفون! يرجى توصيل ميكروفون والمحاولة مرة أخرى.',
      micError: 'فشل الوصول إلى الميكروفون:',
      noSpeech: 'لم يتم اكتشاف كلام. يرجى المحاولة مرة أخرى.',
      audioCapture: 'لم يتم العثور على ميكروفون. تأكد من توصيله.',
      notAllowed: 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول.',
      networkError: 'حدث خطأ في الشبكة. يرجى التحقق من اتصالك.',
      errorOccurred: 'حدث خطأ:',
      browserNotSupported: 'لا يدعم هذا المتصفح التعرف على الكلام. يرجى استخدام Chrome أو Edge أو Safari.'
    }
  },
  hi: {
    nav: {
      textToSpeech: 'टेक्स्ट टू स्पीच',
      speechToText: 'स्पीच टू टेक्स्ट',
      textToSpeechLang: 'अन्य भाषा में टेक्स्ट टू स्पीच',
      speechToTextLang: 'अन्य भाषा में स्पीच टू टेक्स्ट',
      textToSign: 'टेक्स्ट से सांकेतिक भाषा'
    },
    common: {
      login: 'लॉगिन'
    },
    banner: {
      recording: 'रिकॉर्डिंग चल रही है - अभी बोलें!'
    },
    hero: {
      title: 'स्पीच टू टेक्स्ट',
      subtitle: 'उन्नत स्पीच रिकॉग्निशन का उपयोग करके अपनी आवाज़ को तुरंत टेक्स्ट में बदलें'
    },
    card: {
      title: 'अपनी आवाज़ रिकॉर्ड करें'
    },
    status: {
      ready: 'तैयार',
      recording: '🔴 रिकॉर्डिंग...',
      initializing: 'इनिशियलाइज़ हो रहा है...'
    },
    settings: {
      speechLanguage: 'स्पीच भाषा:',
      continuous: 'निरंतर रिकॉर्डिंग',
      interim: 'अंतरिम परिणाम दिखाएं'
    },
    buttons: {
      startRecording: 'रिकॉर्डिंग शुरू करें',
      stopRecording: 'रिकॉर्डिंग रोकें',
      clearText: 'टेक्स्ट साफ़ करें',
      downloadTxt: 'TXT के रूप में डाउनलोड करें',
      downloadDoc: 'DOC के रूप में डाउनलोड करें',
      recording: 'रिकॉर्डिंग...'
    },
    transcript: {
      title: 'ट्रांसक्रिप्शन',
      copy: 'क्लिपबोर्ड में कॉपी करें',
      placeholder: 'आपका ट्रांसक्राइब किया गया टेक्स्ट यहां दिखाई देगा...',
      words: 'शब्द',
      characters: 'अक्षर'
    },
    tips: {
      title: 'बेहतर परिणामों के लिए टिप्स',
      tip1: 'स्पष्ट रूप से और मध्यम गति से बोलें',
      tip2: 'पृष्ठभूमि शोर को कम करें',
      tip3: 'अच्छी गुणवत्ता वाला माइक्रोफ़ोन उपयोग करें',
      tip4: 'माइक्रोफ़ोन को अपने मुंह से 15-30 सेमी दूर रखें',
      tip5: 'विराम चिह्न बोलें (उदा. "पूर्ण विराम" या "अल्पविराम" कहें)'
    },
    features: {
      title: 'विशेषताएं',
      feature1: '✅ रियल-टाइम ट्रांसक्रिप्शन',
      feature2: '✅ एकाधिक भाषा समर्थन',
      feature3: '✅ निरंतर रिकॉर्डिंग मोड',
      feature4: '✅ अंतरिम परिणाम पूर्वावलोकन',
      feature5: '✅ संपादन योग्य आउटपुट',
      feature6: '✅ TXT/DOC फॉर्मेट में निर्यात करें'
    },
    compatibility: {
      title: '⚠️ ब्राउज़र संगतता',
      message: 'इस फीचर के लिए Web Speech API सपोर्ट वाले आधुनिक ब्राउज़र (Chrome, Edge, Safari) की आवश्यकता है।'
    },
    footer: {
      copyright: '© 2026 VOTEX. सर्वाधिकार सुरक्षित।'
    },
    notifications: {
      recordingStarted: '🎤 रिकॉर्डिंग शुरू हो गई! अभी बोलें...',
      recordingStopped: '⏹️ रिकॉर्डिंग रोक दी गई',
      textCopied: 'टेक्स्ट क्लिपबोर्ड में कॉपी कर दिया गया!',
      noTextToCopy: 'कॉपी करने के लिए कोई टेक्स्ट नहीं है',
      noTextToDownload: 'डाउनलोड करने के लिए कोई टेक्स्ट नहीं है',
      downloaded: 'डाउनलोड हो गया',
      micDenied: 'माइक्रोफ़ोन एक्सेस अस्वीकार कर दिया गया! कृपया अपने ब्राउज़र सेटिंग्स में माइक्रोफ़ोन एक्सेस की अनुमति दें और फिर से प्रयास करें।',
      micNotFound: 'कोई माइक्रोफ़ोन नहीं मिला! कृपया एक माइक्रोफ़ोन कनेक्ट करें और फिर से प्रयास करें।',
      micError: 'माइक्रोफ़ोन एक्सेस करने में विफल:',
      noSpeech: 'कोई स्पीच नहीं मिली। कृपया फिर से प्रयास करें।',
      audioCapture: 'कोई माइक्रोफ़ोन नहीं मिला। सुनिश्चित करें कि यह कनेक्ट है।',
      notAllowed: 'माइक्रोफ़ोन एक्सेस अस्वीकार कर दिया गया था। कृपया एक्सेस की अनुमति दें।',
      networkError: 'नेटवर्क त्रुटि हुई। कृपया अपना कनेक्शन जांचें।',
      errorOccurred: 'एक त्रुटि हुई:',
      browserNotSupported: 'यह ब्राउज़र स्पीच रिकॉग्निशन को सपोर्ट नहीं करता है। कृपया Chrome, Edge, या Safari उपयोग करें।'
    }
  }
};

let currentUILanguage = CONFIG.defaultUILanguage;

// ===== Translation Functions =====
function getTranslation(key) {
  const keys = key.split('.');
  let value = translations[currentUILanguage];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      // Fallback to English
      value = translations.en;
      for (const k2 of keys) {
        if (value && value[k2]) {
          value = value[k2];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  return value;
}

function updateUILanguage(lang) {
  console.log('updateUILanguage called with:', lang);
  currentUILanguage = lang;
  localStorage.setItem('uiLanguage', lang);
  
  // Check if translations exist for this language
  if (!translations[lang]) {
    console.error(`No translations found for language: ${lang}`);
    return;
  }
  
  console.log('Available translation keys:', Object.keys(translations[lang]));
  
  // Update all elements with data-i18n attribute
  let translatedCount = 0;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key);
    
    if (translation && translation !== key) {
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else if (element.tagName === 'SPAN' && element.parentElement.tagName === 'LABEL') {
        element.textContent = translation;
      } else {
        element.textContent = translation;
      }
      translatedCount++;
    } else {
      console.warn(`Translation not found for key: ${key}`);
    }
  });
  
  console.log(`Translated ${translatedCount} elements with data-i18n`);
  
  // Update elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = getTranslation(key);
    
    if (element.textContent.trim() === getTranslation(key) || element.textContent.trim() === '') {
      element.textContent = translation;
    }
  });
  
  // Update elements with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.title = getTranslation(key);
  });
  
  // Update word and character count labels
  updateStats();
  
  console.log(`UI language changed to: ${lang}`);
}


// ===== State Management =====
class SpeechToTextState {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.transcript = '';
    this.interimTranscript = '';
    this.settings = {
      language: CONFIG.defaultLanguage,
      continuous: true,
      interimResults: true
    };
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

const state = new SpeechToTextState();

// ===== DOM Elements =====
const elements = {
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  clearBtn: document.getElementById('clearBtn'),
  copyBtn: document.getElementById('copyBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  downloadDocBtn: document.getElementById('downloadDocBtn'),
  transcriptOutput: document.getElementById('transcriptOutput'),
  statusIndicator: document.getElementById('statusIndicator'),
  languageSelect: document.getElementById('languageSelect'),
  continuousMode: document.getElementById('continuousMode'),
  interimResults: document.getElementById('interimResults'),
  wordCount: document.getElementById('wordCount'),
  charCount: document.getElementById('charCount'),
  audioVisualizer: document.getElementById('audioVisualizer'),
  recordingBanner: document.getElementById('recordingBanner'),
  uiLanguageSelect: document.getElementById('uiLanguageSelect'),
  uploadBtn: document.getElementById('uploadBtn'),
  fileInput: document.getElementById('fileInput'),
  mediaPlayerSection: document.getElementById('mediaPlayerSection'),
  audioPlayer: document.getElementById('audioPlayer'),
  videoPlayer: document.getElementById('videoPlayer'),
  transcribeBtn: document.getElementById('transcribeBtn'),
  closeMediaBtn: document.getElementById('closeMediaBtn'),
  fileName: document.getElementById('fileName'),
  transcriptionStatus: document.getElementById('transcriptionStatus'),
  urlInput: document.getElementById('urlInput'),
  loadUrlBtn: document.getElementById('loadUrlBtn')
};

// ===== Speech Recognition Setup =====
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showError(getTranslation('notifications.browserNotSupported'));
    disableRecordingControls();
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = state.settings.continuous;
  recognition.interimResults = state.settings.interimResults;
  recognition.lang = state.settings.language;

  // Event Handlers
  recognition.onstart = handleRecognitionStart;
  recognition.onend = handleRecognitionEnd;
  recognition.onresult = handleRecognitionResult;
  recognition.onerror = handleRecognitionError;

  return recognition;
}

// ===== Event Handlers =====
function handleRecognitionStart() {
  state.isRecording = true;
  updateUIForRecording(true);
  console.log('Speech recognition started');
  
  // Clear the placeholder text when recording starts
  if (elements.transcriptOutput.textContent === 'Your transcribed text will appear here...') {
    elements.transcriptOutput.textContent = '';
  }
}

function handleRecognitionEnd() {
  state.isRecording = false;
  updateUIForRecording(false);
  console.log('Speech recognition ended');
}

function handleRecognitionResult(event) {
  let interim = '';
  let final = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
   const transcript = event.results[i][0].transcript;
    
    if (event.results[i].isFinal) {
      final += transcript + ' ';
    } else {
      interim += transcript;
    }
  }

  if (final) {
    state.transcript += final;
    state.interimTranscript = '';
    updateTranscript();
  }

  if (state.settings.interimResults && interim) {
    state.interimTranscript = interim;
    updateTranscript();
  }
}

function handleRecognitionError(event) {
  console.error('Speech recognition error:', event.error);
  
  const errorMessages = {
    'no-speech': getTranslation('notifications.noSpeech'),
    'audio-capture': getTranslation('notifications.audioCapture'),
    'not-allowed': getTranslation('notifications.notAllowed'),
    'network': getTranslation('notifications.networkError')
  };

  const message = errorMessages[event.error] || `${getTranslation('notifications.errorOccurred')} ${event.error}`;
  showError(message);
  stopRecording();
}

// ===== Recording Controls =====
async function startRecording() {
  // Show immediate feedback
  elements.startBtn.innerHTML = '<span class="btn-icon">⏳</span>Initializing...';
  elements.startBtn.disabled = true;

  try {
    // Request microphone permission explicitly
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop the stream immediately - we just needed permission
    stream.getTracks().forEach(track => track.stop());
    
    // Initialize recognition if needed
    if (!state.recognition) {
      state.recognition = initSpeechRecognition();
    }

    if (!state.recognition) {
      elements.startBtn.innerHTML = '<span class="btn-icon">🎤</span>Start Recording';
      elements.startBtn.disabled = false;
      return;
    }

    // Update recognition settings
    state.recognition.continuous = state.settings.continuous;
    state.recognition.interimResults = state.settings.interimResults;
    state.recognition.lang = state.settings.language;

    // Start recognition
    state.recognition.start();
    showNotification(getTranslation('notifications.recordingStarted'), 'success');
    
  } catch (error) {
    console.error('Microphone access error:', error);
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      showError(getTranslation('notifications.micDenied'));
    } else if (error.name === 'NotFoundError') {
      showError(getTranslation('notifications.micNotFound'));
    } else if (error.name === 'InvalidStateError') {
      console.log('Recognition already started');
      state.recognition.stop();
      setTimeout(() => state.recognition.start(), 100);
    } else {
      showError(getTranslation('notifications.micError') + ' ' + error.message);
    }
    
    elements.startBtn.innerHTML = '<span class="btn-icon">🎤</span>Start Recording';
    elements.startBtn.disabled = false;
  }
}

function stopRecording() {
  if (state.recognition && state.isRecording) {
    state.recognition.stop();
    showNotification(getTranslation('notifications.recordingStopped'), 'info');
  }
}

function clearTranscript() {
  if (confirm('Are you sure you want to clear all transcribed text?')) {
    state.transcript = '';
    state.interimTranscript = '';
    elements.transcriptOutput.textContent = '';
    updateStats();
  }
}

// ===== UI Updates =====
function updateUIForRecording(isRecording) {
  if (isRecording) {
    // Update button states
    elements.startBtn.disabled = true;
    elements.startBtn.innerHTML = `<span class="btn-icon">🎤</span><span data-i18n="buttons.recording">${getTranslation('buttons.recording')}</span>`;
    elements.startBtn.classList.add('recording');
    elements.stopBtn.disabled = false;
    
    // Update status indicator
    elements.statusIndicator.classList.add('active');
    elements.statusIndicator.querySelector('.status-text').textContent = getTranslation('status.recording');
    elements.statusIndicator.querySelector('.status-text').setAttribute('data-i18n', 'status.recording');
    
    // Show visualizer and banner
    elements.audioVisualizer.classList.add('active');
    elements.recordingBanner.classList.add('active');
    
    // Scroll banner into view
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } else {
    // Reset button states
    elements.startBtn.disabled = false;
    elements.startBtn.innerHTML = `<span class="btn-icon">🎤</span><span data-i18n="buttons.startRecording">${getTranslation('buttons.startRecording')}</span>`;
    elements.startBtn.classList.remove('recording');
    elements.stopBtn.disabled = true;
    
    // Reset status indicator
    elements.statusIndicator.classList.remove('active');
    elements.statusIndicator.querySelector('.status-text').textContent = getTranslation('status.ready');
    elements.statusIndicator.querySelector('.status-text').setAttribute('data-i18n', 'status.ready');
    
    // Hide visualizer and banner
    elements.audioVisualizer.classList.remove('active');
    elements.recordingBanner.classList.remove('active');
  }
}

function updateTranscript() {
  const placeholder = getTranslation('transcript.placeholder');
  const fullText = state.transcript + (state.interimTranscript ? `<span style="color: #93c5fd;">${state.interimTranscript}</span>` : '');
  elements.transcriptOutput.innerHTML = fullText || placeholder;
  
  // Auto-scroll to bottom
  elements.transcriptOutput.scrollTop = elements.transcriptOutput.scrollHeight;
  
  updateStats();
}

function updateStats() {
  const text = elements.transcriptOutput.textContent.trim();
  const placeholder = getTranslation('transcript.placeholder');
  const isPlaceholder = text === placeholder;
  const words = (text && !isPlaceholder) ? text.split(/\s+/).length : 0;
  const chars = isPlaceholder ? 0 : text.length;
  
  elements.wordCount.innerHTML = `<span data-i18n="transcript.words">${getTranslation('transcript.words')}</span>: ${words}`;
  elements.charCount.innerHTML = `<span data-i18n="transcript.characters">${getTranslation('transcript.characters')}</span>: ${chars}`;
}

// ===== Text Operations =====
function copyToClipboard() {
  const text = elements.transcriptOutput.textContent;
  const placeholder = getTranslation('transcript.placeholder');
  
  if (!text || text === placeholder) {
    showNotification(getTranslation('notifications.noTextToCopy'), 'warning');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showNotification(getTranslation('notifications.textCopied'), 'success');
  }).catch(err => {
    showError('Failed to copy text: ' + err.message);
  });
}

function downloadAsText() {
  const text = elements.transcriptOutput.textContent;
  const placeholder = getTranslation('transcript.placeholder');
  
  if (!text || text === placeholder) {
    showNotification(getTranslation('notifications.noTextToDownload'), 'warning');
    return;
  }

  const blob = new Blob([text], { type: 'text/plain' });
  downloadFile(blob, 'transcript.txt');
}

function downloadAsDoc() {
  const text = elements.transcriptOutput.textContent;
  const placeholder = getTranslation('transcript.placeholder');
  
  if (!text || text === placeholder) {
    showNotification(getTranslation('notifications.noTextToDownload'), 'warning');
    return;
  }

  // Create simple HTML document for Word
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Transcript</title>
    </head>
    <body>
      <h1>Speech to Text Transcript</h1>
      <p>${text.replace(/\n/g, '</p><p>')}</p>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword' });
  downloadFile(blob, 'transcript.doc');
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification(`${getTranslation('notifications.downloaded')} ${filename}`, 'success');
}

// ===== Settings Management =====
function updateLanguage() {
  state.settings.language = elements.languageSelect.value;
  
  if (state.isRecording) {
    stopRecording();
    setTimeout(() => startRecording(), 300);
  }
}

function updateContinuousMode() {
  state.settings.continuous = elements.continuousMode.checked;
}

function updateInterimResults() {
  state.settings.interimResults = elements.interimResults.checked;
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    font-weight: 600;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showError(message) {
  showNotification(message, 'error');
  const notifications = document.querySelectorAll('.notification-error');
  notifications.forEach(notification => {
    notification.style.background = '#ef4444';
  });
}

function disableRecordingControls() {
  elements.startBtn.disabled = true;
  elements.stopBtn.disabled = true;
  elements.startBtn.title = 'Speech recognition not supported in this browser';
}

// ===== Media Upload & Transcription =====
let currentMediaSource = null;
let mediaContext = null;
let mediaStream = null;

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file type
  const isAudio = file.type.startsWith('audio/');
  const isVideo = file.type.startsWith('video/');
  
  if (!isAudio && !isVideo) {
    showError('Please upload an audio or video file');
    return;
  }
  
  // Display file name
  elements.fileName.textContent = file.name;
  
  // Create URL for the file
  const fileURL = URL.createObjectURL(file);
  
  // Show the media player section
  elements.mediaPlayerSection.style.display = 'block';
  
  // Load file into appropriate player
  if (isAudio) {
    elements.audioPlayer.style.display = 'block';
    elements.videoPlayer.style.display = 'none';
    elements.audioPlayer.src = fileURL;
    currentMediaSource = elements.audioPlayer;
  } else {
    elements.videoPlayer.style.display = 'block';
    elements.audioPlayer.style.display = 'none';
    elements.videoPlayer.src = fileURL;
    currentMediaSource = elements.videoPlayer;
  }
  
  elements.transcriptionStatus.textContent = 'Loading file...';
  showNotification(`📁 File loaded: ${file.name}. Starting transcription automatically...`, 'success');
  
  // Auto-start transcription after file loads
  setTimeout(() => {
    transcribeMedia();
  }, 500);
}

function closeMediaPlayer() {
  if (currentMediaSource && currentMediaSource !== 'youtube') {
    currentMediaSource.pause();
    currentMediaSource.src = '';
  }
  
  // Clear YouTube iframe if present
  const iframeContainer = document.getElementById('youtubeIframeContainer');
  if (iframeContainer) {
    iframeContainer.innerHTML = '';
  }
  
  // Stop any ongoing media transcription
  if (state.recognition && state.isRecording) {
    stopRecording();
  }
  
  elements.mediaPlayerSection.style.display = 'none';
  elements.fileInput.value = '';
  elements.urlInput.value = '';
  currentMediaSource = null;
  
  if (mediaContext) {
    mediaContext.close();
    mediaContext = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

async function transcribeMedia() {
  if (!currentMediaSource) {
    showError('No media file loaded');
    return;
  }
  
  // Handle YouTube videos differently (still uses microphone)
  if (currentMediaSource === 'youtube') {
    transcribeYouTubeWithMic();
    return;
  }
  
  elements.transcriptionStatus.textContent = '🎯 Starting transcription...';
  elements.transcribeBtn.disabled = true;
  
  try {
    // Get the audio source (file or URL)
    const audioSrc = currentMediaSource.src;
    
    // Check if it's a blob URL (uploaded file) or external URL
    if (audioSrc.startsWith('blob:')) {
      // For blob URLs, we need to send the actual file
      // Get the file from fileInput
      const file = elements.fileInput.files[0];
      if (!file) {
        throw new Error('File not found');
      }
      
      elements.transcriptionStatus.textContent = '📤 Uploading file for transcription...';
      
      // Send file to backend for transcription
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', elements.languageSelect.value);
      
      const response = await fetch(buildBackendUrl('/api/transcribe'), {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add transcribed text to the output
      const transcribedText = result.text || result.transcript || '';
      if (transcribedText) {
        elements.transcriptOutput.textContent += (elements.transcriptOutput.textContent ? '\n\n' : '') + transcribedText;
        state.transcript = elements.transcriptOutput.textContent;
        updateStats();
        elements.transcriptionStatus.textContent = '✅ Transcription completed!';
        showNotification('✅ Transcription completed successfully!', 'success');
      } else {
        throw new Error('No transcript returned from server');
      }
      
    } else {
      // For external URLs, send URL to backend
      elements.transcriptionStatus.textContent = '📥 Downloading and transcribing media...';
      
      const response = await fetch(buildBackendUrl('/api/transcribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: audioSrc,
          language: elements.languageSelect.value
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add transcribed text
      const transcribedText = result.text || result.transcript || '';
      if (transcribedText) {
        elements.transcriptOutput.textContent += (elements.transcriptOutput.textContent ? '\n\n' : '') + transcribedText;
        state.transcript = elements.transcriptOutput.textContent;
        updateStats();
        elements.transcriptionStatus.textContent = '✅ Transcription completed!';
        showNotification('✅ Transcription completed successfully!', 'success');
      } else {
        throw new Error('No transcript returned from server');
      }
    }
    
  } catch (error) {
    console.error('Media transcription error:', error);
    
    // Show helpful error messages
    let errorMsg = 'Failed to transcribe media: ' + error.message;
    if (error.message.includes('instructions')) {
      errorMsg = '⚠️ Transcription service not configured. Please install Whisper or set up API keys. See server logs.';
    }
    
    showError(errorMsg);
    elements.transcriptionStatus.textContent = '❌ Transcription failed';
  } finally {
    elements.transcribeBtn.disabled = false;
  }
}

// Special handling for YouTube video transcription
function transcribeYouTubeWithMic() {
  // Use microphone to capture audio
  elements.transcriptionStatus.textContent = '🎤 Microphone active - capturing YouTube audio... Play the video now!';
  
  try {
    // Configure and start recognition
    if (!state.recognition) {
      state.recognition = initSpeechRecognition();
    }
    
    state.recognition.continuous = true;
    state.recognition.interimResults = true;
    state.recognition.lang = elements.languageSelect.value;
    
    // Start recognition
    state.recognition.start();
    state.isRecording = true;
    
    // Update UI
    elements.recordingBanner.classList.add('active');
    elements.transcribeBtn.textContent = '⏹️ Stop Transcription';
    elements.transcribeBtn.style.background = '#ef4444';
    
    // When clicked again, stop
    elements.transcribeBtn.onclick = () => {
      state.recognition.stop();
      state.isRecording = false;
      elements.recordingBanner.classList.remove('active');
      elements.transcribeBtn.innerHTML = '<span class="btn-icon">🎯</span><span data-i18n="buttons.transcribe">Transcribe Audio</span>';
      elements.transcribeBtn.style.background = '';
      elements.transcribeBtn.onclick = null;
      elements.transcribeBtn.addEventListener('click', transcribeMedia);
      elements.transcriptionStatus.textContent = '✅ Transcription stopped';
      showNotification('Transcription stopped', 'success');
    };
    
    showNotification('🎤 Microphone active! Play the YouTube video now. The audio will be transcribed as your mic picks it up.', 'success');
    
  } catch (error) {
    console.error('YouTube transcription error:', error);
    showError('Failed to start transcription: ' + error.message);
    elements.transcriptionStatus.textContent = '❌ Transcription failed';
    elements.transcribeBtn.disabled = false;
  }
}

// ===== URL Loading Functions =====
function extractYouTubeId(url) {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function isDirectMediaUrl(url) {
  // Check if URL points to a direct media file
  const mediaExtensions = ['.mp3', '.mp4', '.wav', '.ogg', '.webm', '.m4a', '.aac', '.flac'];
  const lowerUrl = url.toLowerCase();
  return mediaExtensions.some(ext => lowerUrl.includes(ext));
}

function loadFromUrl() {
  const url = elements.urlInput.value.trim();
  
  if (!url) {
    showError('Please enter a URL');
    return;
  }
  
  // Check if it's a YouTube URL
  const youtubeId = extractYouTubeId(url);
  
  if (youtubeId) {
    loadYouTubeVideo(youtubeId, url);
  } else if (isDirectMediaUrl(url)) {
    loadDirectMedia(url);
  } else {
    // Try to load as direct media anyway
    loadDirectMedia(url);
  }
}

function loadYouTubeVideo(videoId, originalUrl) {
  // Show warning about YouTube limitations
  showNotification('📺 YouTube video loaded! Note: Transcription uses your microphone to capture audio from speakers.', 'info');
  
  // Display file name
  elements.fileName.textContent = `YouTube Video (${videoId})`;
  
  // Show the media player section
  elements.mediaPlayerSection.style.display = 'block';
  
  // Hide standard players, create YouTube iframe
  elements.audioPlayer.style.display = 'none';
  elements.videoPlayer.style.display = 'none';
  
  // Create or update YouTube iframe
  let iframeContainer = document.getElementById('youtubeIframeContainer');
  if (!iframeContainer) {
    iframeContainer = document.createElement('div');
    iframeContainer.id = 'youtubeIframeContainer';
    iframeContainer.style.cssText = 'width: 100%; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden;';
    elements.mediaPlayerSection.querySelector('.media-player-container').appendChild(iframeContainer);
  }
  
  // Embed YouTube video with enablejsapi for potential control
  iframeContainer.innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen
      style="border-radius: 10px;">
    </iframe>
  `;
  
  currentMediaSource = 'youtube';
  elements.transcriptionStatus.innerHTML = `
    <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <strong>💡 YouTube Transcription:</strong><br>
      ✅ Microphone will start automatically to capture audio<br>
      ✅ Turn up your speakers/volume<br>
      ✅ Play the YouTube video now<br>
      ✅ Your microphone will transcribe the audio in real-time
    </div>
  `;
  
  showNotification(`📺 YouTube video loaded! Microphone transcription starting automatically...`, 'success');
  
  // Auto-start transcription for YouTube
  setTimeout(() => {
    transcribeYouTubeWithMic();
  }, 1000);
}

function loadDirectMedia(url) {
  try {
    // Determine if it's likely audio or video
    const isAudio = url.match(/\.(mp3|wav|ogg|m4a|aac|flac)/i);
    
    // Display file name
    const fileName = url.split('/').pop().split('?')[0] || 'Media from URL';
    elements.fileName.textContent = fileName;
    
    // Show the media player section
    elements.mediaPlayerSection.style.display = 'block';
    
    // Hide YouTube iframe if exists
    const iframeContainer = document.getElementById('youtubeIframeContainer');
    if (iframeContainer) {
      iframeContainer.style.display = 'none';
    }
    
    // Load file into appropriate player
    if (isAudio) {
      elements.audioPlayer.style.display = 'block';
      elements.videoPlayer.style.display = 'none';
      elements.audioPlayer.src = url;
      currentMediaSource = elements.audioPlayer;
    } else {
      elements.videoPlayer.style.display = 'block';
      elements.audioPlayer.style.display = 'none';
      elements.videoPlayer.src = url;
      currentMediaSource = elements.videoPlayer;
    }
    
    elements.transcriptionStatus.textContent = 'Loading media...';
    showNotification(`📥 Media loaded from URL. Starting transcription automatically...`, 'success');
    
    // Handle load errors
    currentMediaSource.onerror = () => {
      showError('Failed to load media from URL. Check if the URL is valid and accessible.');
      elements.transcriptionStatus.textContent = '❌ Failed to load media';
    };
    
    // Auto-start transcription after media loads
    currentMediaSource.onloadedmetadata = () => {
      setTimeout(() => {
        transcribeMedia();
      }, 500);
    };
    
  } catch (error) {
    console.error('URL loading error:', error);
    showError('Failed to load media from URL: ' + error.message);
  }
}

// ===== Event Listeners =====
function attachEventListeners() {
  elements.startBtn.addEventListener('click', startRecording);
  elements.stopBtn.addEventListener('click', stopRecording);
  elements.clearBtn.addEventListener('click', clearTranscript);
  elements.copyBtn.addEventListener('click', copyToClipboard);
  elements.downloadBtn.addEventListener('click', downloadAsText);
  elements.downloadDocBtn.addEventListener('click', downloadAsDoc);
  elements.languageSelect.addEventListener('change', updateLanguage);
  elements.continuousMode.addEventListener('change', updateContinuousMode);
  elements.interimResults.addEventListener('change', updateInterimResults);
  elements.uiLanguageSelect.addEventListener('change', (e) => {
    updateUILanguage(e.target.value);
  });
  
  // Upload functionality
  elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', handleFileUpload);
  elements.transcribeBtn.addEventListener('click', transcribeMedia);
  elements.closeMediaBtn.addEventListener('click', closeMediaPlayer);
  
  // URL loading functionality
  elements.loadUrlBtn.addEventListener('click', loadFromUrl);
  elements.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadFromUrl();
    }
  });
  
  // Update stats when user manually edits
  elements.transcriptOutput.addEventListener('input', () => {
    state.transcript = elements.transcriptOutput.textContent;
    updateStats();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        downloadAsText();
      } else if (e.key === 'c' && !window.getSelection().toString()) {
        e.preventDefault();
        copyToClipboard();
      }
    }
  });
}

// ===== Add CSS Animations =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ===== Initialization =====
function init() {
  console.log('Initializing Speech to Text module...');
  
  // Check if all elements are found
  const missingElements = Object.entries(elements).filter(([key, value]) => !value).map(([key]) => key);
  if (missingElements.length > 0) {
    console.error('Missing elements:', missingElements);
    return;
  }
  
  // Initialize recognition
  state.recognition = initSpeechRecognition();
  
  // Attach event listeners
  attachEventListeners();
  
  // Initialize UI language from saved preference
  const savedLanguage = localStorage.getItem('uiLanguage') || 'en';
  if (elements.uiLanguageSelect) {
    elements.uiLanguageSelect.value = savedLanguage;
    updateUILanguage(savedLanguage);
  }
  
  // Initialize stats
  updateStats();
  
  console.log('Speech to Text module initialized successfully');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { state, startRecording, stopRecording };
}
