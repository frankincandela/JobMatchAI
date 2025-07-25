// AI Analysis service using OpenAI
class AIAnalysisService {
    static apiKey = null;
    static baseUrl = 'https://api.openai.com/v1';
    static model = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

    static init() {
        // Get API key from environment or fallback
        if (typeof process !== 'undefined' && process.env) {
            this.apiKey = process.env.OPENAI_API_KEY;
        } else if (typeof window !== 'undefined') {
            this.apiKey = window.OPENAI_API_KEY;
        }
        
        if (!this.apiKey) {
            this.apiKey = 'your-openai-api-key-here';
            console.warn('⚠️ OpenAI API key not configured. AI analysis will use fallback method.');
        }
    }

    static async analyzeProfile(profileData) {
        console.log('🧠 Starting AI profile analysis...');
        
        try {
            // Check if mock mode is enabled
            if (window.mockAIService && window.mockAIService.isEnabled) {
                console.log('🧪 Using Mock AI Service for testing');
                const mockResult = await window.mockAIService.analyzeProfile(profileData);
                return {
                    success: true,
                    analysis: mockResult,
                    source: 'mock'
                };
            }
            
            // Validate profile data
            if (!profileData.biography || profileData.biography.trim().length < 50) {
                return {
                    success: false,
                    message: 'Biografia troppo breve per un\'analisi accurata (minimo 50 caratteri)'
                };
            }

            // Try OpenAI analysis first
            if (this.apiKey && this.apiKey !== 'your-openai-api-key-here') {
                const aiResult = await this.performOpenAIAnalysis(profileData);
                if (aiResult.success) {
                    return aiResult;
                }
            }

            // Fallback to local analysis
            console.log('🔄 Using fallback local analysis...');
            return this.performLocalAnalysis(profileData);

        } catch (error) {
            console.error('❌ AI Analysis error:', error);
            return {
                success: false,
                message: 'Errore durante l\'analisi AI. Riprova più tardi.'
            };
        }
    }

    static async performOpenAIAnalysis(profileData) {
        try {
            const systemPrompt = `
Sei un esperto career counselor con 20 anni di esperienza nell'orientamento professionale.
Analizza il profilo professionale fornito e restituisci SEMPRE una risposta in formato JSON valido seguendo ESATTAMENTE questa struttura:

{
  "mainSector": "uno tra: Informatica, Ristorazione, Accoglienza, Agricoltura, Imprenditoria",
  "description": "spiegazione dettagliata del perché questo settore è il più adatto",
  "confidence": 0.85,
  "strengths": ["punto di forza 1", "punto di forza 2", "punto di forza 3"],
  "recommendations": ["raccomandazione 1", "raccomandazione 2", "raccomandazione 3"],
  "skillGaps": ["skill mancante 1", "skill mancante 2"],
  "careerPaths": [
    {
      "title": "Percorso principale",
      "description": "descrizione del percorso",
      "timeframe": "6-12 mesi",
      "difficulty": "medio"
    },
    {
      "title": "Percorso alternativo", 
      "description": "descrizione percorso alternativo",
      "timeframe": "12-18 mesi",
      "difficulty": "alto"
    }
  ]
}

IMPORTANTE: Rispondi SOLO con il JSON, nessun altro testo.
            `;

            const userPrompt = `
Analizza questo profilo professionale:

BIOGRAFIA E ASPIRAZIONI:
${profileData.biography}

EDUCAZIONE:
${profileData.education || 'Non specificata'}

ESPERIENZE LAVORATIVE:
${profileData.experiences.map(exp => `
- ${exp.jobTitle} (${exp.duration})
  ${exp.description}
`).join('\n') || 'Nessuna esperienza specificata'}

COMPETENZE TRASVERSALI:
${profileData.softSkills || 'Non specificate'}

CERTIFICAZIONI:
${profileData.certifications || 'Nessuna certificazione'}

HOBBY E INTERESSI:
${profileData.hobbies || 'Non specificati'}

Fornisci un'analisi completa in formato JSON seguendo la struttura richiesta.
            `;

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    response_format: { type: "json_object" },
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('OpenAI API error:', errorData);
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const analysisResult = JSON.parse(data.choices[0].message.content);

            // Validate the response structure
            if (!this.validateAnalysisResult(analysisResult)) {
                throw new Error('Invalid AI response structure');
            }

            console.log('✅ OpenAI analysis completed successfully');
            return {
                success: true,
                data: analysisResult
            };

        } catch (error) {
            console.error('❌ OpenAI analysis failed:', error);
            return {
                success: false,
                message: 'Errore durante l\'analisi OpenAI'
            };
        }
    }

