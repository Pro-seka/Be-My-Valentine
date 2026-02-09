// ============================================
// PERFECT VALENTINE INTERACTION
// Intelligent button behavior with perfect alignment
// ============================================

class PerfectValentine {
    constructor() {
        // App State
        this.state = {
            currentScreen: 'main',
            noButtonEscapes: 0,
            maxEscapes: 10,
            escapeMessages: [
                "Oh, you missed! 😅",
                "Too slow! 👀",
                "Getting faster, aren't you? 😌",
                "Almost got me! 🏃‍♂️",
                "I'm getting tired... 🙈",
                "Why so persistent? 😳",
                "Okay, you win this round! 🏆",
                "I surrender! 🏳️",
                "Last escape, I promise! 💪",
                "Fine, you caught me! 💖"
            ],
            yesButtonSize: 1,
            noButtonSize: 1,
            noButtonOpacity: 1,
            startTime: Date.now(),
            decisionTime: 0,
            timerInterval: null,
            timerValue: 10,
            movementHistory: []
        };
        
        // DOM Elements
        this.elements = {};
        
        // Movement bounds
        this.bounds = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.calculateBounds();
        this.setupEventListeners();
        this.showScreen('main');
        this.initAudio();
        
        // Start background animations
        this.createBackgroundHearts();
        
        console.log('💖 Perfect Valentine Experience Started');
    }
    
    cacheElements() {
        // Cards
        this.elements.cards = {
            main: document.getElementById('mainCard'),
            followup: document.getElementById('followupCard'),
            final: document.getElementById('finalCard'),
            success: document.getElementById('successCard'),
            exit: document.getElementById('exitCard')
        };
        
        // Buttons
        this.elements.buttons = {
            yes: document.getElementById('yesBtn'),
            no: document.getElementById('noBtn'),
            yesConfirm: document.getElementById('yesConfirmBtn'),
            noConfirm: document.getElementById('noConfirmBtn'),
            yesFinal: document.getElementById('yesFinalBtn'),
            noFinal: document.getElementById('noFinalBtn'),
            restart: document.getElementById('restartBtn'),
            return: document.getElementById('returnBtn')
        };
        
        // Other elements
        this.elements.escapeMessages = document.getElementById('escapeMessages');
        
        // Watermark and ethical note
        this.elements.watermark = document.querySelector('.watermark');
        this.elements.ethicalNote = document.querySelector('.ethical-note');
    }
    
