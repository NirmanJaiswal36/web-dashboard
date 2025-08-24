# Emergency API Setup Guide

## Django Backend Setup

This guide explains how to implement the emergency alerts API in your Django REST Framework backend.

### 1. Install Required Packages

```bash
pip install django djangorestframework django-cors-headers
```

### 2. Add to Django Settings

Add to your `settings.py`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'your_app_name',  # Replace with your app name
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings for your Next.js frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

### 3. Create the Emergency App

```bash
python manage.py startapp emergencies
```

### 4. Implement the Code

Copy the code from `django-emergency-api.py` into the appropriate files:

- `models.py` - Emergency model
- `serializers.py` - Emergency serializers
- `views.py` - Emergency viewset with API endpoints
- `urls.py` - URL routing
- `admin.py` - Admin interface

### 5. Add URLs to Main Project

In your main `urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('emergencies.urls')),
]
```

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Create Sample Data

Create the management command and run:

```bash
python manage.py create_sample_emergencies
```

### 9. Start Django Server

```bash
python manage.py runserver 8000
```

## API Endpoints

Once set up, your API will provide these endpoints:

### Get All Emergencies
```
GET /api/emergencies/
```

### Get Active Emergencies Only
```
GET /api/emergencies/active/
```

### Get Critical Emergencies Only
```
GET /api/emergencies/critical/
```

### Create New Emergency
```
POST /api/emergencies/
{
    "title": "Emergency Title",
    "description": "Description of the emergency",
    "lat": 20.5937,
    "lng": 78.9629,
    "severity": "critical",
    "photo_url": "https://example.com/photo.jpg"
}
```

### Update Emergency Status
```
POST /api/emergencies/{id}/update_status/
{
    "status": "resolved"
}
```

### Assign Emergency
```
POST /api/emergencies/{id}/assign/
{
    "user_id": 1
}
```

### Get Emergency Statistics
```
GET /api/emergencies/statistics/
```

## Query Parameters

- `severity`: Filter by severity (low, medium, high, critical)
- `status`: Filter by status (reported, assigned, in_progress, resolved, closed)
- `lat`, `lng`, `radius`: Filter by location within radius (km)
- `time_range`: Filter by time (1h, 24h, 7d)

## Frontend Integration

The Next.js frontend is already configured to:

1. **Fetch emergencies** from the API every 30 seconds
2. **Display red flag alerts** prominently on the home dashboard
3. **Show emergency markers** on the map
4. **Provide emergency details** in a modal popup
5. **Auto-focus map** when an emergency is clicked

## Authentication

The API requires authentication. Make sure to:

1. Create user accounts in Django admin
2. Generate API tokens for frontend authentication
3. Set the `Authorization: Token your_token_here` header in API requests

## Testing

Test the API endpoints using:

- Django admin interface at `http://localhost:8000/admin/`
- API browser at `http://localhost:8000/api/emergencies/`
- Frontend dashboard at `http://localhost:3001/`

## Real-time Updates

The frontend polls the API every 30 seconds for new emergencies. For true real-time updates, consider implementing:

- WebSocket connections with Django Channels
- Server-Sent Events (SSE)
- Push notifications

## Security Considerations

1. Validate location coordinates
2. Sanitize user input
3. Implement rate limiting
4. Add proper authentication/authorization
5. Use HTTPS in production
6. Set appropriate CORS policies

## Production Deployment

When deploying to production:

1. Set `DEBUG = False` in Django settings
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure environment variables
5. Set proper CORS and ALLOWED_HOSTS
6. Use a production WSGI server (Gunicorn, uWSGI)
7. Set up proper logging