    static performLocalAnalysis(profileData) {
        console.log('🔧 Performing local career analysis...');
        
        try {
            const biography = profileData.biography.toLowerCase();
            const education = (profileData.education || '').toLowerCase();
            const experiences = profileData.experiences || [];
            const skills = (profileData.softSkills || '').toLowerCase();
            const hobbies = (profileData.hobbies || '').toLowerCase();

            // Sector keywords for matching
            const sectorKeywords = {
                'Informatica': {
                    keywords: ['programma', 'sviluppo', 'web', 'computer', 'software', 'app', 'javascript', 'python', 'java', 'react', 'flutter', 'tecnologia', 'digitale', 'coding', 'database'],
                    color: '#2196F3'
                },
                'Ristorazione': {
                    keywords: ['cuoco', 'ristorazione', 'chef', 'cucina', 'ristorante', 'food', 'beverage', 'servizio', 'menu', 'piatti', 'gastronomia', 'alimentare'],
                    color: '#FF9800'
                },
                'Accoglienza': {
                    keywords: ['hotel', 'turismo', 'accoglienza', 'reception', 'ospitalità', 'travel', 'eventi', 'clienti', 'customer', 'service', 'guest'],
                    color: '#4CAF50'
                },
                'Agricoltura': {
                    keywords: ['agricoltura', 'agricolo', 'campagna', 'coltivazione', 'terra', 'biologico', 'sostenibile', 'ambiente', 'natura', 'piante', 'animali'],
                    color: '#8BC34A'
                },
                'Imprenditoria': {
                    keywords: ['impresa', 'business', 'startup', 'manager', 'azienda', 'leadership', 'vendite', 'marketing', 'gestione', 'amministrazione', 'finance'],
                    color: '#9C27B0'
                }
            };

            // Calculate sector scores
            const sectorScores = {};
            const allText = `${biography} ${education} ${experiences.map(e => e.description).join(' ')} ${skills} ${hobbies}`;

            Object.keys(sectorKeywords).forEach(sector => {
                let score = 0;
                const keywords = sectorKeywords[sector].keywords;
                
                keywords.forEach(keyword => {
                    if (allText.includes(keyword)) {
                        score += 1;
                        // Weight biography more heavily
                        if (biography.includes(keyword)) {
                            score += 2;
                        }
                        // Weight experience descriptions heavily
                        experiences.forEach(exp => {
                            if (exp.description.toLowerCase().includes(keyword)) {
                                score += 1.5;
                            }
                        });
                    }
                });

                sectorScores[sector] = score;
            });

            // Find the best matching sector
            const bestSector = Object.keys(sectorScores).reduce((a, b) => 
                sectorScores[a] > sectorScores[b] ? a : b
            );

            const maxScore = Math.max(...Object.values(sectorScores));
            const confidence = Math.min(maxScore / 10, 1); // Normalize to 0-1

            // Generate strengths based on profile content
            const strengths = this.generateStrengths(profileData, bestSector);
            
            // Generate recommendations
            const recommendations = this.generateRecommendations(profileData, bestSector);
            
            // Generate skill gaps
            const skillGaps = this.generateSkillGaps(profileData, bestSector);
            
            // Generate career paths
            const careerPaths = this.generateCareerPaths(bestSector);

            const result = {
                mainSector: bestSector,
                description: this.generateSectorDescription(bestSector, confidence, profileData),
                confidence: Math.max(confidence, 0.6), // Minimum confidence
                strengths: strengths,
                recommendations: recommendations,
                skillGaps: skillGaps,
                careerPaths: careerPaths
            };

            console.log('✅ Local analysis completed');
            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error('❌ Local analysis error:', error);
            return {
                success: false,
                message: 'Errore durante l\'analisi locale'
            };
        }
    }

