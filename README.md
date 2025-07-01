# Restaurante de Sushi "Qitchen"
Este repositorio contiene el código fuente completo para la aplicación web de restaurante de sushi "Qitchen". El proyecto ha sido desarrollado siguiendo una metodología "Frontend First", utilizando un backend robusto en Node.js, Express y sequelize (ORM) y un frontend interactivo en Vanilla JS, HTML y CSS de acuerdo a las especificaciones del proyecto.

---

## 1. ESTRUCTURA

El proyecto está organizado en 2 carpetas principales, `frontend` y `backend`, para una clara separación de responsabilidades, hay una carpeta más de assets en la que se encuentran las imágenes que se utilizaron.

    ```├── backend/
    │   ├── src/
    │   │   ├── config/       # Configuración de la base de datos (db.js, supabase.js)
    │   │   ├── controllers/  # Lógica de negocio
    │   │   ├── middleware/   # Funciones intermedias
    │   │   ├── models/       # Definiciones de los modelos de datos con Sequelize
    │   │   ├── routes/      
    │   │   └── seeders/      # Scripts para poblar la base de datos
    │   └── .env              # (Archivo local) Variables de entorno y credenciales
    │
    └── frontend/
    ├── assets/           # (Fuera de frontend) Íconos e imágenes
    ├── blocks/           # Componentes de la UI (BEM), cada uno con su HTML, CSS y JS
    │   ├── auth/
    │   ├── blog/
    │   ├── cart/
    │   └── ...
    └── index.html
    ```
## 2. PATRONES DE DISEÑO

Se implementaron patrones de diseño para mejorar la estructura, mantenibilidad y escalabilidad del código, siguiendo las mejores prácticas para una aplicación web moderna.

### Patrones Frontend

#### a) Patrón Componente
* **Qué hace?** Permite crear tus propias etiquetas HTML personalizadas que encapsulan su propio HTML, CSS y JavaScript, funcionando como unidades autocontenidas y reutilizables.
* **Para qué sirve?** Para modularizar la interfaz de usuario. Manteniendo el código organizado y fácil de mantener.
* **Por qué lo implementamos?** Para organizar la interfaz de usuario en bloques pequeños y manejables, reducir la repetición de código y asegurar que cada parte de la UI sea independiente y fácil de actualizar.
* **Dónde lo implementamos?** En la mayoría de los archivos JS dentro de la carpeta `frontend/blocks/`.
* **Pseudo-código (Ejemplo en user-actions.js):**
    ```
    // Definición
    class UserActions extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' }); // Encapsula el componente
            // Carga HTML y CSS, luego inicia la lógica
            // ...
        }
        // ... métodos como updateAuthStatus para la lógica del componente
    }
    customElements.define('user-actions', UserActions); // Registra el componente para usarlo en HTML
    ```

#### b) Patrón Router 
* **Qué hace?** Gestiona la navegación interna de la SPA utilizando la parte "hash" de la URL.
* **Para qué sirve?** Para crear una experiencia de usuario fluida y rápida, sin recargar la página completa al cambiar de página.
* **Por qué lo implementamos?** Para proporcionar una navegación rápida y sin interrupciones, mejorando la experiencia del usuario.
* **Dónde lo implementamos** En el archivo `frontend/services/router.js`.
* **Pseudo-código:**
    ```
    const routes = {
        '/': 'home-page',
        '/blog/:id': 'blog-post-view'
    };

    const handleLocation = async () => {
        const path = window.location.hash.substring(1) || '/';
        let componentTag = routes[path] || 'home-page';
        // ... 
        const pageComponent = document.createElement(componentTag);
        document.getElementById('app-root').innerHTML = '';
        document.getElementById('app-root').appendChild(pageComponent);
    };

    window.addEventListener('hashchange', handleLocation);
    window.addEventListener('DOMContentLoaded', handleLocation);
    ```

#### c) Patrón Fachada
* **Qué hace?** Proporciona una interfaz simplificada y unificada para interactuar con un subsistema más complejo la API.
* **Para qué sirve?** Sirve para reducir la complejidad en los componentes del frontend al interactuar con el backend. Centraliza la lógica común de comunicación (como añadir tokens de autenticación, configurar encabezados, manejar respuestas y errores).
* **Por qué lo implementamos?** Para evitar la repetición de código de las llamadas `fetch` y sus configuraciones en cada componente.
* **Dónde lo implementamos?** `frontend/services/api-service.js`.
* **Pseudo-código:**
    ```
    // api-service.js
    const getAuthHeaders = () => {..};
    export const ApiService = {
        async getProfile() {
            const response = await fetch('/api/auth/profile', { headers: getAuthHeaders() });
            return response.json();
        },
        async likeBlogPost(postId) {
            const response = await fetch(`/api/blog/${postId}/like`, { method: 'POST', headers: getAuthHeaders() });
            return response.json();
        }
    };

    // Uso en un componente
    import { ApiService } from '../../services/api-service.js';
    const userProfile = await ApiService.getProfile();
    const likeResult = await ApiService.likeBlogPost(postId);
    ```


