# StoreHub - Comprehensive E-commerce Platform

A full-stack e-commerce platform for selling network devices, software licenses, and installation services with multi-language support, role-based access control, and comprehensive admin features.

## 🚀 Features

### Frontend (React + TypeScript)
- **Multi-language Support**: Arabic & English with RTL layout
- **Theme System**: Light/Dark mode toggle
- **User Management**: Individual, Company, Affiliate, and Admin roles
- **Product Catalog**: Network devices, software licenses, installation services
- **Shopping Cart**: Full cart functionality with points system
- **Dashboard**: Analytics with charts and metrics
- **Admin Panel**: Complete admin dashboard for management
- **Authentication**: JWT-based auth with OTP email verification
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend (Django + DRF)
- **Custom User Model**: Extended user model with roles and verification
- **JWT Authentication**: Secure token-based authentication
- **OTP Email Verification**: 6-digit OTP system for email verification
- **RESTful API**: Complete API with proper serialization
- **Admin Interface**: Django admin for backend management
- **PostgreSQL**: Production-ready database setup
- **Email System**: SMTP email configuration for OTP delivery

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form for form handling
- React Router for navigation
- Recharts for data visualization
- React Hot Toast for notifications

### Backend
- Django 4.2 with Django REST Framework
- PostgreSQL database
- JWT authentication with djangorestframework-simplejwt
- Email backend for OTP verification
- CORS headers for frontend integration
- Comprehensive API documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL 12+

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will run on `http://localhost:5173`

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Setup database
createdb storehub_db
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Django server
python manage.py runserver 8000
```
The backend will run on `http://localhost:8000`

## 📱 Demo Accounts

For testing purposes, you can use these demo accounts:

- **Admin**: admin@storehub.com
- **Individual**: john@example.com  
- **Company**: contact@techcorp.com
- **Password**: password123

## 🔐 Authentication Flow

1. **Registration**: User registers with email and role
2. **OTP Verification**: 6-digit OTP sent to email
3. **Email Verification**: User enters OTP to verify account
4. **Login**: User can login after email verification
5. **JWT Tokens**: Access and refresh tokens for API access

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/verify-otp/` - Verify email with OTP
- `POST /api/auth/resend-otp/` - Resend OTP code
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User Management
- `GET /api/auth/profile/` - Get user profile
- `PATCH /api/auth/profile/` - Update user profile
- `PATCH /api/auth/update/` - Update user information
- `POST /api/auth/change-password/` - Change password

## 🧪 Testing

### Postman Collection
Import the `backend/Postman_Collection.json` file into Postman to test all API endpoints.

### Frontend Testing
The frontend includes comprehensive error handling and loading states for all API interactions.

## 🌐 Internationalization

The platform supports both Arabic and English:
- **RTL Layout**: Proper right-to-left layout for Arabic
- **Translation System**: Comprehensive translation keys
- **Language Toggle**: Easy switching between languages
- **Localized Content**: All UI elements translated

## 🎨 Design System

- **Color Palette**: Professional blue, green, and neutral colors
- **Typography**: Consistent font sizes and weights
- **Spacing**: 8px grid system
- **Components**: Reusable UI components
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://username:password@localhost:5432/storehub_db
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 📦 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
# Set production environment variables
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# Collect static files
python manage.py collectstatic

# Run with production server (gunicorn)
gunicorn storehub.wsgi:application
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the Postman collection
- Open an issue on GitHub

## 🔄 Development Status

- ✅ User Authentication with OTP
- ✅ Multi-language Support
- ✅ Product Catalog
- ✅ Shopping Cart
- ✅ Dashboard Analytics
- ✅ Admin Panel
- ✅ Responsive Design
- 🔄 Payment Integration (Stripe)
- 🔄 Order Management
- 🔄 Inventory Management
- 🔄 Email Notifications
- 🔄 Advanced Analytics

---

Built with ❤️ using React, Django, and modern web technologies.