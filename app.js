// Enhanced Meeting Timer Application with Session Sharing and Break Management
class MeetingTimer {
    constructor() {
        this.currentView = 'setup';
        this.agendaItems = [];
        this.currentItemIndex = 0;
        this.timer = null;
        this.breakTimer = null;
        this.timerRunning = false;
        this.breakMode = false;
        this.currentItemTime = 0; // in seconds
        this.currentItemEstimated = 0; // in seconds
        this.totalBreakTime = 0; // in seconds
        this.breakStartTime = 0;
        this.completedItems = [];
        this.startTime = null;
        this.autoSaveTimer = null;
        this.sessionId = Date.now();
        this.meetingId = null;
        this.isFacilitator = true;
        this.participantCount = 1;
        this.connectionStatus = 'ready';
        
        // Settings data
        this.teamMembers = [];
        this.overtimeReasons = [];
        this.agendaTemplates = [];
        this.currentTheme = 'professional-blue';
        this.currentFontSize = 'medium';
        this.breakSound = 'gentle-chime';
        this.breakReminder = 5;
        
        // Default data with enhanced contrast-compliant themes
        this.defaultData = {
            teamMembers: [
                "John Smith", "Sarah Johnson", "Mike Chen", "Lisa Rodriguez", 
                "David Kim", "Emma Wilson", "Alex Thompson", "Maria Garcia"
            ],
            overtimeReasons: [
                "Requires deeper discussion",
                "New issues discovered", 
                "Need stakeholder input",
                "Technical complexities",
                "Resource constraints",
                "Timeline concerns",
                "Stakeholder questions",
                "Scope clarification needed"
            ],
            colorThemes: {
                "professional-blue": { 
                    name: "Professional Blue", 
                    primary: "#1e40af", 
                    secondary: "#1e3a8a", 
                    background: "#f8fafc", 
                    surface: "#ffffff", 
                    text: "#1f2937", 
                    textSecondary: "#4b5563",
                    accent: "#2563eb", 
                    success: "#047857", 
                    warning: "#d97706", 
                    error: "#dc2626",
                    contrast: "4.8:1"
                },
                "green-nature": { 
                    name: "Green Nature", 
                    primary: "#047857", 
                    secondary: "#065f46", 
                    background: "#f0fdf4", 
                    surface: "#ffffff", 
                    text: "#1f2937", 
                    textSecondary: "#374151",
                    accent: "#059669", 
                    success: "#16a34a", 
                    warning: "#ca8a04", 
                    error: "#dc2626",
                    contrast: "5.2:1"
                },
                "purple-corporate": { 
                    name: "Purple Corporate", 
                    primary: "#6d28d9", 
                    secondary: "#5b21b6", 
                    background: "#faf5ff", 
                    surface: "#ffffff", 
                    text: "#1f2937", 
                    textSecondary: "#374151",
                    accent: "#7c3aed", 
                    success: "#047857", 
                    warning: "#d97706", 
                    error: "#dc2626",
                    contrast: "4.9:1"
                },
                "orange-energy": { 
                    name: "Orange Energy", 
                    primary: "#c2410c", 
                    secondary: "#9a3412", 
                    background: "#fff7ed", 
                    surface: "#ffffff", 
                    text: "#1f2937", 
                    textSecondary: "#374151",
                    accent: "#ea580c", 
                    success: "#047857", 
                    warning: "#ca8a04", 
                    error: "#dc2626",
                    contrast: "5.1:1"
                },
                "dark-mode": { 
                    name: "Dark Mode", 
                    primary: "#3b82f6", 
                    secondary: "#2563eb", 
                    background: "#0f172a", 
                    surface: "#1e293b", 
                    text: "#f8fafc", 
                    textSecondary: "#cbd5e1",
                    accent: "#60a5fa", 
                    success: "#34d399", 
                    warning: "#fbbf24", 
                    error: "#f87171",
                    contrast: "7.2:1"
                }
            },
            fontSizes: {
                small: { name: "Small", base: "14px", scale: 0.875 },
                medium: { name: "Medium", base: "16px", scale: 1 },
                large: { name: "Large", base: "18px", scale: 1.125 }
            },
            sampleTemplates: [
                {
                    name: "Daily Standup",
                    items: [
                        { title: "What did you do yesterday?", estimatedMinutes: 5, description: "Team updates on previous day's work" },
                        { title: "What will you do today?", estimatedMinutes: 5, description: "Planning today's priorities" },
                        { title: "Any blockers?", estimatedMinutes: 5, description: "Discuss impediments and solutions" }
                    ]
                },
                {
                    name: "Project Review",
                    items: [
                        { title: "Project Status Overview", estimatedMinutes: 15, description: "Current progress and milestones" },
                        { title: "Budget Review", estimatedMinutes: 20, description: "Financial status and resource allocation" },
                        { title: "Risk Assessment", estimatedMinutes: 15, description: "Identify and mitigate project risks" },
                        { title: "Next Steps", estimatedMinutes: 10, description: "Action items and responsibilities" }
                    ]
                }
            ]
        };
        
        // Check for shared session
        this.checkForSharedSession();
        this.init();
    }

    init() {
        console.log('Initializing Meeting Timer...');
        
        try {
            this.loadSettings();
            this.bindEvents(); // Bind events first before checking recovery
            this.checkForRecovery();
            this.updateCurrentTime();
            this.setupParticipants();
            this.setupOvertimeReasons();
            this.renderAgendaItems();
            this.renderTeamMembers();
            this.renderOvertimeReasons();
            this.renderTemplates();
            this.applyTheme();
            this.applyFontSize();
            this.updateConnectionStatus();
            
            // Update time every second
            setInterval(() => this.updateCurrentTime(), 1000);
            
            // Start auto-save timer
            this.startAutoSave();
            
            // Cross-tab synchronization
            window.addEventListener('storage', (e) => this.handleStorageChange(e));
            
            // Handle page visibility for session persistence
            document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
            
            // Handle beforeunload for backup
            window.addEventListener('beforeunload', () => this.saveSessionBackup());
            
            // Start session sync if in shared mode
            if (this.meetingId && !this.isFacilitator) {
                this.startParticipantSync();
            }
            
            console.log('Meeting Timer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Meeting Timer:', error);
        }
    }

    // Session Sharing Implementation
    checkForSharedSession() {
        const hash = window.location.hash;
        if (hash.startsWith('#meeting=')) {
            this.meetingId = hash.substring(9);
            this.isFacilitator = false;
            console.log('Joined shared session:', this.meetingId);
        }
    }

