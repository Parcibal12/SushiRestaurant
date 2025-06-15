class UserActions extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        Promise.all([
            fetch('/frontend/blocks/user-actions/user-actions.html').then(response => response.text()),
            fetch('/frontend/blocks/user-actions/user-actions.css').then(response => response.text())
        ]).then(([html, css]) => {
            this.shadowRoot.innerHTML = `
                <style>
                    /* Importamos Font Awesome dentro del Shadow DOM */
                    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
                    ${css}
                </style>
                ${html}
            `;
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}

customElements.define('user-actions', UserActions);