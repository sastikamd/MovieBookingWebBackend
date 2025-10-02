# 🎬 Cinema Booking System - Backend API

A robust Node.js/Express.js REST API for a complete movie booking system with user authentication, movie management, and booking functionality.

## 🚀 Live API Base URL
```
https://moviebookingwebbackend.onrender.com/api
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Deployment**: Render

## ✨ Features

- 🔐 **User Authentication** (Register, Login, JWT-based)
- 👥 **User Management** (Profile, Admin roles)
- 🎬 **Movie Management** (CRUD operations, search, filtering)
- 🎟️ **Booking System** (Seat selection, pricing, confirmation)
- 🛡️ **Security** (Password hashing, input validation, rate limiting)
- 📱 **RESTful API** (JSON responses, proper HTTP status codes)
- 🗄️ **Database Integration** (MongoDB with Mongoose ODM)

## 🔐 Demo Credentials

### Admin Account
```json
{
  "email": "admin@cinemabooking.com",
  "password": "admin123"
}
```

### User Account
```json
{
  "email": "john.doe@example.com", 
  "password": "password123"
}
```

## 📡 API Endpoints

### 🏥 Health & Status

#### Health Check
```
GET https://moviebookingwebbackend.onrender.com/api/health
```
**Response:**
```json
{
  "success": true,
  "message": "CinemaBooking API is running",
  "timestamp": "2024-10-02T10:30:00.000Z",
  "environment": "production"
}
```

---

### 🔐 Authentication APIs

#### Register User
```
POST https://moviebookingwebbackend.onrender.com/api/auth/register
```
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```
POST https://moviebookingwebbackend.onrender.com/api/auth/login
```
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "admin@cinemabooking.com",
  "password": "admin123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "Admin User",
    "email": "admin@cinemabooking.com",
    "role": "admin"
  }
}
```

#### Get Current User
```
GET https://moviebookingwebbackend.onrender.com/api/auth/me
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "Admin User",
    "email": "admin@cinemabooking.com",
    "role": "admin",
    "phone": "9876543210"
  }
}
```

#### Update Profile
```
PUT https://moviebookingwebbackend.onrender.com/api/auth/profile
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543211"
}
```

---

### 🎬 Movie APIs

#### Get All Movies
```
GET https://moviebookingwebbackend.onrender.com/api/movies
```
**Query Parameters:**
- `search` - Search by movie title
- `genre` - Filter by genre
- `language` - Filter by language
- `status` - Filter by status (now-showing, coming-soon, ended)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `sort` - Sort by (popularity, title, rating, release)

**Example:**
```
GET https://moviebookingwebbackend.onrender.com/api/movies?genre=Action&language=Hindi&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "movies": [
      {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
        "title": "RRR",
        "description": "A fictional story about two legendary revolutionaries...",
        "genre": ["Action", "Drama", "History"],
        "director": "S. S. Rajamouli",
        "cast": [
          {
            "name": "N. T. Rama Rao Jr.",
            "role": "Komaram Bheem"
          }
        ],
        "duration": 187,
        "language": ["Telugu", "Hindi", "Tamil"],
        "rating": {
          "imdb": 7.8,
          "certification": "UA"
        },
        "poster": "https://picsum.photos/400/600.jpg",
        "pricing": {
          "premium": 400,
          "regular": 280,
          "economy": 200
        },
        "status": "now-showing",
        "popularity": 95,
        "bookingCount": 25000
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 6,
      "hasNext": false,
      "hasPrev": false
    },
    "filters": {
      "genres": ["Action", "Adventure", "Crime", "Drama", "Fantasy", "History", "Sci-Fi", "Thriller"],
      "languages": ["English", "Hindi", "Kannada", "Tamil", "Telugu"],
      "certifications": ["UA"]
    }
  }
}
```

