class SushiHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        Promise.all([
            fetch('/frontend/blocks/header/header.html').then(response => response.text()),
            fetch('/frontend/blocks/header/header.css').then(response => response.text())
        ]).then(([html, css]) => {
            this.shadowRoot.innerHTML = `
                <style>${css}</style>
                ${html}
            `;
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}

customElements.define('sushi-header', SushiHeader);