// ===== Page Loader =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.page-loader').classList.add('hidden');
    }, 2500);
});

// ===== Paint Splatter on Click/Tap =====
function createSplatter(x, y) {
    const colors = ['#c9a96e', '#8b5e3c', '#d4956a', '#6bb5c9', '#e74c3c', '#8b4d7a', '#2d6e7e'];
    const splatterCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < splatterCount; i++) {
        const splat = document.createElement('div');
        const size = Math.random() * 20 + 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * 360;
        const distance = Math.random() * 80 + 20;
        const dx = Math.cos(angle * Math.PI / 180) * distance;
        const dy = Math.sin(angle * Math.PI / 180) * distance;

        splat.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${Math.random() > 0.3 ? '50%' : '30% 70% 50% 60%'};
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.7;
            transform: scale(0);
            transition: all ${Math.random() * 0.6 + 0.4}s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        document.body.appendChild(splat);

        setTimeout(() => {
            splat.style.transform = `scale(1) translate(${dx}px, ${dy}px)`;
            splat.style.opacity = '0';
        }, 10);

        setTimeout(() => splat.remove(), 1200);
    }
}

document.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, textarea, .cart-sidebar, .cart-overlay')) return;
    createSplatter(e.clientX, e.clientY);
});

document.addEventListener('touchstart', (e) => {
    if (e.target.closest('button, a, input, textarea, .cart-sidebar, .cart-overlay')) return;
    const touch = e.touches[0];
    createSplatter(touch.clientX, touch.clientY);
});

// ===== Scroll Progress Bar =====
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.querySelector('.scroll-progress').style.width = scrollPercent + '%';
});

// ===== Floating Particles =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = -(Math.random() * 1.2 + 0.3);
        this.opacity = Math.random() * 0.6 + 0.1;
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
        const colorSet = ['201, 169, 110', '139, 94, 60', '212, 149, 106', '107, 181, 201', '139, 77, 122'];
        this.color = colorSet[Math.floor(Math.random() * colorSet.length)];
    }
    update() {
        this.x += this.speedX + Math.sin(this.life * 0.02) * 0.3;
        this.y += this.speedY;
        this.life--;
        this.opacity = (this.life / this.maxLife) * 0.5;
        if (this.life <= 0) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
    }
}

for (let i = 0; i < 60; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height;
    p.life = Math.random() * p.maxLife;
    particles.push(p);
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connections between close particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(201, 169, 110, ${0.08 * (1 - dist / 100)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== Scroll Reveal Observer =====
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .stagger-children, .stagger-testimonials, .contact-form');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Section header underline
const sectionHeaders = document.querySelectorAll('.section-header');
const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.3 });
sectionHeaders.forEach(el => headerObserver.observe(el));

// ===== Cart Functionality =====
let cart = [];
const cartCountEl = document.querySelector('.cart-count');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItemsEl = document.querySelector('.cart-items');
const cartTotalEl = document.querySelector('.cart-total-price');

// Open/close cart
document.querySelector('.cart-btn').addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
});

document.querySelector('.cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
}

