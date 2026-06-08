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

const MANAGE_MODE = new URLSearchParams(window.location.search).get('manage') === '1';

function markCardSold(paintingId) {
    const card = document.querySelector(`.painting-card[data-id="${paintingId}"]`);
    if (!card) return;
    card.classList.add('sold-out');
    const btn = card.querySelector('.add-to-cart');
    if (btn) btn.textContent = 'Sold Out';
    if (MANAGE_MODE) updateManageBtn(card, true);
}

function updateManageBtn(card, isSold) {
    let btn = card.querySelector('.manage-toggle-btn');
    if (!btn) return;
    btn.textContent = isSold ? '🔓 Mark as Available' : '🔒 Mark as Sold';
    btn.style.background = isSold ? '#4a7c59' : '#c0392b';
}

function addManageButtons() {
    document.querySelectorAll('.painting-card').forEach(card => {
        const btn = document.createElement('button');
        btn.className = 'manage-toggle-btn';
        const isSold = card.classList.contains('sold-out');
        btn.textContent = isSold ? '🔓 Mark as Available' : '🔒 Mark as Sold';
        btn.style.cssText = `
            width: 100%; margin-top: 10px; padding: 8px;
            background: ${isSold ? '#4a7c59' : '#c0392b'}; color: #fff;
            border: none; border-radius: 2px; cursor: pointer;
            font-size: 0.78rem; letter-spacing: 0.05em;
        `;
        btn.addEventListener('click', async () => {
            const paintingId = card.dataset.id;
            const selling = !card.classList.contains('sold-out');
            btn.textContent = 'Updating...';
            btn.disabled = true;
            try {
                const endpoint = selling ? '/.netlify/functions/mark-sold' : '/.netlify/functions/unmark-sold';
                const bodyData = selling ? { paintingIds: [paintingId] } : { paintingId };
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
                if (selling) {
                    card.classList.add('sold-out');
                    card.querySelector('.add-to-cart').textContent = 'Sold Out';
                } else {
                    card.classList.remove('sold-out');
                    card.querySelector('.add-to-cart').textContent = 'Add to Cart';
                }
                updateManageBtn(card, selling);
            } catch {
                btn.textContent = 'Error — try again';
            }
            btn.disabled = false;
        });
        card.querySelector('.painting-info').appendChild(btn);
    });

    // Show a banner so it's clear manage mode is on
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#2c2c2c;color:#fff;text-align:center;padding:10px;font-size:0.85rem;z-index:9999;';
    banner.textContent = '⚙️ Manage Mode — toggle sold/available on any painting';
    document.body.appendChild(banner);
}

