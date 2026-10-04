/* ==========================================================================
   HASSAAN SAEED PORTFOLIO - INTERACTIVE CONTROLLER
   Matches iamwaleed.me UX dynamics: auto-cycling bento project accordion,
   smooth micro-interactions, click-to-copy clipboard toasts, and contact drawer.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initProjectAccordion();
    initContactModal();
    initMobileDrawer();
    initSmoothScroll();
    initClipboardChips();
    initBallHover();
    initWordJitter();
    initPlaceholderLinks();
    initLatestCommit();
});

/* ==========================================================================
   1. BENTO PROJECTS INTERACTIVE ACCORDION (Matches Mj component)
   ========================================================================== */
function initProjectAccordion() {
    const list = document.getElementById('projects-list');
    const projectItems = document.querySelectorAll('.project-item');
    if (!list || projectItems.length === 0) return;

    let currentIndex = 0;
    let autoCycleTimer = null;
    let hoverIntentTimer = null;
    let isUserInteracting = false;

    function setActiveProject(index) {
        if (index === currentIndex) return;
        projectItems.forEach((item, i) => item.classList.toggle('active', i === index));
        currentIndex = index;
    }

    function startAutoCycle() {
        stopAutoCycle();
        autoCycleTimer = setInterval(() => {
            if (!isUserInteracting) {
                setActiveProject((currentIndex + 1) % projectItems.length);
            }
        }, 3600);
    }

    function stopAutoCycle() {
        if (autoCycleTimer) {
            clearInterval(autoCycleTimer);
            autoCycleTimer = null;
        }
    }

    // Interaction is tracked on the whole list (not per item) so moving between
    // two projects never restarts the auto-cycle or causes a flicker.
    list.addEventListener('mouseenter', () => {
        isUserInteracting = true;
        stopAutoCycle();
    });
    list.addEventListener('mouseleave', () => {
        isUserInteracting = false;
        clearTimeout(hoverIntentTimer);
        startAutoCycle();
    });

    projectItems.forEach((item, index) => {
        // Hover-intent: only switch if the pointer actually rests on the item for a moment.
        // This stops the "layout moves under the cursor -> switches again" ping-pong.
        item.addEventListener('mouseenter', () => {
            clearTimeout(hoverIntentTimer);
            hoverIntentTimer = setTimeout(() => setActiveProject(index), 110);
        });
        item.addEventListener('mouseleave', () => clearTimeout(hoverIntentTimer));

        const header = item.querySelector('.project-item-header');
        if (header) {
            header.addEventListener('click', () => {
                clearTimeout(hoverIntentTimer);
                setActiveProject(index);
            });
        }
        const arrowLink = item.querySelector('.project-arrow');
        if (arrowLink) {
            arrowLink.addEventListener('click', (e) => e.stopPropagation());
        }
    });

    startAutoCycle();
}

/* ==========================================================================
   2. CONTACT MODAL & QUICK OUTREACH (Matches J9 component)
   ========================================================================== */
