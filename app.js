/* ==========================================
   FUTURISTIC INTERACTIVE SCRIPTS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initParticleBackground();
    initCardHoverGlows();
    initHudRadar();
    initDecryptEffect();
    initScrollReveal();
    initContactForm();
});

/* ==========================================
   1. CUSTOM SMOOTH CURSOR TRACKER
   ========================================== */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('cursor-dot');
    
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    // Track real mouse coordinates
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant inner dot placement
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Interpolation (lerp) loop for the outer lagging ring
    function renderCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.15;
        cursorY += dy * 0.15;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover states for links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .hud-orbit-item, .glass-input');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });
}

/* ==========================================
   2. INTERACTIVE CANVAS PARTICLE FIELD
   ========================================== */
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Blueprints
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
            this.color = 'rgba(6, 182, 212, 0.4)'; // Cyan hue base
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off borders
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Mouse interaction push/pull
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    let force = (mouse.radius - dist) / mouse.radius;
                    // Move slightly towards the mouse
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                }
            }
        }
    }

    // Populate particle buffer
    const particleCount = Math.min(Math.floor((width * height) / 16000), 100);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Render loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw and update particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connecting networks
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    // Set line color opacity based on distance
                    let alpha = (120 - dist) / 120 * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    // Gradient lines between connected nodes
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================
   3. BENTO CARD MOUSE ACCENT GLOW
   ========================================== */
function initCardHoverGlows() {
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
}

/* ==========================================
   4. INTERACTIVE HUD RADAR SKILLS
   ========================================== */
function initHudRadar() {
    const orbitItems = document.querySelectorAll('.hud-orbit-item');
    const display = document.getElementById('hud-skill-display');
    
    if (!display) return;

    // Custom descriptions for each skill
    const skillDescriptions = {
        'Dart': 'Dart // Key framework language for high-performance cross-platform Flutter mobile apps.',
        'Python': 'Python // Backend scripting, Gemini AI integration systems, and automation scripts.',
        'C++': 'C++ // Systems programming, low-level efficiency, algorithms, and logical modeling.',
        'Java': 'Java // Classic Android SDK development and OOP object-oriented blueprints.',
        'JS': 'JavaScript // Web layouts, interactive canvas systems, node APIs, and web rendering.'
    };

    orbitItems.forEach(item => {
        const skill = item.getAttribute('data-skill');
        
        item.addEventListener('mouseenter', () => {
            if (skill && skillDescriptions[skill]) {
                scrambleText(display, skillDescriptions[skill]);
            }
        });

        item.addEventListener('mouseleave', () => {
            display.innerText = 'Hover an node';
        });
    });
}

/* ==========================================
   5. CYBER DECRYPT/SCRAMBLE TYPING EFFECT
   ========================================== */
function initDecryptEffect() {
    // Auto decrypt section headings on scroll, or manually trigger
    const decryptElements = document.querySelectorAll('[data-decrypt]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetText = element.getAttribute('data-decrypt');
                if (targetText && !element.classList.contains('decrypted')) {
                    scrambleText(element, targetText);
                    element.classList.add('decrypted');
                }
            }
        });
    }, { threshold: 0.2 });

    decryptElements.forEach(el => observer.observe(el));
}

// Scramble engine
function scrambleText(element, finalString) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*()_-+=[]{}<>|';
    let iterations = 0;
    const intervalTime = 30; // ms per frame
    
    const interval = setInterval(() => {
        element.innerText = finalString
            .split('')
            .map((char, index) => {
                if (index < iterations) {
                    return finalString[index];
                }
                // Random characters space retention
                if (char === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
            
        if (iterations >= finalString.length) {
            clearInterval(interval);
            element.innerText = finalString; // Set clean final text
        }
        
        iterations += 1/2; // Speed threshold (decrypt 1 letter every 2 ticks)
    }, intervalTime);
}

/* ==========================================
   6. SCROLL REVEAL (FADE & SLIDE UP)
   ========================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is in view
    });

    revealElements.forEach(el => observer.observe(el));
    
    // Dynamic navigation active link toggler
    const sections = document.querySelectorAll('section, #apps');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            const target = link.getAttribute('href');
            link.classList.toggle('active', target === `#${current}`);
        });
    });
}

/* ==========================================
   7. CONTACT FORM EMAIL SENDER
   ========================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const emailConfig = {
        serviceId: 'YOUR_EMAILJS_SERVICE_ID',
        templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
        publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
        recipient: 'hassaannsaeed@gmail.com'
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const name = (formData.get('name') || document.getElementById('form-name')?.value || '').toString().trim();
        const email = (formData.get('email') || document.getElementById('form-email')?.value || '').toString().trim();
        const subject = (formData.get('subject') || document.getElementById('form-subject')?.value || '').toString().trim();
        const message = (formData.get('message') || document.getElementById('form-message')?.value || '').toString().trim();

        if (!name || !email || !subject || !message) {
            alert('Please complete all fields before sending.');
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const originalText = button ? button.textContent : 'Send Message';
        if (button) {
            button.disabled = true;
            button.textContent = 'Sending...';
        }

        try {
            if (
                window.emailjs &&
                emailConfig.serviceId !== 'YOUR_EMAILJS_SERVICE_ID' &&
                emailConfig.templateId !== 'YOUR_EMAILJS_TEMPLATE_ID' &&
                emailConfig.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY'
            ) {
                const templateParams = {
                    from_name: name,
                    from_email: email,
                    subject: subject,
                    message: message,
                    to_email: emailConfig.recipient
                };

                await emailjs.send(emailConfig.serviceId, emailConfig.templateId, templateParams, {
                    publicKey: emailConfig.publicKey
                });

                alert('Your message has been sent successfully.');
                form.reset();
            } else {
                const mailtoLink = `mailto:${emailConfig.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
                )}`;
                window.location.href = mailtoLink;
                alert('Your mail app has been opened with the message ready to send.');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            const mailtoLink = `mailto:${emailConfig.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
            )}`;
            window.location.href = mailtoLink;
            alert('The email service is not configured yet, so your mail app was opened with the message ready to send.');
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = originalText;
            }
        }
    });
}
