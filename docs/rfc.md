---
title: "RFC utalEats"
author: F. Carvajal, V. Diaz , B. Farias
geometry: margin=4cm
---

## Contexto y alcance.

El proyecto "Utal Eats" se centra en el desarrollo de una plataforma
simplificada para la simulación de pedidos de comida a domicilio. En esta etapa
inicial, el enfoque principal está en la experiencia del cliente y la
interacción con un conjunto predefinido de datos de restaurantes. **No se
incluye la gestión de restaurantes reales ni la interacción con sistemas
externos.**

**Aplicaciones Cliente:**

- **Aplicación Web y Móvil:** Permite a los clientes explorar un catálogo
  predefinido de restaurantes, simular la creación de pedidos y gestionar su
  cuenta.

**Servicios Backend (SOA):**

- **Servicio de Identidad (Identity):** Gestiona la autenticación de usuarios,
  registro y perfiles.
- **Servicio de Tiendas (Stores):** Proporciona información estática sobre un
  conjunto predefinido de restaurantes, incluyendo menús, ubicación e imágenes
  (no se gestionan datos en tiempo real).
- **Servicio de Pedidos (Orders):** Registra los pedidos simulados de los
  clientes (no se procesan pedidos reales).
- **Servicio de Calificaciones (Ratings):** Permite a los clientes calificar
  los restaurantes y dejar comentarios (estos datos no impactan en la operación
  real de ningún restaurante).

**Arquitectura:**

Se utiliza una arquitectura SOA, con un Reverse Proxy como punto
de entrada único. Esta arquitectura se implementa con fines educativos, para
familiarizarse con el desarrollo de sistemas distribuidos, aunque la escala del
proyecto no lo requiera estrictamente.

**Funcionalidades Clave para el Cliente:**

- **Registro e Inicio de Sesión:** Creación de cuentas de usuario y acceso a la
  plataforma.
- **Exploración de Restaurantes (Catálogo Estático):** Visualización de la
  información precargada de los restaurantes.
- **Simulación de Pedidos:** Agregar productos al carrito y simular el envío de
  un pedido (sin procesamiento real del pedido).
- **Historial de Pedidos Simulados:** Revisar los pedidos simulados
  anteriormente.
- **Calificación y Comentarios de Restaurantes (Simulados):** Proporcionar
  feedback simulado sobre los restaurantes.

**Fuera del Alcance:**

- **Interacción con Restaurantes Reales:** No existe conexión con restaurantes
  reales ni gestión de datos en tiempo real.
- **Procesamiento de Pagos:** No se incluye ningún sistema de pagos.
- **Gestión de Repartidores:** No se gestionan repartidores ni logística de
  entrega.

El proyecto es muy simpre y carece de muchas funcionalidades basicas para su real
funcionamiento, un ejemplo, es la falta de sesiones para el usuario, ya que,
la manera de hacerlo actualmente es muy insegura y extremadamente limitante.

## Diseño.

### Backend.

Este documento describe los diagramas de secuencia para los diferentes
servicios dentro de la arquitectura de servicios, enfocándose en las
interacciones entre los servicios y sus respectivas bases de datos. El Proxy
Inverso juega un papel central en el enrutamiento de las solicitudes a los
servicios apropiados.

#### 1. Servicio de Aplicación Web

```mermaid
sequenceDiagram
    participant Navegador
    participant ProxyInverso
    participant AplicacionWeb

    Navegador->>ProxyInverso: Solicitud HTTP (/ )
    activate ProxyInverso
    ProxyInverso->>AplicacionWeb: Solicitud HTTP
    activate AplicacionWeb
    AplicacionWeb-->>ProxyInverso: Respuesta HTTP
    deactivate AplicacionWeb
    ProxyInverso-->>Navegador: Respuesta HTTP
    deactivate ProxyInverso
```

Este diagrama muestra el flujo básico para servir la aplicación web. El
navegador solicita la ruta raíz (`/`), que el Proxy Inverso reenvía al servicio
AplicacionWeb. La AplicacionWeb luego devuelve la respuesta, que se retransmite
al navegador a través del Proxy Inverso.

#### 2. Servicio de Identidad (Identity)