function initContactModal() {
    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const triggers = [document.getElementById('contact-cta')];

    if (!modal) return;

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    triggers.forEach(trigger => {
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Direct message form
    const form = document.getElementById('direct-message-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('input-name').value.trim();
            const email = document.getElementById('input-email').value.trim();
            const message = document.getElementById('input-message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all fields', 'warning');
                return;
            }

            // Compose mailto as guaranteed direct fallback
            const mailtoUrl = `mailto:hassaannsaeed@gmail.com?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
            window.open(mailtoUrl, '_blank');

            showToast('Transmission initiated! Opening your mail client...', 'success');
            form.reset();
            setTimeout(closeModal, 800);
        });
    }
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const closeBtn = document.getElementById('drawer-close-btn');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !drawer || !backdrop) return;

    function openDrawer() {
        drawer.classList.add('active');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    // Navigation itself is handled by initSmoothScroll (these links also carry data-scroll)
    links.forEach(link => link.addEventListener('click', closeDrawer));
}

/* ==========================================================================
   4. SMOOTH SCROLLING NAVIGATION
   ========================================================================== */
const NAV_TARGETS = {
    about: 'about',
    contact: 'contact-cta',
    projects: 'projects',
    socials: 'socials'
};
// Links that also pop the toast (Socials just scrolls)
const NAV_TOAST = new Set(['about', 'contact', 'projects']);

function initSmoothScroll() {
    document.querySelectorAll('[data-scroll]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-scroll');
            const targetId = NAV_TARGETS[key] || key;
            scrollToSection(targetId);
            if (NAV_TOAST.has(key)) {
                showAnchoredToast("It's right on the screen, chump!", document.getElementById(targetId));
            }
        });
    });

    const brandLogo = document.getElementById('brand-logo');
    if (brandLogo) {
        brandLogo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/* ==========================================================================
   5. CLIPBOARD COPY TOASTS
   ========================================================================== */
function initClipboardChips() {
    const emailChip = document.getElementById('copy-email-chip');
    const phoneChip = document.getElementById('copy-phone-chip');
    const socialEmail = document.getElementById('social-email-copy');

    if (emailChip) {
        emailChip.addEventListener('click', () => {
            copyTextToClipboard('hassaannsaeed@gmail.com', 'Email copied to clipboard!');
        });
    }

    if (phoneChip) {
        phoneChip.addEventListener('click', () => {
            copyTextToClipboard('+92 315 0611166', 'Phone number copied to clipboard!');
        });
    }

    if (socialEmail) {
        socialEmail.addEventListener('click', (e) => {
            e.preventDefault();
            copyTextToClipboard('hassaannsaeed@gmail.com', 'Email copied to clipboard!');
        });
    }
}

function copyTextToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage, 'success');
        }).catch(() => {
            fallbackCopy(text, successMessage);
        });
    } else {
        fallbackCopy(text, successMessage);
    }
}

function fallbackCopy(text, successMessage) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast(successMessage, 'success');
    } catch (err) {
        showToast('Unable to copy automatically. Email: hassaannsaeed@gmail.com', 'info');
    }
    document.body.removeChild(textarea);
}

/* ==========================================================================
   6. TOAST NOTIFICATION ENGINE (Waleed banner style)
   ========================================================================== */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // don't stack identical toasts if the user clicks repeatedly
    const existing = Array.from(container.children).find(
        t => t.dataset.msg === message && !t.classList.contains('removing')
    );
    if (existing) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.dataset.msg = message;

    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-solid fa-circle-info';

    toast.innerHTML = type === 'nerd'
        ? `<span>${message}</span>`
        : `<i class="${iconClass}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 260);
    }, 3200);
}


/* ==========================================================================
   7. CONTACT CARD - PURPLE BALL UNDER THE CURSOR
   One solid, opaque purple circle. It pops in under the pointer with a springy overshoot,
   follows with soft spring easing, squashes & stretches along its direction of
   travel, breathes slightly, and shrinks away smoothly when the pointer leaves.
   (The card itself turns grey via CSS on hover.)
   ========================================================================== */
