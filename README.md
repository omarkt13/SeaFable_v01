# SeaFable Platform - Comprehensive Aquatic Adventure Platform

## 🎯 Overview

SeaFable is a comprehensive aquatic adventure platform that combines robust business infrastructure with diverse activity types and enhanced user experience. This platform supports multiple water sports and marine activities, providing a complete solution for both business owners and customers.

## ✨ Key Features

### 🏄‍♂️ Multi-Activity Support
- **Sailing**: Yacht charters, sailing lessons, and racing experiences
- **Surfing**: Surf lessons, guided tours, and advanced coaching
- **Diving**: Scuba diving, snorkeling, and underwater exploration
- **Kayaking**: Sea kayaking, river kayaking, and wildlife tours
- **Fishing**: Deep sea fishing, inshore fishing, and fishing charters
- **Jet Skiing**: Jet ski rentals and guided tours
- **Whale Watching**: Marine wildlife observation and educational tours
- **Paddleboarding**: Stand-up paddleboarding and SUP tours
- **Windsurfing**: Windsurfing lessons and equipment rental
- **Snorkeling**: Guided snorkeling tours and equipment rental

### 🏢 Business Portal Features
- **Experience Management**: Create and manage diverse activity types
- **Equipment Tracking**: Comprehensive equipment inventory management
- **Host Profiles**: Multi-role host management (captain, instructor, guide, operator)
- **Certification Management**: Track host certifications and qualifications
- **Advanced Analytics**: Activity-specific performance metrics
- **Booking Management**: Comprehensive booking and scheduling system

### 🔍 Enhanced Search & Discovery
- **Advanced Filtering**: Filter by activity type, difficulty, price, location
- **Equipment Filters**: Find experiences with specific equipment provided
- **Weather Dependency**: Filter weather-dependent vs. all-weather activities
- **Instant Booking**: Real-time availability and instant booking options
- **Age Restrictions**: Filter by minimum age requirements

### 🛡️ Security & Performance
- **Input Sanitization**: XSS protection with isomorphic-dompurify
- **Rate Limiting**: Comprehensive rate limiting for all endpoints
- **SQL Injection Prevention**: Advanced input validation and sanitization
- **Content Security Policy**: Strict CSP headers for enhanced security
- **Password Strength Validation**: Multi-factor password requirements

## 🏗️ Architecture

