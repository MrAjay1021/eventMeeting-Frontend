# Event Scheduling Application

A complete event scheduling and meeting management system with user authentication, event creation, booking, and calendar management features.

## Setup Instructions

# Event App Frontend

React-based frontend for the Event Scheduling Application.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Create a `.env` file based on `.env.example` if needed
   - Ensure the backend API URL is correctly set (default is http://localhost:5000)

3. **Start Development Server**
   ```bash
   npm start
   ```

   The application will run on [http://localhost:3000](http://localhost:3000)

## Features

- **Authentication System**
  - User signup and login
  - Protected routes for authenticated users

- **Event Management**
  - Create various event types
  - Set event durations and availability
  - Manage event participants

- **Calendar Integration**
  - View booked events on calendar
  - Google Calendar integration

- **User Profile**
  - Profile customization
  - Preference settings
  - Availability management

- **Responsive UI**
  - Works on desktop and mobile devices

## Folder Structure

- **src/components/** - Reusable UI components
- **src/pages/** - Main application pages
- **src/contexts/** - React context providers
- **src/services/** - API service integrations
- **src/utils/** - Utility functions
- **src/hooks/** - Custom React hooks
- **src/assets/** - Images and static assets

## Demo Credentials

- **Email:** demo@example.com
- **Password:** demopassword

## Technologies Used

- React.js
- React Router
- Axios for API requests
- React Hook Form for form handling
- React Calendar/Big Calendar for date/time functionality
- React Toastify for notifications 
