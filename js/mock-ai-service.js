/**
 * Mock AI Service for testing without OpenAI API costs
 * Provides realistic responses for career guidance and CV analysis
 */

class MockAIService {
    constructor() {
        this.isEnabled = true;
        this.delay = 1500; // Simulate API delay
        
        // Pre-defined mock responses for different sectors
        this.mockAnalyses = {
            'informatica': {
                sector: 'Informatica',
                match_score: 85,
                analysis: {
                    strengths: [
                        'Forte background tecnico in programmazione',
                        'Esperienza con linguaggi moderni (JavaScript, Python)',
                        'Capacità di problem solving e pensiero logico',
                        'Familiarità con metodologie agili'
                    ],
                    skills: [
                        'Sviluppo software',
                        'Database management',
                        'Web development',
                        'API integration',
                        'Version control (Git)'
                    ],
                    recommendations: [
                        'Approfondire le competenze in cloud computing (AWS, Azure)',
                        'Sviluppare conoscenze in cybersecurity',
                        'Considerare certificazioni specifiche del settore',
                        'Migliorare le soft skills per la gestione team'
                    ],
                    career_paths: [
                        'Software Developer Senior',
                        'Full Stack Developer',
                        'DevOps Engineer',
                        'Technical Lead'
                    ]
                }
            },
            'ristorazione': {
                sector: 'Ristorazione',
                match_score: 78,
                analysis: {
                    strengths: [
                        'Eccellenti capacità di lavoro in team',
                        'Resistenza allo stress e ai ritmi intensi',
                        'Attenzione al dettaglio e cura del cliente',
                        'Flessibilità negli orari di lavoro'
                    ],
                    skills: [
                        'Servizio clienti',
                        'Gestione ordini',
                        'Conoscenza norme igiene',
                        'Multitasking',
                        'Comunicazione efficace'
                    ],
                    recommendations: [
                        'Ottenere certificazioni HACCP',
                        'Sviluppare competenze manageriali',
                        'Apprendere tecniche di food & beverage',
                        'Migliorare le lingue straniere per turismo'
                    ],
                    career_paths: [
                        'Responsabile di sala',
                        'Maître',
                        'Food & Beverage Manager',
                        'Proprietario ristorante'
                    ]
                }
            },
            'accoglienza': {
                sector: 'Accoglienza',
                match_score: 82,
                analysis: {
                    strengths: [
                        'Ottime capacità comunicative e relazionali',
                        'Predisposizione naturale al servizio clienti',
                        'Professionalità e cortesia',
                        'Capacità di gestire situazioni complesse'
                    ],
                    skills: [
                        'Customer service',
                        'Gestione prenotazioni',
                        'Accoglienza clienti',
                        'Risoluzione problemi',
                        'Organizzazione eventi'
                    ],
                    recommendations: [
                        'Sviluppare competenze digitali per sistemi di gestione',
                        'Migliorare conoscenze linguistiche',
                        'Approfondire marketing turistico',
                        'Acquisire skills in revenue management'
                    ],
                    career_paths: [
                        'Reception Manager',
                        'Guest Relations Manager',
                        'Hotel Manager',
                        'Event Coordinator'
                    ]
                }
            },
            'agricoltura': {
                sector: 'Agricoltura',
                match_score: 75,
                analysis: {
                    strengths: [
                        'Passione per il lavoro all\'aperto',
                        'Conoscenza dei cicli naturali',
                        'Attenzione alla sostenibilità',
                        'Capacità di lavoro fisico'
                    ],
                    skills: [
                        'Coltivazione biologica',
                        'Gestione terreni',
                        'Utilizzo macchinari agricoli',
                        'Controllo qualità prodotti',
                        'Vendita diretta'
                    ],
                    recommendations: [
                        'Approfondire tecnologie smart farming',
                        'Sviluppare competenze di marketing agricolo',
                        'Studiare agricoltura di precisione',
                        'Acquisire conoscenze di certificazione biologica'
                    ],
                    career_paths: [
                        'Agronomo',
                        'Responsabile produzione agricola',
                        'Consulente agricolo',
                        'Imprenditore agricolo'
                    ]
                }
            },
            'imprenditoria': {
                sector: 'Imprenditoria',
                match_score: 80,
                analysis: {
                    strengths: [
                        'Spirito imprenditoriale e iniziativa',
                        'Capacità di leadership e visione',
                        'Propensione al rischio calcolato',
                        'Creatività e innovazione'
                    ],
                    skills: [
                        'Business planning',
                        'Gestione finanziaria',
                        'Marketing e vendite',
                        'Networking',
                        'Gestione team'
                    ],
                    recommendations: [
                        'Sviluppare competenze digitali per e-commerce',
                        'Approfondire aspetti legali e fiscali',
                        'Migliorare skills di fundraising',
                        'Acquisire conoscenze di scaling business'
                    ],
                    career_paths: [
                        'Startup Founder',
                        'Business Consultant',
                        'Innovation Manager',
                        'Venture Capitalist'
                    ]
                }
            }
        };

        // Mock job opportunities with realistic data
        this.mockOpportunities = {
            'informatica': [
                {
                    id: 'inf_001',
                    title: 'Sviluppatore Full Stack Junior',
                    company: 'TechStart Milano',
                    location: 'Milano',
                    type: 'job',
                    sector: 'Informatica',
                    experience_level: 'junior',
                    job_type: 'full-time',
                    salary_min: 28000,
                    salary_max: 35000,
                    match_score: 92,
                    description: 'Cerchiamo un sviluppatore appassionato per unirsi al nostro team di sviluppo web.',
                    requirements: ['JavaScript', 'React', 'Node.js', 'SQL'],
                    benefits: ['Smart working', 'Formazione continua', 'Buoni pasto'],
                    posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'inf_002',
                    title: 'DevOps Engineer',
                    company: 'CloudTech Solutions',
                    location: 'Remote',
                    type: 'job',
                    sector: 'Informatica',
                    experience_level: 'mid',
                    job_type: 'full-time',
                    salary_min: 40000,
                    salary_max: 55000,
                    match_score: 88,
                    description: 'Opportunità per un DevOps Engineer con esperienza in cloud infrastructure.',
                    requirements: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
                    benefits: ['Lavoro remoto', 'Equipaggiamento fornito', 'Flessibilità orari'],
                    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            'ristorazione': [
                {
                    id: 'rist_001',
                    title: 'Cameriere/a di Sala',
                    company: 'Ristorante Da Giuseppe',
                    location: 'Roma',
                    type: 'job',
                    sector: 'Ristorazione',
                    experience_level: 'entry',
                    job_type: 'part-time',
                    salary_min: 18000,
                    salary_max: 24000,
                    match_score: 85,
                    description: 'Cerchiamo personale dinamico per il nostro ristorante nel centro di Roma.',
                    requirements: ['Esperienza servizio clienti', 'Disponibilità weekend', 'Inglese base'],
                    benefits: ['Mance', 'Pasti gratuiti', 'Formazione sul campo'],
                    posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            'accoglienza': [
                {
                    id: 'acc_001',
                    title: 'Receptionist Hotel',
                    company: 'Grand Hotel Firenze',
                    location: 'Firenze',
                    type: 'job',
                    sector: 'Accoglienza',
                    experience_level: 'junior',
                    job_type: 'full-time',
                    salary_min: 22000,
                    salary_max: 28000,
                    match_score: 90,
                    description: 'Hotel 4 stelle cerca receptionist per turni diurni e notturni.',
                    requirements: ['Inglese fluente', 'Esperienza reception', 'Disponibilità turni'],
                    benefits: ['Vitto e alloggio', '13esima e 14esima', 'Formazione continua'],
                    posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            'agricoltura': [
                {
                    id: 'agr_001',
                    title: 'Operatore Agricolo',
                    company: 'Azienda Agricola Bio Verde',
                    location: 'Toscana',
                    type: 'job',
                    sector: 'Agricoltura',
                    experience_level: 'entry',
                    job_type: 'full-time',
                    salary_min: 20000,
                    salary_max: 26000,
                    match_score: 82,
                    description: 'Azienda biologica cerca operatore per coltivazioni e gestione serre.',
                    requirements: ['Passione agricoltura', 'Disponibilità lavoro fisico', 'Patente B'],
                    benefits: ['Prodotti biologici gratuiti', 'Formazione specialistica', 'Crescita aziendale'],
                    posted_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            'imprenditoria': [
                {
                    id: 'imp_001',
                    title: 'Business Developer',
                    company: 'Innovation Hub',
                    location: 'Milano',
                    type: 'job',
                    sector: 'Imprenditoria',
                    experience_level: 'mid',
                    job_type: 'full-time',
                    salary_min: 35000,
                    salary_max: 50000,
                    match_score: 87,
                    description: 'Cerchiamo un business developer per supportare startup innovative.',
                    requirements: ['MBA o laurea economica', 'Esperienza startup', 'Inglese fluente'],
                    benefits: ['Equity participation', 'Networking events', 'Mentorship program'],
                    posted_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
    }

    /**
     * Enable or disable mock mode
     */
    setMockMode(enabled) {
        this.isEnabled = enabled;
        console.log(`🧪 Mock AI Service ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Simulate API delay
     */
    async simulateDelay() {
        await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    /**
     * Mock CV analysis
     */
    async analyzeCVContent(cvText, userProfile) {
        if (!this.isEnabled) {
            throw new Error('Mock AI Service is disabled');
        }

        console.log('🧪 [MOCK AI] Analyzing CV content');
        await this.simulateDelay();

        // Determine sector based on keywords in CV or profile
        const sector = this.detectSectorFromContent(cvText, userProfile);
        const analysis = this.mockAnalyses[sector] || this.mockAnalyses['informatica'];

        // Add some randomization to make it more realistic
        const randomizedScore = analysis.match_score + Math.floor(Math.random() * 10 - 5);
        
        return {
            ...analysis,
            match_score: Math.max(60, Math.min(95, randomizedScore)),
            analysis_date: new Date().toISOString(),
            cv_summary: this.generateCVSummary(sector),
            improvement_suggestions: this.generateImprovementSuggestions(sector)
        };
    }

    /**
     * Mock profile analysis
     */
    async analyzeProfile(profileData) {
        if (!this.isEnabled) {
            throw new Error('Mock AI Service is disabled');
        }

        console.log('🧪 [MOCK AI] Analyzing user profile');
        await this.simulateDelay();

        const sector = this.detectSectorFromProfile(profileData);
        const analysis = this.mockAnalyses[sector] || this.mockAnalyses['informatica'];

        return {
            recommended_sector: sector,
            confidence: 0.85 + Math.random() * 0.1,
            analysis: analysis.analysis,
            match_explanation: `Based on your profile, you show strong alignment with ${sector} sector. Your skills and experience indicate excellent potential for growth in this field.`
        };
    }

    /**
     * Mock opportunity matching
     */
    async matchOpportunities(userProfile, opportunities) {
        if (!this.isEnabled) {
            throw new Error('Mock AI Service is disabled');
        }

        console.log('🧪 [MOCK AI] Matching opportunities');
        await this.simulateDelay();

        const userSector = this.detectSectorFromProfile(userProfile);
        
        // Return mock opportunities for the detected sector
        const sectorOpportunities = this.mockOpportunities[userSector] || [];
        
        // Add some opportunities from other sectors with lower scores
        const otherSectors = Object.keys(this.mockOpportunities).filter(s => s !== userSector);
        const randomOtherSector = otherSectors[Math.floor(Math.random() * otherSectors.length)];
        const otherOpportunities = this.mockOpportunities[randomOtherSector] || [];
        
        // Combine and adjust scores
        const allOpportunities = [
            ...sectorOpportunities,
            ...otherOpportunities.map(opp => ({
                ...opp,
                match_score: Math.max(60, opp.match_score - 20)
            }))
        ];

        return allOpportunities.sort((a, b) => b.match_score - a.match_score);
    }

    /**
     * Generate personalized motivation letter
     */
    async generateMotivationLetter(opportunity, userProfile) {
        if (!this.isEnabled) {
            throw new Error('Mock AI Service is disabled');
        }

        console.log('🧪 [MOCK AI] Generating motivation letter');
        await this.simulateDelay();

        const templates = {
            'informatica': `Gentile Responsabile delle Risorse Umane,

Sono molto interessato/a alla posizione di ${opportunity.title} presso ${opportunity.company}. La mia esperienza nel settore informatico e la passione per lo sviluppo tecnologico mi rendono il candidato ideale per questa opportunità.

Durante il mio percorso professionale ho sviluppato competenze solide in programmazione e gestione progetti, che ritengo perfettamente allineate con i requisiti richiesti. Sono particolarmente attratto/a dalla possibilità di contribuire all'innovazione tecnologica della vostra azienda.

La mia capacità di problem solving e l'approccio metodico al lavoro mi permetterebbero di integrarmi rapidamente nel vostro team e contribuire fin da subito al successo dei progetti aziendali.

Rimango a disposizione per un colloquio conoscitivo e ringrazio per l'attenzione.

Cordiali saluti`,
            
            'ristorazione': `Egregio/a Responsabile,

Scrivo per manifestare il mio interesse per la posizione di ${opportunity.title} presso ${opportunity.company}. La ristorazione è sempre stata la mia passione e credo fermamente nell'importanza di offrire un servizio di eccellenza.

La mia esperienza nel settore mi ha insegnato l'importanza del lavoro di squadra, dell'attenzione al dettaglio e della soddisfazione del cliente. Sono una persona dinamica, precisa e sempre pronta ad affrontare le sfide che il settore della ristorazione presenta quotidianamente.

Sarei entusiasta di poter contribuire al successo del vostro locale, portando la mia energia e la mia dedizione al servizio clienti.

Resto in attesa di un vostro riscontro e vi ringrazio per l'opportunità.

Distinti saluti`,
            
            'default': `Gentile Responsabile,

Sono molto interessato/a alla posizione di ${opportunity.title} presso ${opportunity.company}. Il vostro annuncio ha catturato la mia attenzione per l'allineamento con il mio percorso professionale e le mie aspirazioni di carriera.

Le competenze che ho sviluppato nel corso della mia esperienza lavorativa e il mio entusiasmo per questo settore mi rendono sicuro/a di poter contribuire positivamente ai vostri obiettivi aziendali.

Sono una persona motivata, precisa e sempre disposta ad apprendere nuove competenze per crescere professionalmente all'interno dell'azienda.

Rimango a disposizione per un colloquio e ringrazio per l'attenzione dedicatami.

Cordiali saluti`
        };

        const template = templates[opportunity.sector?.toLowerCase()] || templates['default'];
        return template;
    }

    /**
     * Detect sector from CV/profile content
     */
    detectSectorFromContent(cvText, userProfile) {
        const content = (cvText + ' ' + JSON.stringify(userProfile)).toLowerCase();
        
        const keywords = {
            'informatica': ['programming', 'javascript', 'python', 'software', 'web', 'database', 'api', 'git', 'sviluppo', 'programmazione', 'informatica'],
            'ristorazione': ['restaurant', 'kitchen', 'cooking', 'chef', 'waiter', 'ristorazione', 'cucina', 'cameriere', 'servizio'],
            'accoglienza': ['hotel', 'reception', 'tourism', 'guest', 'hospitality', 'accoglienza', 'turismo', 'ospitalità'],
            'agricoltura': ['agriculture', 'farming', 'crops', 'biological', 'agricoltura', 'coltivazione', 'biologico'],
            'imprenditoria': ['business', 'startup', 'entrepreneur', 'management', 'imprenditoria', 'business', 'gestione']
        };

        let maxScore = 0;
        let detectedSector = 'informatica';

        Object.entries(keywords).forEach(([sector, words]) => {
            const score = words.reduce((acc, word) => {
                return acc + (content.includes(word) ? 1 : 0);
            }, 0);
            
            if (score > maxScore) {
                maxScore = score;
                detectedSector = sector;
            }
        });

        return detectedSector;
    }

    /**
     * Detect sector from profile data
     */
    detectSectorFromProfile(profile) {
        if (!profile) return 'informatica';
        
        const profileText = JSON.stringify(profile).toLowerCase();
        return this.detectSectorFromContent('', profileText);
    }

    /**
     * Generate CV summary
     */
    generateCVSummary(sector) {
        const summaries = {
            'informatica': 'Profilo tecnico con buone competenze di programmazione e esperienza in sviluppo software. Mostra predisposizione per il problem solving e l\'apprendimento di nuove tecnologie.',
            'ristorazione': 'Candidato con esperienza nel settore food & beverage. Dimostra capacità di lavorare sotto pressione e attenzione al servizio clienti.',
            'accoglienza': 'Profilo orientato al customer service con ottime capacità comunicative. Esperienza nella gestione clienti e organizzazione eventi.',
            'agricoltura': 'Candidato con passione per il settore agricolo e sostenibilità ambientale. Buona predisposizione al lavoro pratico e all\'aria aperta.',
            'imprenditoria': 'Profilo imprenditoriale con visione strategica e capacità di leadership. Esperienza nella gestione progetti e sviluppo business.'
        };
        
        return summaries[sector] || summaries['informatica'];
    }

    /**
     * Generate improvement suggestions
     */
    generateImprovementSuggestions(sector) {
        const suggestions = {
            'informatica': [
                'Aggiungere progetti open source per dimostrare competenze pratiche',
                'Includere certificazioni tecniche specifiche',
                'Evidenziare esperienze di lavoro in team agile'
            ],
            'ristorazione': [
                'Includere certificazioni HACCP e sicurezza alimentare',
                'Evidenziare capacità linguistiche per clientela internazionale',
                'Aggiungere esempi di gestione situazioni complesse'
            ],
            'accoglienza': [
                'Sottolineare competenze multilingue',
                'Includere esperienze con software di gestione hotel',
                'Evidenziare risultati in customer satisfaction'
            ],
            'agricoltura': [
                'Aggiungere conoscenze di agricoltura biologica e sostenibile',
                'Includere competenze nell\'uso di macchinari agricoli',
                'Evidenziare esperienze nella vendita diretta'
            ],
            'imprenditoria': [
                'Includere metriche di performance dei progetti gestiti',
                'Evidenziare competenze di fundraising e business planning',
                'Aggiungere esperienze di team building e leadership'
            ]
        };
        
        return suggestions[sector] || suggestions['informatica'];
    }

    /**
     * Get mock opportunities for a specific sector
     */
    getMockOpportunitiesForSector(sector) {
        return this.mockOpportunities[sector] || [];
    }

    /**
     * Get all mock opportunities
     */
    getAllMockOpportunities() {
        const allOpportunities = [];
        Object.values(this.mockOpportunities).forEach(sectorOpps => {
            allOpportunities.push(...sectorOpps);
        });
        return allOpportunities;
    }
}

// Create global instance
window.mockAIService = new MockAIService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockAIService;
}

console.log('🧪 Mock AI Service initialized - Ready for testing without API costs!');