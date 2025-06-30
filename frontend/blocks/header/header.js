class SushiHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/header/header.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/header/header.html').then(res => res.text());

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;

        this.addEventListeners();
    }

    addEventListeners() {
        const toggleButton = this.shadowRoot.querySelector('.header__toggle');
        const mobileNav = document.querySelector('mobile-nav'); 

        if (toggleButton && mobileNav) {
            toggleButton.addEventListener('click', () => {
                mobileNav.toggle();
            });
        }
    }
}

customElements.define('sushi-header', SushiHeader);