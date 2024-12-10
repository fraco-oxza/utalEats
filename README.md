# Utal Eats: A Client-Server Implementation with SOA

This project implements a simplified food delivery application, "Utal Eats," using a client-server architecture based on Service-Oriented Architecture (SOA). The system is designed as a distributed application consisting of four independent microservices: Identity, Stores, Orders, and Ratings. A web client and mobile clients (Android/iOS) will interact with these services.

## Dependencies

You only need Docker.

## Running

To run the project execute:

```bash
docker compose -f compose.yaml -f production.yml up
```

## Project Structure

The project is divided into several components:

- **Identity Service:** Manages user accounts and profiles. (Partially
  implemented)
- **Stores Service:** Manages stores and their products.
- **Orders Service:** Manages orders.
- **Ratings Service:** Manages store ratings and reviews.
- **Web Client:** A web application providing the user interface.
- **Mobile Client (Android/iOS):** Mobile applications providing the same
  functionality as the web client.

## API Endpoints

The following API endpoints are defined:

**Identity Service:**

- `/account/register` (POST): Registers a new user.
- `/account/login` (POST): Logs in an existing user.
- `/profile` (GET): Retrieves user profile information.

**Stores Service:**

- `/store` (GET): Retrieves a list of stores in a specified city.
- `/product` (GET): Retrieves a list of products for a specified store.

**Orders Service:**

- `/order` (POST): Creates a new order.
- `/order` (GET): Retrieves a list of orders for a specific user.

**Ratings Service:**

- `/rating` (GET): Retrieves the average rating and reviews for a specified store.
- `/rating` (POST): Submits a new rating and review.
