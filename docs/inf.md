## Microservices Architecture Sequence Diagrams

This document outlines the sequence diagrams for the different services within
the microservices architecture, focusing on the interactions between the
services and their respective databases. The Reverse Proxy plays a central role
in routing requests to the appropriate services.

### 1. Web Application Service

```mermaid
sequenceDiagram
    participant Browser
    participant ReverseProxy
    participant WebApp

    Browser->>ReverseProxy: HTTP Request (/ )
    activate ReverseProxy
    ReverseProxy->>WebApp: HTTP Request
    activate WebApp
    WebApp-->>ReverseProxy: HTTP Response
    deactivate WebApp
    ReverseProxy-->>Browser: HTTP Response
    deactivate ReverseProxy
```

This diagram shows the basic flow for serving the web application. The browser
requests the root path (`/`), which the Reverse Proxy forwards to the WebApp
service. The WebApp then returns the response, which is relayed back to the
browser through the Reverse Proxy.

### 2. Identity Service

```mermaid
sequenceDiagram
    participant Browser
    participant ReverseProxy
    participant Identity
    participant IdentityDB

    Browser->>ReverseProxy: HTTP Request (/api/account or /api/profile)
    activate ReverseProxy
    ReverseProxy->>Identity: HTTP Request
    activate Identity
    Identity->>IdentityDB: Database Request (e.g., user authentication/retrieval)
    activate IdentityDB
    IdentityDB-->>Identity: Database Response
    deactivate IdentityDB
    Identity-->>ReverseProxy: HTTP Response
    deactivate Identity
    ReverseProxy-->>Browser: HTTP Response
    deactivate ReverseProxy
```

The Identity service handles requests related to user accounts and profiles.
The Reverse Proxy directs requests starting with `/api/account` or
`/api/profile` to the Identity service. The Identity service typically
interacts with the IdentityDB (PostgreSQL) for data persistence.

### 3. Stores Service

```mermaid
sequenceDiagram
    participant Browser
    participant ReverseProxy
    participant Stores
    participant StoresDB

    Browser->>ReverseProxy: HTTP Request (/api/store or /api/product)
    activate ReverseProxy
    ReverseProxy->>Stores: HTTP Request
    activate Stores
    Stores->>StoresDB: Database Request (e.g., product information)
    activate StoresDB
    StoresDB-->>Stores: Database Response
    deactivate StoresDB
    Stores-->>ReverseProxy: HTTP Response
    deactivate Stores
    ReverseProxy-->>Browser: HTTP Response
    deactivate ReverseProxy
```

The Stores service manages information related to stores and products. The
Reverse Proxy forwards requests beginning with `/api/store` or `/api/product`
to this service. The Stores service interacts with the StoresDB (MongoDB).

### 4. Stores Images Service

```mermaid
sequenceDiagram
    participant Browser
    participant ReverseProxy
    participant StoresImages

    Browser->>ReverseProxy: HTTP Request (/api/store/images)
    activate ReverseProxy
    ReverseProxy->>StoresImages: HTTP Request (e.g., image retrieval)
    activate StoresImages
    StoresImages-->>ReverseProxy: HTTP Response (Image data)
    deactivate StoresImages
    ReverseProxy-->>Browser: HTTP Response
    deactivate ReverseProxy
```

The Stores Images service serves static image content. Requests starting with
`/api/store/images` are handled by this service. Note that this service doesn't
interact with a database; it likely serves files directly from a designated
directory.

### 5. Rating Service

```mermaid
sequenceDiagram
    participant Browser
    participant ReverseProxy
    participant Rating
    participant RatingDB

    Browser->>ReverseProxy: HTTP Request (/api/rating)
    activate ReverseProxy
    ReverseProxy->>Rating: HTTP Request (e.g., get/submit rating)
    activate Rating
    Rating->>RatingDB: Database Request
    activate RatingDB
    RatingDB-->>Rating: Database Response
    deactivate RatingDB
    Rating-->>ReverseProxy: HTTP Response
    deactivate Rating
    ReverseProxy-->>Browser: HTTP Response
    deactivate ReverseProxy
```

The Rating service handles requests for product ratings. The Reverse Proxy
routes requests starting with `/api/rating` to this service. The Rating service
uses the RatingDB (PostgreSQL) for data storage.

### 6. Order Service

```mermaid
sequenceDiagram
    participant Browser
    participant ReverseProxy
    participant Order
    participant OrderDB

    Browser->>ReverseProxy: HTTP Request (/api/order)
    activate ReverseProxy
    ReverseProxy->>Order: HTTP Request (e.g., create/view orders)
    activate Order
    Order->>OrderDB: Database Request
    activate OrderDB
    OrderDB-->>Order: Database Response
    deactivate OrderDB
    Order-->>ReverseProxy: HTTP Response
    deactivate Order
    ReverseProxy-->>Browser: HTTP Response
    deactivate ReverseProxy
```

The Order service manages order processing. Requests starting with `/api/order`
are directed to this service by the Reverse Proxy. The Order service persists
data in the OrderDB (MongoDB).

**Key Observations:**

- **Reverse Proxy as Central Point:** The Reverse Proxy acts as the single
  entry point for all external requests, routing them to the appropriate
  microservices based on the URL path.
- **Service Isolation:** Each microservice has its own dedicated database,
  promoting loose coupling and independent scaling.
- **Technology Diversity:** Different databases (PostgreSQL and MongoDB) are
  used based on the needs of each service.
- **Simplified Diagrams:** By breaking down the overall architecture into
  individual service diagrams, we can more clearly understand the interactions
  and dependencies within each service.

This documentation provides a clear and concise overview of the interactions between services in the provided architecture. The separate diagrams enhance readability and understanding of each service's role and dependencies.