function updateCartCount() {
    cartCountEl.textContent = cart.length;
    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.style.transform = 'scale(1.4) rotate(10deg)';
    setTimeout(() => { cartBtn.style.transform = 'scale(1) rotate(0deg)'; }, 400);
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
        cartTotalEl.textContent = '₹0';
        return;
    }

    let total = 0;
    cartItemsEl.innerHTML = cart.map((item, index) => {
        const price = parseInt(item.price.replace(/[^0-9]/g, ''));
        total += price;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">${item.price}</span>
                </div>
                <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">&times;</button>
            </div>
        `;
    }).join('');

    cartTotalEl.textContent = '₹' + total.toLocaleString('en-IN');

    // Attach remove handlers
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            cart.splice(idx, 1);
            updateCartCount();
            renderCart();
        });
    });
}

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = btn.closest('.painting-card');
        const name = card.querySelector('h3').textContent;
        const price = card.querySelector('.painting-price').textContent;

        cart.push({ name, price });
        updateCartCount();
        renderCart();

        // Flying particle to cart
        const rect = btn.getBoundingClientRect();
        const cartRect = document.querySelector('.cart-btn').getBoundingClientRect();
        const flyEl = document.createElement('div');
        flyEl.style.cssText = `
            position: fixed;
            width: 14px;
            height: 14px;
            background: var(--color-accent);
            border-radius: 50%;
            z-index: 9999;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            box-shadow: 0 0 10px rgba(139, 94, 60, 0.5);
        `;
        document.body.appendChild(flyEl);
        setTimeout(() => {
            flyEl.style.left = cartRect.left + cartRect.width / 2 + 'px';
            flyEl.style.top = cartRect.top + 'px';
            flyEl.style.transform = 'scale(0)';
            flyEl.style.opacity = '0';
        }, 10);
        setTimeout(() => flyEl.remove(), 1000);

        // Button feedback
        btn.textContent = 'Added ✓';
        btn.style.background = 'var(--color-accent)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--color-accent)';
        btn.style.transform = 'scale(1.15)';

        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
            btn.style.transform = '';
        }, 2000);
    });
});

// ===== Gallery Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const paintingCards = document.querySelectorAll('.painting-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        let delay = 0;

        paintingCards.forEach((card) => {
            if (filter === 'all' || card.dataset.category === filter) {
                setTimeout(() => {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(40px) rotateX(10deg) scale(0.9)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
                    }, 50);
                }, delay);
                delay += 120;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px) scale(0.8)';
                setTimeout(() => { card.style.display = 'none'; }, 400);
            }
        });
    });
});

// ===== Mobile Menu =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Contact Form with Confetti =====
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Message Sent ✓';
        submitBtn.style.background = '#4a7c59';
        submitBtn.style.transform = 'scale(1.05)';
        createConfetti(submitBtn);

        setTimeout(() => {
            submitBtn.textContent = 'Send Message';
            submitBtn.style.background = '';
            submitBtn.style.transform = '';
            contactForm.reset();
        }, 3000);
    });
}

function createConfetti(origin) {
    const rect = origin.getBoundingClientRect();
    const colors = ['#c9a96e', '#8b5e3c', '#d4956a', '#e8d5b7', '#6bb5c9', '#8b4d7a'];
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 10 + 4;
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            pointer-events: none;
            z-index: 9999;
            transition: all ${Math.random() * 1.2 + 0.8}s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        document.body.appendChild(confetti);
        setTimeout(() => {
            confetti.style.left = rect.left + rect.width / 2 + (Math.random() - 0.5) * 400 + 'px';
            confetti.style.top = rect.top - Math.random() * 300 - 50 + 'px';
            confetti.style.opacity = '0';
            confetti.style.transform = `rotate(${Math.random() * 720}deg) scale(0)`;
        }, 10);
        setTimeout(() => confetti.remove(), 2500);
    }
}

// ===== Navbar scroll effect =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.style.padding = '14px 40px';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.04)';
    } else {
        navbar.style.padding = '20px 40px';
        navbar.style.boxShadow = 'none';
    }
});

// ===== Parallax on scroll =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroFrame = document.querySelector('.hero-frame');
    const heroContent = document.querySelector('.hero-content');
    const blobs = document.querySelectorAll('.blob');

    if (scrolled < window.innerHeight) {
        if (heroFrame) {
            heroFrame.style.transform = `translateY(${scrolled * 0.2}px) rotate(${scrolled * 0.015}deg)`;
        }
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
            heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.7));
        }
        // Parallax blobs
        blobs.forEach((blob, i) => {
            const speed = 0.05 + i * 0.03;
            blob.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }
});

// ===== 3D Tilt on painting cards =====
document.querySelectorAll('.painting-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `translateY(-10px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 40px rgba(0,0,0,0.12)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
    });
});

// ===== Cursor glow on gallery =====
const gallerySection = document.querySelector('.gallery-section');
if (gallerySection) {
    gallerySection.addEventListener('mousemove', (e) => {
        const rect = gallerySection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gallerySection.style.background = `radial-gradient(800px circle at ${x}px ${y}px, rgba(201, 169, 110, 0.06), transparent 40%)`;
    });
    gallerySection.addEventListener('mouseleave', () => {
        gallerySection.style.background = '';
    });
}

// ===== Price counter animation =====
const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const priceEl = entry.target;
            const finalPrice = priceEl.textContent;
            const numericValue = parseInt(finalPrice.replace(/[^0-9]/g, ''));
            let current = 0;
            const increment = Math.ceil(numericValue / 40);
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                priceEl.textContent = '₹' + current.toLocaleString('en-IN');
            }, 25);
            priceObserver.unobserve(priceEl);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.painting-price').forEach(el => priceObserver.observe(el));

// ===== Magnetic effect on buttons =====
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

// ===== Text reveal for about section =====
const aboutText = document.querySelector('.about-text');
if (aboutText) {
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const paragraphs = entry.target.querySelectorAll('p, h2');
                paragraphs.forEach((p, i) => {
                    p.style.opacity = '0';
                    p.style.transform = 'translateY(30px)';
                    p.style.transition = `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`;
                    setTimeout(() => {
                        p.style.opacity = '1';
                        p.style.transform = 'translateY(0)';
                    }, 100);
                });
                textObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    textObserver.observe(aboutText);
}

// ===== Image reveal with clip-path =====
document.querySelectorAll('.painting-image img').forEach(img => {
    img.style.clipPath = 'inset(100% 0 0 0)';
    img.style.transition = 'clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)';

    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.clipPath = 'inset(0 0 0 0)';
                imgObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    imgObserver.observe(img);
});

// ===== Typing effect for hero subtitle =====
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
    const text = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    heroSubtitle.style.borderRight = '2px solid var(--color-accent)';
    let i = 0;
    setTimeout(() => {
        const typeInterval = setInterval(() => {
            heroSubtitle.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    heroSubtitle.style.borderRight = 'none';
                }, 1000);
            }
        }, 50);
    }, 2800);
}

// ===== Interactive colour palette on hero hover =====
const hero = document.querySelector('.hero');
if (hero) {
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const hue1 = Math.floor(x * 40 + 20);
        const hue2 = Math.floor(y * 60 + 180);

        document.querySelectorAll('.blob-1')[0].style.background = `radial-gradient(circle, hsl(${hue1}, 60%, 60%), transparent 70%)`;
        document.querySelectorAll('.blob-4')[0].style.background = `radial-gradient(circle, hsl(${hue2}, 50%, 55%), transparent 70%)`;
    });
}

// ===== Scroll-triggered section colour shifts =====
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
        section.style.setProperty('--scroll-progress', progress);
    });
});
