document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('nav button.md\\:hidden');
    const navLinksContainer = document.querySelector('nav .hidden.md\\:flex');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            const iconSpan = mobileMenuBtn.querySelector('.material-symbols-outlined');
            // Toggle classes to show/hide the menu on mobile
            if (navLinksContainer.classList.contains('hidden')) {
                navLinksContainer.classList.remove('hidden');
                navLinksContainer.classList.add('flex', 'flex-col', 'absolute', 'top-20', 'left-0', 'w-full', 'bg-surface/95', 'backdrop-blur-xl', 'p-6', 'border-b', 'border-white/10', 'gap-4');
                if (iconSpan) iconSpan.textContent = 'close';
            } else {
                navLinksContainer.classList.add('hidden');
                navLinksContainer.classList.remove('flex', 'flex-col', 'absolute', 'top-20', 'left-0', 'w-full', 'bg-surface/95', 'backdrop-blur-xl', 'p-6', 'border-b', 'border-white/10', 'gap-4');
                if (iconSpan) iconSpan.textContent = 'menu';
            }
        });
    }

    // 2. Active Navigation Link highlighting based on current URL
    const navLinks = document.querySelectorAll('nav a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('text-primary', 'border-b-2', 'border-primary', 'pb-1');
            link.classList.remove('text-on-surface-variant');
        } else {
            link.classList.remove('text-primary', 'border-b-2', 'border-primary', 'pb-1');
            link.classList.add('text-on-surface-variant');
        }
    });

    // 3. Scroll Fade-in Animation using Intersection Observer
    const faders = document.querySelectorAll('.fade-in-section, section');
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        // Only add if not already present
        if(!fader.classList.contains('fade-in-section')){
            fader.classList.add('fade-in-section');
        }
        appearOnScroll.observe(fader);
    });

    // 4. Form Validation & Submission (Simulation)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Basic validation
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('border-error');
                } else {
                    input.classList.remove('border-error');
                }
            });

            if (isValid) {
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Processing...';
                submitBtn.disabled = true;

                // Extract values using FormData
                const formData = new FormData(form);
                const payload = Object.fromEntries(formData.entries());

                // Send POST request asynchronously
                fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (response.ok) {
                        const formContainer = form.parentElement;
                        formContainer.classList.add('form-success');
                        
                        if (!formContainer.querySelector('.form-success-msg')) {
                            const msg = document.createElement('div');
                            msg.className = 'form-success-msg text-center p-8';
                            msg.innerHTML = `
                                <div class="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span class="material-symbols-outlined text-3xl text-primary">check_circle</span>
                                </div>
                                <h3 class="font-headline-md text-2xl mb-2 text-on-surface">Message Received</h3>
                                <p class="text-on-surface-variant">Our team will get back to you within 24 hours.</p>
                            `;
                            formContainer.appendChild(msg);
                        }
                    } else {
                        return response.json().then(errData => {
                            throw new Error(errData.error || 'Failed to submit form');
                        });
                    }
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    // Show a beautiful error state on the button
                    submitBtn.innerHTML = `<span class="material-symbols-outlined">error</span> Submission Failed`;
                    submitBtn.classList.add('bg-error-container', 'text-on-error-container');
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.classList.remove('bg-error-container', 'text-on-error-container');
                        submitBtn.disabled = false;
                    }, 3000);
                });
            }
        });
    });

    // 5. FAQ Accordions
    const faqs = document.querySelectorAll('.faq-item');
    faqs.forEach(faq => {
        const header = faq.querySelector('.faq-header');
        const content = faq.querySelector('.faq-content');
        
        if (header && content) {
            header.addEventListener('click', () => {
                const isActive = faq.classList.contains('faq-active');
                
                // Close all others
                faqs.forEach(otherFaq => {
                    otherFaq.classList.remove('faq-active');
                    const otherContent = otherFaq.querySelector('.faq-content');
                    if (otherContent) otherContent.style.maxHeight = null;
                });

                // Toggle current
                if (!isActive) {
                    faq.classList.add('faq-active');
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        }
    });

    // 6. Bulletproof Cal.com Manual Event Binding & Fallback
    document.querySelectorAll('[data-cal-link]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const link = btn.getAttribute('data-cal-link');
            if (window.Cal) {
                try {
                    window.Cal("preload", { calLink: link });
                    window.Cal("modal", { calLink: link });
                } catch (err) {
                    console.warn('Cal.com modal failed, falling back to new tab:', err);
                    window.open(`https://cal.com/${link}`, '_blank');
                }
            } else {
                window.open(`https://cal.com/${link}`, '_blank');
            }
        });
    });
});

// 7. Official Robust Cal.com Async Loader (Evaluated at top-level)
(function (C, A, L) { 
    let p = function (a, ar) { a.q.push(ar); }; 
    let d = C.document; 
    C.Cal = C.Cal || function () { 
        let cal = C.Cal; 
        let ar = arguments; 
        if (!cal.loaded) { 
            cal.ns = {}; 
            cal.q = cal.q || []; 
            d.head.appendChild(d.createElement("script")).src = A; 
            cal.loaded = true; 
        } 
        if (ar[0] === L) { 
            const api = function () { p(api, arguments); }; 
            const namespace = ar[1]; 
            api.q = api.q || []; 
            typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); 
            return; 
        } 
        p(cal, ar); 
    }; 
})(window, "https://embed.cal.com/embed/embed.js", "init");

Cal("init", { origin: "https://cal.com" });
Cal("ui", {
    "styles": {
        "branding": {
            "brandColor": "#000000"
        }
    },
    "hideEventTypeDetails": false,
    "layout": "month_view"
});
