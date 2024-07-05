# Real-Time Chat Application with NestJS

![NestJS](https://nestjs.com/img/logo_text.svg)

This is a real-time chat application built with NestJS, utilizing WebSocket for instant messaging, Swagger for API documentation, and Docker for containerization with PostgreSQL.

## Features

- **Real-Time Communication**: Utilizes WebSocket for real-time messaging between users.
- **RESTful API**: Provides REST endpoints for managing chats and user profiles.
- **Swagger Documentation**: API endpoints are documented with Swagger UI.
- **Database**: PostgreSQL is used as the database backend.
- **Containerization**: Docker is used for deployment and managing dependencies.

## Installation

To run this application locally, make sure you have Docker and Docker Compose installed. Then, follow these steps:

1. Clone this repository:
   ```bash
   git clone <repository_url>
   cd real-time-chat
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
   ```bash
   yarn add
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```
4. Start API:
   ```bash
   npm run start:dev
   ```
   ```bash
   yarn run start:dev
   ```
