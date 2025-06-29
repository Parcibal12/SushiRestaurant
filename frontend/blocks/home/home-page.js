class HomePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/home/home.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/home/home.html').then(res => res.text());

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
    }
}

customElements.define('home-page', HomePage);