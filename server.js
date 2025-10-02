const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit'); // Commented out for now
require('dotenv').config();

const app = express();

// CRITICAL: Configure Express to trust proxy headers (REQUIRED for Render deployment)
app.set('trust proxy', true);

// Security Middleware
app.use(helmet());

// RATE LIMITING TEMPORARILY DISABLED
// The rate limiter was causing validation errors with trust proxy
// and blocking all API responses. Uncomment and configure properly later.

/*
// Rate Limiting (DISABLED FOR TESTING)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  trustProxy: true, // Match app.set('trust proxy', true)
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/api/health' || req.path === '/api';
  }
});
app.use('/api/', limiter);
*/

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://moviefnsastika.netlify.app/'
  ],
  credentials: true
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to see what's happening
app.use('/api', (req, res, next) => {
  console.log(`🔍 API Request: ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  
  // Override res.json to debug responses
  const originalJson = res.json;
  res.json = function(data) {
    console.log(`📤 API Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    console.log('📊 Response data preview:', JSON.stringify(data).substring(0, 200) + '...');
    return originalJson.call(this, data);
  };
  
  next();
});

// API Root - List all available endpoints
app.get('/api', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;
  
  res.json({
    success: true,
    message: "Cinema Booking API v1.0.0",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    rateLimiting: 'disabled-for-testing',
    trustProxy: app.get('trust proxy'),
    endpoints: {
      health: {
        url: `${baseUrl}/health`,
        method: "GET",
        description: "API health check"
      },
      seed: {
        url: `${baseUrl}/seed`, 
        method: "GET",
        description: "Seed database with demo data (use once)"
      },
      debug: {
        url: `${baseUrl}/debug`,
        method: "GET", 
        description: "Debug database connection and data count"
      },
      authentication: {
        register: {
          url: `${baseUrl}/auth/register`,
          method: "POST",
          description: "Register new user",
          body: {
            name: "string",
            email: "string", 
            password: "string",
            phone: "string"
          }
        },
        login: {
          url: `${baseUrl}/auth/login`,
          method: "POST", 
          description: "Login user",
          body: {
            email: "string",
            password: "string"
          }
        },
        profile: {
          url: `${baseUrl}/auth/me`,
          method: "GET",
          description: "Get current user (requires auth)",
          headers: {
            Authorization: "Bearer JWT_TOKEN"
          }
        }
      },
      movies: {
        getAll: {
          url: `${baseUrl}/movies`,
          method: "GET", 
          description: "Get all movies with filters",
          params: {
            search: "string (optional)",
            genre: "string (optional)",
            language: "string (optional)", 
            page: "number (optional, default: 1)",
            limit: "number (optional, default: 12)",
            sort: "string (optional: popularity, title, rating, release)"
          }
        },
        trending: {
          url: `${baseUrl}/movies/trending`,
          method: "GET",
          description: "Get trending movies",
          params: {
            limit: "number (optional, default: 6)"
          }
        },
        getById: {
          url: `${baseUrl}/movies/:id`,
          method: "GET",
          description: "Get single movie by ID"
        }
      },
      bookings: {
        create: {
          url: `${baseUrl}/bookings`,
          method: "POST",
          description: "Create new booking (requires auth)",
          headers: {
            Authorization: "Bearer JWT_TOKEN"
          }
        },
        getUserBookings: {
          url: `${baseUrl}/bookings`,
          method: "GET", 
          description: "Get user bookings (requires auth)",
          headers: {
            Authorization: "Bearer JWT_TOKEN"
          }
        }
      }
    },
    demoCredentials: {
      admin: {
        email: "admin@cinemabooking.com",
        password: "admin123"
      },
      user: {
        email: "john.doe@example.com", 
        password: "password123"
      }
    },
    testUrls: [
      `${baseUrl}/health`,
      `${baseUrl}/seed`,
      `${baseUrl}/debug`,
      `${baseUrl}/movies`,
      `${baseUrl}/movies/trending`
    ]
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CinemaBooking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name,
      host: mongoose.connection.host
    },
    server: {
      trustProxy: app.get('trust proxy'),
      rateLimiting: 'disabled-for-testing',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    }
  });
});

