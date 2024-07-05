# Real-Time Chat Application with NestJS

![NestJS](https://nestjs.com/img/logo_text.svg)
<p align="left">
<a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/typescript-colored.svg" width="36" height="36" alt="TypeScript" /></a><a  src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/mongodb-colored.svg" width="36" height="36" alt="MongoDB" /></a><a href="https://www.postgresql.org/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/postgresql-colored.svg" width="36" height="36" alt="PostgreSQL" /></a><a href="https://www.docker.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/docker-colored.svg" width="36" height="36" alt="Docker" /></a>
</p>
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