    calculateBounds() {
        // Calculate full screen bounds for NO button movement
        this.bounds = {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    
    setupEventListeners() {
        // YES Button
        this.elements.buttons.yes?.addEventListener('click', () => {
            this.playSound('yes');
            this.showScreen('followup');
        });
        
        // NO Button - Intelligent Escape
        this.elements.buttons.no?.addEventListener('mouseenter', (e) => {
            this.makeButtonEscape(e.clientX, e.clientY);
            this.playSound('giggle');
        });
        
        this.elements.buttons.no?.addEventListener('click', () => {
            this.playSound('no');
            this.showScreen('exit');
        });
        
        // Confirmation YES
        this.elements.buttons.yesConfirm?.addEventListener('click', () => {
            this.playSound('yes');
            this.showScreen('final');
            this.startTimer();
        });
        
        // Confirmation NO
        this.elements.buttons.noConfirm?.addEventListener('click', () => {
            this.playSound('no');
            this.showScreen('exit');
        });
        
        // Final YES
        this.elements.buttons.yesFinal?.addEventListener('click', () => {
            this.playSound('celebration');
            this.state.decisionTime = Date.now() - this.state.startTime;
            this.stopTimer();
            this.showScreen('success');
            this.triggerCelebration();
        });
        
        // Final NO
        this.elements.buttons.noFinal?.addEventListener('click', () => {
            this.playSound('no');
            this.stopTimer();
            this.showScreen('exit');
        });
        
        // Restart
        this.elements.buttons.restart?.addEventListener('click', () => {
            this.resetExperience();
            this.showScreen('main');
            this.playSound('click');
        });
        
        // Return
        this.elements.buttons.return?.addEventListener('click', () => {
            this.showScreen('main');
            this.playSound('click');
        });
        
        // Mouse movement tracking for predictive escape
        document.addEventListener('mousemove', (e) => {
            this.checkMouseProximity(e.clientX, e.clientY);
        });
        
        // Touch support for mobile
        let lastTouchTime = 0;
        this.elements.buttons.no?.addEventListener('touchstart', (e) => {
            const now = Date.now();
            if (now - lastTouchTime > 300) { // Prevent double-tap
                lastTouchTime = now;
                if (this.state.noButtonEscapes < this.state.maxEscapes) {
                    const touch = e.touches[0];
                    this.makeButtonEscape(touch.clientX, touch.clientY);
                    e.preventDefault();
                }
            }
        }, { passive: false });
        
        // Click anywhere else on screen (for even more dynamic movement)
        document.addEventListener('click', (e) => {
            if (this.state.currentScreen === 'main' && 
                this.state.noButtonEscapes < this.state.maxEscapes &&
                !e.target.closest('.btn-no')) {
                // Small chance to move when clicking elsewhere
                if (Math.random() < 0.3) {
                    this.makeButtonEscape(e.clientX, e.clientY);
                }
            }
        });
        
        // Window resize - recalculate bounds
        window.addEventListener('resize', () => {
            this.calculateBounds();
            this.repositionElements();
        });
    }
    
    showScreen(screenName) {
        // Hide all cards
        Object.values(this.elements.cards).forEach(card => {
            card?.classList.remove('active');
        });
        
        // Show the requested card
        const card = this.elements.cards[screenName];
        if (card) {
            card.classList.add('active');
            this.state.currentScreen = screenName;
            
            // Special handling for each screen
            switch(screenName) {
                case 'main':
                    this.resetNoButton();
                    break;
                case 'final':
                    this.state.startTime = Date.now();
                    break;
            }
        }
    }
    
    // Intelligent Button Escape System - Full Screen Movement
    makeButtonEscape(mouseX, mouseY) {
        if (this.state.noButtonEscapes >= this.state.maxEscapes) return;
        
        const noBtn = this.elements.buttons.no;
        if (!noBtn) return;
        
        // Record movement
        this.state.movementHistory.push({
            x: mouseX,
            y: mouseY,
            timestamp: Date.now()
        });
        
        // Keep only last 5 movements
        if (this.state.movementHistory.length > 5) {
            this.state.movementHistory.shift();
        }
        
        // Calculate new position using "magnet-like" repulsion
        const buttonRect = noBtn.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        
        // Calculate vector from mouse to button
        const dx = buttonCenterX - mouseX;
        const dy = buttonCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let newX, newY;
        
        if (distance > 0) {
            // Normalize direction and add repulsion force
            const repulsionForce = 100 + (this.state.noButtonEscapes * 10);
            const moveX = (dx / distance) * repulsionForce;
            const moveY = (dy / distance) * repulsionForce;
            
            // Calculate new position
            newX = buttonRect.left + moveX;
            newY = buttonRect.top + moveY;
        } else {
            // If mouse is exactly on button, random direction
            const angle = Math.random() * Math.PI * 2;
            const repulsionForce = 150;
            newX = buttonRect.left + Math.cos(angle) * repulsionForce;
            newY = buttonRect.top + Math.sin(angle) * repulsionForce;
        }
        
        // Keep button within screen bounds with padding
        const padding = 50;
        newX = Math.max(padding, Math.min(this.bounds.width - buttonRect.width - padding, newX));
        newY = Math.max(padding, Math.min(this.bounds.height - buttonRect.height - padding, newY));
        
        // Convert to percentage for smooth animation
        const percentX = (newX / this.bounds.width) * 100;
        const percentY = (newY / this.bounds.height) * 100;
        
        // Apply the escape with dynamic animation
        const animationDuration = Math.max(0.3, 0.8 - (this.state.noButtonEscapes * 0.05));
        const animationCurve = this.state.noButtonEscapes > 5 ? 
            'cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 
            'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        noBtn.style.transition = `all ${animationDuration}s ${animationCurve}`;
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${percentX}%`;
        noBtn.style.top = `${percentY}%`;
        noBtn.style.transform = `translate(-50%, -50%) scale(${this.state.noButtonSize})`;
        
        // Add bounce effect for later escapes
        if (this.state.noButtonEscapes > 3) {
            setTimeout(() => {
                noBtn.style.transition = 'transform 0.2s ease';
                noBtn.style.transform = `translate(-50%, -50%) scale(${this.state.noButtonSize * 1.1})`;
                setTimeout(() => {
                    noBtn.style.transform = `translate(-50%, -50%) scale(${this.state.noButtonSize})`;
                }, 200);
            }, animationDuration * 1000);
        }
        
        // Update state
        this.state.noButtonEscapes++;
        
        // Show escape message
        this.showEscapeMessage();
        
        // Update button appearances
        this.updateButtonStates();
        
        // If max escapes reached, fade out NO button completely
        if (this.state.noButtonEscapes >= this.state.maxEscapes) {
            setTimeout(() => {
                noBtn.style.transition = 'all 1s ease';
                noBtn.style.opacity = '0';
                noBtn.style.transform = `translate(-50%, -50%) scale(0.5)`;
                noBtn.style.pointerEvents = 'none';
                setTimeout(() => {
                    noBtn.style.visibility = 'hidden';
                    this.showMessage("Got me! ❤️ Now click YES!", 3000);
                }, 1000);
            }, 500);
        }
        
        this.playSound('escape');
    }
    
    checkMouseProximity(mouseX, mouseY) {
        if (this.state.currentScreen !== 'main') return;
        if (this.state.noButtonEscapes >= this.state.maxEscapes) return;
        
        const noBtn = this.elements.buttons.no;
        if (!noBtn) return;
        
        const buttonRect = noBtn.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(mouseX - buttonCenterX, 2) + 
            Math.pow(mouseY - buttonCenterY, 2)
        );
        
        // If mouse is close, predict movement and escape
        if (distance < 200) {
            // Higher chance to escape as mouse gets closer
            const escapeChance = Math.max(0.05, 0.3 - (distance / 2000));
            if (Math.random() < escapeChance) {
                // Predict mouse direction based on history
                if (this.state.movementHistory.length >= 2) {
                    const last = this.state.movementHistory[this.state.movementHistory.length - 1];
                    const secondLast = this.state.movementHistory[this.state.movementHistory.length - 2];
                    
                    const velocityX = last.x - secondLast.x;
                    const velocityY = last.y - secondLast.y;
                    
                    // Predict future position
                    const predictedX = mouseX + velocityX * 2;
                    const predictedY = mouseY + velocityY * 2;
                    
                    this.makeButtonEscape(predictedX, predictedY);
                } else {
                    this.makeButtonEscape(mouseX, mouseY);
                }
            }
        }
    }
    
    updateButtonStates() {
        const yesBtn = this.elements.buttons.yes;
        const noBtn = this.elements.buttons.no;
        
        if (!yesBtn || !noBtn) return;
        
        // Make YES button grow and glow
        this.state.yesButtonSize = 1 + (this.state.noButtonEscapes * 0.08);
        yesBtn.style.transform = `scale(${this.state.yesButtonSize})`;
        
        // Add progressive glow effect to YES button
        const glowSize = this.state.noButtonEscapes * 6;
        const glowOpacity = Math.min(0.6, this.state.noButtonEscapes * 0.1);
        yesBtn.style.boxShadow = 
            `0 10px 25px rgba(255, 77, 109, 0.3), 
             0 0 0 ${glowSize}px rgba(255, 77, 109, ${glowOpacity})`;
        
        // Make YES button pulse more intensely
        const pulseSpeed = Math.max(0.5, 2 - (this.state.noButtonEscapes * 0.15));
        yesBtn.style.animation = `pulseGlow ${pulseSpeed}s infinite`;
        
        // Make NO button shrink and fade
        this.state.noButtonSize = Math.max(0.4, 1 - (this.state.noButtonEscapes * 0.12));
        this.state.noButtonOpacity = Math.max(0.2, 1 - (this.state.noButtonEscapes * 0.18));
        
        noBtn.style.opacity = this.state.noButtonOpacity;
        noBtn.style.filter = `brightness(${1 - (this.state.noButtonEscapes * 0.1)})`;
        
        // Apply dynamic shake animation to NO button
        const shakeIntensity = Math.min(10, this.state.noButtonEscapes * 1.5);
        noBtn.style.animation = `shake 0.5s ease`;
        noBtn.style.setProperty('--tx', '-50%');
        noBtn.style.setProperty('--ty', '-50%');
        
        // If close to max escapes, make NO button very small and add blur
        if (this.state.noButtonEscapes >= this.state.maxEscapes - 2) {
            noBtn.style.filter += ' blur(1px)';
            noBtn.style.transform += ` scale(0.6)`;
        }
        
        // Add jiggle effect to NO button
        if (this.state.noButtonEscapes > 2) {
            noBtn.style.animation += `, jiggle 0.3s ease ${this.state.noButtonEscapes * 0.1}s`;
        }
    }
    
    showEscapeMessage() {
        const index = Math.min(this.state.noButtonEscapes - 1, this.state.escapeMessages.length - 1);
        const message = this.state.escapeMessages[index];
        
        const messageEl = document.createElement('div');
        messageEl.className = 'escape-message';
        messageEl.textContent = message;
        
        // Add dynamic styling based on escape count
        if (this.state.noButtonEscapes > 5) {
            messageEl.style.background = 'linear-gradient(135deg, #ffd166, #ffb347)';
            messageEl.style.color = '#333';
        } else if (this.state.noButtonEscapes > 3) {
            messageEl.style.background = 'linear-gradient(135deg, #a2d2ff, #cdb4db)';
            messageEl.style.color = '#333';
        }
        
        this.elements.escapeMessages.innerHTML = '';
        this.elements.escapeMessages.appendChild(messageEl);
        
        // Remove message after animation
        setTimeout(() => {
            if (messageEl.parentNode === this.elements.escapeMessages) {
                messageEl.remove();
            }
        }, 2000);
    }
    
    showMessage(text, duration = 2000) {
        const messageEl = document.createElement('div');
        messageEl.className = 'escape-message';
        messageEl.textContent = text;
        messageEl.style.background = 'linear-gradient(135deg, #ff4d6d, #ff8fa3)';
        messageEl.style.color = 'white';
        messageEl.style.fontWeight = '600';
        
        this.elements.escapeMessages.innerHTML = '';
        this.elements.escapeMessages.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode === this.elements.escapeMessages) {
                messageEl.remove();
            }
        }, duration);
    }
    
    // Timer for final screen
    startTimer() {
        this.state.timerValue = 10;
        this.updateTimerDisplay();
        
        this.state.timerInterval = setInterval(() => {
            this.state.timerValue--;
            this.updateTimerDisplay();
            
            if (this.state.timerValue <= 0) {
                this.stopTimer();
                this.showScreen('exit');
                this.showMessage("Time's up! The moment has passed... ⏰", 3000);
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timerCount = document.querySelector('.timer-count');
        const timerFill = document.querySelector('.timer-fill');
        
        if (timerCount) {
            timerCount.textContent = this.state.timerValue;
            
            // Add pulse animation when time is running out
            if (this.state.timerValue <= 3) {
                timerCount.style.animation = 'pulse 1s infinite';
                timerCount.style.color = '#ff4d6d';
            } else {
                timerCount.style.animation = '';
                timerCount.style.color = '';
            }
        }
        
        if (timerFill) {
            const progress = this.state.timerValue / 10;
            const dashoffset = 283 * (1 - progress);
            timerFill.style.strokeDashoffset = dashoffset;
            
            // Change color when time is running out
            if (this.state.timerValue <= 3) {
                timerFill.style.stroke = '#ff4d6d';
                timerFill.style.filter = 'drop-shadow(0 0 3px rgba(255, 77, 109, 0.5))';
            }
        }
    }
    
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    }
    
    // Success celebration
    triggerCelebration() {
        // Create confetti
        const confettiContainer = document.querySelector('.confetti-container');
        if (!confettiContainer) return;
        
        // Clear any existing confetti
        confettiContainer.innerHTML = '';
        
        // Create lots of confetti
        for (let i = 0; i < 200; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.width = `${Math.random() * 12 + 4}px`;
                confetti.style.height = `${Math.random() * 12 + 4}px`;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.animationDelay = `${Math.random() * 2}s`;
                confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
                
                // Random shapes for some confetti
                if (Math.random() > 0.7) {
                    confetti.style.borderRadius = '2px';
                    confetti.style.transform = `rotate(${Math.random() * 45}deg)`;
                }
                
                confettiContainer.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => {
                    if (confetti.parentNode === confettiContainer) {
                        confetti.remove();
                    }
                }, 5000);
            }, i * 15);
        }
        
        // Create heart explosion
        this.createHeartExplosion();
        
        // Play celebration sounds
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playSound('celebrate');
            }, i * 250);
        }
    }
    
    createHeartExplosion() {
        const container = document.querySelector('.success-card');
        if (!container) return;
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = '❤️';
                heart.style.position = 'absolute';
                heart.style.fontSize = `${Math.random() * 40 + 20}px`;
                heart.style.left = '50%';
                heart.style.top = '50%';
                heart.style.color = ['#ff4d6d', '#ff8fa3', '#ffafcc', '#cdb4db'][Math.floor(Math.random() * 4)];
                heart.style.opacity = '0.9';
                heart.style.zIndex = '1000';
                heart.style.transform = 'translate(-50%, -50%) scale(0)';
                heart.style.pointerEvents = 'none';
                heart.style.filter = `drop-shadow(0 0 3px currentColor)`;
                
                container.appendChild(heart);
                
                // Animate heart
                const angle = Math.random() * Math.PI * 2;
                const distance = 150 + Math.random() * 150;
                const duration = 1.5 + Math.random();
                
                const animation = heart.animate([
                    { 
                        transform: 'translate(-50%, -50%) scale(0)', 
                        opacity: 1 
                    },
                    { 
                        transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1.2)`, 
                        opacity: 0.8 
                    },
                    { 
                        transform: `translate(${Math.cos(angle) * distance * 1.1}px, ${Math.sin(angle) * distance * 1.1}px) scale(0)`, 
                        opacity: 0 
                    }
                ], {
                    duration: duration * 1000,
                    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                });
                
