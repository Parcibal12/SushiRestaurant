class ContactPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/contact/contact.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/contact/contact.html').then(res => res.text());

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
    }
}

customElements.define('contact-page', ContactPage);