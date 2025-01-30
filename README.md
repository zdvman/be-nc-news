# Northcoders News API

A backend API built with **Node.js**, **Express**, and **PostgreSQL**, designed to mimic the functionality of a real-world news website. This API supports CRUD operations for topics, articles, comments, and users, with additional features like sorting, filtering, and pagination.

This project was created as part of a **Digital Skills Bootcamp in Software Engineering** provided by [Northcoders](https://northcoders.com/).

---

## 🔗 Hosted API

The API is hosted on Render: [Northcoders News API](https://be-nc-news-m90v.onrender.com/)

You can access available endpoints by making a **GET** request to `/api`:

```bash
curl https://be-nc-news-m90v.onrender.com/api
```

This will return a JSON object detailing all available routes.

---

## 📂 Project Setup

### 🔧 Prerequisites

To run this project locally, ensure you have:

- [Node.js](https://nodejs.org/) **v16 or higher**
- [PostgreSQL](https://www.postgresql.org/) **v12 or higher**
- A code editor like [VS Code](https://code.visualstudio.com/)

---

### 🚀 Installation & Setup

1️⃣ **Clone the repository:**

```bash
git clone https://github.com/zdvman/be-nc-news.git
cd be-nc-news
```

2️⃣ **Install dependencies:**

```bash
npm install
```

3️⃣ **Set up environment variables:**

Create three `.env` files in the root of the project:

- `.env.production`
- `.env.development`
- `.env.test`

Add the following variables to each file:

**`.env.production`**:

```env
DATABASE_URL=<Your_Supabase_Connection_URL>
```

**`.env.development`**:

```env
PGDATABASE=nc_news
PORT=3000
```

**`.env.test`**:

```env
PGDATABASE=nc_news_test
PORT=3001
```

Ensure these files are included in `.gitignore` to keep them private.

4️⃣ **Set up and seed the database:**

```bash
npm run setup-dbs   # Creates the databases
npm run seed        # Seeds the development database
```

5️⃣ **Run the tests:**

```bash
npm test
```

---

## 🖥️ Available Scripts

- **`npm run setup-dbs`** - Creates the required PostgreSQL databases.
- **`npm run seed`** - Seeds the development database with sample data.
- **`npm test`** - Runs the Jest test suite.
- **`npm run start-dev`** - Starts the development server using nodemon.
- **`npm start`** - Starts the production server.

---

## 📡 Hosting with Supabase & Render

This project is hosted using **Supabase** (for the database) and **Render** (for the API). Below are the steps followed for hosting:

1️⃣ **Set up Supabase Database**

- Created a new database instance in Supabase.
- Obtained a **DATABASE_URL** for the hosted database.
- Stored it in `.env.production`.

2️⃣ **Update Connection Configuration**

- Modified `connection.js` to use `DATABASE_URL` in production.

3️⃣ **Deploy to Render**

- Created a **Web Service** on Render.
- Set **Build Command**: `yarn`
- Set **Start Command**: `yarn start`
- Added environment variables:
  ```
  DATABASE_URL=<Your_Supabase_Connection_URL>
  NODE_ENV=production
  ```

4️⃣ **Seed the Production Database**

```bash
npm run seed-prod
```

---

## 📌 Endpoints Overview

### 📝 GET `/api`

Returns a JSON object describing all available API endpoints.

### 📰 GET `/api/topics`

Returns an array of topic objects, each with:

- `slug`
- `description`

### 📰 GET `/api/articles`

Returns a list of articles with optional sorting (`sort_by`), ordering (`order`), and topic filtering (`topic`). Each article object contains:

- `author`
- `title`
- `article_id`
- `topic`
- `created_at`
- `votes`
- `article_img_url`
- `comment_count`

Sorted by `created_at` in descending order by default.

### 📖 GET `/api/articles/:article_id`

Returns a single article by `article_id`, including:

- `author`
- `title`
- `article_id`
- `body`
- `topic`
- `created_at`
- `votes`
- `article_img_url`
- `comment_count`

### 💬 GET `/api/articles/:article_id/comments`

Returns all comments for a given article, ordered from most recent first.

### ✍️ POST `/api/articles/:article_id/comments`

Adds a comment to an article. Request body:

```json
{
  "username": "user_name",
  "body": "This is a comment."
}
```

Returns the posted comment.

### 📤 PATCH `/api/articles/:article_id`

Updates the votes on an article. Request body:

```json
{
  "inc_votes": 1
}
```

Returns the updated article.

### ❌ DELETE `/api/comments/:comment_id`

Deletes a comment by `comment_id`. Responds with status `204` and no content.

### 👤 GET `/api/users`

Returns an array of users, each with:

- `username`
- `name`
- `avatar_url`

### 🔄 GET `/api/articles (sorting queries)`

Supports sorting by `sort_by` (default: `created_at`) and ordering with `order` (`asc` or `desc`).

### 🔍 GET `/api/articles (topic query)`

Filters articles by `topic`.

### 🔢 GET `/api/articles/:article_id (comment_count)`

Includes `comment_count`, the total number of comments for the article.