#### d) Patrón Observer
* **Qué hace?** Permite que un objeto ("publicador" o "sujeto") notifique automáticamente a otros objetos ("suscriptores") sobre cambios en su estado, sin que los suscriptores necesiten revisar constantemente ese estado o tener una dependencia directa con el publicador.
* **Para qué sirve?** Sirve para desacoplar la lógica que inicia un cambio de la lógica que reacciona a ese cambio, ideal para sincronizar estados en la interfaz de usuario donde un cambio en un lugar necesita ser reflejado en múltiples otros lugares.
* **Por qué lo implementamos?** Para gestionar la actualización del contador de likes de los posts. Cuando un like cambia, el LikeEventManager (publicador) emite un evento, y BlogPage (suscriptor) lo escucha para actualizar la UI de las tarjetas de posts.
* **Dónde lo implementamos?** `frontend/services/LikeEventManager.js` (el publicador) y en `frontend/blocks/blog/list/blog-page.js` (suscriptor).
* **Pseudo-código:**
    ```
    const listeners = [];
    export const LikeEventManager = {
        subscribe: (callback) => { listeners.push(callback); /* ... */ },
        publish: (eventData) => { listeners.forEach(callback => callback(eventData)); }
    };

    // blog-page.js
    import { LikeEventManager } from '../../../services/LikeEventManager.js';

    class BlogPage extends HTMLElement {
        connectedCallback() {
            // ..
            LikeEventManager.subscribe(this.handleLikeUpdateEvent.bind(this));
        }

        async handlePostActions(event) {
            // Lógica para llamar a la API de like
            LikeEventManager.publish({ postId: postId, newLikeCount: result.newLikeCount, liked: result.liked });
        }

        handleLikeUpdateEvent(eventData) {
            const postCard = this.shadowRoot.querySelector(`.post-card[data-post-id="${eventData.postId}"]`);
            if (postCard) { /* .. */ }
        }
    }
    ```

### Patrones Backend

#### a) Patrón MVC
* **Qué hace?** Divide la aplicación en tres componentes principales:
    * **Modelos:** Representan los datos y la lógica de negocio asociada.
    * **Vistas:** Se encargan de la presentación de los datos.
    * **Controladores:** Manejan las peticiones del cliente, interactúan con los Modelos para obtener/manipular datos, y preparan la respuesta.
* **Para qué sirve?** Sirve para separar las responsabilidades del código.
* **Por qué lo implementamos?** Para estructurar el backend de la API RESTful de una manera clara y estándar.
* **Dónde lo implementamos?**
    * **Modelos:** `backend/src/models/`
    * **Vistas:** `backend/src/routes/`
    * **Controladores:**`backend/src/controllers/`
    * Se orquesta en `backend/src/server.js`.
* **Pseudo-código:**
    ```
    // Controlador blogController.js
    const BlogPost = require('../models/BlogPost'); // Modelo

    exports.getPostById = async (req, res) => { // Controlador recibe la petición
        const postId = req.params.id;
        const post = await BlogPost.findByPk(postId); // Interactúa con el modelo
        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }
        res.json(post);
    }
    ```

#### b) Patrón repositorio
* **Qué hace?** Abstrae la lógica de acceso a datos, en lugar de escribir consultas de base de datos directamente, la aplicación interactúa con "colecciones" de objetos (los modelos de Sequelize) que se encargan de los detalles de la comunicación con la base de datos.
* **Para qué sirve?** Sirve para desacoplar la lógica de negocio de los detalles específicos de la base de datos.
* **¿Dónde lo implementamos?** Principalmente en los archivos de tus **Modelos** en `backend/src/models/`  y en cómo los **Controladores**los utilizan para realizar operaciones de base de datos.
* **Pseudo-código:**
    ```
    const BlogPost = require('../models/BlogPost'); 

    exports.getAllPosts = async (req, res) => {
        const posts = await BlogPost.findAll();
        res.json(posts);
    }
    ```