// ===== Dynamic Gallery =====
function paintingIdFromName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function renderGallery(paintings) {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = paintings.map(p => {
        const id = paintingIdFromName(p.name);
        const soldClass = p.sold ? ' sold-out' : '';
        const btnText = p.sold ? 'Sold Out' : 'Add to Cart';
        // Support both old single `image` field and new `images` array
        const imgs = p.images ? p.images.map(i => i.src || i) : [p.image];
        const firstImg = imgs[0];
        const multiImg = imgs.length > 1;
        const dotsHtml = multiImg
            ? `<div class="carousel-dots">${imgs.map((_, i) => `<span class="carousel-dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>`
            : '';
        const arrowsHtml = multiImg
            ? `<button class="carousel-btn carousel-prev" aria-label="Previous">&#8249;</button>
               <button class="carousel-btn carousel-next" aria-label="Next">&#8250;</button>`
            : '';
        return `
        <div class="painting-card${soldClass}" data-category="${p.category}" data-id="${id}" data-images='${JSON.stringify(imgs)}'>
            <div class="painting-image">
                <img src="${firstImg}" alt="${p.name} - Acrylic painting by Vaishali" loading="lazy">
                ${arrowsHtml}
                ${dotsHtml}
            </div>
            <div class="painting-info">
                <h3>${p.name}</h3>
                <p class="painting-medium">${p.medium}</p>
                <div class="painting-footer">
                    <span class="painting-price">${p.price}</span>
                    <button class="btn btn-small add-to-cart">${btnText}</button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Stagger fade-in
    document.querySelectorAll('.painting-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(32px)';
        card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    });
}

function initPaintingCards() {
    // Add to cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.painting-card');
            if (card.classList.contains('sold-out')) return;
            const name = card.querySelector('h3').textContent;
            const price = card.querySelector('.painting-price').textContent;
            cart.push({ name, price, paintingId: card.dataset.id });
            updateCartCount();
            renderCart();

            const rect = btn.getBoundingClientRect();
            const cartRect = document.querySelector('.cart-btn').getBoundingClientRect();
            const flyEl = document.createElement('div');
            flyEl.style.cssText = `position:fixed;width:14px;height:14px;background:var(--color-accent);border-radius:50%;z-index:9999;left:${rect.left + rect.width / 2}px;top:${rect.top}px;pointer-events:none;transition:all 0.7s cubic-bezier(0.25,0.46,0.45,0.94);`;
            document.body.appendChild(flyEl);
            requestAnimationFrame(() => {
                flyEl.style.left = cartRect.left + cartRect.width / 2 + 'px';
                flyEl.style.top = cartRect.top + 'px';
                flyEl.style.opacity = '0';
                flyEl.style.transform = 'scale(0.3)';
            });
            setTimeout(() => flyEl.remove(), 1000);

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

    // 3D tilt
    document.querySelectorAll('.painting-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = (y - rect.height / 2) / 15;
            const rotateY = (rect.width / 2 - x) / 15;
            card.style.transform = `translateY(-10px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 40px rgba(0,0,0,0.12)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });

    // Carousel
    document.querySelectorAll('.painting-card').forEach(card => {
        const imgs = JSON.parse(card.dataset.images || '[]');
        if (imgs.length <= 1) return;
        let current = 0;
        const img = card.querySelector('.painting-image img');
        const dots = card.querySelectorAll('.carousel-dot');

        function goTo(index) {
            current = (index + imgs.length) % imgs.length;
            img.style.opacity = '0';
            img.style.transform = 'scale(0.97)';
            setTimeout(() => {
                img.src = imgs[current];
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            }, 180);
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        card.querySelector('.carousel-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            goTo(current - 1);
        });
        card.querySelector('.carousel-next').addEventListener('click', (e) => {
            e.stopPropagation();
            goTo(current + 1);
        });
        dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goTo(i);
        }));
    });

    // Price counter animation
    document.querySelectorAll('.painting-price').forEach(el => priceObserver.observe(el));
}

fetch('/data/paintings.json')
    .then(r => r.json())
    .then(data => {
        renderGallery(data.paintings || []);
        initPaintingCards();
        // sold status is read directly from paintings.json (managed via /admin)
    })
    .catch(() => {
        document.getElementById('gallery-grid').innerHTML =
            '<p style="text-align:center;padding:60px;color:var(--color-text-muted)">Gallery coming soon.</p>';
    });

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