#### Get Trending Movies
```
GET https://moviebookingwebbackend.onrender.com/api/movies/trending
```
**Query Parameters:**
- `limit` - Number of movies (default: 6)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "title": "RRR",
      "poster": "https://picsum.photos/400/600.jpg",
      "rating": {
        "imdb": 7.8,
        "certification": "UA"
      },
      "pricing": {
        "premium": 400,
        "regular": 280,
        "economy": 200
      },
      "popularity": 95
    }
  ]
}
```

#### Get Single Movie
```
GET https://moviebookingwebbackend.onrender.com/api/movies/MOVIE_ID
```
**Example:**
```
GET https://moviebookingwebbackend.onrender.com/api/movies/64f5a1b2c3d4e5f6a7b8c9d0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "title": "RRR",
    "description": "A fictional story about two legendary revolutionaries...",
    "genre": ["Action", "Drama", "History"],
    "director": "S. S. Rajamouli",
    "cast": [...],
    "duration": 187,
    "language": ["Telugu", "Hindi", "Tamil"],
    "rating": {
      "imdb": 7.8,
      "certification": "UA"
    },
    "poster": "https://picsum.photos/400/600.jpg",
    "pricing": {
      "premium": 400,
      "regular": 280,
      "economy": 200
    },
    "status": "now-showing"
  }
}
```

---

### 🎟️ Booking APIs

#### Create Booking
```
POST https://moviebookingwebbackend.onrender.com/api/bookings
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "movieId": "64f5a1b2c3d4e5f6a7b8c9d0",
  "showDate": "2024-10-03",
  "showTime": "7:00 PM",
  "seats": [
    {
      "seatNumber": "A1",
      "seatType": "premium",
      "price": 400
    },
    {
      "seatNumber": "A2", 
      "seatType": "premium",
      "price": 400
    }
  ],
  "theater": {
    "name": "PVR Phoenix MarketCity",
    "location": "Mumbai"
  }
}
```
**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "user": "64f5a1b2c3d4e5f6a7b8c9d0",
    "movie": "64f5a1b2c3d4e5f6a7b8c9d0",
    "movieTitle": "RRR",
    "showDate": "2024-10-03T00:00:00.000Z",
    "showTime": "7:00 PM",
    "seats": [
      {
        "seatNumber": "A1",
        "seatType": "premium",
        "price": 400
      }
    ],
    "totalAmount": 994,
    "bookingId": "CB170123456789",
    "status": "confirmed",
    "paymentStatus": "completed",
    "theater": {
      "name": "PVR Phoenix MarketCity",
      "location": "Mumbai"
    }
  }
}
```

#### Get User Bookings
```
GET https://moviebookingwebbackend.onrender.com/api/bookings
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "movieTitle": "RRR",
      "showDate": "2024-10-03T00:00:00.000Z",
      "showTime": "7:00 PM",
      "seats": [
        {
          "seatNumber": "A1",
          "seatType": "premium",
          "price": 400
        }
      ],
      "totalAmount": 994,
      "bookingId": "CB170123456789",
      "status": "confirmed",
      "movie": {
        "title": "RRR",
        "poster": "https://picsum.photos/400/600.jpg"
      }
    }
  ]
}
```

#### Get Single Booking
```
GET https://moviebookingwebbackend.onrender.com/api/bookings/BOOKING_ID
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🧪 Testing the API

### Using curl

```bash
# Test health
curl https://moviebookingwebbackend.onrender.com/api/health

# Get all movies
curl https://moviebookingwebbackend.onrender.com/api/movies

# Login and get token
curl -X POST https://moviebookingwebbackend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cinemabooking.com", "password": "admin123"}'

# Use the token from login response
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://moviebookingwebbackend.onrender.com/api/auth/me
```

### Using Postman

1. **Import Collection**: Create a new collection named "Cinema Booking API"
2. **Set Base URL**: `https://moviebookingwebbackend.onrender.com/api`
3. **Add Requests**: Create requests for each endpoint above
4. **Authentication**: Use Bearer Token with JWT from login response

