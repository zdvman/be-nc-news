# Northcoders News API

A backend API built with Node.js, Express, and PostgreSQL, designed to mimic the functionality of a real-world news website. This project supports CRUD operations for topics, articles, comments, and users, with additional features like sorting, filtering, and pagination.

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

---

## Project Setup

### Prerequisites

To run this project locally, ensure you have:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/)
- A code editor like [VS Code](https://code.visualstudio.com/)

---

### Setting Up the Project

1. **Clone the repository:**

   ```bash
   git clone https://github.com/zdvman/be-nc-news.git
   cd be-nc-news
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**

   Create two `.env` files in the root of the project:

   - `.env.development`
   - `.env.test`

   Add the following variables to each file:

   **`.env.development`:**

   ```env
   PGDATABASE=nc_news
   PORT=3000
   ```

   **`.env.test`:**

   ```env
   PGDATABASE=nc_news_test
   PORT=3001
   ```

   - `PGDATABASE`: Specifies the database name for the corresponding environment.
   - `PORT`: Defines the port on which the server will run for each environment.

   Ensure these files are included in `.gitignore` to keep them private.

4. **Set up the databases:**

   Run the setup script to create the necessary databases:

   ```bash
   npm run setup-dbs
   ```

5. **Seed the development database:**

   Populate the development database with initial data:

   ```bash
   npm run seed
   ```

6. **Run the tests:**

   Verify that everything is working correctly by running the test suite:

   ```bash
   npm test
   ```

### Available Scripts

- **`npm run setup-dbs`**: Creates the required PostgreSQL databases.
- **`npm run seed`**: Seeds the development database with sample data.
- **`npm test`**: Runs the Jest test suite.
- **`npm run prepare`**: Installs Husky for managing Git hooks.

---

### Hosting Instructions

If hosting this project, ensure that environment variables (e.g., `PGDATABASE`) are configured for the production environment.