// ===== Gallery Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        let delay = 0;
        document.querySelectorAll('.painting-card').forEach((card) => {
            if (filter === 'all' || card.dataset.category === filter) {
                setTimeout(() => {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(40px) scale(0.9)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
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

// (3D tilt is initialised in initPaintingCards after dynamic gallery loads)

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

// (priceObserver.observe called in initPaintingCards after dynamic gallery loads)

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

// ===== Razorpay Checkout =====
const RAZORPAY_KEY_ID = 'rzp_live_SvmqTcVe3TN8Aj';
const WHATSAPP_NUMBER = '919457162999';

const checkoutPanel = document.querySelector('.checkout-panel');
const checkoutOverlay = document.querySelector('.checkout-overlay');
const checkoutForm = document.getElementById('checkout-form');

// Step 1: "Proceed to Checkout" opens shipping form
document.querySelector('.cart-checkout').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty. Add some paintings first!');
        return;
    }

    const total = cart.reduce((sum, item) => {
        return sum + parseInt(item.price.replace(/[^0-9]/g, ''));
    }, 0);

    document.querySelector('.checkout-total').textContent = '\u20B9' + total.toLocaleString('en-IN');

    closeCart();
    setTimeout(() => {
        checkoutPanel.classList.add('open');
        checkoutOverlay.classList.add('open');
    }, 300);
});

// Close checkout panel
document.querySelector('.checkout-close').addEventListener('click', closeCheckout);
checkoutOverlay.addEventListener('click', closeCheckout);

function closeCheckout() {
    checkoutPanel.classList.remove('open');
    checkoutOverlay.classList.remove('open');
}

// Step 2: Submit shipping form then open Razorpay
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const shippingInfo = {
        name: document.getElementById('ship-name').value,
        phone: document.getElementById('ship-phone').value,
        email: document.getElementById('ship-email').value,
        address: document.getElementById('ship-address').value,
        city: document.getElementById('ship-city').value,
        pincode: document.getElementById('ship-pincode').value,
        state: document.getElementById('ship-state').value,
    };

    const total = cart.reduce((sum, item) => {
        return sum + parseInt(item.price.replace(/[^0-9]/g, ''));
    }, 0);

    const payBtn = document.querySelector('.checkout-pay-btn');
    payBtn.textContent = 'Processing...';
    payBtn.style.opacity = '0.7';

    try {
        const response = await fetch('/.netlify/functions/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: total,
                currency: 'INR',
                receipt: 'rang_' + Date.now()
            })
        });

        const order = await response.json();

        if (!response.ok) {
            throw new Error(order.error || 'Failed to create order');
        }

        if (!order.id) {
            throw new Error('Order ID missing from server response');
        }

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Rang by Vaishali',
            description: cart.map(item => item.name).join(', '),
            order_id: order.id,
            prefill: {
                name: shippingInfo.name,
                email: shippingInfo.email,
                contact: shippingInfo.phone
            },
            theme: { color: '#8b5e3c' },
            handler: async function (paymentResponse) {
                try {
                    const verifyRes = await fetch('/.netlify/functions/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(paymentResponse)
                    });
                    const verifyData = await verifyRes.json();
                    if (!verifyRes.ok || !verifyData.verified) {
                        alert('Payment verification failed. Please contact us with your Payment ID: ' + paymentResponse.razorpay_payment_id);
                        return;
                    }
                } catch (err) {
                    console.error('Verification error:', err);
                    alert('Could not verify payment. Please contact us with your Payment ID: ' + paymentResponse.razorpay_payment_id);
                    return;
                }
                closeCheckout();
                sendOrderNotification(shippingInfo, paymentResponse);
                showPaymentSuccess(paymentResponse, shippingInfo);
                cart = [];
                updateCartCount();
                renderCart();
                checkoutForm.reset();
            },
            modal: {
                ondismiss: function () {
                    payBtn.textContent = 'Pay Now';
                    payBtn.style.opacity = '1';
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
        payBtn.textContent = 'Pay Now';
        payBtn.style.opacity = '1';

    } catch (error) {
        console.error('Checkout error:', error);
        payBtn.textContent = 'Pay Now';
        payBtn.style.opacity = '1';
        alert('Something went wrong. Please try again or contact us on WhatsApp.');
    }
});

// Step 3: Automatically send order details to Vaishali (server-side)
async function sendOrderNotification(shipping, payment) {
    const total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/[^0-9]/g, '')), 0);

    try {
        await fetch('/.netlify/functions/send-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shipping: shipping,
                items: cart.map(item => ({ name: item.name, price: item.price })),
                total: total.toLocaleString('en-IN'),
                paymentId: payment.razorpay_payment_id
            })
        });
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
}

// Payment success screen
function showPaymentSuccess(response, shipping) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(250,248,245,0.97);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;';
    overlay.innerHTML = '<div style="text-align:center;padding:40px;max-width:500px;">' +
        '<div style="font-size:4rem;margin-bottom:16px;">🎨</div>' +
        '<h2 style="font-family:Cormorant Garamond,serif;font-size:2.5rem;margin-bottom:12px;color:#2c2c2c;">Thank You, ' + shipping.name + '!</h2>' +
        '<p style="color:#6b6b6b;font-size:1.1rem;margin-bottom:8px;">Your payment was successful.</p>' +
        '<p style="color:#6b6b6b;font-size:0.9rem;margin-bottom:8px;">Your painting will be carefully packed and shipped to:</p>' +
        '<p style="color:#2c2c2c;font-size:0.9rem;margin-bottom:20px;font-weight:500;">' + shipping.address + ', ' + shipping.city + ' - ' + shipping.pincode + '</p>' +
        '<p style="color:#8b5e3c;font-size:0.8rem;margin-bottom:32px;">Payment ID: ' + response.razorpay_payment_id + '</p>' +
        '<p style="color:#6b6b6b;font-size:0.85rem;margin-bottom:24px;">Vaishali will contact you on WhatsApp with shipping updates 📦</p>' +
        '<button onclick="this.parentElement.parentElement.remove()" style="padding:14px 32px;background:#8b5e3c;color:#fff;border:none;border-radius:2px;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">Continue Browsing</button>' +
        '</div>';
    document.body.appendChild(overlay);
    setTimeout(() => createConfetti(overlay.querySelector('button')), 300);
}
