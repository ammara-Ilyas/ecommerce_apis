# 🛒 Ecommerce Backend API

A robust, secure, and scalable ecommerce backend API built with Node.js, Express, and MongoDB.

## ✨ Features

### 🔐 Security Features
- **JWT Authentication** with role-based access control
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent brute force attacks
- **Input Validation & Sanitization** using express-validator
- **Security Headers** with Helmet.js
- **CORS Protection** with configurable origins
- **Account Lockout** after failed login attempts
- **Request Size Limiting** to prevent DoS attacks
- **IP Blocklisting** capability

### 📊 Performance & Monitoring
- **Comprehensive Logging** with Winston and daily rotation
- **Request/Response Logging** with performance metrics
- **Compression** for faster response times
- **Database Connection Pooling** for optimal performance
- **Graceful Shutdown** handling
- **Health Check Endpoints**

### 🏗️ Architecture & Code Quality
- **Modular Structure** with clear separation of concerns
- **Error Handling** with custom error classes
- **Async/Await** with proper error wrapping
- **Input Validation** middleware
- **Response Standardization** across all endpoints
- **Environment-based Configuration**

### 👥 User Management
- **Email Verification** with OTP
- **Password Reset** functionality
- **Profile Management** with address support
- **User Preferences** and settings
- **Account Locking** for security
- **Social Login** support (Google, Facebook)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce_apis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   jwt_SECRET_KEY=your-super-secret-jwt-key
   jwt_REFRESH_SECRET_KEY=your-refresh-secret-key
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-webhook-secret
   
   # Optional: Blocked IPs (comma-separated)
   BLOCKED_IPS=192.168.1.1,10.0.0.1
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user account.
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/login`
Authenticate user and get JWT token.
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/verify-otp`
Verify email with OTP.
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST `/api/auth/request-reset`
Request password reset.
```json
{
  "email": "john@example.com"
}
```

### User Management Endpoints

#### GET `/api/auth/profile`
Get user profile (requires authentication).

#### PUT `/api/auth/profile`
Update user profile (requires authentication).
```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": false
    }
  },
  "addresses": [
    {
      "type": "home",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "isDefault": true
    }
  ]
}
```

### Admin Endpoints

#### GET `/api/auth/users`
Get all users (admin only).
```
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search by name or email
- role: Filter by role (user/admin/seller)
- isActive: Filter by active status
```

#### GET `/api/auth/stats`
Get user statistics (admin only).

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `8000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `jwt_SECRET_KEY` | JWT signing secret | Required |
| `EMAIL_HOST` | SMTP host | Required |
| `EMAIL_USER` | SMTP username | Required |
| `EMAIL_PASS` | SMTP password | Required |

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Strict endpoints**: 5 requests per 15 minutes

### Security Settings

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **JWT Expiry**: 7 days
- **OTP Expiry**: 10 minutes
- **Account Lockout**: 5 failed attempts for 2 hours

## 📁 Project Structure

```
ecommerce_apis/
├── config/                 # Configuration files
├── controllers/           # Route controllers
├── libs/                  # External service integrations
├── middleware/            # Custom middleware
├── models/                # Database models
├── public/                # Static files
├── routes/                # API routes
├── src/
│   ├── middleware/        # Enhanced middleware
│   ├── utils/             # Utility functions
│   ├── db.js             # Database connection
│   └── index.js          # Main server file
├── logs/                  # Application logs
└── package.json
```

## 🛡️ Security Best Practices

1. **Input Validation**: All inputs are validated and sanitized
2. **Password Security**: Strong password requirements and secure hashing
3. **Rate Limiting**: Prevents brute force and DoS attacks
4. **JWT Security**: Secure token generation and validation
5. **Error Handling**: No sensitive information leaked in errors
6. **CORS Protection**: Configurable cross-origin resource sharing
7. **Security Headers**: Protection against common web vulnerabilities

## 📊 Monitoring & Logging

### Log Levels
- **ERROR**: Application errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### Log Files
- `logs/combined-YYYY-MM-DD.log`: All logs
- `logs/error-YYYY-MM-DD.log`: Error logs only

### Health Check
- **Endpoint**: `GET /health`
- **Response**: Server status, uptime, and environment info

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure MongoDB connection
- [ ] Set strong JWT secrets
- [ ] Configure email service
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS certificates

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using Node.js, Express, and MongoDB** 