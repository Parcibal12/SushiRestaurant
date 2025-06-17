class UserActions extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        Promise.all([
            fetch('/frontend/blocks/user-actions/user-actions.html').then(response => response.text()),
            fetch('/frontend/blocks/user-actions/user-actions.css').then(response => response.text())
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

customElements.define('user-actions', UserActions);