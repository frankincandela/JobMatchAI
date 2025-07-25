// Opportunity management service
class OpportunityService {
    static opportunities = [];
    static filteredOpportunities = [];
    static currentFilters = {
        type: 'all',
        sector: 'all',
        location: 'all',
        search: ''
    };

    static async loadOpportunities() {
        try {
            console.log('🔍 Loading opportunities...');
            
            // First, get user's profile for matching
            let userProfile = null;
            if (AuthService.currentUser) {
                userProfile = await ProfileService.getUserProfile(AuthService.currentUser.id);
            }

            // Check Supabase connection first, fallback to mock if needed
            if (supabaseClient && supabaseClient.isReady && supabaseClient.isReady()) {
                console.log('🗄️ Loading opportunities from Supabase database');
                return await this.loadFromSupabase(userProfile);
            } else if (window.mockAIService && window.mockAIService.isEnabled) {
                console.log('🧪 Using Mock AI Service for opportunities (Supabase not available)');
                
                // Get mock opportunities
                const mockOpportunities = userProfile 
                    ? await window.mockAIService.matchOpportunities(userProfile, [])
                    : window.mockAIService.getAllMockOpportunities();
                
                this.opportunities = mockOpportunities.map(item => ({
                    id: item.id,
                    title: item.title,
                    companyId: item.company || item.companyName,
                    companyName: item.company || item.companyName,
                    companyEmail: 'info@' + (item.company || item.companyName).toLowerCase().replace(/\s+/g, '') + '.com',
                    sector: item.sector,
                    jobType: item.job_type,
                    experienceLevel: item.experience_level,
                    location: item.location,
                    isRemote: item.location === 'Remote',
                    description: item.description,
                    requirements: item.requirements || [],
                    responsibilities: [],
                    requiredSkills: item.requirements || [],
                    preferredSkills: [],
                    salaryMin: item.salary_min,
                    salaryMax: item.salary_max,
                    benefits: item.benefits || [],
                    applicationDeadline: null,
                    contactEmail: 'info@' + (item.company || item.companyName).toLowerCase().replace(/\s+/g, '') + '.com',
                    createdAt: item.posted_date,
                    updatedAt: item.posted_date,
                    matchScore: item.match_score || 0
                }));
                
                console.log(`✅ Loaded ${this.opportunities.length} mock opportunities`);
                this.filteredOpportunities = [...this.opportunities];
                return this.opportunities;
            }

            // If no mock service, use fallback data
            console.log('⚠️ No data source available, using static fallback');
            this.opportunities = [];
            this.filteredOpportunities = [];
            return this.opportunities;

        } catch (error) {
            console.error('Error loading opportunities:', error);
            this.opportunities = [];
            this.filteredOpportunities = [];
            return this.opportunities;
        }
    }