#### c) Patrón Middleware
* **Qué hace?** Son funciones que tienen acceso a la petición (`req`), la respuesta (`res`) y a la siguiente función en el ciclo de petición/respuesta de Express.
* **Para qué sirve?** Sirve para realizar tareas comunes y transversales a múltiples rutas de forma modular y organizada.
* **Por qué lo implementamos?** Para añadir funcionalidades como la autenticación o el manejo de cuerpos JSON a las peticiones HTTP de forma modular y reutilizable en tu aplicación Express, sin duplicar código en cada controlador.
* **Dónde lo implementamos?** `backend/src/middleware/` . Se "usan" o "aplican" en los archivos de **rutas** donde authMiddleware protege las rutas y en el archivo principal del servidor server.js.
* **Pseudo-código:**
    ```
    const jwt = require('jsonwebtoken');
    module.exports = function(req, res, next) {
        const token = req.header('Authorization');
        if (!token) return res.status(401).json({ message: 'Acceso denegado.' });
        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
            req.user = decoded.user;
            next(); // Pasa la petición
        } catch (error) {
            res.status(401).json({ message: 'Token no válido.' });
        }
    };

    const authMiddleware = require('../middleware/authMiddleware');
    router.post('/', authMiddleware, blogController.createPost); // La petición pasa primero por authMiddleware
    ```

---
---
## 3. BASE DE DATOS (Esquema)

La aplicación utiliza una base de datos PostgreSQL con las siguientes tablas y relaciones principales:

* **Users**
    * `id` (PK, SERIAL)
    * `name` (VARCHAR)
    * `email` (VARCHAR, UNIQUE)
    * `password_hash` (VARCHAR)

* **Categories**
    * `id` (PK, SERIAL)
    * `name` (VARCHAR, UNIQUE)

* **Products**
    * `id` (PK, SERIAL)
    * `name` (VARCHAR)
    * `description` (TEXT)
    * `price` (DECIMAL)
    * `imageUrl` (VARCHAR)
    * `category_id` (FK -> Categories.id)

* **BlogPosts**
    * `id` (PK, SERIAL)
    * `title` (VARCHAR)
    * `content` (TEXT)
    * `imageUrl` (VARCHAR)
    * `authorId` (FK -> Users.id)

* **Likes**
    * `id` (PK, SERIAL)
    * `userId` (FK -> Users.id)
    * `blogPostId` (FK -> BlogPosts.id)

* **Orders**
    * `id` (PK, SERIAL)
    * `total_price` (DECIMAL)
    * `status` (VARCHAR)
    * `userId` (FK -> Users.id)

* **OrderItems**
    * `id` (PK, SERIAL)
    * `quantity` (INTEGER)
    * `price` (DECIMAL)
    * `OrderId` (FK -> Orders.id)
    * `ProductId` (FK -> Products.id)

* **Reservations**
    * `id` (PK, SERIAL)
    * `name` (VARCHAR)
    * `contact_info` (VARCHAR)
    * `reservation_date` (DATETIME)
    * `guest_count` (INTEGER)
    * `userId` (FK -> Users.id, NULLABLE)

---
## 4. Documentación

La aplicación es una plataforma web diseñada para la gestión de un restaurante de sushi. Permite a los clientes explorar el menú, realizar pedidos, hacer reservas y participar en una comunidad a través de un blog interactivo.

* **Tecnologías Frontend:** Vanilla JavaScript, HTML5, CSS3, Metodología BEM.
* **Tecnologías Backend:** Node.js, Express.js, Sequelize (ORM), PostgreSQL.
* **Seguridad:** Autenticación basada en JWT y hasheo de contraseñas con bcrypt.
* **Cloud:** La base de datos está alojada en Supabase (PostgreSQL) y el almacenamiento de imágenes en Supabase Storage.

## 5. PASOS A SEGUIR

### Prerrequisitos
1. Node.js y npm
2. Git: Para clonar el repositorio.
3. Cuenta de Supabase: Necesaria para obtener las credenciales de la base de datos PostgreSQL y el servicio de almacenamiento de imágenes.

Las dependencias específicas del proyecto (como Express, Sequelize, etc.) están listadas en el archivo `backend/package.json` y se instalan automáticamente con el comando `npm install`.

### Backend
1.  Instalar las dependencias: `npm install`.
2.  En archivo `.env` en la raíz de `/backend` y añadir las siguientes variables con tus credenciales:
    ```
    DATABASE_URL="tu_cadena_de_conexion_de_supabase"
    JWT_SECRET="tu_clave_secreta_para_jwt"
    SUPABASE_URL="la_url_de_tu_proyecto_supabase"
    SUPABASE_SERVICE_KEY="la_service_key_de_supabase"
    ```
3.  Poblar la base de datos con datos iniciales: `npm run seed`.
4.  Iniciar el servidor de desarrollo: `npm run dev`.

### Frontend
1.  Para visualizar los archivos se recomienda usar una extensión como Live Server.

## 8. Link al Figma
https://www.figma.com/design/h0oMWdLowNGfgjJXKEnkMN/web-app-exam-1--Copy-?node-id=0-1&t=zBMnpto3W9jC7Ulp-1


## Documento-defensa: https://docs.google.com/document/d/1m-xTO4YaFuU-afLMi9rXy0nmQ6Zvxn1sCBWeyKWdZQk/edit?usp=sharing
