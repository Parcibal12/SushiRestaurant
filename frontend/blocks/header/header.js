class SushiHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        Promise.all([
            fetch('/frontend/blocks/header/header.html').then(response => response.text()),
            fetch('/frontend/blocks/header/header.css').then(response => response.text())
        ]).then(([html, css]) => {
            this.shadowRoot.innerHTML = `
                <style>
                    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
                    ${css}
                </style>
                ${html}
            `;
            this.shadowRoot.querySelector('.header__toggle').addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('toggleMobileMenu'));
            });
        }).catch(error => console.error('Error:', error));
    }
}
customElements.define('sushi-header', SushiHeader);