    static async loadFromSupabase(userProfile) {
        try {
            console.log('🗄️ Fetching opportunities from Supabase...');
            
            // Load opportunities from database
            const { data, error } = await supabaseClient
                .from('job_opportunities')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading opportunities:', error);
                throw error;
            }

            // Transform data and calculate match scores
            this.opportunities = data.map(item => {
                const opportunity = {
                    id: item.id,
                    title: item.title,
                    companyId: item.company_id,
                    companyName: item.companies?.name || 'Azienda non specificata',
                    companyEmail: item.companies?.contact_email || item.contact_email,
                    sector: item.sector,
                    jobType: item.job_type,
                    experienceLevel: item.experience_level,
                    location: item.location,
                    isRemote: item.is_remote,
                    description: item.description,
                    requirements: item.requirements,
                    responsibilities: item.responsibilities || [],
                    requiredSkills: item.required_skills || [],
                    preferredSkills: item.preferred_skills || [],
                    salaryMin: item.salary_min,
                    salaryMax: item.salary_max,
                    benefits: item.benefits || [],
                    applicationDeadline: item.application_deadline,
                    contactEmail: item.contact_email,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at,
                    matchScore: userProfile ? this.calculateMatchScore(item, userProfile) : 0
                };

                return opportunity;
            });

            console.log(`✅ Loaded ${this.opportunities.length} opportunities`);
            
            // Sort by match score if user is logged in
            if (userProfile) {
                this.opportunities.sort((a, b) => b.matchScore - a.matchScore);
            }

            this.filteredOpportunities = [...this.opportunities];
            this.renderOpportunities();

        } catch (error) {
            console.error('Error loading opportunities:', error);
            showToast('Errore nel caricamento delle opportunità', 'error');
            
            // Load fallback opportunities
            this.loadFallbackOpportunities();
        }
    }

    static calculateMatchScore(opportunity, userProfile) {
        let score = 0;
        const maxScore = 100;

        if (!userProfile) return score;

        try {
            // Sector matching (40% weight)
            const sectorKeywords = {
                'Informatica': ['programma', 'sviluppo', 'web', 'computer', 'software', 'app', 'javascript', 'python', 'java', 'react', 'flutter'],
                'Ristorazione': ['cuoco', 'ristorazione', 'chef', 'cucina', 'ristorante', 'food', 'beverage', 'servizio'],
                'Accoglienza': ['hotel', 'turismo', 'accoglienza', 'reception', 'ospitalità', 'travel', 'eventi'],
                'Agricoltura': ['agricoltura', 'agricolo', 'campagna', 'coltivazione', 'terra', 'biologico', 'sostenibile'],
                'Imprenditoria': ['impresa', 'business', 'startup', 'manager', 'azienda', 'leadership', 'vendite']
            };

            const opportunitySector = opportunity.sector;
            const userBiography = (userProfile.biography || '').toLowerCase();
            
            if (sectorKeywords[opportunitySector]) {
                const keywords = sectorKeywords[opportunitySector];
                let sectorMatches = 0;
                
                keywords.forEach(keyword => {
                    if (userBiography.includes(keyword.toLowerCase())) {
                        sectorMatches++;
                    }
                });
                
                score += (sectorMatches / keywords.length) * 40;
            }

            // Skills matching (30% weight)
            const requiredSkills = opportunity.requiredSkills || [];
            const userSkills = (userProfile.softSkills || '').toLowerCase();
            
            if (requiredSkills.length > 0) {
                let skillMatches = 0;
                
                requiredSkills.forEach(skill => {
                    if (userSkills.includes(skill.toLowerCase())) {
                        skillMatches++;
                    }
                });
                
                score += (skillMatches / requiredSkills.length) * 30;
            }

            // Experience matching (20% weight)
            const userExperiences = userProfile.experiences || [];
            if (userExperiences.length > 0) {
                let experienceMatch = 0;
                
                userExperiences.forEach(exp => {
                    const expText = (exp.description || '').toLowerCase();
                    const oppText = (opportunity.description || '').toLowerCase();
                    
                    // Simple text similarity check
                    const commonWords = this.getCommonWords(expText, oppText);
                    if (commonWords > 0) {
                        experienceMatch += commonWords;
                    }
                });
                
                score += Math.min(experienceMatch * 2, 20);
            }

            // Education matching (10% weight)
            const userEducation = (userProfile.education || '').toLowerCase();
            const oppRequirements = (opportunity.requirements || '').toLowerCase();
            
            if (userEducation && oppRequirements) {
                const educationWords = userEducation.split(' ');
                let educationMatches = 0;
                
                educationWords.forEach(word => {
                    if (word.length > 3 && oppRequirements.includes(word)) {
                        educationMatches++;
                    }
                });
                
                score += Math.min(educationMatches, 10);
            }

        } catch (error) {
            console.error('Error calculating match score:', error);
        }

        return Math.min(Math.round(score), maxScore);
    }

    static getCommonWords(text1, text2) {
        const words1 = text1.split(' ').filter(word => word.length > 3);
        const words2 = text2.split(' ').filter(word => word.length > 3);
        
        let commonCount = 0;
        words1.forEach(word => {
            if (words2.includes(word)) {
                commonCount++;
            }
        });
        
        return commonCount;
    }

    static loadFallbackOpportunities() {
        // Sample opportunities for demo/fallback
        this.opportunities = [
            {
                id: 'fallback-1',
                title: 'Sviluppatore Web Junior',
                companyName: 'Tech Innovation SRL',
                companyEmail: 'hr@techinnovation.it',
                sector: 'Informatica',
                jobType: 'full-time',
                experienceLevel: 'entry',
                location: 'Milano',
                isRemote: true,
                description: 'Cerchiamo uno sviluppatore web junior per unirsi al nostro team dinamico.',
                requirements: 'Conoscenza HTML, CSS, JavaScript. Laurea in Informatica preferibile.',
                responsibilities: ['Sviluppo frontend', 'Testing', 'Manutenzione codice'],
                requiredSkills: ['HTML', 'CSS', 'JavaScript'],
                preferredSkills: ['React', 'Node.js'],
                salaryMin: 25000,
                salaryMax: 35000,
                benefits: ['Smart working', 'Formazione continua'],
                contactEmail: 'hr@techinnovation.it',
                matchScore: 85
            },
            {
                id: 'fallback-2',
                title: 'Cuoco di Linea',
                companyName: 'Ristorante La Tavola',
                companyEmail: 'info@latavola.it',
                sector: 'Ristorazione',
                jobType: 'full-time',
                experienceLevel: 'mid',
                location: 'Roma',
                isRemote: false,
                description: 'Ristorante di alta qualità cerca cuoco esperto per la brigata di cucina.',
                requirements: 'Esperienza minima 2 anni in cucina. Diploma alberghiero preferibile.',
                responsibilities: ['Preparazione piatti', 'Gestione ingredienti', 'Controllo qualità'],
                requiredSkills: ['Cucina italiana', 'Organizzazione', 'Lavoro in team'],
                preferredSkills: ['Cucina internazionale', 'Pasticceria'],
                salaryMin: 22000,
                salaryMax: 28000,
                benefits: ['Pasti inclusi', 'Divisa fornita'],
                contactEmail: 'info@latavola.it',
                matchScore: 72
            }
        ];

        this.filteredOpportunities = [...this.opportunities];
        this.renderOpportunities();
    }

    static initFilters() {
        console.log('🔧 Initializing opportunity filters');

        // Search input
        const searchInput = document.getElementById('searchOpportunities');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Type filter
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentFilters.type = e.target.value;
                this.applyFilters();
            });
        }

        // Sector filter
        const sectorFilter = document.getElementById('sectorFilter');
        if (sectorFilter) {
            sectorFilter.addEventListener('change', (e) => {
                this.currentFilters.sector = e.target.value;
                this.applyFilters();
            });
        }

        // Location filter
        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.applyFilters();
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    static applyFilters() {
        let filtered = [...this.opportunities];

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(opp => 
                opp.title.toLowerCase().includes(searchTerm) ||
                opp.companyName.toLowerCase().includes(searchTerm) ||
                opp.description.toLowerCase().includes(searchTerm) ||
                opp.sector.toLowerCase().includes(searchTerm)
            );
        }

        // Type filter
        if (this.currentFilters.type !== 'all') {
            if (this.currentFilters.type === 'job') {
                filtered = filtered.filter(opp => 
                    opp.jobType === 'full-time' || opp.jobType === 'part-time' || opp.jobType === 'contract'
                );
            } else if (this.currentFilters.type === 'training') {
                filtered = filtered.filter(opp => opp.jobType === 'training');
            } else if (this.currentFilters.type === 'internship') {
                filtered = filtered.filter(opp => opp.jobType === 'internship');
            }
        }

        // Sector filter
        if (this.currentFilters.sector !== 'all') {
            filtered = filtered.filter(opp => opp.sector === this.currentFilters.sector);
        }

        // Location filter
        if (this.currentFilters.location !== 'all') {
            filtered = filtered.filter(opp => 
                opp.location.toLowerCase().includes(this.currentFilters.location.toLowerCase()) ||
                (this.currentFilters.location === 'remote' && opp.isRemote)
            );
        }

        this.filteredOpportunities = filtered;
        this.renderOpportunities();
        
        // Update results count
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${filtered.length} opportunità trovate`;
        }
    }

    static clearFilters() {
        this.currentFilters = {
            type: 'all',
            sector: 'all',
            location: 'all',
            search: ''
        };

        // Reset form inputs
        const searchInput = document.getElementById('searchOpportunities');
        if (searchInput) searchInput.value = '';

        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) typeFilter.value = 'all';

        const sectorFilter = document.getElementById('sectorFilter');
        if (sectorFilter) sectorFilter.value = 'all';

        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter) locationFilter.value = 'all';

        this.filteredOpportunities = [...this.opportunities];
        this.renderOpportunities();

        // Update results count
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${this.opportunities.length} opportunità trovate`;
        }
    }

    static renderOpportunities() {
        const container = document.getElementById('opportunitiesContainer');
        if (!container) return;

        if (this.filteredOpportunities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>Nessuna opportunità trovata</h4>
                    <p class="text-muted">Prova a modificare i filtri di ricerca</p>
                </div>
            `;
            return;
        }

        const html = this.filteredOpportunities.map(opportunity => `
            <div class="col-lg-6 col-xl-4 mb-4">
                <div class="card opportunity-card h-100 sector-${opportunity.sector.toLowerCase().replace(/\s+/g, '')}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <span class="badge badge-sector">${opportunity.sector}</span>
                                ${opportunity.isRemote ? '<span class="badge bg-info ms-2">Remote</span>' : ''}
                            </div>
                            ${AuthService.currentUser && opportunity.matchScore > 0 ? 
                                `<span class="match-score">${opportunity.matchScore}% match</span>` : ''}
                        </div>
                        
                        <h5 class="card-title">${opportunity.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">
                            <i class="fas fa-building me-1"></i>${opportunity.companyName}
                        </h6>
                        
                        <p class="card-text text-muted mb-3">
                            <i class="fas fa-map-marker-alt me-1"></i>${opportunity.location}
                            <span class="ms-3">
                                <i class="fas fa-briefcase me-1"></i>${this.getJobTypeLabel(opportunity.jobType)}
                            </span>
                        </p>
                        
                        <p class="card-text">${this.truncateText(opportunity.description, 100)}</p>
                        
                        ${opportunity.requiredSkills && opportunity.requiredSkills.length > 0 ? `
                            <div class="mb-3">
                                <small class="text-muted">Competenze richieste:</small><br>
                                ${opportunity.requiredSkills.slice(0, 3).map(skill => 
                                    `<span class="skill-tag">${skill}</span>`
                                ).join('')}
                                ${opportunity.requiredSkills.length > 3 ? '<small class="text-muted">+altri</small>' : ''}
                            </div>
                        ` : ''}
                        
                        ${opportunity.salaryMin && opportunity.salaryMax ? `
                            <p class="text-success fw-bold mb-3">
                                <i class="fas fa-euro-sign me-1"></i>
                                €${opportunity.salaryMin.toLocaleString()} - €${opportunity.salaryMax.toLocaleString()}
                            </p>
                        ` : ''}
                    </div>
                    
                    <div class="card-footer bg-transparent">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="btn-group" role="group">
                                <button class="btn btn-outline-primary btn-sm" onclick="OpportunityService.viewOpportunity('${opportunity.id}')">
                                    <i class="fas fa-eye me-1"></i>Dettagli
                                </button>
                                ${AuthService.currentUser ? `
                                    <button class="btn btn-outline-success btn-sm" onclick="OpportunityService.saveOpportunity('${opportunity.id}')">
                                        <i class="fas fa-heart me-1"></i>Salva
                                    </button>
                                ` : ''}
                            </div>
                            
                            ${AuthService.currentUser ? `
                                <button class="btn btn-primary btn-sm" onclick="OpportunityService.applyToOpportunity('${opportunity.id}')">
                                    <i class="fas fa-paper-plane me-1"></i>Candidati
                                </button>
                            ` : `
                                <button class="btn btn-primary btn-sm" onclick="showLogin()">
                                    <i class="fas fa-sign-in-alt me-1"></i>Accedi per candidarti
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    static getJobTypeLabel(jobType) {
        const labels = {
            'full-time': 'Tempo pieno',
            'part-time': 'Part-time',
            'contract': 'Contratto',
            'internship': 'Stage',
            'training': 'Formazione'
        };
        return labels[jobType] || jobType;
    }

    static truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static async viewOpportunity(opportunityId) {
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;

        // Create modal with opportunity details
        const modal = this.createOpportunityModal(opportunity);
        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Remove modal from DOM when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    static createOpportunityModal(opportunity) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${opportunity.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6><i class="fas fa-building me-2"></i>Azienda</h6>
                                <p>${opportunity.companyName}</p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-map-marker-alt me-2"></i>Località</h6>
                                <p>${opportunity.location} ${opportunity.isRemote ? '(Remote)' : ''}</p>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6><i class="fas fa-briefcase me-2"></i>Tipo di Contratto</h6>
                                <p>${this.getJobTypeLabel(opportunity.jobType)}</p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-chart-line me-2"></i>Livello di Esperienza</h6>
                                <p>${opportunity.experienceLevel}</p>
                            </div>
                        </div>
                        
                        ${opportunity.salaryMin && opportunity.salaryMax ? `
                            <div class="mb-3">
                                <h6><i class="fas fa-euro-sign me-2"></i>Retribuzione</h6>
                                <p class="text-success fw-bold">€${opportunity.salaryMin.toLocaleString()} - €${opportunity.salaryMax.toLocaleString()}</p>
                            </div>
                        ` : ''}
                        
                        <div class="mb-3">
                            <h6><i class="fas fa-info-circle me-2"></i>Descrizione</h6>
                            <p>${opportunity.description}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h6><i class="fas fa-list-check me-2"></i>Requisiti</h6>
                            <p>${opportunity.requirements}</p>
                        </div>
                        
                        ${opportunity.responsibilities && opportunity.responsibilities.length > 0 ? `
                            <div class="mb-3">
                                <h6><i class="fas fa-tasks me-2"></i>Responsabilità</h6>
                                <ul>
                                    ${opportunity.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${opportunity.requiredSkills && opportunity.requiredSkills.length > 0 ? `
                            <div class="mb-3">
                                <h6><i class="fas fa-cogs me-2"></i>Competenze Richieste</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${opportunity.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${opportunity.preferredSkills && opportunity.preferredSkills.length > 0 ? `
                            <div class="mb-3">
                                <h6><i class="fas fa-star me-2"></i>Competenze Preferibili</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${opportunity.preferredSkills.map(skill => `<span class="badge bg-light text-dark">${skill}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${opportunity.benefits && opportunity.benefits.length > 0 ? `
                            <div class="mb-3">
                                <h6><i class="fas fa-gift me-2"></i>Benefici</h6>
                                <ul>
                                    ${opportunity.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${opportunity.applicationDeadline ? `
                            <div class="alert alert-warning">
                                <i class="fas fa-clock me-2"></i>
                                <strong>Scadenza candidature:</strong> ${new Date(opportunity.applicationDeadline).toLocaleDateString('it-IT')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                        ${AuthService.currentUser ? `
                            <button type="button" class="btn btn-outline-success" onclick="OpportunityService.saveOpportunity('${opportunity.id}')">
                                <i class="fas fa-heart me-1"></i>Salva
                            </button>
                            <button type="button" class="btn btn-primary" onclick="OpportunityService.applyToOpportunity('${opportunity.id}')">
                                <i class="fas fa-paper-plane me-1"></i>Candidati
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary" onclick="showLogin()">
                                <i class="fas fa-sign-in-alt me-1"></i>Accedi per candidarti
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    static async saveOpportunity(opportunityId) {
        if (!AuthService.currentUser) {
            showToast('Devi essere autenticato per salvare opportunità', 'warning');
            return;
        }

        try {
            const success = await AuthService.saveOpportunity(opportunityId);
            
            if (success) {
                showToast('Opportunità salvata nei preferiti!', 'success');
            } else {
                showToast('Errore nel salvare l\'opportunità', 'error');
            }
            
        } catch (error) {
            console.error('Error saving opportunity:', error);
            showToast('Errore nel salvare l\'opportunità', 'error');
        }
    }

    static async applyToOpportunity(opportunityId) {
        if (!AuthService.currentUser) {
            showToast('Devi essere autenticato per candidarti', 'warning');
            return;
        }

        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) {
            showToast('Opportunità non trovata', 'error');
            return;
        }

        // Store opportunity data for application form
        sessionStorage.setItem('applicationOpportunity', JSON.stringify(opportunity));
        
        // Load application form
        await app.loadView('application-form');
    }

    static async getMatchedOpportunities(userId) {
        try {
            // This would typically call an AI matching service
            // For now, return a subset of opportunities with scores
            await this.loadOpportunities();
            
            return this.opportunities
                .filter(opp => opp.matchScore > 50)
                .slice(0, 10);
                
        } catch (error) {
            console.error('Error getting matched opportunities:', error);
            return [];
        }
    }
}
