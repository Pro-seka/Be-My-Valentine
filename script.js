// ============================================
// PERFECT VALENTINE INTERACTION
// WITH UNIVERSAL AUDIO SUPPORT
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
            movementHistory: [],
            isMobile: this.checkMobile(),
            lastEscapeTime: 0,
            escapeCooldown: 500,
            audioUnlocked: false
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
        
        // Touch state
        this.touchState = {
            isTouching: false,
            touchStartTime: 0,
            touchStartX: 0,
            touchStartY: 0
        };
        
        // Audio Context
        this.audioContext = null;
        
        // Initialize
        this.init();
    }
    
    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    init() {
        this.cacheElements();
        this.calculateBounds();
        this.setupEventListeners();
        this.setupMobileEvents();
        this.initAudio();  // Initialize audio FIRST
        this.showScreen('main');
        
        // Start background animations
        this.createBackgroundHearts();
        
        // Set initial watermark position
        this.positionWatermarks();
        
        console.log('💖 Perfect Valentine Experience Started');
        console.log('📱 Mobile:', this.state.isMobile);
        
        // Unlock audio on first interaction
        this.unlockAudioOnInteraction();
    }
    
    // UNIVERSAL AUDIO SYSTEM - Works on ALL devices
    initAudio() {
        try {
            // Try to use Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                console.log("🎵 Audio Context created successfully");
            }
        } catch (e) {
            console.log("Web Audio API not available, using fallback");
        }
        
        // Pre-create audio buffers for faster playback
        this.preloadSounds();
    }
    
    // Preload sound buffers for instant playback
    preloadSounds() {
        if (!this.audioContext) return;
        
        // Create simple tones for each sound type
        this.soundBuffers = {};
        
        const soundTypes = {
            'yes': { freq: 523.25, duration: 0.3, type: 'sine' },      // C5
            'no': { freq: 349.23, duration: 0.4, type: 'sine' },       // F4
            'escape': { freq: 800, duration: 0.15, type: 'triangle' }, // High pitch
            'hover': { freq: 600, duration: 0.1, type: 'sine' },       // Medium pitch
            'click': { freq: 440, duration: 0.1, type: 'sine' },       // A4
            'celebration': 'chord' // Special case for celebration
        };
        
        // Generate buffers for simple sounds
        Object.keys(soundTypes).forEach(type => {
            if (type !== 'celebration') {
                const config = soundTypes[type];
                const buffer = this.createSoundBuffer(config.freq, config.duration, config.type);
                if (buffer) {
                    this.soundBuffers[type] = buffer;
                }
            }
        });
    }
    
    // Create audio buffer for a specific sound
    createSoundBuffer(frequency, duration, type = 'sine') {
        if (!this.audioContext) return null;
        
        try {
            const sampleRate = this.audioContext.sampleRate;
            const frameCount = Math.floor(sampleRate * duration);
            const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
            const channelData = buffer.getChannelData(0);
            
            // Fill buffer with sound data
            for (let i = 0; i < frameCount; i++) {
                const time = i / sampleRate;
                let value;
                
                switch(type) {
                    case 'sine':
                        value = Math.sin(2 * Math.PI * frequency * time);
                        break;
                    case 'triangle':
                        value = 2 * Math.abs(2 * (frequency * time - Math.floor(frequency * time + 0.5))) - 1;
                        break;
                    default:
                        value = Math.sin(2 * Math.PI * frequency * time);
                }
                
                // Apply envelope for smooth start/end
                const attack = 0.01;
                const release = 0.1;
                let envelope = 1;
                
                if (time < attack) {
                    envelope = time / attack;
                } else if (time > duration - release) {
                    envelope = (duration - time) / release;
                }
                
                channelData[i] = value * envelope * 0.3; // Reduce volume
            }
            
            return buffer;
        } catch (e) {
            console.log("Error creating sound buffer:", e);
            return null;
        }
    }
    
    // PLAY SOUND - Works on all devices
    playSound(type) {
        // Ensure audio context is ready
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // If no audio context, use HTML5 Audio fallback
        if (!this.audioContext) {
            this.playFallbackSound(type);
            return;
        }
        
        // Special handling for celebration
        if (type === 'celebration') {
            this.playCelebration();
            return;
        }
        
        // Play preloaded sound buffer
        if (this.soundBuffers[type]) {
            this.playBufferSound(this.soundBuffers[type]);
        } else {
            // Fallback to generated sound
            this.generateAndPlaySound(type);
        }
    }
    
    // Play from audio buffer
    playBufferSound(buffer) {
        if (!this.audioContext || !buffer) return;
        
        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // Add gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.5;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
            
            // Clean up after playback
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
            };
        } catch (e) {
            console.log("Error playing buffer sound:", e);
            this.playFallbackSound();
        }
    }
    
    // Generate and play sound on the fly
    generateAndPlaySound(type) {
        if (!this.audioContext) return;
        
        let frequency = 440;
        let duration = 0.2;
        let waveType = 'sine';
        
        switch(type) {
            case 'yes':
                frequency = 523.25; // C5
                duration = 0.3;
                break;
            case 'no':
                frequency = 349.23; // F4
                duration = 0.4;
                break;
            case 'escape':
                frequency = 800;
                duration = 0.15;
                waveType = 'triangle';
                break;
            case 'hover':
                frequency = 600;
                duration = 0.1;
                break;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = waveType;
            oscillator.frequency.value = frequency;
            
            // Volume envelope
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            // Clean up
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (e) {
            console.log("Error generating sound:", e);
        }
    }
    
    // Celebration sound (happy chord)
    playCelebration() {
        if (!this.audioContext) return;
        
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        const now = this.audioContext.currentTime;
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                try {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.value = freq;
                    
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                    
                    oscillator.start(now);
                    oscillator.stop(now + 0.8);
                    
                    oscillator.onended = () => {
                        oscillator.disconnect();
                        gainNode.disconnect();
                    };
                } catch (e) {
                    console.log("Error playing celebration note:", e);
                }
            }, index * 100);
        });
    }
    
    // HTML5 Audio Fallback (works on really old browsers)
    playFallbackSound(type) {
        try {
            let frequency = 440;
            let duration = 0.2;
            
            switch(type) {
                case 'yes': frequency = 523.25; duration = 0.3; break;
                case 'no': frequency = 349.23; duration = 0.4; break;
                case 'escape': frequency = 800; duration = 0.15; break;
                case 'hover': frequency = 600; duration = 0.1; break;
            }
            
            // Create oscillator manually
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            const now = audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            // Resume if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (e) {
            console.log("Fallback audio failed:", e);
            // Last resort - use beep() if available
            if (typeof beep === 'function') {
                beep();
            }
        }
    }
    
    // Unlock audio on first user interaction
    unlockAudioOnInteraction() {
        const unlock = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log("🎵 Audio unlocked!");
                    this.state.audioUnlocked = true;
                    
                    // Play a silent sound to fully unlock audio
                    this.playSound('click');
                });
            }
            
            // Remove event listeners after unlocking
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };
        
        // Listen for user interaction
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
        
        // Also unlock on any button click
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', unlock, { once: true });
        });
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
        // Calculate safe bounds for mobile (considering safe areas)
        const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top')) || 0;
        const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-bottom')) || 0;
        const safeLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-left')) || 0;
        const safeRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-right')) || 0;
        
        this.bounds = {
            x: safeLeft,
            y: safeTop,
            width: window.innerWidth - safeLeft - safeRight,
            height: window.innerHeight - safeTop - safeBottom
        };
    }
    
    positionWatermarks() {
        // Position watermarks considering safe areas
        const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-bottom')) || 20;
        const safeLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-left')) || 20;
        const safeRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-right')) || 20;
        
        if (this.elements.watermark) {
            this.elements.watermark.style.bottom = `${Math.max(20, safeBottom)}px`;
            this.elements.watermark.style.right = `${Math.max(20, safeRight)}px`;
        }
        
        if (this.elements.ethicalNote) {
            this.elements.ethicalNote.style.bottom = `${Math.max(20, safeBottom)}px`;
            this.elements.ethicalNote.style.left = `${Math.max(20, safeLeft)}px`;
        }
    }
    
    setupEventListeners() {
        // YES Button
        this.elements.buttons.yes?.addEventListener('click', () => {
            this.playSound('yes');
            this.showScreen('followup');
        });
        
        // NO Button - Desktop Hover
        if (!this.state.isMobile) {
            this.elements.buttons.no?.addEventListener('mouseenter', (e) => {
                this.playSound('hover');
                this.makeButtonEscape(e.clientX, e.clientY);
            });
        }
        
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
            this.playSound('click');
            this.resetExperience();
            this.showScreen('main');
        });
        
        // Return
        this.elements.buttons.return?.addEventListener('click', () => {
            this.playSound('click');
            this.showScreen('main');
        });
        
        // Mouse movement tracking for predictive escape (Desktop only)
        if (!this.state.isMobile) {
            document.addEventListener('mousemove', (e) => {
                this.checkMouseProximity(e.clientX, e.clientY);
            });
        }
        
        // Window resize - recalculate bounds
        window.addEventListener('resize', () => {
            this.calculateBounds();
            this.positionWatermarks();
            this.repositionElements();
        });
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.calculateBounds();
                this.positionWatermarks();
                this.repositionElements();
            }, 300);
        });
    }
    
    setupMobileEvents() {
        if (!this.state.isMobile) return;
        
        const noBtn = this.elements.buttons.no;
        if (!noBtn) return;
        
        // Touch start
        noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchState = {
                isTouching: true,
                touchStartTime: Date.now(),
                touchStartX: touch.clientX,
                touchStartY: touch.clientY
            };
            
            // Vibrate on touch (if supported)
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
        }, { passive: false });
        
        // Touch move - predictive escape
        noBtn.addEventListener('touchmove', (e) => {
            if (!this.touchState.isTouching) return;
            
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // Calculate touch velocity
            const timeDiff = Date.now() - this.touchState.touchStartTime;
            const xDiff = touchX - this.touchState.touchStartX;
            const yDiff = touchY - this.touchState.touchStartY;
            const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            
            // If moving fast toward button, escape
            if (timeDiff < 300 && distance > 30) {
                const velocity = distance / timeDiff;
                if (velocity > 0.3) {
                    // Predict future position
                    const predictedX = touchX + (xDiff / timeDiff) * 100;
                    const predictedY = touchY + (yDiff / timeDiff) * 100;
                    this.makeButtonEscape(predictedX, predictedY);
                    this.touchState.isTouching = false;
                }
            }
        }, { passive: true });
        
        // Touch end
        noBtn.addEventListener('touchend', (e) => {
            if (this.touchState.isTouching) {
                const touch = e.changedTouches[0];
                const timeDiff = Date.now() - this.touchState.touchStartTime;
                
                // Quick tap - escape immediately
                if (timeDiff < 200) {
                    this.makeButtonEscape(touch.clientX, touch.clientY);
                }
            }
            this.touchState.isTouching = false;
        }, { passive: true });
        
        // Prevent context menu on mobile
        document.addEventListener('contextmenu', (e) => {
            if (this.state.isMobile) {
                e.preventDefault();
            }
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
            
            // Scroll to top on mobile
            if (this.state.isMobile && card.scrollTop > 0) {
                card.scrollTop = 0;
            }
        }
    }
    
    // Intelligent Button Escape System - Mobile Optimized
    makeButtonEscape(mouseX, mouseY) {
        // Cooldown check
        const now = Date.now();
        if (now - this.state.lastEscapeTime < this.state.escapeCooldown) {
            return;
        }
        this.state.lastEscapeTime = now;
        
        if (this.state.noButtonEscapes >= this.state.maxEscapes) return;
        
        const noBtn = this.elements.buttons.no;
        if (!noBtn) return;
        
        // Play escape sound
        this.playSound('escape');
        
        // Record movement
        this.state.movementHistory.push({
            x: mouseX,
            y: mouseY,
            timestamp: now
        });
        
        // Keep only last 5 movements
        if (this.state.movementHistory.length > 5) {
            this.state.movementHistory.shift();
        }
        
        // Calculate new position
        const buttonRect = noBtn.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        
        // Calculate vector from touch/mouse to button
        const dx = buttonCenterX - mouseX;
        const dy = buttonCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let newX, newY;
        
        if (distance > 0) {
            // Normalize direction and add repulsion force
            const repulsionForce = this.state.isMobile ? 
                80 + (this.state.noButtonEscapes * 8) : 
                100 + (this.state.noButtonEscapes * 10);
            
            const moveX = (dx / distance) * repulsionForce;
            const moveY = (dy / distance) * repulsionForce;
            
            // Calculate new position
            newX = buttonRect.left + moveX;
            newY = buttonRect.top + moveY;
        } else {
            // If exactly on button, random direction
            const angle = Math.random() * Math.PI * 2;
            const repulsionForce = this.state.isMobile ? 120 : 150;
            newX = buttonRect.left + Math.cos(angle) * repulsionForce;
            newY = buttonRect.top + Math.sin(angle) * repulsionForce;
        }
        
        // Keep button within safe bounds with padding
        const padding = this.state.isMobile ? 40 : 50;
        newX = Math.max(this.bounds.x + padding, 
                       Math.min(this.bounds.width - buttonRect.width - padding, newX));
        newY = Math.max(this.bounds.y + padding, 
                       Math.min(this.bounds.height - buttonRect.height - padding, newY));
        
        // Convert to percentage for responsive positioning
        const percentX = (newX / this.bounds.width) * 100;
        const percentY = (newY / this.bounds.height) * 100;
        
        // Apply the escape with mobile-optimized animation
        const animationDuration = this.state.isMobile ? 
            Math.max(0.2, 0.6 - (this.state.noButtonEscapes * 0.04)) : 
            Math.max(0.3, 0.8 - (this.state.noButtonEscapes * 0.05));
        
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
        
        // Vibrate on escape (mobile only)
        if (this.state.isMobile && navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
        
        // If max escapes reached, fade out NO button completely
        if (this.state.noButtonEscapes >= this.state.maxEscapes) {
            setTimeout(() => {
                noBtn.style.transition = 'all 0.8s ease';
                noBtn.style.opacity = '0';
                noBtn.style.transform = `translate(-50%, -50%) scale(0.5)`;
                noBtn.style.pointerEvents = 'none';
                setTimeout(() => {
                    noBtn.style.visibility = 'hidden';
                    this.showMessage("Got me! ❤️ Now click YES!", 3000);
                }, 800);
            }, 500);
        }
    }
    
    checkMouseProximity(mouseX, mouseY) {
        if (this.state.currentScreen !== 'main') return;
        if (this.state.noButtonEscapes >= this.state.maxEscapes) return;
        if (this.state.isMobile) return; // Mobile uses touch events
        
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
            const escapeChance = Math.max(0.05, 0.3 - (distance / 2000));
            if (Math.random() < escapeChance) {
                this.makeButtonEscape(mouseX, mouseY);
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
        const glowSize = this.state.noButtonEscapes * (this.state.isMobile ? 4 : 6);
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
        
        // Mobile-optimized styling
        if (this.state.isMobile) {
            messageEl.style.fontSize = '0.9rem';
            messageEl.style.padding = '10px 16px';
            messageEl.style.maxWidth = '80%';
            messageEl.style.margin = '0 auto 8px';
        }
        
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
        
        // Mobile optimization
        if (this.state.isMobile) {
            messageEl.style.fontSize = '0.9rem';
            messageEl.style.padding = '12px 18px';
            messageEl.style.maxWidth = '85%';
        }
        
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
        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.width = `${Math.random() * 10 + 3}px`;
                confetti.style.height = `${Math.random() * 10 + 3}px`;
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
            }, i * 20);
        }
        
        // Create heart explosion
        this.createHeartExplosion();
        
        // Vibrate on success (mobile only)
        if (this.state.isMobile && navigator.vibrate) {
            navigator.vibrate([100, 100, 100, 100, 100]);
        }
    }
    
    createHeartExplosion() {
        const container = document.querySelector('.success-card');
        if (!container) return;
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = '❤️';
                heart.style.position = 'absolute';
                heart.style.fontSize = `${Math.random() * 30 + 15}px`;
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
                const distance = 100 + Math.random() * 100;
                const duration = 1.2 + Math.random();
                
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
            }, i * 50);
        }
    }
    
    // Background animations
    createBackgroundHearts() {
        const container = document.querySelector('.background-hearts');
        if (!container) return;
        
        // Create more hearts
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = '❤️';
                heart.style.position = 'absolute';
                heart.style.fontSize = `${Math.random() * 25 + 12}px`;
                heart.style.left = `${Math.random() * 100}%`;
                heart.style.top = `${Math.random() * 100}%`;
                heart.style.opacity = `${Math.random() * 0.15 + 0.05}`;
                heart.style.animation = `floatHeart ${Math.random() * 20 + 12}s linear infinite`;
                heart.style.animationDelay = `${Math.random() * 8}s`;
                heart.style.filter = `hue-rotate(${Math.random() * 60}deg)`;
                
                container.appendChild(heart);
            }, i * 1000);
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
        this.state.lastEscapeTime = 0;
        
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
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add custom animations for button effects
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
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
            .escape-message {
                font-size: 0.85rem !important;
                padding: 8px 14px !important;
                margin-bottom: 6px !important;
            }
            
            .btn-no {
                min-width: 80px !important;
                max-width: 100px !important;
                font-size: 0.85rem !important;
            }
        }
        
        /* Prevent text selection */
        .btn-no, .btn-yes {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Audio unlock button */
        .audio-unlock {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .audio-unlock:hover {
            background: white;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
    
    // Create audio unlock button
    const audioUnlockBtn = document.createElement('button');
    audioUnlockBtn.className = 'audio-unlock';
    audioUnlockBtn.innerHTML = '🔊';
    audioUnlockBtn.title = 'Click to enable audio';
    audioUnlockBtn.addEventListener('click', () => {
        // This will trigger audio context on user interaction
        if (window.valentineApp && window.valentineApp.audioContext) {
            window.valentineApp.audioContext.resume();
        }
        audioUnlockBtn.style.display = 'none';
    });
    document.body.appendChild(audioUnlockBtn);
    
    // Initialize the app
    window.valentineApp = new PerfectValentine();
    
    // Auto-remove audio unlock button after 5 seconds if not needed
    setTimeout(() => {
        if (audioUnlockBtn.parentNode) {
            audioUnlockBtn.style.display = 'none';
        }
    }, 5000);
    
    // Console message
    console.log('%c💖 Will You Be My Valentine? 💖', 'color: #ff4d6d; font-size: 18px; font-weight: bold;');
    console.log('%cPerfectly aligned, perfectly timed, perfectly romantic.', 'color: #666;');
    console.log('%cMobile Optimized: ' + (window.valentineApp.state.isMobile ? 'Yes 📱' : 'No 💻'), 'color: #4d79ff;');
    console.log('%cAudio System: ' + (window.valentineApp.audioContext ? 'Web Audio API 🎵' : 'Fallback'), 'color: #4dff79;');
});

// Handle window resize with debouncing
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

// Handle orientation change with proper delay
let orientationChangeTimeout;
window.addEventListener('orientationchange', () => {
    clearTimeout(orientationChangeTimeout);
    orientationChangeTimeout = setTimeout(() => {
        if (window.valentineApp) {
            window.valentineApp.calculateBounds();
            window.valentineApp.positionWatermarks();
            window.valentineApp.repositionElements();
        }
    }, 500);
});

// Prevent pull-to-refresh on mobile
document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Fix for iOS 100vh issue
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update app bounds if exists
    if (window.valentineApp) {
        window.valentineApp.calculateBounds();
        window.valentineApp.positionWatermarks();
    }
}

// Initial set
setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
