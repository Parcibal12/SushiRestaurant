class AboutPage extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({ mode: 'open' });

        const styles = document.createElement("style");
        this.shadowRoot.appendChild(styles);

        async function loadCSS() {
            const request = await fetch('/frontend/blocks/about/about.css');
            const css = await request.text();
            styles.textContent = css;
        }
        loadCSS();
    }

    connectedCallback(){
        const contentContainer = document.createElement('div');
        this.shadowRoot.appendChild(contentContainer);

        fetch('/frontend/blocks/about/about.html')
            .then(res => res.text())
            .then(html => {
                contentContainer.innerHTML = html;
            })


    }
}

customElements.define('about-page', AboutPage);