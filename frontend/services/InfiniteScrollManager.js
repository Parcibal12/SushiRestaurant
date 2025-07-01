class InfiniteScrollManager {
    constructor(callbackObtenerDatos, objetivoObservador, itemsPorPaginaInicial = 10, elementoRaizScroll = null) {
        if (typeof callbackObtenerDatos !== 'function') {
            this.esValido = false; 
            return; 
        }
        if (!(objetivoObservador instanceof HTMLElement)) {
            this.esValido = false;
            return;
        }
        if (elementoRaizScroll !== null && !(elementoRaizScroll instanceof HTMLElement)) {
            this.esValido = false;
            return;
        }

        this.callbackObtenerDatos = callbackObtenerDatos;
        this.objetivoObservador = objetivoObservador;
        this.itemsPorPagina = itemsPorPaginaInicial;
        this.elementoRaizScroll = elementoRaizScroll || window;

        this.datos = [];
        this.paginaActual = 0;
        this.hayMas = true;
        this.estaCargando = false;
        this.filtroActual = 'all';

        this.callbackDatosCargados = null;
        this.callbackEstadoCargaCambiado = null;

        this.oyenteScroll = this.handleScroll.bind(this);
        this.esValido = true; 
    }

    async init(callbackDatosCargados, callbackEstadoCargaCambiado) {
        if (!this.esValido) {
            return;
        }
        if (typeof callbackDatosCargados !== 'function') {
            return; 
        }
        this.callbackDatosCargados = callbackDatosCargados;
        this.callbackEstadoCargaCambiado = callbackEstadoCargaCambiado;

        this.setupScrollListener();
        await this.loadItems(true);
    }

    setupScrollListener() {
        this.disconnect(); 
        this.elementoRaizScroll.addEventListener('scroll', this.oyenteScroll);
    }

    handleScroll() {
        const alturaScroll = this.elementoRaizScroll === window 
            ? document.documentElement.scrollHeight 
            : this.elementoRaizScroll.scrollHeight;
        
        const posicionScrollTop = this.elementoRaizScroll === window 
            ? window.scrollY || document.documentElement.scrollTop 
            : this.elementoRaizScroll.scrollTop;
        
        const alturaCliente = this.elementoRaizScroll === window 
            ? window.innerHeight || document.documentElement.clientHeight 
            : this.elementoRaizScroll.clientHeight;

        const cercaDelFinal = (posicionScrollTop + alturaCliente + 200) >= alturaScroll;

        if (cercaDelFinal && this.hayMas && !this.estaCargando) {
            this.loadItems(false);
        }
    }

    async loadItems(reset = false) {
        if (!this.esValido) {
            return;
        }
        if (this.estaCargando || (!this.hayMas && !reset)) {
            return; 
        }

        this.estaCargando = true;
        this.callbackEstadoCargaCambiado && this.callbackEstadoCargaCambiado(true);

        if (reset) {
            this.datos = [];
            this.paginaActual = 0;
            this.hayMas = true;
        }

        const desplazamiento = this.paginaActual * this.itemsPorPagina;

        try {
            const { items: elementos, total: totalElementos, hasMore: hayMas } = await this.callbackObtenerDatos(
                this.itemsPorPagina,
                desplazamiento,
                this.filtroActual
            );
            
            this.datos = [...this.datos, ...elementos];
            this.hayMas = hayMas;
            this.paginaActual++;

            this.callbackDatosCargados(this.datos, this.hayMas);

        } catch (error) {
            this.hayMas = false; 
            this.callbackDatosCargados([], false); 
        } finally {
            this.estaCargando = false;
            this.callbackEstadoCargaCambiado && this.callbackEstadoCargaCambiado(false);
        }
    }

    async applyFilter(nuevoFiltro) {
        if (this.estaCargando && nuevoFiltro === this.filtroActual) return;

        this.filtroActual = nuevoFiltro;
        await this.loadItems(true);
    }

    disconnect() {
        if (this.elementoRaizScroll && this.oyenteScroll) {
            this.elementoRaizScroll.removeEventListener('scroll', this.oyenteScroll);
        }
    }

    get currentData() {
        return this.datos;
    }
    get isCurrentlyLoading() {
        return this.estaCargando;
    }
    get hasMoreData() {
        return this.hayMas;
    }
    get activeFilter() {
        return this.filtroActual;
    }
}

export default InfiniteScrollManager;