```mermaid
sequenceDiagram
    participant Navegador
    participant ProxyInverso
    participant Identidad
    participant BaseDatosIdentidad

    Navegador->>ProxyInverso: Solicitud HTTP (/api/account o /api/profile)
    activate ProxyInverso
    ProxyInverso->>Identidad: Solicitud HTTP
    activate Identidad
    Identidad->>BaseDatosIdentidad: Solicitud a la Base de Datos (ej., autenticación/recuperación de usuario)
    activate BaseDatosIdentidad
    BaseDatosIdentidad-->>Identidad: Respuesta de la Base de Datos
    deactivate BaseDatosIdentidad
    Identidad-->>ProxyInverso: Respuesta HTTP
    deactivate Identidad
    ProxyInverso-->>Navegador: Respuesta HTTP
    deactivate ProxyInverso
```

El servicio de Identidad maneja las solicitudes relacionadas con las cuentas y
perfiles de usuario. El Proxy Inverso dirige las solicitudes que comienzan con
`/api/account` o `/api/profile` al servicio de Identidad. El servicio de
Identidad generalmente interactúa con la BaseDatosIdentidad (PostgreSQL) para
la persistencia de datos.

#### 3. Servicio de Tiendas (Stores)

```mermaid
sequenceDiagram
    participant Navegador
    participant ProxyInverso
    participant Tiendas
    participant BaseDatosTiendas

    Navegador->>ProxyInverso: Solicitud HTTP (/api/store o /api/product)
    activate ProxyInverso
    ProxyInverso->>Tiendas: Solicitud HTTP
    activate Tiendas
    Tiendas->>BaseDatosTiendas: Solicitud a la Base de Datos (ej., información del producto)
    activate BaseDatosTiendas
    BaseDatosTiendas-->>Tiendas: Respuesta de la Base de Datos
    deactivate BaseDatosTiendas
    Tiendas-->>ProxyInverso: Respuesta HTTP
    deactivate Tiendas
    ProxyInverso-->>Navegador: Respuesta HTTP
    deactivate ProxyInverso
```

El servicio de Tiendas gestiona la información relacionada con las tiendas y
los productos. El Proxy Inverso reenvía las solicitudes que comienzan con
`/api/store` o `/api/product` a este servicio. El servicio de Tiendas
interactúa con la BaseDatosTiendas (MongoDB).

#### 4. Servicio de Calificaciones (Ratings)

```mermaid
sequenceDiagram
    participant Navegador
    participant ProxyInverso
    participant Calificaciones
    participant BaseDatosCalificaciones

    Navegador->>ProxyInverso: Solicitud HTTP (/api/rating)
    activate ProxyInverso
    ProxyInverso->>Calificaciones: Solicitud HTTP (ej., obtener/enviar calificación)
    activate Calificaciones
    Calificaciones->>BaseDatosCalificaciones: Solicitud a la Base de Datos
    activate BaseDatosCalificaciones
    BaseDatosCalificaciones-->>Calificaciones: Respuesta de la Base de Datos
    deactivate BaseDatosCalificaciones
    Calificaciones-->>ProxyInverso: Respuesta HTTP
    deactivate Calificaciones
    ProxyInverso-->>Navegador: Respuesta HTTP
    deactivate ProxyInverso
```

El servicio de Calificaciones maneja las solicitudes de calificaciones de
productos. El Proxy Inverso enruta las solicitudes que comienzan con
`/api/rating` a este servicio. El servicio de Calificaciones utiliza la
BaseDatosCalificaciones (PostgreSQL) para el almacenamiento de datos.

#### 5. Servicio de Pedidos (Orders)

```mermaid
sequenceDiagram
    participant Navegador
    participant ProxyInverso
    participant Pedidos
    participant BaseDatosPedidos

    Navegador->>ProxyInverso: Solicitud HTTP (/api/order)
    activate ProxyInverso
    ProxyInverso->>Pedidos: Solicitud HTTP (ej., crear/ver pedidos)
    activate Pedidos
    Pedidos->>BaseDatosPedidos: Solicitud a la Base de Datos
    activate BaseDatosPedidos
    BaseDatosPedidos-->>Pedidos: Respuesta de la Base de Datos
    deactivate BaseDatosPedidos
    Pedidos-->>ProxyInverso: Respuesta HTTP
    deactivate Pedidos
    ProxyInverso-->>Navegador: Respuesta HTTP
    deactivate ProxyInverso
```

El servicio de Pedidos gestiona el procesamiento de pedidos. Las solicitudes
que comienzan con `/api/order` son dirigidas a este servicio por el Proxy
Inverso. El servicio de Pedidos persiste los datos en la BaseDatosPedidos
(MongoDB).

