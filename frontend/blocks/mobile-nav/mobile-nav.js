class MobileNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/mobile-nav/mobile-nav.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/mobile-nav/mobile-nav.html').then(res => res.text());

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
        
        this.addEventListeners();
    }

    addEventListeners() {
        const closeButton = this.shadowRoot.querySelector('.mobile-nav__close-btn');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.toggle(false));
        }

        const links = this.shadowRoot.querySelectorAll('.mobile-nav__link');
        links.forEach(link => {
            link.addEventListener('click', () => this.toggle(false));
        });
    }

    toggle(forceState) {
        this.isOpen = (forceState !== undefined) ? forceState : !this.isOpen;
        
        const mobileNavElement = this.shadowRoot.querySelector('.mobile-nav');
        if (mobileNavElement) {

            mobileNavElement.classList.toggle('is-open', this.isOpen);
        }
    }
}

customElements.define('mobile-nav', MobileNav);