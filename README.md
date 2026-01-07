# Shortify

A web application that converts long URLs into short, shareable links. Users can create shortened URLs, track their performance, and manage their links through a dashboard.

## Features

- **User Authentication**  
  - User registration and login  
  - Secure authentication using JWT  
  - Protected dashboard routes for authenticated users only  

- **URL Shortening**  
  - Generate a unique short URL for any long URL  
  - Short code length: 6-8 characters  
  - Copy-to-clipboard functionality  

- **URL Redirection**  
  - Redirect short URLs to the original URL  
  - Track clicks/visits per URL  

- **Dashboard**  
  - View all shortened URLs in a table  
  - Display: Original URL (truncated), Short code, Short URL, Total clicks, Created date  
  - Delete URLs  

- **Usage Limits**  
  - Free tier: Maximum 100 shortened URLs per user  
  - Alert when the limit is reached  

---

## Setup Instructions

1. **Clone the repository**  

```bash
git clone https://github.com/hasanulhasan/url_shortify_backend
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
NODE_ENV=development
PORT=8000
MONGO_URI=<Your MongoDB Connection String>
JWT_SECRET=<Your JWT Secret Key>
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

4. **Run the server**

```bash
npm run dev
```

## API Documentation

#### 
- **Register User:** `POST /api/auth/register`
- **Login User:** `POST /api/auth/login`
- **User Profile:** `GET /api/auth/profile`
- **Create Short URL:** `POST /api/url/shorten`
- **Check URL with shortcode:** `GET /api/url/:shortCode`
- **Get URL Info** `GET /api/url/:shortCode/stats`
- **Delete URL Info** `DELETE /api/url/:shortCode`
- **URL Info in User Dashboard** `GET /api/dashboard/urls`
- **All URLs data in User Dashboard** `GET /api/dashboard/stats`


## Links

#### Frontend Live Link : https://url-shorten-beta.netlify.app/
#### Frontend Git Link: https://github.com/hasanulhasan/url_shortify_frontend
#### Backend Git Link: https://github.com/hasanulhasan/url_shortify_backend

## Test Credential

#### Email: test@test.com
#### Password: 123456