### Browser Testing (GET Requests Only)

- Health: https://moviebookingwebbackend.onrender.com/api/health
- Movies: https://moviebookingwebbackend.onrender.com/api/movies
- Trending: https://moviebookingwebbackend.onrender.com/api/movies/trending

## 💾 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  role: String (enum: ['user', 'admin']),
  isVerified: Boolean,
  preferences: {
    favoriteGenres: [String],
    preferredLanguages: [String],
    location: {
      city: String,
      state: String,
      pincode: String
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Movie Model
```javascript
{
  title: String (required),
  description: String (required),
  genre: [String] (required),
  director: String (required),
  cast: [{
    name: String,
    role: String
  }],
  duration: Number (required),
  language: [String] (required),
  rating: {
    imdb: Number,
    certification: String (enum: ['U', 'UA', 'A'])
  },
  poster: String (required),
  releaseDate: Date (required),
  status: String (enum: ['coming-soon', 'now-showing', 'ended']),
  pricing: {
    premium: Number,
    regular: Number,
    economy: Number
  },
  popularity: Number,
  bookingCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  user: ObjectId (ref: 'User'),
  movie: ObjectId (ref: 'Movie'),
  movieTitle: String,
  showDate: Date (required),
  showTime: String (required),
  seats: [{
    seatNumber: String,
    seatType: String (enum: ['economy', 'regular', 'premium']),
    price: Number
  }],
  totalAmount: Number (required),
  bookingId: String (unique),
  status: String (enum: ['pending', 'confirmed', 'cancelled']),
  paymentStatus: String (enum: ['pending', 'completed', 'failed']),
  paymentMethod: String,
  theater: {
    name: String,
    location: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 💰 Pricing Structure

### Ticket Categories
- **Economy**: ₹170 - ₹250
- **Regular**: ₹240 - ₹320  
- **Premium**: ₹350 - ₹450

### Additional Charges
- **GST**: 18% on ticket price
- **Booking Fee**: ₹25 per ticket
- **Total**: Ticket Price + GST + Booking Fee

### Example Calculation
```
2 Premium tickets at ₹400 each:
Subtotal: ₹800
GST (18%): ₹144
Booking Fee: ₹50 (₹25 × 2)
Total: ₹994
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: express-validator for all inputs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured origins
- **Helmet**: Security headers
- **MongoDB Injection Protection**: Mongoose sanitization

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // For validation errors
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request / Validation Error
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## 🌐 Environment Variables

```env
MONGODB_URI=mongodb+srv://sastimeena_db_user:...
JWT_SECRET=your-super-secret-jwt-key-for-cinema-booking-2024
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.netlify.app
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 API Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

## 🔧 Deployment Information

- **Platform**: Render.com
- **Runtime**: Node.js 18
- **Database**: MongoDB Atlas
- **Auto-deploy**: Enabled on GitHub push
- **Cold Start**: ~30 seconds (free tier)
- **Region**: US East

## 📱 Frontend Integration

Update your frontend environment variables:
```env
VITE_API_URL=https://moviebookingwebbackend.onrender.com/api
```

CORS origins configured for:
- `http://localhost:3000` (development)
- Your production frontend URL

## 🐛 Troubleshooting

### Common Issues

1. **503 Service Unavailable**
   - Wait 30 seconds (cold start)
   - Check Render logs

2. **Database Connection Failed**
   - Verify MongoDB URI
   - Check IP whitelist (0.0.0.0/0)

3. **Authentication Failed**
   - Check JWT token format
   - Verify Bearer token in headers

4. **CORS Errors**
   - Add frontend domain to CORS origins
   - Update FRONTEND_URL environment variable

## 📞 Support

For issues or questions:
- Check Render deployment logs
- Verify environment variables
- Test with provided demo credentials
- Ensure proper request headers

---

**API Documentation Version**: 1.0.0  
**Last Updated**: October 2024  
**Deployment**: https://moviebookingwebbackend.onrender.com