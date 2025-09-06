// Meeting Timer Application
class MeetingTimer {
    constructor() {
        this.currentView = 'setup';
        this.agendaItems = [];
        this.currentItemIndex = 0;
        this.timer = null;
        this.timerRunning = false;
        this.currentItemTime = 0; // in seconds
        this.currentItemEstimated = 0; // in seconds
        this.completedItems = [];
        this.startTime = null;
        
        // Sample data
        this.sampleParticipants = [
            "John Smith", "Sarah Johnson", "Mike Chen", 
            "Lisa Rodriguez", "David Kim", "Emma Wilson"
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCurrentTime();
        this.setupParticipants();
        this.renderAgendaItems(); // Initial render
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    bindEvents() {
        // Setup phase events
        const agendaForm = document.getElementById('agenda-form');
        if (agendaForm) {
            agendaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAgendaItem();
            });
        }
        
        const confirmBtn = document.getElementById('confirm-agenda');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.startTimerPhase();
            });
        }

        // Timer phase events
        const startPauseBtn = document.getElementById('start-pause-btn');
        if (startPauseBtn) {
            startPauseBtn.addEventListener('click', () => {
                this.toggleTimer();
            });
        }
        
        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopTimer();
            });
        }
        
        const nextBtn = document.getElementById('next-item-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextItem();
            });
        }
        
        const saveNotesBtn = document.getElementById('save-overtime-notes');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => {
                this.saveOvertimeNotes();
            });
        }

        // Summary phase events
        const exportBtn = document.getElementById('export-summary');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSummary();
            });
        }
        
        const newMeetingBtn = document.getElementById('start-new-meeting');
        if (newMeetingBtn) {
            newMeetingBtn.addEventListener('click', () => {
                this.startNewMeeting();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.currentView === 'timer') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.toggleTimer();
                } else if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    this.nextItem();
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    this.stopTimer();
                }
            }
        });
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

    setupParticipants() {
        const participantsList = document.getElementById('participants-list');
        if (!participantsList) return;
        
        participantsList.innerHTML = '';
        
        this.sampleParticipants.forEach(participant => {
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

    addAgendaItem() {
        const titleEl = document.getElementById('item-title');
        const timeEl = document.getElementById('item-time');
        const descriptionEl = document.getElementById('item-description');
        
        if (!titleEl || !timeEl) {
            console.error('Form elements not found');
            return;
        }

        const title = titleEl.value.trim();
        const time = parseInt(timeEl.value);
        const description = descriptionEl ? descriptionEl.value.trim() : '';

        if (!title || !time || time <= 0) {
            alert('Please enter a valid title and time estimate.');
            return;
        }

        const item = {
            id: Date.now(),
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
        console.log('Added item:', item);
        console.log('Total items:', this.agendaItems.length);
        
        this.renderAgendaItems();
        this.updateTotalTime();

        // Clear form
        titleEl.value = '';
        timeEl.value = '';
        if (descriptionEl) descriptionEl.value = '';
        
        // Focus back to title field
        titleEl.focus();
    }

    removeAgendaItem(id) {
        this.agendaItems = this.agendaItems.filter(item => item.id !== id);
        this.renderAgendaItems();
        this.updateTotalTime();
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
            itemEl.innerHTML = `
                <div class="agenda-item-header">
                    <h4 class="agenda-item-title">${this.escapeHtml(item.title)}</h4>
                    <span class="agenda-item-time">${item.estimatedMinutes} min</span>
                </div>
                ${item.description ? `<p class="agenda-item-description">${this.escapeHtml(item.description)}</p>` : ''}
                <div class="agenda-item-actions">
                    <button class="btn-remove" onclick="window.meetingTimer.removeAgendaItem(${item.id})">Remove</button>
                </div>
            `;
            container.appendChild(itemEl);
        });

        // Update item count
        if (itemCount) {
            itemCount.textContent = this.agendaItems.length;
        }
        
        // Update confirm button state
        if (confirmBtn) {
            confirmBtn.disabled = this.agendaItems.length === 0;
        }
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
        if (this.agendaItems.length === 0) {
            alert('Please add at least one agenda item before starting the timer.');
            return;
        }

        this.currentView = 'timer';
        this.currentItemIndex = 0;
        this.showView('timer-view');
        this.loadCurrentItem();
        this.updateProgress();
    }

    loadCurrentItem() {
        const item = this.agendaItems[this.currentItemIndex];
        if (!item) return;

        const titleEl = document.getElementById('current-item-title');
        const descriptionEl = document.getElementById('current-item-description');
        
        if (titleEl) titleEl.textContent = item.title;
        if (descriptionEl) descriptionEl.textContent = item.description;
        
        this.currentItemEstimated = item.estimatedMinutes * 60; // convert to seconds
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
                // First time hitting zero - show overtime
                this.showOvertimeSection();
            }
        }, 1000);
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
    }

    stopTimer() {
        this.pauseTimer();
        this.currentItemTime = this.currentItemEstimated;
        this.updateTimerDisplay();
        this.resetTimerStatus();
        this.hideOvertimeSection();
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
        
        // Remove existing classes
        circle.classList.remove('warning', 'overtime');
        status.classList.remove('on-track', 'warning', 'overtime');
        
        if (this.currentItemTime < 0) {
            // Overtime
            circle.classList.add('overtime');
            status.classList.add('overtime');
            status.textContent = 'Overtime';
        } else if (percentRemaining <= 0.25) {
            // Warning (75% done)
            circle.classList.add('warning');
            status.classList.add('warning');
            status.textContent = '⚠️ Wrapping Up';
        } else {
            // On track
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
        
        // Play notification sound (if browser supports it)
        this.playNotificationSound();
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
            // Create a simple beep sound
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
            // Ignore audio errors
            console.log('Audio notification not available');
        }
    }

    clearOvertimeForm() {
        const notesEl = document.getElementById('overtime-notes');
        const reasonEl = document.getElementById('overtime-reason');
        
        if (notesEl) notesEl.value = '';
        if (reasonEl) reasonEl.value = '';
        
        // Uncheck all participants
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
        
        // Get selected participants
        const checkboxes = document.querySelectorAll('#participants-list input[type="checkbox"]:checked');
        item.followUpParticipants = Array.from(checkboxes).map(cb => cb.value);
        
        // Show confirmation
        const btn = document.getElementById('save-overtime-notes');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Saved!';
            btn.classList.add('btn--success');
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('btn--success');
            }, 2000);
        }
    }

    nextItem() {
        // Save current item data
        const item = this.agendaItems[this.currentItemIndex];
        if (item) {
            const actualSeconds = this.currentItemEstimated - this.currentItemTime;
            item.actualMinutes = Math.max(1, Math.ceil(actualSeconds / 60));
            item.overtime = this.currentItemTime < 0;
            
            this.completedItems.push({...item});
        }

        this.pauseTimer();

        // Move to next item or finish
        this.currentItemIndex++;
        if (this.currentItemIndex >= this.agendaItems.length) {
            this.finishMeeting();
        } else {
            this.loadCurrentItem();
            this.updateProgress();
        }
    }

    finishMeeting() {
        this.currentView = 'summary';
        this.showView('summary-view');
        this.generateSummary();
    }

    generateSummary() {
        // Calculate totals
        const totalItems = this.completedItems.length;
        const estimatedTotal = this.completedItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);
        const actualTotal = this.completedItems.reduce((sum, item) => sum + item.actualMinutes, 0);
        const overtimeItems = this.completedItems.filter(item => item.overtime).length;

        // Update overview stats
        const elements = {
            'summary-total-items': totalItems,
            'summary-estimated-time': `${estimatedTotal} min`,
            'summary-actual-time': `${actualTotal} min`,
            'summary-overtime-items': overtimeItems
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        // Render items summary and follow-up actions
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
                ${item.overtimeReason ? `<p class="followup-notes"><strong>Reason:</strong> ${this.getReasonText(item.overtimeReason)}</p>` : ''}
                ${participantTags ? `<div class="followup-participants">${participantTags}</div>` : ''}
            `;
            followupList.appendChild(followupEl);
        });
    }

    getReasonText(reason) {
        const reasons = {
            'deeper-discussion': 'Requires deeper discussion',
            'new-issues': 'New issues discovered',
            'stakeholder-input': 'Need stakeholder input',
            'technical': 'Technical complexities',
            'resources': 'Resource constraints',
            'timeline': 'Timeline concerns'
        };
        return reasons[reason] || reason;
    }

    exportSummary() {
        const totalItems = this.completedItems.length;
        const estimatedTotal = this.completedItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);
        const actualTotal = this.completedItems.reduce((sum, item) => sum + item.actualMinutes, 0);
        const overtimeItems = this.completedItems.filter(item => item.overtime).length;

        let summary = `MEETING SUMMARY\n`;
        summary += `Generated: ${new Date().toLocaleString()}\n\n`;
        summary += `OVERVIEW:\n`;
        summary += `• Total Items: ${totalItems}\n`;
        summary += `• Estimated Time: ${estimatedTotal} minutes\n`;
        summary += `• Actual Time: ${actualTotal} minutes\n`;
        summary += `• Overtime Items: ${overtimeItems}\n\n`;

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
                if (item.overtimeReason) summary += `  Reason: ${this.getReasonText(item.overtimeReason)}\n`;
                if (item.followUpParticipants.length > 0) {
                    summary += `  Participants: ${item.followUpParticipants.join(', ')}\n`;
                }
                summary += `\n`;
            });
        }

        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(summary).then(() => {
                this.showExportSuccess();
            }).catch(err => {
                this.showExportFallback(summary);
            });
        } else {
            this.showExportFallback(summary);
        }
    }

    showExportSuccess() {
        const btn = document.getElementById('export-summary');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('btn--success');
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('btn--success');
            }, 2000);
        }
    }

    showExportFallback(summary) {
        alert('Copy the summary below:\n\n' + summary);
    }

    startNewMeeting() {
        // Reset all data
        this.agendaItems = [];
        this.currentItemIndex = 0;
        this.completedItems = [];
        this.currentItemTime = 0;
        this.currentItemEstimated = 0;
        this.timerRunning = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Reset views
        this.currentView = 'setup';
        this.showView('setup-view');
        
        // Reset forms and displays
        const agendaForm = document.getElementById('agenda-form');
        if (agendaForm) agendaForm.reset();
        
        this.renderAgendaItems();
        this.updateTotalTime();
        this.clearOvertimeForm();
        
        // Focus on first input
        const titleInput = document.getElementById('item-title');
        if (titleInput) titleInput.focus();
    }

    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });
        
        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.meetingTimer = new MeetingTimer();
});

// Also initialize immediately in case DOM is already ready
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already ready
    window.meetingTimer = new MeetingTimer();
}