    static generateStrengths(profileData, sector) {
        const baseStrengths = {
            'Informatica': [
                'Orientamento alla risoluzione di problemi',
                'Capacità di apprendimento continuo',
                'Pensiero logico e analitico'
            ],
            'Ristorazione': [
                'Attenzione ai dettagli',
                'Capacità di lavorare sotto pressione',
                'Orientamento al servizio clienti'
            ],
            'Accoglienza': [
                'Eccellenti capacità comunicative',
                'Orientamento al cliente',
                'Flessibilità e adattabilità'
            ],
            'Agricoltura': [
                'Connessione con la natura',
                'Pazienza e perseveranza',
                'Attenzione alla sostenibilità'
            ],
            'Imprenditoria': [
                'Leadership naturale',
                'Visione strategica',
                'Capacità di prendere decisioni'
            ]
        };

        const strengths = [...baseStrengths[sector]];

        // Add personalized strengths based on profile
        if (profileData.experiences && profileData.experiences.length > 0) {
            strengths.push('Esperienza pratica nel settore');
        }

        if (profileData.education) {
            strengths.push('Solida base educativa');
        }

        if (profileData.softSkills) {
            strengths.push('Competenze trasversali sviluppate');
        }

        return strengths.slice(0, 4); // Limit to 4 strengths
    }

    static generateRecommendations(profileData, sector) {
        const baseRecommendations = {
            'Informatica': [
                'Approfondisci le tecnologie più richieste nel mercato',
                'Crea un portfolio online con i tuoi progetti',
                'Partecipa a community tech e eventi di networking'
            ],
            'Ristorazione': [
                'Considera corsi di specializzazione culinaria',
                'Sviluppa competenze in gestione del food cost',
                'Acquisisci esperienza in diversi tipi di cucina'
            ],
            'Accoglienza': [
                'Migliora le competenze linguistiche',
                'Studia tecniche di customer service avanzate',
                'Specializzati in revenue management'
            ],
            'Agricoltura': [
                'Esplora tecniche di agricoltura sostenibile',
                'Studia le nuove tecnologie AgriTech',
                'Considera la specializzazione in agricoltura biologica'
            ],
            'Imprenditoria': [
                'Sviluppa un business plan dettagliato',
                'Studia tecniche di marketing digitale',
                'Crea una rete di contatti professionali'
            ]
        };

        return baseRecommendations[sector] || [];
    }

    static generateSkillGaps(profileData, sector) {
        const commonSkillGaps = {
            'Informatica': ['Conoscenza cloud computing', 'Competenze in AI/ML'],
            'Ristorazione': ['Gestione inventario digitale', 'Marketing per ristoranti'],
            'Accoglienza': ['Revenue management', 'Competenze digitali'],
            'Agricoltura': ['Tecnologie precision farming', 'Marketing diretto'],
            'Imprenditoria': ['Digital marketing', 'Gestione finanziaria']
        };

        return commonSkillGaps[sector] || [];
    }