    generateMeetingId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 10);
        return `${timestamp}${random}`;
    }

    shareMeeting() {
        if (!this.meetingId) {
            this.meetingId = this.generateMeetingId();
            this.isFacilitator = true;
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}#meeting=${this.meetingId}`;
        
        const shareUrlInput = document.getElementById('share-url');
        const shareUrlContainer = document.getElementById('share-url-container');
        
        if (shareUrlInput && shareUrlContainer) {
            shareUrlInput.value = shareUrl;
            shareUrlContainer.classList.remove('hidden');
        }

        // Save session data for sharing
        this.saveSharedSession();
        
        this.showNotification('Meeting URL generated! Share with participants.', 'success');
        return shareUrl;
    }

    copyShareUrl() {
        const shareUrlInput = document.getElementById('share-url');
        if (shareUrlInput) {
            shareUrlInput.select();
            shareUrlInput.setSelectionRange(0, 99999); // For mobile
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrlInput.value).then(() => {
                    this.showNotification('Meeting URL copied to clipboard!', 'success');
                }).catch(() => {
                    this.showNotification('Please copy the URL manually', 'info');
                });
            } else {
                this.showNotification('Please copy the URL manually', 'info');
            }
        }
    }

    saveSharedSession() {
        if (!this.meetingId) return;

        const sharedData = {
            meetingId: this.meetingId,
            agendaItems: this.agendaItems,
            currentItemIndex: this.currentItemIndex,
            currentItemTime: this.currentItemTime,
            currentItemEstimated: this.currentItemEstimated,
            timerRunning: this.timerRunning,
            breakMode: this.breakMode,
            totalBreakTime: this.totalBreakTime,
            participantCount: this.participantCount,
            lastUpdate: Date.now(),
            facilitatorId: this.sessionId
        };

        this.saveToStorage(`shared_${this.meetingId}`, sharedData);
    }

    loadSharedSession() {
        if (!this.meetingId) return null;
        return this.getFromStorage(`shared_${this.meetingId}`);
    }

    startParticipantSync() {
        // Update UI for participant mode
        this.updateParticipantMode();
        
        // Start syncing every 2 seconds
        this.syncTimer = setInterval(() => {
            this.syncWithFacilitator();
        }, 2000);
    }

    updateParticipantMode() {
        const facilitatorControls = document.getElementById('facilitator-controls');
        const participantControls = document.getElementById('participant-controls');
        const participantIndicator = document.getElementById('participant-mode-indicator');
        const sharingSection = document.getElementById('sharing-section');

        if (facilitatorControls) facilitatorControls.classList.add('hidden');
        if (participantControls) participantControls.classList.remove('hidden');
        if (participantIndicator) participantIndicator.classList.remove('hidden');
        if (sharingSection) sharingSection.classList.add('hidden');

        // Disable setup modifications
        const setupInputs = document.querySelectorAll('#setup-view input, #setup-view textarea, #setup-view button');
        setupInputs.forEach(input => input.disabled = true);
    }

    syncWithFacilitator() {
        const sharedData = this.loadSharedSession();
        if (!sharedData) {
            this.updateConnectionStatus('error');
            return;
        }

        // Update local state from facilitator
        this.agendaItems = sharedData.agendaItems || [];
        this.currentItemIndex = sharedData.currentItemIndex || 0;
        this.currentItemTime = sharedData.currentItemTime || 0;
        this.currentItemEstimated = sharedData.currentItemEstimated || 0;
        this.timerRunning = sharedData.timerRunning || false;
        this.breakMode = sharedData.breakMode || false;
        this.totalBreakTime = sharedData.totalBreakTime || 0;
        this.participantCount = sharedData.participantCount || 1;

        // Update UI
        if (this.currentView === 'timer') {
            this.loadCurrentItem();
            this.updateTimerDisplay();
            this.updateProgress();
            
            if (this.breakMode) {
                this.showBreakMode();
            } else {
                this.hideBreakMode();
            }
        }

        this.updateConnectionStatus('connected');
    }

    updateConnectionStatus(status = 'connected') {
        this.connectionStatus = status;
        const statusIndicator = document.querySelector('.status-indicator');
        const connectionText = document.getElementById('connection-text');
        const participantNumber = document.getElementById('participant-number');
        const participantCount = document.getElementById('participant-count');

        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            if (status === 'connecting') statusIndicator.classList.add('connecting');
            else if (status === 'error') statusIndicator.classList.add('error');
        }

        if (connectionText) {
            const statusTexts = {
                ready: 'Ready',
                connected: 'Connected',
                connecting: 'Connecting...',
                error: 'Connection Lost'
            };
            connectionText.textContent = statusTexts[status] || 'Unknown';
        }

        if (participantNumber) {
            participantNumber.textContent = this.participantCount;
        }

        if (participantCount && this.participantCount > 1) {
            participantCount.classList.remove('hidden');
        } else if (participantCount) {
            participantCount.classList.add('hidden');
        }
    }

    // Break Management
    takeBreak() {
        if (this.breakMode) return;

        this.breakMode = true;
        this.breakStartTime = Date.now();
        
        if (this.timerRunning) {
            this.pauseTimer();
        }

        this.showBreakMode();
        this.startBreakTimer();
        
        if (this.isFacilitator) {
            this.saveSharedSession();
        }

        this.playBreakSound();
        this.showNotification('Break started! ☕', 'info');
    }

    endBreak() {
        if (!this.breakMode) return;

        this.breakMode = false;
        const breakDuration = Math.floor((Date.now() - this.breakStartTime) / 1000);
        this.totalBreakTime += breakDuration;

        this.hideBreakMode();
        this.stopBreakTimer();
        
        if (this.isFacilitator) {
            this.saveSharedSession();
        }

        this.showNotification(`Break ended! Duration: ${this.formatTime(breakDuration)}`, 'success');
    }

    showBreakMode() {
        const breakMode = document.getElementById('break-mode');
        const currentItemSection = document.getElementById('current-item-section');
        const timerCircle = document.getElementById('timer-circle');

        if (breakMode) breakMode.classList.remove('hidden');
        if (currentItemSection) currentItemSection.style.opacity = '0.6';
        if (timerCircle) timerCircle.classList.add('break-mode');
    }

    hideBreakMode() {
        const breakMode = document.getElementById('break-mode');
        const currentItemSection = document.getElementById('current-item-section');
        const timerCircle = document.getElementById('timer-circle');

        if (breakMode) breakMode.classList.add('hidden');
        if (currentItemSection) currentItemSection.style.opacity = '1';
        if (timerCircle) timerCircle.classList.remove('break-mode');
    }

    startBreakTimer() {
        this.breakTimer = setInterval(() => {
            const breakDuration = Math.floor((Date.now() - this.breakStartTime) / 1000);
            this.updateBreakDisplay(breakDuration);
            
            // Check if we should show reminder
            const targetDuration = parseInt(document.getElementById('break-duration')?.value || 15) * 60;
            const reminderTime = targetDuration - (this.breakReminder * 60);
            
            if (breakDuration === reminderTime && reminderTime > 0) {
                this.showNotification(`Break reminder: ${this.breakReminder} minutes left`, 'warning');
            }
        }, 1000);
    }

    stopBreakTimer() {
        if (this.breakTimer) {
            clearInterval(this.breakTimer);
            this.breakTimer = null;
        }
    }

    updateBreakDisplay(duration) {
        const breakTimeEl = document.getElementById('break-time');
        if (breakTimeEl) {
            breakTimeEl.textContent = this.formatTime(duration);
        }
    }

    playBreakSound() {
        if (this.breakSound === 'none') return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (this.breakSound === 'gentle-chime') {
                // Gentle chime sequence
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.3); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.6); // G5
            } else if (this.breakSound === 'soft-bell') {
                // Soft bell
                oscillator.frequency.value = 800;
            }
            
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.log('Audio notification not available');
        }
    }

    // Enhanced Session Management - FIXED
    checkForRecovery() {
        const lastSession = this.getFromStorage('lastSession');
        const sessionBackup = this.getFromStorage('sessionBackup');
        
        // Only show recovery if both exist and session is recent (within 30 minutes) and has meaningful data
        if (lastSession && sessionBackup && 
            lastSession.timestamp > Date.now() - 30 * 60 * 1000 &&
            sessionBackup.agendaItems && sessionBackup.agendaItems.length > 0) {
            this.showRecoveryModal(sessionBackup);
        }
    }

    showRecoveryModal(backupData) {
        const modal = document.getElementById('recovery-modal');
        if (!modal) return;
        
        modal.classList.remove('hidden');
        
        // Properly bind button handlers
        const recoverBtn = document.getElementById('recover-session-btn');
        const freshBtn = document.getElementById('start-fresh-btn');
        
        if (recoverBtn) {
            // Remove any existing listeners and add new one
            const newRecoverBtn = recoverBtn.cloneNode(true);
            recoverBtn.parentNode.replaceChild(newRecoverBtn, recoverBtn);
            
            newRecoverBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.restoreSession(backupData);
                modal.classList.add('hidden');
            });
        }
        
        if (freshBtn) {
            // Remove any existing listeners and add new one
            const newFreshBtn = freshBtn.cloneNode(true);
            freshBtn.parentNode.replaceChild(newFreshBtn, freshBtn);
            
            newFreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearSessionBackup();
                modal.classList.add('hidden');
            });
        }
    }

    restoreSession(backupData) {
        try {
            this.agendaItems = backupData.agendaItems || [];
            this.currentItemIndex = backupData.currentItemIndex || 0;
            this.completedItems = backupData.completedItems || [];
            this.currentView = backupData.currentView || 'setup';
            this.totalBreakTime = backupData.totalBreakTime || 0;
            this.meetingId = backupData.meetingId || null;
            
            if (this.currentView === 'timer') {
                this.switchToView('timer');
                this.loadCurrentItem();
                this.updateProgress();
            } else {
                this.renderAgendaItems();
                this.updateTotalTime();
            }
            
            this.showNotification('Session recovered successfully!', 'success');
        } catch (error) {
            console.error('Failed to restore session:', error);
            this.showNotification('Failed to restore session', 'error');
        }
    }

    saveSessionBackup() {
        // Only save backup if there's meaningful data
        if (this.agendaItems.length === 0 && this.completedItems.length === 0) {
            return;
        }

        const backup = {
            agendaItems: this.agendaItems,
            currentItemIndex: this.currentItemIndex,
            completedItems: this.completedItems,
            currentView: this.currentView,
            totalBreakTime: this.totalBreakTime,
            meetingId: this.meetingId,
            timestamp: Date.now()
        };
        
        this.saveToStorage('sessionBackup', backup);
        this.saveToStorage('lastSession', { timestamp: Date.now() });
    }

    clearSessionBackup() {
        this.removeFromStorage('sessionBackup');
        this.removeFromStorage('lastSession');
    }

    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            if (this.currentView === 'timer' && (this.timerRunning || this.breakMode)) {
                this.saveSessionBackup();
                
                if (this.isFacilitator && this.meetingId) {
                    this.saveSharedSession();
                }
            }
        }, 5000); // Every 5 seconds
    }

    handleStorageChange(event) {
        if (event.key === 'sessionBackup' && event.newValue) {
            console.log('Cross-tab sync detected');
        }
        
        // Handle shared session updates
        if (event.key === `shared_${this.meetingId}` && event.newValue && !this.isFacilitator) {
            this.syncWithFacilitator();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.saveSessionBackup();
        } else {
            console.log('Page visible again');
        }
    }

    // Storage utilities
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to storage:', error);
        }
    }

    getFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Failed to get from storage:', error);
            return null;
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from storage:', error);
        }
    }

    // Settings Management
    loadSettings() {
        this.teamMembers = this.getFromStorage('teamMembers') || [...this.defaultData.teamMembers];
        this.overtimeReasons = this.getFromStorage('overtimeReasons') || [...this.defaultData.overtimeReasons];
        this.agendaTemplates = this.getFromStorage('agendaTemplates') || [...this.defaultData.sampleTemplates];
        this.currentTheme = this.getFromStorage('currentTheme') || 'professional-blue';
        this.currentFontSize = this.getFromStorage('currentFontSize') || 'medium';
        this.breakSound = this.getFromStorage('breakSound') || 'gentle-chime';
        this.breakReminder = this.getFromStorage('breakReminder') || 5;
    }

    saveSettings() {
        this.saveToStorage('teamMembers', this.teamMembers);
        this.saveToStorage('overtimeReasons', this.overtimeReasons);
        this.saveToStorage('agendaTemplates', this.agendaTemplates);
        this.saveToStorage('currentTheme', this.currentTheme);
        this.saveToStorage('currentFontSize', this.currentFontSize);
        this.saveToStorage('breakSound', this.breakSound);
        this.saveToStorage('breakReminder', this.breakReminder);
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Tab navigation - fixed event handling
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const view = e.target.dataset.view;
                if (view) {
                    this.switchToView(view);
                }
            }
        });

        // Setup phase events - direct event binding
        const agendaForm = document.getElementById('agenda-form');
        if (agendaForm) {
            agendaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAgendaItem();
            });
        }
        
        // Use more specific event delegation
        document.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.id;
            
            // Setup actions
            if (id === 'confirm-agenda') {
                this.startTimerPhase();
            } else if (id === 'load-template-btn') {
                this.showTemplateModal();
            } else if (id === 'import-agenda-btn') {
                document.getElementById('agenda-file-input')?.click();
            } else if (id === 'export-agenda-btn') {
                this.exportAgenda();
            }
            
            // Timer actions
            else if (id === 'start-pause-btn') {
                this.toggleTimer();
            } else if (id === 'stop-btn') {
                this.stopTimer();
            } else if (id === 'next-item-btn') {
                this.nextItem();
            } else if (id === 'take-break-btn') {
                this.takeBreak();
            } else if (id === 'end-break-btn') {
                this.endBreak();
            } else if (id === 'save-overtime-notes') {
                this.saveOvertimeNotes();
            }
            
            // Sharing actions
            else if (id === 'share-meeting-btn') {
                this.shareMeeting();
            } else if (id === 'copy-share-url') {
                this.copyShareUrl();
            }
            
            // Settings actions
            else if (id === 'add-member-btn') {
                this.addTeamMember();
            } else if (id === 'import-team-btn') {
                document.getElementById('team-file-input')?.click();
            } else if (id === 'export-team-btn') {
                this.exportTeamMembers();
            } else if (id === 'add-reason-btn') {
                this.addOvertimeReason();
            } else if (id === 'import-reasons-btn') {
                document.getElementById('reasons-file-input')?.click();
            } else if (id === 'export-reasons-btn') {
                this.exportOvertimeReasons();
            } else if (id === 'save-template-btn') {
                this.saveCurrentAsTemplate();
            } else if (id === 'clear-data-btn') {
                this.clearAllData();
            } else if (id === 'backup-data-btn') {
                this.backupAllSettings();
            } else if (id === 'restore-data-btn') {
                document.getElementById('backup-file-input')?.click();
            }
            
            // Summary actions
            else if (id === 'export-summary') {
                this.exportSummary();
            } else if (id === 'start-new-meeting') {
                this.startNewMeeting();
            }
            
            // Modal actions
            else if (id === 'close-template-modal') {
                this.hideTemplateModal();
            }
            
            // Modal close by clicking outside
            else if (target.classList.contains('modal')) {
                target.classList.add('hidden');
            }
            
            // Remove buttons
            else if (target.classList.contains('btn-remove')) {
                const agendaItem = target.closest('.agenda-item');
                if (agendaItem) {
                    const itemId = agendaItem.dataset.itemId;
                    if (itemId) {
                        this.removeAgendaItem(parseFloat(itemId));
                    }
                }
            }
            
            // Dynamic remove buttons
            else if (target.textContent.includes('Remove')) {
                const memberItem = target.closest('.member-item');
                const reasonItem = target.closest('.reason-item');
                
                if (memberItem) {
                    const memberName = memberItem.querySelector('span').textContent;
                    this.removeTeamMember(memberName);
                } else if (reasonItem) {
                    const reasonText = reasonItem.querySelector('span').textContent;
                    this.removeOvertimeReason(reasonText);
                }
            }
        });

        // Form control changes
        document.addEventListener('change', (e) => {
            const target = e.target;
            const id = target.id;
            
            if (id === 'theme-select') {
                this.changeTheme(target.value);
            } else if (id === 'font-size-select') {
                this.changeFontSize(target.value);
            } else if (id === 'break-sound-select') {
                this.breakSound = target.value;
                this.saveSettings();
            } else if (id === 'break-reminder') {
                this.breakReminder = parseInt(target.value);
                this.saveSettings();
            }
        });

        // File input events
        this.bindFileEvents();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Drag and drop
        this.setupDragAndDrop();
        
        console.log('Events bound successfully');
    }

    bindFileEvents() {
        const agendaFileInput = document.getElementById('agenda-file-input');
        if (agendaFileInput) {
            agendaFileInput.addEventListener('change', (e) => {
                this.handleAgendaImport(e.target.files[0]);
                e.target.value = '';
            });
        }

        const teamFileInput = document.getElementById('team-file-input');
        if (teamFileInput) {
            teamFileInput.addEventListener('change', (e) => {
                this.handleTeamImport(e.target.files[0]);
                e.target.value = '';
            });
        }

        const reasonsFileInput = document.getElementById('reasons-file-input');
        if (reasonsFileInput) {
            reasonsFileInput.addEventListener('change', (e) => {
                this.handleReasonsImport(e.target.files[0]);
                e.target.value = '';
            });
        }

        const backupFileInput = document.getElementById('backup-file-input');
        if (backupFileInput) {
            backupFileInput.addEventListener('change', (e) => {
                this.handleBackupRestore(e.target.files[0]);
                e.target.value = '';
            });
        }
    }

    setupDragAndDrop() {
        const teamDropArea = document.getElementById('team-drop-area');
        if (teamDropArea) {
            this.setupDropArea(teamDropArea, (file) => this.handleTeamImport(file));
        }

        const reasonsDropArea = document.getElementById('reasons-drop-area');
        if (reasonsDropArea) {
            this.setupDropArea(reasonsDropArea, (file) => this.handleReasonsImport(file));
        }
    }

    setupDropArea(dropArea, handleFile) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('drag-over');
            });
        });

        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        dropArea.addEventListener('click', () => {
            if (dropArea.id === 'team-drop-area') {
                document.getElementById('team-file-input')?.click();
            } else if (dropArea.id === 'reasons-drop-area') {
                document.getElementById('reasons-file-input')?.click();
            }
        });
    }

    handleKeyboardShortcuts(e) {
        // Only allow shortcuts for facilitators
        if (!this.isFacilitator) return;

        if (this.currentView === 'timer') {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleTimer();
            } else if (e.code === 'KeyB') {
                e.preventDefault();
                if (this.breakMode) {
                    this.endBreak();
                } else {
                    this.takeBreak();
                }
            } else if (e.code === 'ArrowRight' || e.code === 'Tab') {
                e.preventDefault();
                this.nextItem();
            } else if (e.code === 'Escape') {
                e.preventDefault();
                this.stopTimer();
            }
        }

        // Global shortcuts
        if (e.ctrlKey || e.metaKey) {
            if (e.code === 'Digit1') {
                e.preventDefault();
                this.switchToView('setup');
            } else if (e.code === 'Digit2') {
                e.preventDefault();
                this.switchToView('timer');
            } else if (e.code === 'Digit3') {
                e.preventDefault();
                this.switchToView('settings');
            } else if (e.code === 'Digit4') {
                e.preventDefault();
                this.switchToView('summary');
            }
        }
    }

    // View Management
    switchToView(viewName) {
        console.log('Switching to view:', viewName);
        this.currentView = viewName;
        
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            }
        });
        
        this.showView(viewName + '-view');
        
        if (viewName === 'settings') {
            setTimeout(() => {
                const themeSelect = document.getElementById('theme-select');
                const fontSelect = document.getElementById('font-size-select');
                const breakSoundSelect = document.getElementById('break-sound-select');
                const breakReminderSelect = document.getElementById('break-reminder');
                
                if (themeSelect) themeSelect.value = this.currentTheme;
                if (fontSelect) fontSelect.value = this.currentFontSize;
                if (breakSoundSelect) breakSoundSelect.value = this.breakSound;
                if (breakReminderSelect) breakReminderSelect.value = this.breakReminder;
            }, 100);
        }
        
        this.updateTabStates();
    }

    updateTabStates() {
        const timerTab = document.querySelector('[data-view="timer"]');
        if (timerTab) {
            if (this.agendaItems.length === 0) {
                timerTab.disabled = true;
                timerTab.style.opacity = '0.5';
                timerTab.style.cursor = 'not-allowed';
            } else {
                timerTab.disabled = false;
                timerTab.style.opacity = '';
                timerTab.style.cursor = '';
            }
        }
        
        const summaryTab = document.querySelector('[data-view="summary"]');
        if (summaryTab) {
            if (this.completedItems.length === 0) {
                summaryTab.disabled = true;
                summaryTab.style.opacity = '0.5';
                summaryTab.style.cursor = 'not-allowed';
            } else {
                summaryTab.disabled = false;
                summaryTab.style.opacity = '';
                summaryTab.style.cursor = '';
            }
        }
    }

    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });
        
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = timeString;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Theme Management
    changeTheme(themeName) {
        this.currentTheme = themeName;
        this.applyTheme();
        this.saveSettings();
        this.showNotification(`Theme changed to ${this.defaultData.colorThemes[themeName].name}`, 'success');
    }

    applyTheme() {
        document.body.dataset.theme = this.currentTheme;
    }

    changeFontSize(sizeName) {
        this.currentFontSize = sizeName;
        this.applyFontSize();
        this.saveSettings();
        this.showNotification(`Font size changed to ${this.defaultData.fontSizes[sizeName].name}`, 'success');
    }

    applyFontSize() {
        document.body.dataset.fontSize = this.currentFontSize;
    }

    // Team Management
    addTeamMember() {
        const input = document.getElementById('new-member-name');
        if (!input) return;

        const name = input.value.trim();
        if (!name) {
            this.showNotification('Please enter a team member name', 'error');
            return;
        }

        if (this.teamMembers.includes(name)) {
            this.showNotification('Team member already exists', 'error');
            return;
        }

        this.teamMembers.push(name);
        input.value = '';
        this.renderTeamMembers();
        this.setupParticipants();
        this.saveSettings();
        this.showNotification(`Added ${name} to team`, 'success');
    }

    removeTeamMember(name) {
        const index = this.teamMembers.indexOf(name);
        if (index > -1) {
            this.teamMembers.splice(index, 1);
            this.renderTeamMembers();
            this.setupParticipants();
            this.saveSettings();
            this.showNotification(`Removed ${name} from team`, 'success');
        }
    }

    renderTeamMembers() {
        const container = document.getElementById('team-members-list');
        if (!container) return;

        container.innerHTML = '';

        this.teamMembers.forEach(member => {
            const memberEl = document.createElement('div');
            memberEl.className = 'member-item';
            memberEl.innerHTML = `
                <span>${this.escapeHtml(member)}</span>
                <button class="btn btn--sm btn--outline">Remove</button>
            `;
            container.appendChild(memberEl);
        });
    }

    exportTeamMembers() {
        this.downloadJSON(this.teamMembers, 'team-members.json');
        this.showNotification('Team members exported', 'success');
    }

    handleTeamImport(file) {
        if (!file) return;

        this.readJSONFile(file)
            .then(data => {
                if (Array.isArray(data)) {
                    this.teamMembers = [...new Set([...this.teamMembers, ...data])];
                    this.renderTeamMembers();
                    this.setupParticipants();
                    this.saveSettings();
                    this.showNotification(`Imported ${data.length} team members`, 'success');
                } else {
                    throw new Error('Invalid format');
                }
            })
            .catch(error => {
                this.showNotification('Failed to import team members: ' + error.message, 'error');
            });
    }

    // Overtime Reasons Management
    addOvertimeReason() {
        const input = document.getElementById('new-reason-text');
        if (!input) return;

        const reason = input.value.trim();
        if (!reason) {
            this.showNotification('Please enter an overtime reason', 'error');
            return;
        }

        if (this.overtimeReasons.includes(reason)) {
            this.showNotification('Reason already exists', 'error');
            return;
        }

        this.overtimeReasons.push(reason);
        input.value = '';
        this.renderOvertimeReasons();
        this.setupOvertimeReasons();
        this.saveSettings();
        this.showNotification('Added overtime reason', 'success');
    }

    removeOvertimeReason(reason) {
        const index = this.overtimeReasons.indexOf(reason);
        if (index > -1) {
            this.overtimeReasons.splice(index, 1);
            this.renderOvertimeReasons();
            this.setupOvertimeReasons();
            this.saveSettings();
            this.showNotification('Removed overtime reason', 'success');
        }
    }

    renderOvertimeReasons() {
        const container = document.getElementById('overtime-reasons-list');
        if (!container) return;

        container.innerHTML = '';

        this.overtimeReasons.forEach(reason => {
            const reasonEl = document.createElement('div');
            reasonEl.className = 'reason-item';
            reasonEl.innerHTML = `
                <span>${this.escapeHtml(reason)}</span>
                <button class="btn btn--sm btn--outline">Remove</button>
            `;
            container.appendChild(reasonEl);
        });
    }

    exportOvertimeReasons() {
        this.downloadJSON(this.overtimeReasons, 'overtime-reasons.json');
        this.showNotification('Overtime reasons exported', 'success');
    }

    handleReasonsImport(file) {
        if (!file) return;

        this.readJSONFile(file)
            .then(data => {
                if (Array.isArray(data)) {
                    this.overtimeReasons = [...new Set([...this.overtimeReasons, ...data])];
                    this.renderOvertimeReasons();
                    this.setupOvertimeReasons();
                    this.saveSettings();
                    this.showNotification(`Imported ${data.length} overtime reasons`, 'success');
                } else {
                    throw new Error('Invalid format');
                }
            })
            .catch(error => {
                this.showNotification('Failed to import overtime reasons: ' + error.message, 'error');
            });
    }

    setupOvertimeReasons() {
        const select = document.getElementById('overtime-reason');
        if (!select) return;
        
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        this.overtimeReasons.forEach(reason => {
            const option = document.createElement('option');
            option.value = reason;
            option.textContent = reason;
            select.appendChild(option);
        });
    }

    setupParticipants() {
        const participantsList = document.getElementById('participants-list');
        if (!participantsList) return;
        
        participantsList.innerHTML = '';
        
        this.teamMembers.forEach(participant => {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'participant-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `participant-${participant.replace(/\s+/g, '-').toLowerCase()}`;
            checkbox.value = participant;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = participant;
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            participantsList.appendChild(checkboxContainer);
        });
    }

    // Template Management
    renderTemplates() {
        const container = document.getElementById('templates-list');
        if (!container) return;

        container.innerHTML = '';

        this.agendaTemplates.forEach((template, index) => {
            const templateEl = document.createElement('div');
            templateEl.className = 'template-item';
            templateEl.innerHTML = `
                <h4>${this.escapeHtml(template.name)}</h4>
                <p>${template.items.length} items, ${template.items.reduce((sum, item) => sum + item.estimatedMinutes, 0)} min total</p>
            `;
            templateEl.addEventListener('click', () => this.loadTemplate(template));
            container.appendChild(templateEl);
        });
    }

    saveCurrentAsTemplate() {
        if (this.agendaItems.length === 0) {
            this.showNotification('No agenda items to save as template', 'error');
            return;
        }

        const name = prompt('Enter template name:');
        if (!name) return;

        const template = {
            name: name.trim(),
            items: this.agendaItems.map(item => ({
                title: item.title,
                estimatedMinutes: item.estimatedMinutes,
                description: item.description
            }))
        };

        this.agendaTemplates.push(template);
        this.renderTemplates();
        this.saveSettings();
        this.showNotification(`Template "${name}" saved`, 'success');
    }

    showTemplateModal() {
        const modal = document.getElementById('template-modal');
        if (!modal) return;

        const container = document.getElementById('template-options');
        if (!container) return;

        container.innerHTML = '';

        this.agendaTemplates.forEach(template => {
            const templateEl = document.createElement('div');
            templateEl.className = 'template-item';
            templateEl.innerHTML = `
                <h4>${this.escapeHtml(template.name)}</h4>
                <p>${template.items.length} items, ${template.items.reduce((sum, item) => sum + item.estimatedMinutes, 0)} min total</p>
            `;
            templateEl.addEventListener('click', () => {
                this.loadTemplate(template);
                this.hideTemplateModal();
            });
            container.appendChild(templateEl);
        });

        modal.classList.remove('hidden');
    }

    hideTemplateModal() {
        const modal = document.getElementById('template-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    loadTemplate(template) {
        this.agendaItems = template.items.map(item => ({
            id: Date.now() + Math.random(),
            title: item.title,
            estimatedMinutes: item.estimatedMinutes,
            description: item.description || '',
            actualMinutes: 0,
            overtime: false,
            overtimeNotes: '',
            followUpParticipants: [],
            overtimeReason: ''
        }));

        this.renderAgendaItems();
        this.updateTotalTime();
        this.showNotification(`Template "${template.name}" loaded`, 'success');
    }

    // File utilities
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    readJSONFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.includes('json')) {
                reject(new Error('Please select a JSON file'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Agenda Management
    exportAgenda() {
        if (this.agendaItems.length === 0) {
            this.showNotification('No agenda items to export', 'error');
            return;
        }

        const agendaData = {
            title: `Meeting Agenda - ${new Date().toLocaleDateString()}`,
            items: this.agendaItems.map(item => ({
                title: item.title,
                estimatedMinutes: item.estimatedMinutes,
                description: item.description
            })),
            exportDate: new Date().toISOString()
        };

        this.downloadJSON(agendaData, 'meeting-agenda.json');
        this.showNotification('Agenda exported successfully', 'success');
    }

    handleAgendaImport(file) {
        if (!file) return;

        this.readJSONFile(file)
            .then(data => {
                if (data.items && Array.isArray(data.items)) {
                    const imported = data.items.map(item => ({
                        id: Date.now() + Math.random(),
                        title: item.title || 'Untitled',
                        estimatedMinutes: item.estimatedMinutes || 10,
                        description: item.description || '',
                        actualMinutes: 0,
                        overtime: false,
                        overtimeNotes: '',
                        followUpParticipants: [],
                        overtimeReason: ''
                    }));

                    this.agendaItems = [...this.agendaItems, ...imported];
                    this.renderAgendaItems();
                    this.updateTotalTime();
                    this.showNotification(`Imported ${imported.length} agenda items`, 'success');
                } else {
                    throw new Error('Invalid agenda format');
                }
            })
            .catch(error => {
                this.showNotification('Failed to import agenda: ' + error.message, 'error');
            });
    }

    // Data Management
    clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            return;
        }

        localStorage.clear();
        
        this.agendaItems = [];
        this.completedItems = [];
        this.teamMembers = [...this.defaultData.teamMembers];
        this.overtimeReasons = [...this.defaultData.overtimeReasons];
        this.agendaTemplates = [...this.defaultData.sampleTemplates];
        this.currentTheme = 'professional-blue';
        this.currentFontSize = 'medium';
        this.breakSound = 'gentle-chime';
        this.breakReminder = 5;

        this.renderAgendaItems();
        this.renderTeamMembers();
        this.renderOvertimeReasons();
        this.renderTemplates();
        this.setupParticipants();
        this.setupOvertimeReasons();
        this.applyTheme();
        this.applyFontSize();
        this.updateTotalTime();

        this.showNotification('All data cleared and reset to defaults', 'success');
    }

    backupAllSettings() {
        const backup = {
            teamMembers: this.teamMembers,
            overtimeReasons: this.overtimeReasons,
            agendaTemplates: this.agendaTemplates,
            currentTheme: this.currentTheme,
            currentFontSize: this.currentFontSize,
            breakSound: this.breakSound,
            breakReminder: this.breakReminder,
            backupDate: new Date().toISOString(),
            version: '2.0'
        };

        this.downloadJSON(backup, `meeting-timer-backup-${new Date().toISOString().split('T')[0]}.json`);
        this.showNotification('Settings backup created', 'success');
    }

    handleBackupRestore(file) {
        if (!file) return;

        this.readJSONFile(file)
            .then(backup => {
                if (backup.teamMembers && backup.overtimeReasons) {
                    this.teamMembers = backup.teamMembers;
                    this.overtimeReasons = backup.overtimeReasons;
                    this.agendaTemplates = backup.agendaTemplates || [];
                    this.currentTheme = backup.currentTheme || 'professional-blue';
                    this.currentFontSize = backup.currentFontSize || 'medium';
                    this.breakSound = backup.breakSound || 'gentle-chime';
                    this.breakReminder = backup.breakReminder || 5;

                    this.renderTeamMembers();
                    this.renderOvertimeReasons();
                    this.renderTemplates();
                    this.setupParticipants();
                    this.setupOvertimeReasons();
                    this.applyTheme();
                    this.applyFontSize();

                    this.saveSettings();
                    this.showNotification('Settings restored successfully', 'success');
                } else {
                    throw new Error('Invalid backup format');
                }
            })
            .catch(error => {
                this.showNotification('Failed to restore backup: ' + error.message, 'error');
            });
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        const colors = {
            success: '#047857',
            error: '#dc2626',
            warning: '#d97706',
            info: '#2563eb'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Timer functionality
    addAgendaItem() {
        if (!this.isFacilitator) {
            this.showNotification('Only facilitators can modify agenda', 'error');
            return;
        }

        const titleEl = document.getElementById('item-title');
        const timeEl = document.getElementById('item-time');
        const descriptionEl = document.getElementById('item-description');
        
        if (!titleEl || !timeEl) {
            this.showNotification('Form elements not found', 'error');
            return;
        }

        const title = titleEl.value.trim();
        const time = parseInt(timeEl.value);
        const description = descriptionEl ? descriptionEl.value.trim() : '';

        if (!title || !time || time <= 0) {
            this.showNotification('Please enter a valid title and time estimate', 'error');
            return;
        }

        const item = {
            id: Date.now() + Math.random(),
            title,
            estimatedMinutes: time,
            description: description || '',
            actualMinutes: 0,
            overtime: false,
            overtimeNotes: '',
            followUpParticipants: [],
            overtimeReason: ''
        };

        this.agendaItems.push(item);
        this.renderAgendaItems();
        this.updateTotalTime();

        titleEl.value = '';
        timeEl.value = '';
        if (descriptionEl) descriptionEl.value = '';
        
        titleEl.focus();

        this.showNotification(`Added "${title}"`, 'success');
    }

    removeAgendaItem(id) {
        if (!this.isFacilitator) {
            this.showNotification('Only facilitators can modify agenda', 'error');
            return;
        }

        this.agendaItems = this.agendaItems.filter(item => item.id !== id);
        this.renderAgendaItems();
        this.updateTotalTime();
        this.showNotification('Agenda item removed', 'success');
    }

    renderAgendaItems() {
        const container = document.getElementById('agenda-items');
        const itemCount = document.getElementById('item-count');
        const confirmBtn = document.getElementById('confirm-agenda');
        
        if (!container) return;

        container.innerHTML = '';

        this.agendaItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'agenda-item';
            itemEl.dataset.itemId = item.id;
            itemEl.innerHTML = `
                <div class="agenda-item-header">
                    <h4 class="agenda-item-title">${this.escapeHtml(item.title)}</h4>
                    <span class="agenda-item-time">${item.estimatedMinutes} min</span>
                </div>
                ${item.description ? `<p class="agenda-item-description">${this.escapeHtml(item.description)}</p>` : ''}
                ${this.isFacilitator ? '<div class="agenda-item-actions"><button class="btn-remove">Remove</button></div>' : ''}
            `;
            container.appendChild(itemEl);
        });

        if (itemCount) {
            itemCount.textContent = this.agendaItems.length;
        }
        
        if (confirmBtn) {
            confirmBtn.disabled = this.agendaItems.length === 0 || !this.isFacilitator;
        }
        
        this.updateTabStates();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateTotalTime() {
        const total = this.agendaItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);
        const totalTimeEl = document.getElementById('total-time');
        if (totalTimeEl) {
            totalTimeEl.textContent = `${total} min`;
        }
    }

    startTimerPhase() {
        if (!this.isFacilitator) {
            this.showNotification('Only facilitators can start the timer', 'error');
            return;
        }

        if (this.agendaItems.length === 0) {
            this.showNotification('Please add at least one agenda item before starting the timer', 'error');
            return;
        }

        this.currentView = 'timer';
        this.currentItemIndex = 0;
        this.switchToView('timer');
        this.loadCurrentItem();
        this.updateProgress();
        
        // Increment participant count for facilitator
        this.participantCount = 1;
        this.updateConnectionStatus('connected');
    }

    loadCurrentItem() {
        const item = this.agendaItems[this.currentItemIndex];
        if (!item) return;

        const titleEl = document.getElementById('current-item-title');
        const descriptionEl = document.getElementById('current-item-description');
        
        if (titleEl) titleEl.textContent = item.title;
        if (descriptionEl) descriptionEl.textContent = item.description;
        
        this.currentItemEstimated = item.estimatedMinutes * 60;
        this.currentItemTime = this.currentItemEstimated;
        
        this.updateTimerDisplay();
        this.resetTimerControls();
        this.hideOvertimeSection();
    }

    updateProgress() {
        const progressText = document.getElementById('progress-text');
        const progressFill = document.getElementById('progress-fill');
        
        if (progressText) {
            progressText.textContent = `Item ${this.currentItemIndex + 1} of ${this.agendaItems.length}`;
        }
        
        if (progressFill) {
            const progressPercent = ((this.currentItemIndex) / this.agendaItems.length) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }
    }

    toggleTimer() {
        if (!this.isFacilitator) {
            this.showNotification('Only facilitators can control the timer', 'error');
            return;
        }

        if (this.breakMode) {
            this.showNotification('Cannot control timer during break', 'warning');
            return;
        }

        if (this.timerRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.timerRunning = true;
        this.startTime = Date.now();
        
        const startBtn = document.getElementById('start-pause-btn');
        if (startBtn) {
            startBtn.textContent = 'Pause';
            startBtn.className = 'btn btn--secondary btn--lg';
        }
        
        this.timer = setInterval(() => {
            this.currentItemTime--;
            this.updateTimerDisplay();
            this.updateTimerStatus();
            
            if (this.currentItemTime <= 0 && !this.isOvertimeSectionVisible()) {
                this.showOvertimeSection();
            }

            if (this.isFacilitator) {
                this.saveSharedSession();
            }
        }, 1000);

        this.showNotification('Timer started', 'success');
    }

    pauseTimer() {
        this.timerRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const startBtn = document.getElementById('start-pause-btn');
        if (startBtn) {
            startBtn.textContent = 'Start';
            startBtn.className = 'btn btn--primary btn--lg';
        }

        if (this.isFacilitator) {
            this.saveSharedSession();
        }

        this.showNotification('Timer paused', 'info');
    }

    stopTimer() {
        if (!this.isFacilitator) {
            this.showNotification('Only facilitators can stop the timer', 'error');
            return;
        }

        this.pauseTimer();
        this.currentItemTime = this.currentItemEstimated;
        this.updateTimerDisplay();
        this.resetTimerStatus();
        this.hideOvertimeSection();
        this.showNotification('Timer stopped', 'info');
    }

    updateTimerDisplay() {
        const minutes = Math.floor(Math.abs(this.currentItemTime) / 60);
        const seconds = Math.abs(this.currentItemTime) % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerText = document.getElementById('timer-text');
        const timerStatus = document.getElementById('timer-status');
        
        if (timerText) {
            if (this.currentItemTime < 0) {
                timerText.textContent = `+${timeString}`;
            } else {
                timerText.textContent = timeString;
            }
        }
        
        if (timerStatus) {
            if (this.currentItemTime < 0) {
                timerStatus.textContent = 'OVERTIME';
            } else {
                timerStatus.textContent = '';
            }
        }
    }

    updateTimerStatus() {
        const circle = document.getElementById('timer-circle');
        const status = document.getElementById('agenda-status');
        
        if (!circle || !status) return;
        
        const percentRemaining = this.currentItemTime / this.currentItemEstimated;
        
        circle.classList.remove('warning', 'overtime');
        status.classList.remove('on-track', 'warning', 'overtime');
        
        if (this.currentItemTime < 0) {
            circle.classList.add('overtime');
            status.classList.add('overtime');
            status.textContent = 'Overtime';
        } else if (percentRemaining <= 0.1) {
            circle.classList.add('warning');
            status.classList.add('warning');
            status.textContent = '⚠️ Wrapping Up';
        } else {
            status.classList.add('on-track');
            status.textContent = 'On Track';
        }
    }

    resetTimerStatus() {
        const circle = document.getElementById('timer-circle');
        const status = document.getElementById('agenda-status');
        
        if (!circle || !status) return;
        
        circle.classList.remove('warning', 'overtime');
        status.classList.remove('warning', 'overtime');
        status.classList.add('on-track');
        status.textContent = 'On Track';
    }

    resetTimerControls() {
        const startBtn = document.getElementById('start-pause-btn');
        if (startBtn) {
            startBtn.textContent = 'Start';
            startBtn.className = 'btn btn--primary btn--lg';
        }
    }

    isOvertimeSectionVisible() {
        const section = document.getElementById('overtime-section');
        return section && !section.classList.contains('hidden');
    }

    showOvertimeSection() {
        const section = document.getElementById('overtime-section');
        if (section) {
            section.classList.remove('hidden');
        }
        
        this.playNotificationSound();
        this.showNotification('Time exceeded! Please add overtime notes.', 'warning');
    }

    hideOvertimeSection() {
        const section = document.getElementById('overtime-section');
        if (section) {
            section.classList.add('hidden');
        }
        this.clearOvertimeForm();
    }

    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio notification not available');
        }
    }

    clearOvertimeForm() {
        const notesEl = document.getElementById('overtime-notes');
        const reasonEl = document.getElementById('overtime-reason');
        
        if (notesEl) notesEl.value = '';
        if (reasonEl) reasonEl.value = '';
        
        const checkboxes = document.querySelectorAll('#participants-list input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }

    saveOvertimeNotes() {
        const item = this.agendaItems[this.currentItemIndex];
        if (!item) return;

        const notesEl = document.getElementById('overtime-notes');
        const reasonEl = document.getElementById('overtime-reason');
        
        if (notesEl) item.overtimeNotes = notesEl.value;
        if (reasonEl) item.overtimeReason = reasonEl.value;
        
        const checkboxes = document.querySelectorAll('#participants-list input[type="checkbox"]:checked');
        item.followUpParticipants = Array.from(checkboxes).map(cb => cb.value);
        
        this.showNotification('Overtime notes saved', 'success');
    }

    nextItem() {
        if (!this.isFacilitator) {
            this.showNotification('Only facilitators can navigate items', 'error');
            return;
        }

        const item = this.agendaItems[this.currentItemIndex];
        if (item) {
            const actualSeconds = this.currentItemEstimated - this.currentItemTime;
            item.actualMinutes = Math.max(1, Math.ceil(actualSeconds / 60));
            item.overtime = this.currentItemTime < 0;
            
            this.completedItems.push({...item});
        }

        this.pauseTimer();

        this.currentItemIndex++;
        if (this.currentItemIndex >= this.agendaItems.length) {
            this.finishMeeting();
        } else {
            this.loadCurrentItem();
            this.updateProgress();
            this.showNotification(`Moving to next item: ${this.agendaItems[this.currentItemIndex].title}`, 'info');
        }

        if (this.isFacilitator) {
            this.saveSharedSession();
        }
    }

    finishMeeting() {
        this.currentView = 'summary';
        this.switchToView('summary');
        this.generateSummary();
        this.clearSessionBackup();
        
        // Stop break timer if running
        this.stopBreakTimer();
        this.breakMode = false;
        
        this.showNotification('Meeting completed!', 'success');
    }

    generateSummary() {
        const totalItems = this.completedItems.length;
        const estimatedTotal = this.completedItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);
        const actualTotal = this.completedItems.reduce((sum, item) => sum + item.actualMinutes, 0);
        const overtimeItems = this.completedItems.filter(item => item.overtime).length;
        const breakMinutes = Math.ceil(this.totalBreakTime / 60);

        const elements = {
            'summary-total-items': totalItems,
            'summary-estimated-time': `${estimatedTotal} min`,
            'summary-actual-time': `${actualTotal} min`,
            'summary-break-time': `${breakMinutes} min`,
            'summary-overtime-items': overtimeItems,
            'summary-participants': this.participantCount
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        this.renderItemsSummary();
        this.renderFollowUpActions();
    }

    renderItemsSummary() {
        const container = document.getElementById('items-summary');
        if (!container) return;
        
        container.innerHTML = '';

        this.completedItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            
            const statusClass = item.overtime ? 'overtime' : '';
            const timeStatus = item.overtime ? 
                `${item.actualMinutes} min (${item.actualMinutes - item.estimatedMinutes} over)` : 
                `${item.actualMinutes} min`;

            itemEl.innerHTML = `
                <div class="summary-item-info">
                    <h4>${this.escapeHtml(item.title)}</h4>
                    ${item.description ? `<p class="summary-item-description">${this.escapeHtml(item.description)}</p>` : ''}
                </div>
                <div class="summary-item-times">
                    <div class="time-comparison">
                        <div class="estimated-time">Est: ${item.estimatedMinutes} min</div>
                        <div class="actual-time ${statusClass}">${timeStatus}</div>
                    </div>
                </div>
            `;
            container.appendChild(itemEl);
        });
    }

    renderFollowUpActions() {
        const followupSection = document.getElementById('followup-section');
        const followupList = document.getElementById('followup-list');
        
        if (!followupSection || !followupList) return;
        
        const itemsWithFollowup = this.completedItems.filter(item => 
            item.overtime && (item.overtimeNotes || item.followUpParticipants.length > 0)
        );

        if (itemsWithFollowup.length === 0) {
            followupSection.classList.add('hidden');
            return;
        }

        followupSection.classList.remove('hidden');
        followupList.innerHTML = '';

        itemsWithFollowup.forEach(item => {
            const followupEl = document.createElement('div');
            followupEl.className = 'followup-item';
            
            const participantTags = item.followUpParticipants.map(p => 
                `<span class="participant-tag">${this.escapeHtml(p)}</span>`
            ).join('');

            followupEl.innerHTML = `
                <h4>${this.escapeHtml(item.title)}</h4>
                ${item.overtimeNotes ? `<p class="followup-notes">${this.escapeHtml(item.overtimeNotes)}</p>` : ''}
                ${item.overtimeReason ? `<p class="followup-notes"><strong>Reason:</strong> ${this.escapeHtml(item.overtimeReason)}</p>` : ''}
                ${participantTags ? `<div class="followup-participants">${participantTags}</div>` : ''}
            `;
            followupList.appendChild(followupEl);
        });
    }

    exportSummary() {
        const totalItems = this.completedItems.length;
        const estimatedTotal = this.completedItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);
        const actualTotal = this.completedItems.reduce((sum, item) => sum + item.actualMinutes, 0);
        const overtimeItems = this.completedItems.filter(item => item.overtime).length;
        const breakMinutes = Math.ceil(this.totalBreakTime / 60);

        let summary = `MEETING SUMMARY\n`;
        summary += `Generated: ${new Date().toLocaleString()}\n`;
        if (this.meetingId) summary += `Meeting ID: ${this.meetingId}\n`;
        summary += `\nOVERVIEW:\n`;
        summary += `• Total Items: ${totalItems}\n`;
        summary += `• Estimated Time: ${estimatedTotal} minutes\n`;
        summary += `• Actual Time: ${actualTotal} minutes\n`;
        summary += `• Break Time: ${breakMinutes} minutes\n`;
        summary += `• Overtime Items: ${overtimeItems}\n`;
        summary += `• Participants: ${this.participantCount}\n\n`;

        summary += `AGENDA ITEMS:\n`;
        this.completedItems.forEach((item, index) => {
            summary += `${index + 1}. ${item.title}\n`;
            if (item.description) summary += `   Description: ${item.description}\n`;
            summary += `   Estimated: ${item.estimatedMinutes} min | Actual: ${item.actualMinutes} min`;
            if (item.overtime) summary += ` (${item.actualMinutes - item.estimatedMinutes} min over)`;
            summary += `\n\n`;
        });

        const itemsWithFollowup = this.completedItems.filter(item => 
            item.overtime && (item.overtimeNotes || item.followUpParticipants.length > 0)
        );

        if (itemsWithFollowup.length > 0) {
            summary += `FOLLOW-UP ACTIONS:\n`;
            itemsWithFollowup.forEach(item => {
                summary += `• ${item.title}\n`;
                if (item.overtimeNotes) summary += `  Notes: ${item.overtimeNotes}\n`;
                if (item.overtimeReason) summary += `  Reason: ${item.overtimeReason}\n`;
                if (item.followUpParticipants.length > 0) {
                    summary += `  Participants: ${item.followUpParticipants.join(', ')}\n`;
                }
                summary += `\n`;
            });
        }

        if (navigator.clipboard) {
            navigator.clipboard.writeText(summary).then(() => {
                this.showNotification('Summary copied to clipboard!', 'success');
            }).catch(err => {
                this.showExportFallback(summary);
            });
        } else {
            this.showExportFallback(summary);
        }
    }

    showExportFallback(summary) {
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.top = '50%';
        textarea.style.left = '50%';
        textarea.style.transform = 'translate(-50%, -50%)';
        textarea.style.width = '80%';
        textarea.style.height = '70%';
        textarea.style.zIndex = '9999';
        textarea.style.background = 'white';
        textarea.style.border = '2px solid #ccc';
        textarea.style.borderRadius = '8px';
        textarea.style.padding = '16px';
        
        document.body.appendChild(textarea);
        textarea.select();
        
        setTimeout(() => {
            if (document.body.contains(textarea)) {
                document.body.removeChild(textarea);
            }
        }, 10000);
        
        this.showNotification('Summary displayed - please copy manually', 'info');
    }

    startNewMeeting() {
        if (!confirm('Are you sure you want to start a new meeting? Current progress will be lost.')) {
            return;
        }

        // Reset all meeting data
        this.agendaItems = [];
        this.currentItemIndex = 0;
        this.completedItems = [];
        this.currentItemTime = 0;
        this.currentItemEstimated = 0;
        this.totalBreakTime = 0;
        this.breakMode = false;
        this.timerRunning = false;
        this.meetingId = null;
        this.participantCount = 1;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (this.breakTimer) {
            clearInterval(this.breakTimer);
            this.breakTimer = null;
        }

        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }

        this.clearSessionBackup();
        this.switchToView('setup');
        
        const agendaForm = document.getElementById('agenda-form');
        if (agendaForm) agendaForm.reset();
        
        this.renderAgendaItems();
        this.updateTotalTime();
        this.clearOvertimeForm();
        this.hideBreakMode();
        this.updateConnectionStatus('ready');
        
        const titleInput = document.getElementById('item-title');
        if (titleInput) titleInput.focus();

        // Clear URL hash
        window.location.hash = '';

        this.showNotification('New meeting started', 'success');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating MeetingTimer...');
    window.meetingTimer = new MeetingTimer();
});

// Fallback initialization if DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already ready, creating MeetingTimer...');
    window.meetingTimer = new MeetingTimer();
}