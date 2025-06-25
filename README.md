# Restaurante de Sushi "Qitchen"
Este repositorio contiene el código fuente completo para la aplicación web de restaurante de sushi "Qitchen". El proyecto ha sido desarrollado siguiendo una metodología "Frontend First", utilizando un backend robusto en Node.js, Express y sequelize (ORM) y un frontend interactivo en Vanilla JS, HTML y CSS de acuerdo a las especificaciones del proyecto.

---

## 1. ESTRUCTURA

El proyecto está organizado en 2 carpetas principales, `frontend` y `backend`, para una clara separación de responsabilidades, hay una carpeta más de assets en la que se encuentran las imágenes que se utilizaron.

    ```
├── backend/
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

Se implementaron patrones de diseño para mejorar la estructura, mantenibilidad y escalabilidad del código.

### Patrones backend

#### a) Patrón MVC
* **Justificación:** Separa la lógica de datos Modelo, la lógica de negocio Controlador y la representación de los datos, haciendo el código más limpio y fácil de mantener.
* **Ubicación:**
    * **Modelos:** Carpeta `backend/src/models/` (ej: `User.js`, `Product.js`).
    * **Vistas:** Las respuestas **JSON** generadas por los controladores (ej: `res.json(...)`).
    * **Controladores:** Carpeta `backend/src/controllers/` (ej: `blogController.js`).
* **Pseudo-código:**
    ```javascript
    // Controlador (recibe la petición)
    exports.getPost = async (req, res) => {
        // Habla con el Modelo para obtener datos
        const post = await BlogPost.findByPk(req.params.id);
        // Envía la Vista (JSON)
        res.json(post);
    }
    ```

#### b) Patrón Repository
* **Justificación:** Abstrae el acceso a la base de datos. En lugar de escribir SQL crudo, interactuamos con objetos que representan nuestras tablas. Esto se logra a través del ORM **Sequelize**.
* **Ubicación:** Se implementa implícitamente en los **Controladores** cada vez que se usa un modelo de Sequelize.
* **Pseudo-código:**
    ```javascript
    // El controlador usa el Repositorio de BlogPost para buscar todos los posts sin saber nada de SQL
    const posts = await BlogPost.findAll();
    ```

### Patrones frontend

#### a) Patrón Fachada
* **Justificación:** Se implementó para simplificar la comunicación con el backend, oculta la complejidad de las llamadas `fetch` (configuración de `headers`, `body`, token de autorización, etc.).
* **Ubicación:** `frontend/utils/api.js`
* **Pseudo-código:**
    ```javascript
    // El código principal no necesita saber cómo funciona fetch, simplemente llama a la función de la Fachada.
    import { blogApi } from './utils/api.js';

    const misPosts = await blogApi.getMyPosts();
    ```

#### b) Patrón Módulo
* **Justificación:** Para organizar el código en piezas lógicas y reutilizables, evitando un único archivo gigante. Cada archivo tiene una responsabilidad única y solo expone lo necesario mediante `export`.
* **Ubicación:** En todo el frontend. Por ejemplo, `blog.js` importa funcionalidades desde `api.js`.
* **Pseudo-código:**
    ```javascript
    // api.js
    export const blogApi = { /* ... */ };

    // blog.js
    import { blogApi } from '../utils/api.js';
    ```

#### c) Patrón Factory
* **Justificación:** Se utilizó para centralizar y simplificar la creación de elementos DOM complejos, como las tarjetas de los posts del blog, esto desacopla la lógica principal de la estructura del HTML.
* **Ubicación:** `frontend/blocks/blog/blogComponents.js` (luego se integró en `blog.js`).
* **Pseudo-código:**
    ```javascript
    function createPostCard(post) {
        const article = document.createElement('article');
        article.innerHTML = `<h3>${post.title}</h3>...`;
        return article;
    }
    // Cómo se usa..
    posts.forEach(post => {
        const tarjeta = createPostCard(post);
        container.appendChild(tarjeta);
    });
    ```

#### d) Patrón Observer y Command
* **Justificación:** Se implementaron juntos para manejar la funcionalidad de "Likes". El Observer permite que la interfaz (el contador de likes) se actualice automáticamente cuando el estado cambia, sin que los componentes se conozcan entre sí. El Command encapsula la acción de "dar like" en un objeto, manteniendo el código del manejador de eventos limpio y simple.
* **Ubicación:** `frontend/blocks/blog/blog.js`
* **Pseudo-código:**
    ```javascript
    // Observer
    const LikeManager = {
        suscriptores: [],
        notificar(postId, nuevoConteo) { /* avisa a los suscriptores */ }
    };

    // Command
    class ToggleLikeCommand {
        constructor(postId) { this.postId = postId; }
        execute() {
            // Llama a la API...
            // Llama a LikeManager.notificar(...);
        }
    }

    container.addEventListener('click', e => {
        if (e.target.esBotonLike) {
            const comando = new ToggleLikeCommand(id);
            comando.execute();
        }
    });
    ```
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
