class AboutPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const html = await fetch('/frontend/blocks/about/about.html').then(res => res.text());
        const css = await fetch('/frontend/blocks/about/about.css').then(res => res.text());


        this.shadowRoot.innerHTML = `
            <style>
                ${css}
            </style>
            ${html}
        `;
    }
}

customElements.define('about-page', AboutPage);