    static generateCareerPaths(sector) {
        const careerPaths = {
            'Informatica': [
                {
                    title: 'Sviluppatore Full-Stack',
                    description: 'Specializzazione nello sviluppo web completo con focus su tecnologie moderne',
                    timeframe: '6-12 mesi',
                    difficulty: 'medio'
                },
                {
                    title: 'Data Scientist',
                    description: 'Analisi dati e machine learning per business intelligence',
                    timeframe: '12-18 mesi',
                    difficulty: 'alto'
                }
            ],
            'Ristorazione': [
                {
                    title: 'Chef de Partie',
                    description: 'Specializzazione in una stazione specifica della brigata di cucina',
                    timeframe: '6-12 mesi',
                    difficulty: 'medio'
                },
                {
                    title: 'Restaurant Manager',
                    description: 'Gestione completa di un ristorante con responsabilità operative',
                    timeframe: '18-24 mesi',
                    difficulty: 'alto'
                }
            ],
            'Accoglienza': [
                {
                    title: 'Guest Relations Manager',
                    description: 'Gestione dell\'esperienza cliente in strutture alberghiere',
                    timeframe: '6-12 mesi',
                    difficulty: 'medio'
                },
                {
                    title: 'Hotel General Manager',
                    description: 'Direzione operativa completa di strutture ricettive',
                    timeframe: '24-36 mesi',
                    difficulty: 'alto'
                }
            ],
            'Agricoltura': [
                {
                    title: 'Agricoltore Specializzato',
                    description: 'Specializzazione in colture biologiche o tecniche innovative',
                    timeframe: '12-18 mesi',
                    difficulty: 'medio'
                },
                {
                    title: 'Agribusiness Manager',
                    description: 'Gestione aziendale agricola con focus commerciale',
                    timeframe: '18-24 mesi',
                    difficulty: 'alto'
                }
            ],
            'Imprenditoria': [
                {
                    title: 'Startup Founder',
                    description: 'Creazione e lancio di una startup innovativa',
                    timeframe: '12-18 mesi',
                    difficulty: 'alto'
                },
                {
                    title: 'Business Consultant',
                    description: 'Consulenza strategica per PMI e grandi aziende',
                    timeframe: '18-24 mesi',
                    difficulty: 'alto'
                }
            ]
        };

        return careerPaths[sector] || [];
    }

    static generateSectorDescription(sector, confidence, profileData) {
        const descriptions = {
            'Informatica': `Basandoci sulla tua biografia e sulle competenze indicate, il settore informatico sembra allinearsi perfettamente con il tuo profilo. Le tue capacità analitiche e l'interesse per la tecnologia sono punti di forza chiave per questo campo in rapida crescita.`,
            'Ristorazione': `Il tuo profilo mostra una forte inclinazione verso il settore della ristorazione. La tua attenzione ai dettagli e la passione per il servizio clienti sono elementi fondamentali per eccellere in questo ambito dinamico.`,
            'Accoglienza': `Le tue competenze comunicative e l'orientamento al servizio indicano una naturale predisposizione per il settore dell'accoglienza. La tua capacità di relazionarti con le persone è un asset prezioso in questo campo.`,
            'Agricoltura': `Il tuo interesse per la sostenibilità e il contatto con la natura suggerisce una forte compatibilità con il settore agricolo. Le tue competenze possono contribuire all'innovazione in questo settore tradizionale ma in evoluzione.`,
            'Imprenditoria': `La tua visione strategica e le capacità di leadership emerse dal profilo indicano un forte potenziale imprenditoriale. Le tue competenze sono ideali per avviare e gestire attività commerciali innovative.`
        };

        return descriptions[sector] || `Il settore ${sector} sembra adatto al tuo profilo professionale.`;
    }

    static async analyzeCVContent(cvText, userProfile) {
        console.log('🧠 Starting AI CV analysis...');
        
        try {
            // Check if mock mode is enabled
            if (window.mockAIService && window.mockAIService.isEnabled) {
                console.log('🧪 Using Mock AI Service for CV analysis');
                const mockResult = await window.mockAIService.analyzeCVContent(cvText, userProfile);
                return {
                    success: true,
                    analysis: mockResult,
                    source: 'mock'
                };
            }
            
            // Validate CV content
            if (!cvText || cvText.trim().length < 100) {
                return {
                    success: false,
                    message: 'Contenuto CV troppo breve per un\'analisi accurata (minimo 100 caratteri)'
                };
            }

            // Try OpenAI analysis first
            if (this.apiKey && this.apiKey !== 'your-openai-api-key-here') {
                const aiResult = await this.performOpenAICVAnalysis(cvText, userProfile);
                if (aiResult.success) {
                    return aiResult;
                }
            }

            // Fallback to local analysis
            console.log('🔄 Using fallback local CV analysis...');
            return this.performLocalCVAnalysis(cvText, userProfile);

        } catch (error) {
            console.error('❌ CV Analysis error:', error);
            return {
                success: false,
                message: 'Errore durante l\'analisi CV. Riprova più tardi.'
            };
        }
    }