// Debug endpoint to check database status
app.get('/api/debug', async (req, res) => {
  try {
    const User = require('./models/User');
    const Movie = require('./models/Movie');
    const Booking = require('./models/Booking');
    
    const movieCount = await Movie.countDocuments();
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const sampleMovie = await Movie.findOne();
    
    res.json({
      success: true,
      debug: {
        database: {
          name: mongoose.connection.name,
          host: mongoose.connection.host,
          connectionState: mongoose.connection.readyState,
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        },
        collections: {
          movies: movieCount,
          users: userCount,
          bookings: bookingCount
        },
        sampleData: {
          movie: sampleMovie ? {
            title: sampleMovie.title,
            genre: sampleMovie.genre,
            pricing: sampleMovie.pricing
          } : 'No movies found'
        },
        server: {
          trustProxy: app.get('trust proxy'),
          rateLimiting: 'disabled-for-testing',
          environment: process.env.NODE_ENV || 'development'
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Seed endpoint to populate database
app.get('/api/seed', async (req, res) => {
  try {
    console.log('🎬 Starting production database seeding...');
    
    const User = require('./models/User');
    const Movie = require('./models/Movie');
    const Booking = require('./models/Booking');

    // Check if already seeded
    const existingMovies = await Movie.countDocuments();
    if (existingMovies > 0) {
      return res.json({
        success: false,
        message: 'Database already seeded',
        data: {
          movies: existingMovies,
          note: 'Database contains movies. To re-seed, manually clear the database first.'
        }
      });
    }

    // Demo users
    const demoUsers = [
      {
        name: "Admin User",
        email: "admin@cinemabooking.com", 
        password: "admin123",
        phone: "9876543210",
        role: "admin",
        isVerified: true
      },
      {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123", 
        phone: "9876543211",
        role: "user",
        isVerified: true
      },
      {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        password: "password123",
        phone: "9876543212",
        role: "user",
        isVerified: true
      }
    ];

    // Movies with placeholder images
    const movies = [
      {
        title: "RRR",
        description: "A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.",
        genre: ["Action", "Drama", "History"],
        director: "S. S. Rajamouli",
        cast: [
          { name: "N. T. Rama Rao Jr.", role: "Komaram Bheem" },
          { name: "Ram Charan", role: "Alluri Sitarama Raju" },
          { name: "Alia Bhatt", role: "Sita" }
        ],
        duration: 187,
        language: ["Telugu", "Hindi", "Tamil"],
        rating: { imdb: 7.8, certification: "UA" },
        poster: "https://picsum.photos/400/600?random=1",
        releaseDate: new Date("2022-03-25"),
        status: "now-showing",
        pricing: { premium: 400, regular: 280, economy: 200 },
        popularity: 95,
        bookingCount: 25000
      },
      {
        title: "K.G.F: Chapter 2",
        description: "In the blood-soaked Kolar Gold Fields, Rocky's name strikes fear into his foes.",
        genre: ["Action", "Crime", "Drama"],
        director: "Prashanth Neel",
        cast: [
          { name: "Yash", role: "Rocky" },
          { name: "Sanjay Dutt", role: "Adheera" },
          { name: "Raveena Tandon", role: "Ramika Sen" }
        ],
        duration: 168,
        language: ["Kannada", "Hindi", "Telugu"],
        rating: { imdb: 8.4, certification: "UA" },
        poster: "https://picsum.photos/400/600?random=2",
        releaseDate: new Date("2022-04-14"),
        status: "now-showing", 
        pricing: { premium: 350, regular: 250, economy: 180 },
        popularity: 92,
        bookingCount: 22000
      },
      {
        title: "Pushpa: The Rise",
        description: "Violence erupts between red sandalwood smugglers and the police.",
        genre: ["Action", "Crime", "Drama"],
        director: "Sukumar",
        cast: [
          { name: "Allu Arjun", role: "Pushpa Raj" },
          { name: "Rashmika Mandanna", role: "Srivalli" }
        ],
        duration: 179,
        language: ["Telugu", "Hindi", "Tamil"],
        rating: { imdb: 7.6, certification: "UA" },
        poster: "https://picsum.photos/400/600?random=3",
        releaseDate: new Date("2021-12-17"),
        status: "now-showing",
        pricing: { premium: 380, regular: 260, economy: 190 },
        popularity: 88,
        bookingCount: 18000
      },
      {
        title: "Brahmastra Part One: Shiva", 
        description: "A DJ with superpowers and his ladylove embark on a mission to protect the Brahmastra.",
        genre: ["Action", "Adventure", "Fantasy"],
        director: "Ayan Mukerji",
        cast: [
          { name: "Ranbir Kapoor", role: "Shiva" },
          { name: "Alia Bhatt", role: "Isha" }
        ],
        duration: 167,
        language: ["Hindi", "Telugu", "Tamil"], 
        rating: { imdb: 5.6, certification: "UA" },
        poster: "https://picsum.photos/400/600?random=4",
        releaseDate: new Date("2022-09-09"),
        status: "now-showing",
        pricing: { premium: 420, regular: 300, economy: 220 },
        popularity: 75,
        bookingCount: 15000
      },
      {
        title: "Vikram",
        description: "Members of a black ops team must track and eliminate a gang of masked murderers.",
        genre: ["Action", "Crime", "Thriller"],
        director: "Lokesh Kanagaraj",
        cast: [
          { name: "Kamal Haasan", role: "Agent Vikram" },
          { name: "Vijay Sethupathi", role: "Santhanam" }
        ],
        duration: 174,
        language: ["Tamil", "Hindi", "Telugu"],
        rating: { imdb: 8.4, certification: "UA" },
        poster: "https://picsum.photos/400/600?random=5",
        releaseDate: new Date("2022-06-03"),
        status: "now-showing",
        pricing: { premium: 360, regular: 240, economy: 170 },
        popularity: 90,
        bookingCount: 20000
      },
      {
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        director: "James Cameron",
        cast: [
          { name: "Sam Worthington", role: "Jake Sully" },
          { name: "Zoe Saldana", role: "Neytiri" }
        ],
        duration: 192,
        language: ["English", "Hindi"],
        rating: { imdb: 7.9, certification: "UA" },
        poster: "https://picsum.photos/400/600?random=6",
        releaseDate: new Date("2022-12-16"),
        status: "now-showing",
        pricing: { premium: 450, regular: 320, economy: 250 },
        popularity: 85,
        bookingCount: 16000
      }
    ];

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Booking.deleteMany({});

    // Seed users
    console.log('👥 Seeding users...');
    const users = await User.insertMany(demoUsers);
    
    // Seed movies  
    console.log('🎬 Seeding movies...');
    const moviesCreated = await Movie.insertMany(movies);

    console.log(`✅ Seeded ${users.length} users and ${moviesCreated.length} movies`);

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: users.length,
        movies: moviesCreated.length,
        movieTitles: moviesCreated.map(m => m.title),
        userEmails: users.map(u => u.email)
      },
      nextSteps: [
        'Test movies API: /api/movies',
        'Test trending: /api/movies/trending',
        'Login with demo credentials',
        'Check debug info: /api/debug'
      ]
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/bookings', require('./routes/bookings'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableEndpoints: {
      root: '/api',
      health: '/api/health',
      seed: '/api/seed',
      debug: '/api/debug'
    }
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    };

    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(mongoUri, connectionOptions);

    console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log('🎬 Cinema Booking Database ready');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️ Server will continue running without database...');
    
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

const PORT = process.env.PORT || 5000;

// Initialize database connection and start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log('🎬 Cinema Booking API Server');
    console.log('=' + '='.repeat(29));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌱 Seed Database: http://localhost:${PORT}/api/seed`);
    console.log(`🔍 Debug Info: http://localhost:${PORT}/api/debug`);
    console.log('');
    console.log('🎯 Quick Test URLs:');
    console.log(`• Root API: http://localhost:${PORT}/api`);
    console.log(`• Movies: http://localhost:${PORT}/api/movies`);
    console.log(`• Trending: http://localhost:${PORT}/api/movies/trending`);
    console.log('');
    console.log('🔐 Demo Credentials:');
    console.log('• Admin: admin@cinemabooking.com / admin123');
    console.log('• User: john.doe@example.com / password123');
    console.log('');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Trust Proxy: ${app.get('trust proxy') ? 'Enabled' : 'Disabled'}`);
    console.log(`⚡ Rate Limiting: Disabled for testing`);
    console.log('✅ Server ready for requests!');
  });
};

// FIXED: Graceful shutdown handlers (no callback in mongoose.connection.close())
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close().then(() => {
      console.log('📊 Database connection closed');
      process.exit(0);
    }).catch((error) => {
      console.error('Error closing database connection:', error);
      process.exit(1);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close().then(() => {
      console.log('📊 Database connection closed');
      process.exit(0);
    }).catch((error) => {
      console.error('Error closing database connection:', error);
      process.exit(1);
    });
  } else {
    process.exit(0);
  }
});

// Start the server
startServer().catch(console.error);