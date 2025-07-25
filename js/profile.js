// Profile management service
class ProfileService {
    static async getUserProfile(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No profile found
                    return null;
                }
                console.error('Error fetching user profile:', error);
                return null;
            }

            return {
                id: data.id,
                biography: data.biography || '',
                experiences: data.experiences || [],
                education: data.education || '',
                certifications: data.certifications || '',
                professionalReferences: data.professional_references || '',
                hobbies: data.hobbies || '',
                softSkills: data.soft_skills || '',
                cvFilePath: data.cv_file_path,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };

        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
            return null;
        }
    }

    static async saveUserProfile(profileData) {
        try {
            if (!AuthService.currentUser) {
                throw new Error('Utente non autenticato');
            }

            const profile = {
                id: AuthService.currentUser.id,
                biography: profileData.biography || '',
                experiences: profileData.experiences || [],
                education: profileData.education || '',
                certifications: profileData.certifications || '',
                professional_references: profileData.professionalReferences || '',
                hobbies: profileData.hobbies || '',
                soft_skills: profileData.softSkills || '',
                cv_file_path: profileData.cvFilePath || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient
                .from('user_profiles')
                .upsert([profile])
                .select()
                .single();

            if (error) {
                console.error('Error saving profile:', error);
                throw error;
            }

            console.log('✅ Profile saved successfully');
            return {
                success: true,
                profile: data,
                message: 'Profilo salvato con successo'
            };

        } catch (error) {
            console.error('Error saving profile:', error);
            return {
                success: false,
                message: 'Errore durante il salvataggio del profilo'
            };
        }
    }

    static initProfileForm() {
        console.log('🔧 Initializing profile form');

        const profileForm = document.getElementById('profileForm');
        if (!profileForm) return;

        // Add experience button
        const addExperienceBtn = document.getElementById('addExperience');
        if (addExperienceBtn) {
            addExperienceBtn.addEventListener('click', this.addExperienceField);
        }

        // CV upload
        const cvUploadArea = document.getElementById('cvUploadArea');
        if (cvUploadArea) {
            this.initCVUpload(cvUploadArea);
        }

        // Form submission
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleProfileSubmit(e.target);
        });

        // AI Analysis button
        const analyzeBtn = document.getElementById('analyzeProfile');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', async () => {
                await this.handleAIAnalysis();
            });
        }
    }

    static addExperienceField() {
        const experiencesContainer = document.getElementById('experiencesContainer');
        if (!experiencesContainer) return;

        const experienceCount = experiencesContainer.children.length;
        const experienceHTML = `
            <div class="experience-item card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="card-title mb-0">Esperienza Lavorativa ${experienceCount + 1}</h6>
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.experience-item').remove()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Titolo della posizione</label>
                        <input type="text" class="form-control" name="experiences[${experienceCount}][jobTitle]" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descrizione delle responsabilità</label>
                        <textarea class="form-control" name="experiences[${experienceCount}][description]" rows="3" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Durata (es. Gen 2020 - Dic 2022)</label>
                        <input type="text" class="form-control" name="experiences[${experienceCount}][duration]" required>
                    </div>
                </div>
            </div>
        `;

        experiencesContainer.insertAdjacentHTML('beforeend', experienceHTML);
    }

    static initCVUpload(uploadArea) {
        const fileInput = document.getElementById('cvFileInput');
        
        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleCVFile(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleCVFile(e.target.files[0]);
            }
        });
    }

    static async handleCVFile(file) {
        try {
            // Validate file
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                showToast('Formato file non supportato. Usa PDF, DOC o DOCX.', 'error');
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB
                showToast('Il file è troppo grande. Massimo 10MB.', 'error');
                return;
            }

            showLoading();

            // Upload to Supabase Storage
            const fileName = `${AuthService.currentUser.id}/${Date.now()}_${file.name}`;
            
            const { data, error } = await supabaseClient.storage
                .from('cvs')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('CV upload error:', error);
                showToast('Errore durante il caricamento del CV', 'error');
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from('cvs')
                .getPublicUrl(fileName);

            // Update UI
            const uploadArea = document.getElementById('cvUploadArea');
            const uploadText = uploadArea.querySelector('.upload-text');
            const uploadIcon = uploadArea.querySelector('.upload-icon');
            
            uploadIcon.className = 'fas fa-check-circle text-success upload-icon';
            uploadText.innerHTML = `
                <strong>CV caricato: ${file.name}</strong><br>
                <small class="text-muted">Clicca per sostituire</small>
            `;
            uploadArea.classList.add('uploaded');

            // Store CV path for form submission
            uploadArea.dataset.cvPath = fileName;
            uploadArea.dataset.cvUrl = publicUrl;

            showToast('CV caricato con successo!', 'success');

        } catch (error) {
            console.error('Error handling CV file:', error);
            showToast('Errore durante il caricamento del CV', 'error');
        } finally {
            hideLoading();
        }
    }

    static async handleProfileSubmit(form) {
        try {
            showLoading();

            const formData = new FormData(form);
            
            // Collect experiences
            const experiences = [];
            const experienceItems = document.querySelectorAll('.experience-item');
            
            experienceItems.forEach((item, index) => {
                const jobTitle = formData.get(`experiences[${index}][jobTitle]`);
                const description = formData.get(`experiences[${index}][description]`);
                const duration = formData.get(`experiences[${index}][duration]`);
                
                if (jobTitle && description && duration) {
                    experiences.push({
                        jobTitle,
                        description,
                        duration
                    });
                }
            });

            // Get CV file path
            const cvUploadArea = document.getElementById('cvUploadArea');
            const cvFilePath = cvUploadArea?.dataset.cvPath || null;

            const profileData = {
                biography: formData.get('biography'),
                experiences: experiences,
                education: formData.get('education'),
                certifications: formData.get('certifications'),
                professionalReferences: formData.get('professionalReferences'),
                hobbies: formData.get('hobbies'),
                softSkills: formData.get('softSkills'),
                cvFilePath: cvFilePath
            };

            const result = await this.saveUserProfile(profileData);

            if (result.success) {
                showToast('Profilo salvato con successo!', 'success');
                
                // Update user's profile ID
                if (AuthService.currentUser) {
                    AuthService.currentUser.profileId = result.profile.id;
                    localStorage.setItem('career_guidance_user', JSON.stringify(AuthService.currentUser));
                }
            } else {
                showToast(result.message, 'error');
            }

        } catch (error) {
            console.error('Error submitting profile:', error);
            showToast('Errore durante il salvataggio del profilo', 'error');
        } finally {
            hideLoading();
        }
    }

    static async handleAIAnalysis() {
        try {
            if (!AuthService.currentUser) {
                showToast('Devi essere autenticato per utilizzare l\'analisi AI', 'error');
                return;
            }

            // Get current profile data from form
            const form = document.getElementById('profileForm');
            const formData = new FormData(form);
            
            const biography = formData.get('biography');
            if (!biography || biography.trim().length < 50) {
                showToast('Inserisci una biografia di almeno 50 caratteri per l\'analisi AI', 'warning');
                return;
            }

            showLoading();

            // Collect profile data
            const profileData = {
                biography: biography,
                education: formData.get('education') || '',
                certifications: formData.get('certifications') || '',
                hobbies: formData.get('hobbies') || '',
                softSkills: formData.get('softSkills') || '',
                experiences: []
            };

            // Collect experiences
            const experienceItems = document.querySelectorAll('.experience-item');
            experienceItems.forEach((item, index) => {
                const jobTitle = formData.get(`experiences[${index}][jobTitle]`);
                const description = formData.get(`experiences[${index}][description]`);
                const duration = formData.get(`experiences[${index}][duration]`);
                
                if (jobTitle && description) {
                    profileData.experiences.push({
                        jobTitle,
                        description,
                        duration: duration || ''
                    });
                }
            });

            // Perform AI analysis
            const analysis = await AIAnalysisService.analyzeProfile(profileData);
            
            if (analysis.success) {
                this.displayAIAnalysis(analysis.data);
                showToast('Analisi AI completata!', 'success');
            } else {
                showToast(analysis.message || 'Errore durante l\'analisi AI', 'error');
            }

        } catch (error) {
            console.error('Error performing AI analysis:', error);
            showToast('Errore durante l\'analisi AI', 'error');
        } finally {
            hideLoading();
        }
    }

    static displayAIAnalysis(analysis) {
        const analysisContainer = document.getElementById('aiAnalysisResults');
        if (!analysisContainer) return;

        const html = `
            <div class="ai-result-card">
                <div class="row">
                    <div class="col-md-8">
                        <h4><i class="fas fa-brain me-2"></i>Analisi AI del tuo Profilo</h4>
                        <h5 class="mb-3">Settore Raccomandato: <span class="badge bg-light text-dark">${analysis.mainSector}</span></h5>
                        <p class="mb-3">${analysis.description}</p>
                    </div>
                    <div class="col-md-4 text-center">
                        <div class="mb-3">
                            <h6>Livello di Confidenza</h6>
                            <div class="confidence-meter mb-2">
                                <div class="confidence-fill" style="width: ${(analysis.confidence * 100)}%"></div>
                            </div>
                            <span class="fw-bold">${Math.round(analysis.confidence * 100)}%</span>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-md-6">
                        <h6><i class="fas fa-star text-warning me-2"></i>I tuoi Punti di Forza</h6>
                        <ul class="list-unstyled">
                            ${analysis.strengths.map(strength => `<li><i class="fas fa-check text-success me-2"></i>${strength}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-lightbulb text-info me-2"></i>Raccomandazioni</h6>
                        <ul class="list-unstyled">
                            ${analysis.recommendations.map(rec => `<li><i class="fas fa-arrow-right text-primary me-2"></i>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                ${analysis.skillGaps && analysis.skillGaps.length > 0 ? `
                <div class="mt-4">
                    <h6><i class="fas fa-exclamation-triangle text-warning me-2"></i>Competenze da Sviluppare</h6>
                    <div class="d-flex flex-wrap gap-2">
                        ${analysis.skillGaps.map(skill => `<span class="badge bg-warning text-dark">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}

                ${analysis.careerPaths && analysis.careerPaths.length > 0 ? `
                <div class="mt-4">
                    <h6><i class="fas fa-road text-primary me-2"></i>Percorsi di Carriera Suggeriti</h6>
                    <div class="row">
                        ${analysis.careerPaths.map(path => `
                            <div class="col-md-6 mb-3">
                                <div class="career-path difficulty-${path.difficulty.toLowerCase()}">
                                    <h6>${path.title}</h6>
                                    <p class="mb-2">${path.description}</p>
                                    <small class="text-muted">
                                        <i class="far fa-clock me-1"></i>Tempo stimato: ${path.timeframe} | 
                                        <i class="fas fa-chart-line me-1"></i>Difficoltà: ${path.difficulty}
                                    </small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        analysisContainer.innerHTML = html;
        analysisContainer.style.display = 'block';
        
        // Animate confidence meter
        setTimeout(() => {
            const confidenceFill = analysisContainer.querySelector('.confidence-fill');
            if (confidenceFill) {
                confidenceFill.style.width = `${Math.round(analysis.confidence * 100)}%`;
            }
        }, 500);

        // Scroll to results
        analysisContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    static populateProfileForm(profile) {
        if (!profile) return;

        // Basic fields
        const fields = ['biography', 'education', 'certifications', 'professionalReferences', 'hobbies', 'softSkills'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && profile[field]) {
                element.value = profile[field];
            }
        });

        // Experiences
        if (profile.experiences && profile.experiences.length > 0) {
            const experiencesContainer = document.getElementById('experiencesContainer');
            if (experiencesContainer) {
                experiencesContainer.innerHTML = '';
                
                profile.experiences.forEach((exp, index) => {
                    const experienceHTML = `
                        <div class="experience-item card mb-3">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="card-title mb-0">Esperienza Lavorativa ${index + 1}</h6>
                                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.experience-item').remove()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Titolo della posizione</label>
                                    <input type="text" class="form-control" name="experiences[${index}][jobTitle]" value="${exp.jobTitle || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Descrizione delle responsabilità</label>
                                    <textarea class="form-control" name="experiences[${index}][description]" rows="3" required>${exp.description || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Durata (es. Gen 2020 - Dic 2022)</label>
                                    <input type="text" class="form-control" name="experiences[${index}][duration]" value="${exp.duration || ''}" required>
                                </div>
                            </div>
                        </div>
                    `;
                    experiencesContainer.insertAdjacentHTML('beforeend', experienceHTML);
                });
            }
        }

        // CV file
        if (profile.cvFilePath) {
            const cvUploadArea = document.getElementById('cvUploadArea');
            if (cvUploadArea) {
                const uploadText = cvUploadArea.querySelector('.upload-text');
                const uploadIcon = cvUploadArea.querySelector('.upload-icon');
                
                if (uploadText && uploadIcon) {
                    uploadIcon.className = 'fas fa-file-pdf text-success upload-icon';
                    uploadText.innerHTML = `
                        <strong>CV caricato</strong><br>
                        <small class="text-muted">Clicca per sostituire</small>
                    `;
                    cvUploadArea.classList.add('uploaded');
                    cvUploadArea.dataset.cvPath = profile.cvFilePath;
                }
            }
        }
    }
}
