# HabitLock Backend

## Overview

HabitLock is a Django-based backend application designed to help users track and manage their habits effectively. The project leverages modern web development technologies and provides robust features for habit tracking, user management, and various supporting services.

## Key Technologies

- **Backend Framework**: Django 5.2.1
- **Database**: PostgreSQL (with SQLite for development)
- **Authentication**: Django Rest Framework with Simple JWT
- **Task Queue**: Celery
- **API Documentation**: DRF Spectacular
- **Deployment**: Docker, Railway

## Main Features

- User Account Management
- Habit Tracking System
- Payments Integration
- Donation Management
- Newsletter Functionality
- Scheduled Tasks and Reminders

## Project Structure

The backend is organized into several Django apps:
- `accounts`: User authentication and profile management
- `habit`: Core habit tracking functionality
- `payments`: Payment processing
- `donation`: Donation management
- `newsletter`: Email newsletter system

## Development Setup

### Prerequisites
- Python 3.10+
- Docker (optional)
- PostgreSQL

### Installation
1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables
4. Run migrations
5. Start the development server

## Docker Support

The project includes a Dockerfile and docker-compose configuration for easy deployment and local development.

## API Documentation

Comprehensive API documentation is available through DRF Spectacular, providing detailed information about available endpoints and request/response structures.