**Explicación del rol del Reverse Proxy:**

Es crucial entender que todo el tráfico que el usuario final (ya sea desde la
aplicación web o la aplicación móvil de Android) pasa a través del Reverse
Proxy. Este actúa como un intermediario, recibiendo todas las solicitudes
entrantes y redirigiéndolas al servicio apropiado. De esta manera, el usuario
no interactúa directamente con los microservicios individuales, sino que el
Reverse Proxy funciona como un único punto de entrada.

Tanto la aplicación web como la aplicación móvil de Android envían sus
solicitudes HTTP al Reverse Proxy. Este, basándose en la ruta de la URL,
determina a qué microservicio debe enviar la solicitud. Por ejemplo:

- Si la solicitud es a `/api/account`, el Reverse Proxy la redirige al servicio
  de Identidad (Identity).
- Si la solicitud es a `/api/store`, el Reverse Proxy la redirige al servicio
  de Tiendas (Stores).
- Y así sucesivamente para los demás servicios.

El uso del Reverse Proxy ofrece varias ventajas, incluyendo:

- **Seguridad:** Oculta la arquitectura interna del sistema, protegiendo los
  microservicios de accesos directos no autorizados.
- **Balanceo de carga:** Puede distribuir el tráfico entre varias instancias de
  un mismo microservicio, mejorando el rendimiento y la disponibilidad.
- **Simplificación:** Facilita la gestión de SSL/TLS, la caché y otras
  funcionalidades transversales, sin necesidad de implementarlas en cada
  microservicio.

```mermaid
graph LR
    subgraph Usuario
        A[Aplicación Web] --> ProxyInverso
        B[Aplicación Android] --> ProxyInverso
    end
    ProxyInverso --> Identidad
    ProxyInverso --> Tiendas
    ProxyInverso --> Pedidos
    ProxyInverso --> Calificaciones

```

Este diagrama simplificado ilustra cómo tanto la aplicación web como la
aplicación de Android interactúan con el sistema a través del Reverse Proxy. El
proxy luego se encarga de enrutar las solicitudes a los servicios
correspondientes.

#### Uso de Docker y Docker-Compose

Para simplificar la ejecución y despliegue del sistema, se utiliza Docker y
Docker Compose. Esto permite contenerizar cada microservicio y sus dependencias
(bases de datos, etc.) en contenedores Docker independientes. De esta manera,
se garantiza la portabilidad del sistema y se evitan problemas de
compatibilidad entre diferentes entornos de desarrollo.

**Ventajas del uso de Docker:**

- **Aislamiento:** Cada servicio se ejecuta en su propio contenedor, lo que
  evita conflictos entre dependencias y facilita la gestión de diferentes
  versiones de software.
- **Portabilidad:** Los contenedores Docker pueden ejecutarse en cualquier
  sistema que tenga Docker instalado, simplificando el despliegue en diferentes
  entornos (desarrollo, pruebas, producción).
- **Reproducibilidad:** Docker Compose define la configuración del sistema en
  un archivo `docker-compose.yml`, lo que garantiza que el entorno se configure
  de la misma manera en cada ejecución.
- **Escalabilidad:** Facilita el escalado horizontal de los servicios,
  permitiendo ejecutar múltiples instancias de un mismo servicio en diferentes
  contenedores.

**Ejecución del sistema con Docker Compose:**

El archivo `docker-compose.yml` define todos los servicios del sistema,
incluyendo las aplicaciones cliente (web y móvil), los microservicios backend y
las bases de datos. Para ejecutar el sistema completo, basta con tener Docker
instalado y ejecutar el siguiente comando en la raíz del proyecto:

```bash
docker-compose up -d
```

Este comando descargará las imágenes necesarias, creará los contenedores y los
iniciará en segundo plano (`-d`). Una vez que los servicios estén en
funcionamiento, se puede acceder a la aplicación web a través del puerto
definido en el `docker-compose.yml`.

**Ejemplo de `docker-compose.yml` (simplificado):**

```yaml
services:
  web:
    build: ./web
    depends_on:
      - reverse-proxy
  reverse-proxy:
    image: nginx:latest
    ports:
      - "80:80"
    depends_on:
      - identity
      - stores
      - orders
      - ratings
  identity:
    build: ./identity
    depends_on:
      - identity-db
  identity-db:
    image: postgres:latest
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
  # ... otros servicios y bases de datos
```