function initBallHover() {
    const card = document.getElementById('contact-cta');
    const canvas = document.getElementById('bubble-canvas');
    if (!card || !canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1;
    let active = false;
    let rafId = null;
    const pointer = { x: 0, y: 0 };

    const ball = { x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, angle: 0, stretch: 0, sv: 0 };

    function resize() {
        const rect = card.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = rect.width;
        h = rect.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function setPointer(e) {
        const rect = card.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
    }

    function drawBall(t) {
        if (ball.r < 0.5) return;
        const r = ball.r * (1 + 0.05 * Math.sin(t / 340));

        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.angle);
        // squash & stretch along the direction of travel
        ctx.scale(1 + ball.stretch, 1 - ball.stretch * 0.7);

        // flat, fully opaque purple circle (no gloss, no shadow, no transparency)
        ctx.fillStyle = '#7203a9';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function frame(t) {
        ctx.clearRect(0, 0, w, h);
        const targetR = active ? Math.min(w, h) * 0.17 : 0;

        // radius: springy pop-in (overshoots slightly), smooth ease-out on leave
        if (active) {
            ball.vr += (targetR - ball.r) * 0.18;
            ball.vr *= 0.78;
        } else {
            ball.vr += (targetR - ball.r) * 0.10;
            ball.vr *= 0.62;
        }
        ball.r = Math.max(0, ball.r + ball.vr);

        // position: soft spring toward the pointer
        ball.vx += (pointer.x - ball.x) * 0.06;
        ball.vy += (pointer.y - ball.y) * 0.06;
        ball.vx *= 0.84;
        ball.vy *= 0.84;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // squash & stretch along travel direction
        const speed = Math.hypot(ball.vx, ball.vy);
        // jelly-like stretch: a spring, so it overshoots and wobbles back into shape
        ball.sv += (Math.min(speed / 38, 0.4) - ball.stretch) * 0.14;
        ball.sv *= 0.8;
        ball.stretch += ball.sv;
        if (speed > 0.4) {
            const a = Math.atan2(ball.vy, ball.vx);
            let diff = a - ball.angle;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            ball.angle += diff * 0.2;
        }

        drawBall(t);

        const settled = !active && ball.r < 0.5 && Math.abs(ball.vr) < 0.05;
        if (settled) {
            ball.r = 0; ball.vr = 0;
            rafId = null;
            ctx.clearRect(0, 0, w, h);
        } else {
            rafId = requestAnimationFrame(frame);
        }
    }

    function start() {
        if (!rafId) rafId = requestAnimationFrame(frame);
    }

    card.addEventListener('pointerenter', (e) => {
        resize();
        setPointer(e);
        if (ball.r < 1) { ball.x = pointer.x; ball.y = pointer.y; ball.vx = 0; ball.vy = 0; }
        active = true;
        start();
    });
    card.addEventListener('pointermove', (e) => {
        setPointer(e);
        if (!active) { active = true; start(); }
    });
    card.addEventListener('pointerleave', () => {
        active = false;
        start();
    });

    window.addEventListener('resize', resize);
    resize();
}

/* ==========================================================================
   7b. ABOUT CARD - WORDS DRIFT RANDOMLY WHILE HOVERED
   Each word wanders a few pixels in a random direction every ~1.1s (CSS handles
   the easing). Moves only via translate/rotate, so layout never changes.
   ========================================================================== */
function initWordJitter() {
    const card = document.getElementById('about');
    if (!card) return;
    const words = Array.from(card.querySelectorAll('.bt'));
    if (!words.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer = null;
    const rand = (min, max) => min + Math.random() * (max - min);

    function scatter() {
        words.forEach((el) => {
            // sometimes a word rests, so the motion feels organic and not uniform
            if (Math.random() < 0.2) return;
            el.style.setProperty('--jx', rand(-0.14, 0.14).toFixed(3) + 'em');
            el.style.setProperty('--jy', rand(-0.12, 0.12).toFixed(3) + 'em');
            el.style.setProperty('--jr', rand(-5, 5).toFixed(2) + 'deg');
        });
    }

    function settle() {
        words.forEach((el) => {
            el.style.setProperty('--jx', '0px');
            el.style.setProperty('--jy', '0px');
            el.style.setProperty('--jr', '0deg');
        });
    }

    card.addEventListener('pointerenter', () => {
        scatter();
        clearInterval(timer);
        timer = setInterval(scatter, 1100);
    });
    card.addEventListener('pointerleave', () => {
        clearInterval(timer);
        timer = null;
        settle();
    });
}

/* ==========================================================================
   8. PLACEHOLDER LINKS (Download CV until the file exists, PromptGuard store)
   ========================================================================== */
function initPlaceholderLinks() {
    // CV buttons now point at assets/Hassaan_Saeed_CV.pdf. This "coming soon" toast
    // only fires if a button's href is ever set back to "#".
    document.querySelectorAll('.cv-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                showToast('CV will be available soon!', 'info');
            }
        });
    });

    document.querySelectorAll('.store-soon').forEach((link) => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
                e.stopPropagation();
                showToast('Store link coming soon!', 'info');
            }
        });
    });
}


