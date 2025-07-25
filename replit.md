# Career Guidance Platform

## Overview

This is an AI-powered career guidance platform built as a single-page application (SPA) that helps users discover career opportunities through CV analysis and profile matching. The platform uses modern web technologies with AI integration to provide personalized career recommendations.

**Latest Update**: Added comprehensive mock AI service for cost-free testing during development. The system automatically detects when API keys are missing and switches to test mode, allowing full functionality testing without OpenAI costs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript
- **UI Framework**: Bootstrap 5.3.0 for responsive design and components
- **Icons**: Font Awesome 6.4.0 for iconography
- **Architecture Pattern**: Component-based SPA with modular JavaScript services
- **Styling**: Custom CSS with CSS variables for theming and Bootstrap integration

### Backend Architecture
- **Database**: Supabase (PostgreSQL-based) for user data, profiles, and job opportunities
- **Authentication**: Supabase Auth for user management and session handling
- **AI Integration**: OpenAI GPT-4o for CV analysis and profile matching
- **File Storage**: Supabase Storage for CV uploads

### Component Structure
- **Modular Components**: Each major feature is separated into HTML components
- **Service Layer**: JavaScript services handle business logic and API interactions
- **State Management**: Client-side state management through service classes

## Key Components

### 1. Authentication System (`js/auth.js`)
- Handles user login, registration, and session management
- Integrates with Supabase Auth
- Manages user profile creation and retrieval
- Provides error handling and validation

### 2. Profile Management (`js/profile.js`)
- Manages user professional profiles
- Handles CRUD operations for user data
- Stores biography, experiences, education, certifications, and skills

### 3. AI Analysis Service (`js/ai-analysis.js`)
- Integrates with OpenAI GPT-4o for CV and profile analysis
- Provides fallback local analysis when API is unavailable
- Generates career recommendations and match scores
- Validates input data before processing

### 4. Opportunity Management (`js/opportunities.js`)
- Manages job opportunities and matching
- Implements filtering and sorting functionality
- Calculates compatibility scores between users and opportunities
- Handles application submissions

### 5. Supabase Client (`js/supabase-client.js`)
- Centralized database connection management
- Handles Supabase client initialization
- Provides connection status checking

### 6. Application Controller (`js/app.js`)
- Main application orchestrator
- Manages view routing and state transitions
- Handles global event listeners and error management

### 7. Mock AI Service (`js/mock-ai-service.js`)
- **NEW**: Comprehensive testing service for AI functionality
- Simulates OpenAI responses with realistic data for 5 sectors
- Includes mock job opportunities with realistic match scores
- Provides cost-free testing during development
- Automatically activates when API keys are missing

### 8. Test Control Panel (`components/test-panel.html`)
- **NEW**: Development interface for managing test mode
- Real-time statistics on mock API calls and saved costs
- Controls for switching between test and live modes
- Configurable response delays for realistic testing
- Automatically appears in development environments

### 9. Utility Functions (`js/utils.js`)
- Common utility functions for UI interactions
- Toast notifications and loading states
- Form validation and data formatting

## Data Flow

### User Onboarding Flow
1. **CV Upload**: Users upload their CV through drag-and-drop interface
2. **Registration**: Multi-step registration process with personal information
3. **Profile Creation**: Detailed profile form with AI analysis capability
4. **Dashboard Access**: Complete dashboard with opportunities and recommendations

### Profile Analysis Flow
1. **Data Collection**: Gather user profile information and CV
2. **AI Processing**: Send data to OpenAI for analysis or use local fallback
3. **Result Generation**: Create personalized recommendations and insights
4. **Storage**: Save analysis results and recommendations to database

### Opportunity Matching Flow
1. **Profile Retrieval**: Get user's complete profile data
2. **Opportunity Loading**: Fetch active job opportunities from database
3. **Match Calculation**: Calculate compatibility scores using AI or rule-based logic
4. **Filtering/Sorting**: Apply user-selected filters and sorting preferences
5. **Display**: Present ranked opportunities with match percentages

## External Dependencies

### Third-Party Services
- **Supabase**: Backend-as-a-Service for database, authentication, and file storage
- **OpenAI**: GPT-4o model for AI-powered analysis and recommendations
- **Bootstrap**: Frontend UI framework for responsive design
- **Font Awesome**: Icon library for enhanced UI

### CDN Dependencies
- Bootstrap CSS and JavaScript
- Font Awesome icons
- Supabase JavaScript client (loaded via CDN)

### npm Dependencies
- **openai**: Official OpenAI Node.js library for API integration

## Deployment Strategy

### Frontend Deployment
- **Static Hosting**: Can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages)
- **No Build Process**: Direct deployment of source files (no compilation required)
- **CDN Assets**: External dependencies loaded from CDNs for optimal performance

### Environment Configuration
- **Supabase Configuration**: URL and API key configuration required
- **OpenAI API Key**: Required for AI analysis functionality
- **Environment Variables**: Support for both client-side and server-side configuration

### Database Setup
The application expects the following Supabase database schema:

#### Tables Required
- `user_profiles`: User professional data and preferences
- `job_opportunities`: Available career opportunities
- `companies`: Company information linked to opportunities
- `applications`: User applications to opportunities

#### Storage Buckets
- CV file storage for uploaded documents
- Profile images (optional)

### Scalability Considerations
- **Client-Side Processing**: Reduces server load by handling UI logic in browser
- **API Rate Limiting**: Built-in fallback for AI analysis when API limits are reached
- **Caching Strategy**: Local storage for user sessions and temporary data
- **Progressive Enhancement**: Core functionality works without JavaScript