Gracias a Docker y Docker Compose, el despliegue y ejecución del sistema se
simplifica considerablemente, permitiendo a cualquier persona con Docker
instalado ejecutar el proyecto completo con un solo comando.

### Frontend.

#### Aplicación Web.

La aplicación web de Utal Eats es una interfaz de usuario interactiva creada con
astro.

#### Aplicación Móvil.

La aplicación móvil de Utal Eats es una interfaz de usuario interactiva creada
con React Native.

## Definición de APIs.

Todos estos endpoints se encuentran bajo el prefijo `/api`.

### Servicio de Identidad (Identity)

- **POST /account/register:**

  - Descripción: Registra un nuevo usuario.
  - Parámetros (Cuerpo):
    - `email` (string, requerido): Correo electrónico del usuario.
    - `password` (string, requerido): Contraseña del usuario.
    - `name` (string, requerido): Nombre del usuario.
    - `phone` (string, requerido): Teléfono del usuario.
    - `address` (string, requerido): Dirección del usuario.
    - `city` (string, requerido): Ciudad del usuario.
  - Respuesta:
    - 201 (Created) con el ID del usuario creado en el cuerpo de la respuesta.
    - 400 (Bad Request) si el email ya está registrado.

- **POST /account/login:**

  - Descripción: Inicia sesión a un usuario existente.
  - Parámetros (Cuerpo):
    - `email` (string, requerido): Correo electrónico del usuario.
    - `password` (string, requerido): Contraseña del usuario.
  - Respuesta:
    - 200 (OK) con el ID del usuario en el cuerpo de la respuesta si las credenciales son válidas.
    - 401 (Unauthorized) si las credenciales son inválidas.

- **GET /profile:**
  - Descripción: Obtiene el perfil de un usuario.
  - Parámetros (Query):
    - `accountId` (number, requerido): ID del usuario.
  - Respuesta:
    - 200 (OK) con el objeto perfil en el cuerpo de la respuesta.
    - 404 (Not Found) si el perfil no existe.

### Servicio de Tiendas (Stores)

- **GET /store:**

  - Descripción: Obtiene una lista de tiendas en una ciudad específica.
  - Parámetros (Query):
    - `cityName` (string, requerido): Nombre de la ciudad.
  - Respuesta:
    - 200 (OK) con una lista de objetos tienda en el cuerpo de la respuesta. Cada objeto tienda incluye `storeId`, `storeName`, `imagePath`, `category` y `cityName`.

- **GET /product:**
  - Descripción: Obtiene una lista de productos de una tienda específica.
  - Parámetros (Query):
    - `storeId` (number, requerido): ID de la tienda.
  - Respuesta:
    - 200 (OK) con una lista de objetos producto en el cuerpo de la respuesta.
    - 404 (Not Found) si la tienda no existe.

### Servicio de Pedidos (Orders)

- **POST /order:**

  - Descripción: Crea un nuevo pedido.
  - Parámetros (Cuerpo):
    - `accountId` (number, requerido): ID del usuario que realiza el pedido.
    - `storeId` (number, requerido): ID de la tienda a la que se realiza el pedido.
    - `products` (array, requerido): Array de objetos producto. Cada objeto producto debe tener `product` (string), `quantity` (number) y `price` (number).
  - Respuesta:
    - 201 (Created) con un mensaje de confirmación y el `orderId` en el cuerpo de la respuesta.

- **GET /order:**
  - Descripción: Obtiene el historial de pedidos de un usuario.
  - Parámetros (Query):
    - `accountId` (number, requerido): ID del usuario.
  - Respuesta:
    - 200 (OK) con una lista de objetos pedido en el cuerpo de la respuesta.

### Servicio de Calificaciones (Ratings)

- **GET /rating:**

  - Descripción: Obtiene la calificación promedio y los comentarios de una tienda.
  - Parámetros (Query):
    - `storeId` (number, requerido): ID de la tienda.
  - Respuesta:
    - 200 (OK) con la calificación promedio y una lista de comentarios en el cuerpo de la respuesta.

- **POST /rating:**
  - Descripción: Envía una calificación para una tienda.
  - Parámetros (Cuerpo):
    - `storeId` (number, requerido): ID de la tienda.
    - `orderId` (string, requerido): ID del pedido.
    - `score` (number, requerido): Calificación numérica (0-5).
    - `comment` (string, opcional): Comentario del usuario.
  - Respuesta:
    - 201 (Created) si la calificación se registró correctamente.

## Preocupaciones.