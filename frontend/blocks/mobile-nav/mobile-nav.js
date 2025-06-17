class MobileNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;

        Promise.all([
            fetch('/frontend/blocks/mobile-nav/mobile-nav.html').then(res => res.text()),
            fetch('/frontend/blocks/mobile-nav/mobile-nav.css').then(res => res.text())
        ]).then(([html, css]) => {
            this.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
            this.navElement = this.shadowRoot.querySelector('.mobile-nav');
            this.shadowRoot.querySelector('.mobile-nav__close-btn').addEventListener('click', () => this.toggle());
        }).catch(error => console.error('Error:', error));
    }

    connectedCallback() {
        document.addEventListener('toggleMobileMenu', () => this.toggle());
    }

    disconnectedCallback() {
        document.removeEventListener('toggleMobileMenu', () => this.toggle());
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.navElement.classList.add('is-open');
        } else {
            this.navElement.classList.remove('is-open');
        }
    }
}
customElements.define('mobile-nav', MobileNav);