    static async performOpenAICVAnalysis(cvText, userProfile) {
        try {
            const prompt = `Analizza questo CV e fornisci una risposta in formato JSON con la seguente struttura:
{
  "sector": "settore consigliato tra: Informatica, Ristorazione, Accoglienza, Agricoltura, Imprenditoria",
  "match_score": 85,
  "analysis": {
    "strengths": ["punto di forza 1", "punto di forza 2", "punto di forza 3"],
    "skills": ["competenza 1", "competenza 2", "competenza 3"],
    "recommendations": ["raccomandazione 1", "raccomandazione 2"],
    "career_paths": ["percorso 1", "percorso 2"]
  }
}

CV da analizzare:
${cvText}

${userProfile ? `Profilo utente: ${JSON.stringify(userProfile)}` : ''}`;

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'Sei un esperto analista di CV con 20 anni di esperienza. Rispondi sempre in formato JSON valido.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const analysisResult = JSON.parse(data.choices[0].message.content);

            console.log('✅ OpenAI CV analysis completed successfully');
            return {
                success: true,
                analysis: analysisResult,
                source: 'openai'
            };

        } catch (error) {
            console.error('❌ OpenAI CV analysis failed:', error);
            return {
                success: false,
                message: 'Errore durante l\'analisi OpenAI CV'
            };
        }
    }

    static performLocalCVAnalysis(cvText, userProfile) {
        console.log('🔧 Performing local CV analysis...');
        
        const cvLower = cvText.toLowerCase();
        const sector = this.detectSectorFromContent(cvText, userProfile || {});
        
        // Generate mock analysis similar to AI analysis
        const analysis = {
            sector: sector,
            match_score: 75 + Math.floor(Math.random() * 20),
            analysis: {
                strengths: this.generateStrengths(userProfile || {}, sector),
                skills: this.extractSkillsFromCV(cvText),
                recommendations: this.generateRecommendations(userProfile || {}, sector),
                career_paths: this.generateCareerPaths(sector).map(path => path.title)
            },
            analysis_date: new Date().toISOString(),
            cv_summary: this.generateCVSummaryFromText(cvText, sector),
            improvement_suggestions: this.generateImprovementSuggestions(userProfile || {}, sector)
        };

        return {
            success: true,
            analysis: analysis,
            source: 'local'
        };
    }

    static extractSkillsFromCV(cvText) {
        const skillKeywords = [
            'javascript', 'python', 'react', 'node.js', 'html', 'css', 'sql',
            'communication', 'leadership', 'team work', 'problem solving',
            'customer service', 'sales', 'marketing', 'management',
            'microsoft office', 'excel', 'powerpoint', 'photoshop'
        ];
        
        const cvLower = cvText.toLowerCase();
        const foundSkills = skillKeywords.filter(skill => 
            cvLower.includes(skill.toLowerCase())
        );
        
        return foundSkills.length > 0 ? foundSkills.slice(0, 5) : ['Competenze base', 'Comunicazione', 'Problem solving'];
    }

    static generateCVSummaryFromText(cvText, sector) {
        const summaries = {
            'informatica': 'CV con focus tecnologico e competenze di programmazione. Mostra esperienza nello sviluppo software.',
            'ristorazione': 'Profilo orientato al settore food & beverage con esperienza nel servizio clienti.',
            'accoglienza': 'CV che evidenzia competenze relazionali e orientamento al customer service.',
            'agricoltura': 'Profilo con interesse per sostenibilità e settore primario.',
            'imprenditoria': 'CV che mostra capacità imprenditoriali e di gestione business.'
        };
        
        return summaries[sector] || 'CV con competenze trasversali adatte a diversi settori.';
    }

    static validateAnalysisResult(result) {
        const requiredFields = ['mainSector', 'description', 'confidence', 'strengths', 'recommendations'];
        
        for (const field of requiredFields) {
            if (!(field in result)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        if (!Array.isArray(result.strengths) || !Array.isArray(result.recommendations)) {
            console.error('Strengths and recommendations must be arrays');
            return false;
        }

        if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
            console.error('Confidence must be a number between 0 and 1');
            return false;
        }

        return true;
    }
}

// Initialize the service
AIAnalysisService.init();
