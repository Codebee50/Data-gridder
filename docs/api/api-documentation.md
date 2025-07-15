# HabitLock Backend API Documentation

## Overview

This documentation provides a comprehensive guide to the HabitLock Backend API, detailing the available endpoints across different modules of the application.

## API Endpoints

### Accounts API

The Accounts API provides endpoints for user management and authentication:

#### User Registration and Authentication
- `POST /api/v1/accounts/register/`: Register a new user
- `POST /api/v1/accounts/login/`: User login
- `POST /api/v1/accounts/logout`: User logout
- `POST /api/v1/accounts/signin/google/`: Google Sign-In

#### Email Verification
- `POST /api/v1/accounts/email/verify/`: Verify email
- `POST /api/v1/accounts/verification/resend/`: Resend verification email

#### Profile Management
- `GET /api/v1/accounts/profile/`: Retrieve user profile
- `PUT /api/v1/accounts/profile/edit/`: Edit user profile
- `POST /api/v1/accounts/location/update/`: Update user location
- `POST /api/v1/accounts/timezone/update/`: Update user timezone

#### Password Management
- `POST /api/v1/accounts/password/reset/request/`: Request password reset
- `POST /api/v1/accounts/password/reset/`: Reset password

#### Additional Features
- `GET /api/v1/accounts/countries/supported/`: Get supported countries
- `GET /api/v1/accounts/search/`: Search users
- `GET /api/v1/accounts/notifications/`: Get user notifications

### Habits API

The Habits API provides endpoints for habit tracking and management:

#### Habit Management
- `GET /api/v1/habit/`: List habits
- `POST /api/v1/habit/create/`: Start a new habit
- `GET /api/v1/habit/<id>/`: Get habit details
- `POST /api/v1/habit/day/complete/`: Complete daily habit
- `GET /api/v1/habit/user-habits/`: List user's habits

#### Habit Group Features
- `POST /api/v1/habit/group/create/`: Create habit group
- `POST /api/v1/habit/group/join/`: Join a habit group
- `GET /api/v1/habit/group/<id>/`: Get habit group details
- `GET /api/v1/habit/user/user-groups/`: List user-created habit groups

#### Validation and Search
- `POST /api/v1/habit/data/validate/`: Validate habit creation data
- `GET /api/v1/habit/search/`: Search habits
- `GET /api/v1/habit/user-habit/search/`: Search user habits

### Payments API

The Payments API handles transaction-related operations:
- `POST /api/v1/payments/paystack/webhook/`: Paystack webhook
- `GET /api/v1/payments/verify/<reference>/`: Verify transaction

### Donation API
- `POST /api/v1/donation/`: Create a donation

### Newsletter API
- `POST /api/v1/newsletter/`: Newsletter subscription

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Documentation Tools

- Swagger UI: `/api/docs/`
- ReDoc UI: `/api/redoc/`
- API Schema: `/api/schema/`

## Error Handling

The API returns standard HTTP status codes and JSON error responses. Always check the status code and error message for detailed information.

## Rate Limiting

API endpoints may have rate limiting to prevent abuse. Refer to specific endpoint documentation for details.