### Database Schema
\`\`\`
experiences (expanded with activity fields)
├── activity_type (sailing, surfing, diving, etc.)
├── activity_specific_details (JSONB)
├── difficulty_level (beginner, intermediate, advanced, expert)
├── max_participants, min_age
├── equipment_provided, what_to_bring
├── weather_dependency, instant_booking
└── tags, highlights, included/excluded_services

host_profiles (renamed from captain_profiles)
├── role (captain, instructor, guide, operator)
├── specializations, certifications
├── years_experience, languages
└── emergency_contact

equipment (new table)
├── category (safety, activity, comfort, navigation)
├── condition, quantity
└── last_maintenance

certifications (new table)
├── issuing_authority, validity_period
├── category (safety, instruction, navigation, specialized)
└── description
\`\`\`

### API Structure
\`\`\`
/api/
├── business/             # Business management
├── activities/[type]/    # Activity-specific operations
├── equipment/            # Equipment management
├── certifications/       # Certification tracking
├── weather/              # Weather integration (planned)
└── bookings/             # Booking management
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account and project

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd SeaFable_v01
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Fill in your Supabase credentials and other environment variables.

4. **Database Setup**
   \`\`\`bash
   # Run migration scripts in order
   pnpm run db:migrate
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   pnpm dev
   \`\`\`

## 📊 Database Migrations

### Migration Order
1. `scripts/18-expand-activity-types.sql` - Core schema expansion
2. `scripts/19-seed-expanded-activities.sql` - Seed data for all activity types

### Key Changes
- **Experiences Table**: Added activity-specific fields and metadata
- **Host Profiles**: Renamed from captain_profiles, added role diversity
- **Equipment Management**: New equipment tracking system
- **Certifications**: Comprehensive certification management
- **Activity Types**: Support for 10 different aquatic activities

## 🎨 UI/UX Enhancements

### Activity Type Icons
- Sailing: ⛵
- Surfing: 🏄
- Kayaking: 🛶
- Diving: 🤿
- Jet Skiing: 🚤
- Fishing: 🎣
- Whale Watching: 🐋
- Paddleboarding: 🏄‍♂️
- Windsurfing: 🏄‍♀️
- Snorkeling: 🤿

### Difficulty Level Colors
- **Beginner**: Green (safe, family-friendly)
- **Intermediate**: Yellow (some experience helpful)
- **Advanced**: Orange (significant experience required)
- **Expert**: Red (professional level skills)

### Enhanced Experience Cards
- Activity type badges with icons
- Difficulty level indicators
- Equipment provided status
- Weather dependency indicators
- Participant capacity display
- Age requirement badges

## 🔧 Technical Implementation

### Security Features
- **Input Sanitization**: All user inputs sanitized with DOMPurify
- **Rate Limiting**: Configurable rate limits for different endpoints
- **SQL Injection Prevention**: Pattern-based input filtering
- **XSS Protection**: Comprehensive XSS pattern detection
- **CSRF Protection**: Token-based CSRF protection
- **Content Security Policy**: Strict CSP headers

### Performance Optimizations
- **Database Indexing**: Optimized indexes for activity types and filters
- **Caching Strategy**: Redis-based caching for frequently accessed data
- **Image Optimization**: Next.js image optimization for equipment photos
- **Lazy Loading**: Component-level lazy loading for better performance

### Type Safety
- **Comprehensive TypeScript**: Full type coverage for all components
- **Activity-Specific Types**: Type-safe activity-specific data structures
- **API Response Types**: Strict typing for all API responses
- **Form Validation**: Zod-based form validation with type inference

## 📱 Component Architecture

### Search & Discovery
\`\`\`
/components/search/
├── search-filters.tsx      # Advanced filtering system
├── activity-type-filter.tsx # Activity type selection
├── difficulty-filter.tsx    # Difficulty level filtering
└── equipment-filter.tsx    # Equipment-based filtering
\`\`\`

### Experience Management
\`\`\`
/components/experience/
├── experience-card.tsx     # Enhanced experience display
├── activity-badge.tsx      # Activity type badges
├── difficulty-indicator.tsx # Difficulty level display
└── equipment-list.tsx      # Equipment provided list
\`\`\`

### Business Portal
\`\`\`
/components/business/
├── experience-form.tsx     # Enhanced experience creation
├── equipment-manager.tsx   # Equipment inventory management
├── host-profiles.tsx       # Multi-role host management
└── certification-tracker.tsx # Certification management
\`\`\`

## 🧪 Testing Strategy

### Unit Tests
- Component rendering with new activity types
- API endpoint functionality
- Type validation
- Security middleware

### Integration Tests
- Complete booking flows
- Business portal workflows
- Search and filtering accuracy
- Data consistency across activity types

### User Acceptance Tests
- Business owner can create experiences for all activity types
- Customers can successfully book different activities
- Search returns relevant results
- Dashboard analytics reflect all activity types

## 📚 API Documentation

### Activity-Specific Endpoints
\`\`\`typescript
GET /api/activities/[type]
POST /api/activities/[type]
// Supports: sailing, surfing, kayaking, diving, jet-skiing,
//          fishing, whale-watching, paddleboarding, windsurfing, snorkeling
\`\`\`

### Equipment Management
\`\`\`typescript
GET /api/equipment?business_id=xxx&category=safety
POST /api/equipment
PUT /api/equipment
DELETE /api/equipment?id=xxx
\`\`\`

### Certification Management
\`\`\`typescript
GET /api/certifications?category=safety&host_id=xxx
POST /api/certifications
PATCH /api/certifications // Add certification to host
\`\`\`

## 🎯 Success Criteria

### Functional Requirements ✅
- [x] All v01 business features remain functional
- [x] New activity types fully integrated
- [x] Enhanced search and filtering working
- [x] Activity-specific booking flows operational
- [x] Business portal supports multi-activity management

### Technical Requirements ✅
- [x] No breaking changes to existing APIs
- [x] Maintains performance benchmarks
- [x] Security enhancements implemented
- [x] Type safety maintained throughout
- [x] Database migrations successful

### User Experience Requirements ✅
- [x] Intuitive activity type selection
- [x] Smooth booking experience for all activities
- [x] Business owners can easily manage diverse offerings
- [x] Search results relevant and well-filtered
- [x] Mobile experience optimized

## 🔄 Migration Guide

### From v01 to Enhanced Platform
1. **Backup existing data**
2. **Run migration scripts in order**
3. **Update environment variables**
4. **Test all functionality**
5. **Deploy with zero downtime**

### Breaking Changes
- `captain_profiles` table renamed to `host_profiles`
- New required fields in `experiences` table
- Enhanced type definitions for all components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the migration guide

---

**SeaFable Platform** - Where aquatic adventures meet business excellence 🌊
