// GitHub-Style CV - Interactive Features

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = html.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Generate Contribution Graph
function generateContributionGraph() {
    const graph = document.getElementById('contributions-graph');
    if (!graph) return;
    
    const weeks = 53;
    const daysPerWeek = 7;
    
    // Generate contribution data (simulated)
    for (let week = 0; week < weeks; week++) {
        for (let day = 0; day < daysPerWeek; day++) {
            const cell = document.createElement('div');
            cell.className = 'contribution-day';
            
            // Simulate contribution levels (0-4)
            // Higher activity in recent months
            const recentBoost = week > 40 ? 1 : 0;
            const randomLevel = Math.floor(Math.random() * (5 + recentBoost));
            const level = Math.min(randomLevel, 4);
            
            // Set background color based on level
            const colors = [
                'var(--contrib-level-0)',
                'var(--contrib-level-1)',
                'var(--contrib-level-2)',
                'var(--contrib-level-3)',
                'var(--contrib-level-4)'
            ];
            
            cell.style.backgroundColor = colors[level];
            
            // Add tooltip
            const contributions = level * Math.floor(Math.random() * 5 + 1);
            cell.title = `${contributions} contributions`;
            
            graph.appendChild(cell);
        }
    }
}

// Animate stats on scroll
function animateStats() {
    const statCards = document.querySelectorAll('.stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Animate numbers
                const valueElement = entry.target.querySelector('.stat-value');
                if (valueElement) {
                    animateValue(valueElement);
                }
            }
        });
    }, { threshold: 0.5 });
    
    statCards.forEach(card => observer.observe(card));
}

function animateValue(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasPercent = text.includes('%');
    const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
    
    if (isNaN(numericValue)) return;
    
    const duration = 1000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        
        // Format with commas for large numbers
        if (displayValue >= 1000) {
            displayValue = displayValue.toLocaleString();
        }
        
        // Add back symbols
        if (hasPlus && current >= numericValue) {
            displayValue += '+';
        }
        if (hasPercent) {
            displayValue += '%';
        }
        
        element.textContent = displayValue;
    }, duration / steps);
}

// Animate language bars on scroll
function animateLanguageBars() {
    const languageBars = document.querySelectorAll('.language-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.language-fill');
                if (fill) {
                    const width = fill.style.width;
                    fill.style.width = '0%';
                    setTimeout(() => {
                        fill.style.width = width;
                    }, 100);
                }
            }
        });
    }, { threshold: 0.5 });
    
    languageBars.forEach(bar => observer.observe(bar));
}

// Fade in sections on scroll
function fadeInOnScroll() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add typing effect to profile title
function typingEffect() {
    const titleElement = document.querySelector('.profile-title');
    if (!titleElement) return;
    
    const originalText = titleElement.innerHTML;
    const emoji = titleElement.querySelector('.emoji');
    const emojiHTML = emoji ? emoji.outerHTML : '';
    const textContent = titleElement.textContent.replace('🤖', '').trim();
    
    titleElement.innerHTML = emojiHTML;
    
    let index = 0;
    const speed = 50;
    
    function type() {
        if (index < textContent.length) {
            const currentText = titleElement.textContent.replace('🤖', '').trim();
            titleElement.innerHTML = emojiHTML + ' ' + textContent.substring(0, index + 1);
            index++;
            setTimeout(type, speed);
        }
    }
    
    setTimeout(type, 500);
}

// Add hover effect to pinned cards
function setupPinnedCardEffects() {
    const pinnedCards = document.querySelectorAll('.pinned-card');
    
    pinnedCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px) scale(1)';
        });
    });
}

// Print functionality
function setupPrintButton() {
    // Add print button if needed
    const printBtn = document.createElement('button');
    printBtn.innerHTML = '<i class="fas fa-print"></i>';
    printBtn.className = 'print-button';
    printBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: var(--shadow-md);
        z-index: 999;
        transition: all 0.3s ease;
    `;
    
    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    printBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.backgroundColor = 'var(--accent-primary)';
        this.style.color = 'white';
    });
    
    printBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.backgroundColor = 'var(--bg-secondary)';
        this.style.color = 'var(--text-primary)';
    });
    
    document.body.appendChild(printBtn);
}

// Add parallax effect to header
function setupParallax() {
    const header = document.querySelector('.profile-header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        header.style.transform = `translateY(${rate}px)`;
    });
}

// Add copy email functionality
function setupCopyEmail() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const email = link.href.replace('mailto:', '');
            
            // Try to copy to clipboard
            if (navigator.clipboard) {
                e.preventDefault();
                navigator.clipboard.writeText(email).then(() => {
                    // Show tooltip
                    const tooltip = document.createElement('div');
                    tooltip.textContent = 'Email copied!';
                    tooltip.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: var(--success-color);
                        color: white;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-size: 14px;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                    `;
                    
                    document.body.appendChild(tooltip);
                    
                    setTimeout(() => {
                        tooltip.style.opacity = '0';
                        setTimeout(() => tooltip.remove(), 300);
                    }, 2000);
                });
            }
        });
    });
}

// Add loading animation
function showLoadingAnimation() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.style.opacity = '0';
    
    setTimeout(() => {
        container.style.transition = 'opacity 0.6s ease';
        container.style.opacity = '1';
    }, 100);
}

// Initialize all features
function init() {
    // Show loading animation
    showLoadingAnimation();
    
    // Generate contribution graph
    generateContributionGraph();
    
    // Setup animations
    animateStats();
    animateLanguageBars();
    fadeInOnScroll();
    
    // Setup interactions
    setupSmoothScroll();
    setupPinnedCardEffects();
    setupPrintButton();
    setupCopyEmail();
    
    // Optional effects (can be disabled if too much)
    // typingEffect();
    // setupParallax();
    
    // Add fade-in class to initial visible elements
    setTimeout(() => {
        const initialElements = document.querySelectorAll('.profile-header, .stats-overview');
        initialElements.forEach(el => el.classList.add('fade-in'));
    }, 200);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
    
    // Ctrl/Cmd + T for theme toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        themeToggle.click();
    }
});

// Export to PDF functionality (optional)
function exportToPDF() {
    // This would require a library like html2pdf.js
    // For now, just use browser's print to PDF
    window.print();
}

// Add scroll progress indicator
function addScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--accent-primary), var(--success-color));
        z-index: 10000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize scroll progress
addScrollProgress();

console.log('🚀 GitHub-Style CV loaded successfully!');
console.log('💡 Keyboard shortcuts:');
console.log('   Ctrl/Cmd + P: Print');
console.log('   Ctrl/Cmd + T: Toggle theme');