/* ==========================================================================
   9. HERO CARD - "PORTFOLIO LAST UPDATED" (live from the GitHub repo)
   Reads the newest commit of the portfolio repo and shows its message and age.
   If GitHub can't be reached (offline, rate-limited) the placeholder text stays.
   ========================================================================== */
function initLatestCommit() {
    const box = document.getElementById('latest-commit');
    const titleEl = document.getElementById('latest-commit-title');
    const timeEl = document.getElementById('latest-commit-time');
    if (!box || !titleEl || !timeEl || !window.fetch) return;

    const REPO = 'hassaannsaeed/portfolio';

    function timeAgo(date) {
        const s = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        const units = [
            ['year', 31536000], ['month', 2592000], ['week', 604800],
            ['day', 86400], ['hour', 3600], ['minute', 60]
        ];
        for (const [name, secs] of units) {
            const n = Math.floor(s / secs);
            if (n >= 1) return n + ' ' + name + (n > 1 ? 's' : '') + ' ago';
        }
        return 'just now';
    }

    function render(message, isoDate, url) {
        titleEl.textContent = message;
        titleEl.title = message;
        timeEl.textContent = timeAgo(new Date(isoDate));
        if (url) box.setAttribute('href', url);
    }

    // Show the last good result immediately (avoids a flash and saves API calls)
    try {
        const cached = JSON.parse(sessionStorage.getItem('latestCommit') || 'null');
        if (cached) render(cached.message, cached.date, cached.url);
    } catch (e) { /* storage unavailable - ignore */ }

    fetch('https://api.github.com/repos/' + REPO + '/commits?per_page=1')
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
            const c = data && data[0];
            if (!c) return;
            const message = (c.commit.message || '').split('\n')[0].trim();
            const date = c.commit.committer.date;
            render(message, date, c.html_url);
            try {
                sessionStorage.setItem('latestCommit', JSON.stringify({ message, date, url: c.html_url }));
            } catch (e) { /* ignore */ }
        })
        .catch(() => {
            if (titleEl.textContent.indexOf('Checking') === 0) {
                titleEl.textContent = 'Always improving';
                timeEl.textContent = 'recently';
            }
        });
}


/* ==========================================================================
   10. ANCHORED TOAST - pops up on the card the navbar link scrolled to
   Uses page coordinates (not fixed), so it stays glued to the card while the
   smooth scroll is still travelling there. Only one at a time.
   ========================================================================== */
let anchoredToastTimer = null;
let anchoredToastEl = null;

function showAnchoredToast(message, targetEl) {
    if (!targetEl) return;

    // replace any toast that's still showing
    if (anchoredToastEl) {
        clearTimeout(anchoredToastTimer);
        anchoredToastEl.remove();
        anchoredToastEl = null;
    }

    const rect = targetEl.getBoundingClientRect();
    const toast = document.createElement('div');
    toast.className = 'anchored-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    toast.style.left = (rect.left + window.scrollX + rect.width / 2) + 'px';
    toast.style.top = (rect.top + window.scrollY + rect.height / 2) + 'px';
    document.body.appendChild(toast);
    anchoredToastEl = toast;

    anchoredToastTimer = setTimeout(() => {
        toast.classList.add('leaving');
        setTimeout(() => {
            toast.remove();
            if (anchoredToastEl === toast) anchoredToastEl = null;
        }, 380);
    }, 2600);
}