                animation.onfinish = () => {
                    if (heart.parentNode === container) {
                        heart.remove();
                    }
                };
            }, i * 30);
        }
    }
    
    // Background animations
    createBackgroundHearts() {
        const container = document.querySelector('.background-hearts');
        if (!container) return;
        
        // Create more hearts
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = '❤️';
                heart.style.position = 'absolute';
                heart.style.fontSize = `${Math.random() * 30 + 15}px`;
                heart.style.left = `${Math.random() * 100}%`;
                heart.style.top = `${Math.random() * 100}%`;
                heart.style.opacity = `${Math.random() * 0.15 + 0.05}`;
                heart.style.animation = `floatHeart ${Math.random() * 25 + 15}s linear infinite`;
                heart.style.animationDelay = `${Math.random() * 10}s`;
                heart.style.filter = `hue-rotate(${Math.random() * 60}deg)`;
                
                container.appendChild(heart);
            }, i * 800);
        }
    }
    
    // Reset experience
    resetExperience() {
        // Reset state
        this.state.noButtonEscapes = 0;
        this.state.yesButtonSize = 1;
        this.state.noButtonSize = 1;
        this.state.noButtonOpacity = 1;
        this.state.movementHistory = [];
        
        // Reset NO button
        const noBtn = this.elements.buttons.no;
        if (noBtn) {
            noBtn.style.position = '';
            noBtn.style.left = '';
            noBtn.style.top = '';
            noBtn.style.transform = '';
            noBtn.style.opacity = '';
            noBtn.style.visibility = '';
            noBtn.style.filter = '';
            noBtn.style.boxShadow = '';
            noBtn.style.animation = '';
            noBtn.style.transition = '';
            noBtn.style.pointerEvents = '';
        }
        
        // Reset YES button
        const yesBtn = this.elements.buttons.yes;
        if (yesBtn) {
            yesBtn.style.transform = '';
            yesBtn.style.boxShadow = '';
            yesBtn.style.animation = '';
        }
        
        // Clear messages
        this.elements.escapeMessages.innerHTML = '';
        
        // Stop timer
        this.stopTimer();
        
        // Reset timer display
        this.state.timerValue = 10;
        this.updateTimerDisplay();
        
        // Reset timer styles
        const timerCount = document.querySelector('.timer-count');
        const timerFill = document.querySelector('.timer-fill');
        if (timerCount) {
            timerCount.style.animation = '';
            timerCount.style.color = '';
        }
        if (timerFill) {
            timerFill.style.stroke = '#ff4d6d';
            timerFill.style.filter = '';
        }
    }
    
    resetNoButton() {
        const noBtn = this.elements.buttons.no;
        if (noBtn) {
            noBtn.style.position = '';
            noBtn.style.left = '';
            noBtn.style.top = '';
            noBtn.style.transform = 'translate(0, 0)';
            noBtn.style.opacity = '1';
            noBtn.style.visibility = 'visible';
            noBtn.style.filter = 'none';
            noBtn.style.pointerEvents = 'auto';
        }
    }
    
    // Reposition elements on resize
    repositionElements() {
        // Reset NO button position when screen changes
        if (this.state.currentScreen === 'main') {
            this.resetNoButton();
        }
    }
    
    // Audio system
    initAudio() {
        // Simple sound effects using Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log("Audio not supported");
            this.audioContext = null;
        }
    }
    
    playSound(type) {
        if (!this.audioContext) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            let frequency = 440;
            let duration = 0.3;
            
            switch(type) {
                case 'yes':
                    frequency = 523.25; // C5
                    oscillator.type = 'sine';
                    break;
                case 'no':
                    frequency = 349.23; // F4
                    oscillator.type = 'sine';
                    oscillator.frequency.exponentialRampToValueAtTime(261.63, this.audioContext.currentTime + duration);
                    break;
                case 'giggle':
                    frequency = 600;
                    oscillator.type = 'triangle';
                    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + duration);
                    break;
                case 'escape':
                    frequency = 400;
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
                    break;
                case 'celebration':
                    frequency = 783.99; // G5
                    oscillator.type = 'sine';
                    break;
                case 'click':
                    frequency = 100;
                    duration = 0.1;
                    oscillator.type = 'sine';
                    break;
            }
            
            oscillator.frequency.value = frequency;
            
            // Volume envelope
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start();
            oscillator.stop(now + duration);
            
        } catch (e) {
            // Audio error, ignore
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.valentineApp = new PerfectValentine();
    
    // Add custom animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translate(var(--tx, 0), var(--ty, 0)) translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translate(var(--tx, 0), var(--ty, 0)) translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translate(var(--tx, 0), var(--ty, 0)) translateX(5px); }
        }
        
        @keyframes jiggle {
            0%, 100% { transform: translate(var(--tx, 0), var(--ty, 0)) rotate(0deg); }
            25% { transform: translate(var(--tx, 0), var(--ty, 0)) rotate(-3deg); }
            75% { transform: translate(var(--tx, 0), var(--ty, 0)) rotate(3deg); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
    
    // Console message
    console.log('%c💖 Will You Be My Valentine? 💖', 'color: #ff4d6d; font-size: 20px; font-weight: bold;');
    console.log('%cPerfectly aligned, perfectly timed, perfectly romantic.', 'color: #666;');
});

// Handle window resize perfectly
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.valentineApp) {
            window.valentineApp.calculateBounds();
            window.valentineApp.repositionElements();
        }
    }, 250);
});

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (window.valentineApp) {
            window.valentineApp.calculateBounds();
            window.valentineApp.repositionElements();
        }
    }, 500);
});