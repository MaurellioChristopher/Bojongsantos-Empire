# 🌾 AksesPangan - Dokumentasi Teknis Proyek
## Platform Penyelamatan Surplus Pangan & Pengurangan Emisi Karbon

---

## 📋 Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Informasi Tim & Organisasi](#informasi-tim--organisasi)
3. [Arsitektur Sistem](#arsitektur-sistem)
4. [Technology Stack](#technology-stack)
5. [Struktur Mikroservis](#struktur-mikroservis)
6. [Fitur & Fungsionalitas](#fitur--fungsionalitas)
7. [Keamanan & Compliance](#keamanan--compliance)
8. [Deployment & Infrastructure](#deployment--infrastructure)
9. [Panduan Pengembangan](#panduan-pengembangan)
10. [Appendix: AI-Assisted Development](#appendix-ai-assisted-development)

---

## 1. Ringkasan Eksekutif

### Latar Belakang Proyek

**AksesPangan** adalah platform ekosistem sirkular berbasis web yang dirancang untuk mengatasi dua masalah kritis di Indonesia:
- **Food Waste**: 23-48 juta ton makanan terbuang per tahun
- **Food Insecurity**: 19.4% penduduk mengalami kerawanan pangan

Platform ini menghubungkan penyedia makanan surplus dengan penerima manfaat secara real-time, dilengkapi dengan telemetri ESG (Environmental, Social, Governance) untuk melacak reduksi emisi karbon, sertifikat keberlanjutan digital, dan kepatuhan mutu pangan berbasis standar BPOM & HACCP.

### Link Penting
- **Live Demo**: https://bojongsantos-empire.vercel.app
- **GitHub Repository**: https://github.com/MaurellioChristopher/Bojongsantos-Empire
- **Framework**: Next.js 16.3.5 (App Router + Turbopack)
- **Database**: Supabase (PostgreSQL + Realtime)

### Statistik Proyek
- **Lines of Code**: ~15,000+ lines
- **Components**: 25+ React components
- **API Routes**: 15+ Next.js API endpoints
- **Microservices**: 5 independent services
- **Database Tables**: 10+ Supabase tables

---

## 2. Informasi Tim & Organisasi

### Tim Pengembang: **Bojongsantos Empire**

#### Struktur Tim Manusia (4 Anggota)

1. **Project Lead & Full-Stack Developer**
   - Koordinasi proyek end-to-end
   - Arsitektur sistem & database design
   - Integration & deployment

2. **Frontend Developer**
   - UI/UX implementation
   - Component architecture
   - State management & routing

3. **Backend Developer**
   - Microservices architecture
   - API gateway implementation
   - Database optimization

4. **DevOps Engineer**
   - Docker containerization
   - CI/CD pipeline
   - Monitoring & observability

### 🤖 AI Agent Personas (5 Specialized Agents)

Tim manusia didukung oleh 5 AI agent spesialisasi melalui platform **Kiro IDE**:

#### 1. **Architect Agent** (`@architect`)
- **Peran**: System Design & Technical Decision Making
- **Tanggung Jawab**:
  - Desain arsitektur mikroservis
  - Database schema design & optimization
  - Performance & scalability planning
  - Technical documentation
- **Kompetensi**:
  - System architecture patterns (microservices, event-driven)
  - Database design (PostgreSQL, indexing, normalization)
  - API design (RESTful, GraphQL considerations)
  - Performance optimization strategies

#### 2. **UI/UX Agent** (`@uiux`)
- **Peran**: Interface Design & User Experience
- **Tanggung Jawab**:
  - Component design system
  - Accessibility compliance (WCAG 2.1 AA)
  - Apple Design Language implementation
  - Animation & micro-interactions
- **Kompetensi**:
  - React component architecture
  - CSS-in-JS & Tailwind CSS
  - Framer Motion animations
  - Responsive design patterns
  - User flow optimization

#### 3. **Security Agent** (`@security`)
- **Peran**: Application Security & Compliance
- **Tanggung Jawab**:
  - Authentication & authorization implementation
  - Data encryption & secure storage
  - OWASP compliance
  - Security audit & vulnerability assessment
- **Kompetensi**:
  - JWT & session management
  - Supabase Row Level Security (RLS)
  - Input validation & sanitization
  - HTTPS & secure communication
  - GDPR/Privacy compliance

#### 4. **Geospatial Agent** (`@geo`)
- **Peran**: Location-Based Services & Mapping
- **Tanggung Jawab**:
  - Leaflet map integration
  - Geolocation & distance calculation
  - Spatial data optimization
  - Route optimization algorithms
- **Kompetensi**:
  - Leaflet & React-Leaflet
  - Haversine distance formula
  - GeoJSON data structures
  - Map clustering & performance
  - OpenStreetMap integration

#### 5. **Testing Agent** (`@testing`)
- **Peran**: Quality Assurance & Testing Strategy
- **Tanggung Jawab**:
  - Test strategy & planning
  - Unit & integration testing
  - E2E testing scenarios
  - Performance testing
- **Kompetensi**:
  - Jest & React Testing Library
  - Playwright/Cypress E2E
  - Performance profiling
  - Load testing strategies

### Collaboration Model

Tim menggunakan **Kiro IDE** sebagai development environment dengan workflow:

1. **Planning**: Architect agent membantu design decisions
2. **Implementation**: UI/UX & backend development dengan AI assistance
3. **Security Review**: Security agent melakukan code review otomatis
4. **Testing**: Testing agent generate test cases & run validations
5. **Deployment**: DevOps engineer dengan bantuan monitoring agents

**Komunikasi**:
- Daily sync via Kiro AI chat interface
- Code review dengan AI-powered suggestions
- Automated refactoring & optimization
- Real-time documentation generation

---

## 3. Arsitektur Sistem

### 3.1 Pola Arsitektur: Microservices Gateway Pattern

```
┌────────────────────────────────────────────────────────────────────┐
│                         User Browser Layer                         │
│                    (React 19 + Next.js 16 SSR)                     │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                        HTTP / HTTPS (Port 3000)
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                    aksespangan-web-gateway                         │
│              (Next.js Standalone + API Routes)                     │
│                                                                     │
│  Features:                                                          │
│  • Server-Side Rendering (SSR)                                     │
│  • Client Components Hydration                                     │
│  • API Route Handlers (Next.js 16 App Router)                     │
│  • Reverse Proxy to Microservices                                  │
│  • Fault Tolerance (Graceful Degradation)                          │
│  • LocalStorage Fallback Cache                                     │
└───────────┬───────────┬───────────┬───────────┬────────────────────┘
            │           │           │           │
   ┌────────┴────┐ ┌───┴────┐ ┌────┴────┐ ┌────┴─────┐
   ▼             ▼          ▼          ▼           ▼
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│ Auth │    │Inven-│    │Book- │    │Analy-│    │Gover-│
│Service│   │tory  │    │ing   │    │tics  │    │nance │
│:3001 │    │:3002 │    │:3003 │    │:3004 │    │:3005 │
└──┬───┘    └──┬───┘    └──┬───┘    └──┬───┘    └──┬───┘
   │           │           │           │           │
   └───────────┴───────────┴───────────┴───────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │  Supabase Cloud DB  │
              │    (PostgreSQL)     │
              │   + Realtime Sync   │
              │   + Row Level Sec   │
              └─────────────────────┘
```

### 3.2 Network Topology

**Docker Bridge Network**: `aksespangan-network`

```yaml
services:
  web-gateway:
    container_name: aksespangan-web-gateway
    ports: ["3000:3000"]
    networks: [aksespangan-network]
    
  auth-service:
    container_name: aksespangan-auth-service
    ports: ["3001:3001"]
    networks: [aksespangan-network]
    
  inventory-service:
    container_name: aksespangan-inventory-service
    ports: ["3002:3002"]
    networks: [aksespangan-network]
    
  booking-service:
    container_name: aksespangan-booking-service
    ports: ["3003:3003"]
    networks: [aksespangan-network]
    
  analytics-service:
    container_name: aksespangan-analytics-service
    ports: ["3004:3004"]
    networks: [aksespangan-network]
    
  governance-service:
    container_name: aksespangan-governance-service
    ports: ["3005:3005"]
    networks: [aksespangan-network]
```

### 3.3 Data Flow Architecture

#### User Authentication Flow
```
User → Next.js Gateway → Auth Service → Supabase Auth
                ↓
        Generate JWT Token
                ↓
        Store in Browser (httpOnly cookie)
                ↓
        Return User Session
```

#### Surplus Booking Flow
```
User (Penerima) → Browse Map (/penerima)
       ↓
Select Surplus Item → View Details
       ↓
Click "Book Now" → Inventory Service Check Stock
       ↓
Create Booking → Booking Service (Generate PIN)
       ↓
Update Inventory → Reduce Available Stock
       ↓
Send Notification → Email/SMS (Future: Twilio)
       ↓
User Receives QR Code + PIN
```

#### ESG Telemetry Flow
```
Provider Donates Surplus → Inventory Service Logs
                ↓
Analytics Service Calculates:
  • CO₂ Emission Reduction (kg × 2.5)
  • Economic Value Saved
  • Social Impact Metrics
                ↓
Governance Service Generates:
  • Digital ESG Certificate
  • Sustainability Report
  • Compliance Audit Trail
```

---

## 4. Technology Stack

### 4.1 Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Core Framework** | Next.js | 16.3.5 | SSR, App Router, API Routes |
| **UI Library** | React | 19.2.8 | Component-based UI |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Animation** | Framer Motion | 13.3.0 | Smooth transitions & animations |
| **Icons** | Lucide React | 1.46.0 | Modern icon library |
| **Maps** | Leaflet + React-Leaflet | 1.9.4 + 5.0.0 | Interactive geospatial maps |
| **Charts** | Recharts | 3.10.1 | Data visualization |
| **QR Codes** | qrcode.react | 3.1.0 | QR code generation |
| **QR Scanner** | jsqr | 1.4.0 | QR code scanning |

### 4.2 Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x | JavaScript runtime |
| **API Framework** | Next.js API Routes | 16.3.5 | RESTful API endpoints |
| **Microservices** | Express.js | - | Standalone services |
| **Database** | Supabase (PostgreSQL) | 2.116.0 | Cloud database + Realtime |
| **Authentication** | Supabase Auth | 2.116.0 | JWT-based auth |
| **Storage** | LocalStorage | Browser API | Client-side cache |

### 4.3 DevOps & Infrastructure

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Containerization** | Docker | Multi-container orchestration |
| **Orchestration** | Docker Compose | Service management |
| **Hosting** | Vercel | Serverless deployment |
| **Database Hosting** | Supabase Cloud | Managed PostgreSQL |
| **Version Control** | Git + GitHub | Source code management |
| **CI/CD** | Vercel Auto-Deploy | Continuous deployment |

### 4.4 Development Tools

| Tool | Purpose |
|------|---------|
| **Kiro IDE** | AI-powered development environment |
| **ESLint** | Code linting & quality |
| **Prettier** | Code formatting |
| **TypeScript Compiler** | Type checking |
| **Turbopack** | Fast bundler (Next.js 16) |

---

## 5. Struktur Mikroservis

### 5.1 Web Gateway Service (Port 3000)

**Teknologi**: Next.js 16 Standalone

**Tanggung Jawab**:
- Server-Side Rendering (SSR)
- API route handling
- Static asset serving
- Reverse proxy ke microservices
- Fault tolerance & graceful degradation

**Key Files**:
- `src/app/` - App Router pages
- `src/app/api/` - API route handlers
- `src/components/` - React components
- `src/lib/` - Utility functions
- `src/services/` - API client services

**API Routes**:
- `/api/auth/*` - Authentication endpoints
- `/api/surplus/*` - Surplus inventory management
- `/api/bookings/*` - Booking management
- `/api/impact/*` - ESG impact metrics
- `/api/admin/*` - Admin operations
- `/api/chat` - Real-time chat
- `/api/ai-chat` - AI assistant

### 5.2 Auth Service (Port 3001)

**Teknologi**: Node.js + Express.js

**Tanggung Jawab**:
- User registration
- Login/logout
- JWT token generation & validation
- Password hashing (bcrypt)
- Session management

**Endpoints**:
- `POST /auth/register` - Create new user
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Invalidate session
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh JWT token

**Database Tables**:
- `users` - User accounts
- `sessions` - Active sessions

### 5.3 Inventory Service (Port 3002)

**Teknologi**: Node.js + Express.js

**Tanggung Jawab**:
- Surplus item CRUD operations
- Stock management
- Expiration checking & auto-archive
- Category filtering
- Geospatial queries

**Endpoints**:
- `GET /surplus` - List all active surplus
- `GET /surplus/:id` - Get surplus detail
- `POST /surplus` - Create new surplus
- `PUT /surplus/:id` - Update surplus
- `DELETE /surplus/:id` - Remove surplus
- `POST /surplus/expire` - Run expiration check

**Database Tables**:
- `surplus_items` - Surplus inventory
  - Columns: id, provider_id, name, description, quantity, portion_count, food_category, item_type, price, is_free, expiry_time, status, location, address, created_at

### 5.4 Booking Service (Port 3003)

**Teknologi**: Node.js + Express.js

**Tanggung Jawab**:
- Create booking/reservation
- Generate pickup PIN & QR code
- Booking status management (pending → confirmed → completed/cancelled)
- Pickup deadline enforcement
- Notification triggers

**Endpoints**:
- `GET /bookings` - List user bookings
- `GET /bookings/:id` - Get booking detail
- `POST /bookings` - Create new booking
- `PUT /bookings/:id/status` - Update booking status
- `POST /bookings/:id/verify` - Verify pickup PIN

**Database Tables**:
- `bookings` - All reservations
  - Columns: id, surplus_id, recipient_id, recipient_name, quantity, pickup_pin, pickup_deadline, status, fulfillment_method, created_at

### 5.5 Analytics Service (Port 3004)

**Teknologi**: Node.js + Express.js

**Tanggung Jawab**:
- Calculate ESG impact metrics
- CO₂ emission reduction calculation
- Economic value tracking
- Social impact statistics
- Generate sustainability reports

**Endpoints**:
- `GET /analytics/impact` - Get overall impact
- `GET /analytics/provider/:id` - Provider-specific metrics
- `GET /analytics/trends` - Time-series data
- `GET /analytics/export` - Export CSV report

**Metrics Calculated**:
- Total kg food rescued
- CO₂ emission reduced (kg × 2.5 factor)
- Economic value saved (IDR)
- Number of meals served
- Provider participation rate

### 5.6 Governance Service (Port 3005)

**Teknologi**: Node.js + Express.js

**Tanggung Jawab**:
- Food safety compliance checks
- BPOM/HACCP standard validation
- Generate digital ESG certificates
- Audit trail logging
- Quality assurance reports

**Endpoints**:
- `GET /governance/certificate/:providerId` - Generate ESG cert
- `GET /governance/audit/:bookingId` - Get audit trail
- `POST /governance/complaint` - Submit quality complaint
- `GET /governance/standards/:category` - Get food safety guidelines

**Database Tables**:
- `audit_logs` - System audit trail
- `certificates` - Issued ESG certificates
- `complaints` - Quality complaints & resolutions

---

## 6. Fitur & Fungsionalitas

### 6.1 User Roles & Permissions

#### 1. Penerima (Beneficiary)
**Access**: `/penerima` dashboard

**Capabilities**:
- ✅ Browse interactive surplus map
- ✅ Filter by category, price, distance
- ✅ View surplus item details
- ✅ Book/reserve surplus items
- ✅ Receive QR code + pickup PIN
- ✅ Chat with providers
- ✅ View booking history
- ✅ Submit quality feedback
- ❌ Cannot create surplus items
- ❌ No admin access

#### 2. Penyedia (Provider/Donor)
**Access**: `/penyedia` dashboard

**Capabilities**:
- ✅ Create new surplus items (prepared meals / raw produce)
- ✅ Manage surplus inventory
- ✅ View incoming bookings
- ✅ Verify pickup PIN/QR code
- ✅ Chat with recipients
- ✅ View ESG impact dashboard
- ✅ Download sustainability certificates
- ✅ Export impact reports
- ❌ Cannot browse map as beneficiary
- ❌ Limited admin access

#### 3. Administrator
**Access**: `/#/admin` dashboard

**Capabilities**:
- ✅ Full system observability
- ✅ Monitor microservice health
- ✅ View all users & transactions
- ✅ Mediate disputes
- ✅ Generate platform-wide reports
- ✅ Access audit logs
- ✅ Manage system configurations
- ✅ View real-time analytics

### 6.2 Core Features Detail

#### A. Interactive Surplus Map (`/penerima`)

**Technology**: Leaflet + React-Leaflet

**Features**:
- Real-time geolocation of surplus items
- Dynamic map markers with category icons
- Cluster markers for dense areas
- Distance calculation (Haversine formula)
- Radius filter (1km, 3km, 5km, 10km, 25km)
- Price filter (Free, Paid, All)
- Item type filter (Prepared Meals, Raw Produce)
- Category filter dropdown
- Search bar with real-time filtering
- Mobile-responsive touch controls

**Visual Indicators**:
- 🔴 Red zone: Urgent (< 4 hours to expiry)
- 🟠 Orange zone: Soon (4-8 hours)
- 🟢 Green zone: Safe (> 8 hours)

**Map Interaction**:
```typescript
// Pseudo-code flow
User clicks marker → Popup appears
  ↓
Show: Name, Category, Distance, Time Left, Price
  ↓
User clicks "View Details" → Modal opens
  ↓
Full details + Book button
```

#### B. Surplus Item Management (`/penyedia/surplus`)

**Features**:
- Two-tab interface:
  - 🍽️ **Prepared Surplus** (siap_santap): Cooked meals ready to eat
  - 🧺 **Raw Produce** (bahan_baku): Fresh vegetables, fruits, ingredients
- Create new surplus form with:
  - Item name & description
  - Category selection (dynamic based on type)
  - Weight (kg) & portion count
  - Pricing (Free / Paid)
  - Safe consumption window (2h - 48h)
  - Pickup location
  - Allergen notes
- Edit existing surplus items
- Delete items with confirmation
- Real-time countdown timer for each item
- Status badges (Active, Expired, Booked)

**Category Mapping**:
- **Prepared Surplus**: Nasi, Lauk, Roti, Kue, Minuman, Lainnya
- **Raw Produce**: Sayur, Buah, Lainnya

#### C. Booking System

**Booking Flow**:
```
1. User selects surplus item from map
2. Click "Book Now" → Opens booking modal
3. Enter quantity & confirm details
4. System generates:
   - Unique 6-digit PIN code
   - QR code with booking ID
   - Pickup deadline (default: 4 hours from booking)
5. User receives booking confirmation
6. Provider verifies PIN/QR at pickup
7. System marks booking as completed
8. Stock automatically reduced
```

**Booking States**:
- `pending` - Awaiting pickup
- `confirmed` - Provider acknowledged
- `completed` - Successfully picked up
- `cancelled` - User/provider cancelled
- `expired` - Pickup deadline passed

**PIN Verification**:
```typescript
// Example PIN: "BSE472"
// QR Code contains: booking_id + encrypted_hash
// Provider scans QR or enters PIN
// System validates and updates status
```

#### D. ESG Impact Dashboard (`/penyedia/esg`)

**Telemetry Metrics**:
1. **Environmental Impact**
   - Total CO₂ Emission Reduced
   - Formula: `total_kg_rescued × 2.5 = kg_CO₂e`
   - Visual: Progress bar to yearly goal
   
2. **Social Impact**
   - Total meals/portions served
   - Number of beneficiaries reached
   - Community engagement score

3. **Economic Impact**
   - Total food value saved (IDR)
   - Cost avoidance for waste disposal
   - Tax incentive eligibility

**Visual Components**:
- Real-time counter animations (Framer Motion)
- Recharts line/bar graphs
- Monthly trend analysis
- Comparative benchmarks

**Certificate Generation**:
- Provider clicks "Generate Certificate"
- System creates PDF with:
  - Provider business info
  - Total impact metrics
  - QR code for verification
  - Digital signature & timestamp
- Downloadable & shareable

#### E. Real-Time Chat (`ChatModal`)

**Technology**: Supabase Realtime

**Features**:
- One-on-one chat between provider & recipient
- Message persistence in cloud DB
- Real-time sync across devices
- Typing indicators (future enhancement)
- Read receipts (future enhancement)
- Attachment support (images, PDFs)

**Database Schema**:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  sender_id UUID REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Security**:
- Row Level Security (RLS) enabled
- Users can only read messages from their own bookings
- Message encryption in transit (HTTPS)

#### F. Admin Dashboard (`/#/admin`)

**Sections**:

1. **System Health Tab**
   - Microservice status indicators
   - Health check every 30 seconds
   - Response time monitoring
   - Visual status: ✅ 200 OK | ❌ 503 DOWN
   - Service dependency graph

2. **Users Tab**
   - List all users (paginated)
   - Filter by role (Penerima, Penyedia, Admin)
   - User registration trends
   - Account status management

3. **Transactions Tab**
   - All bookings across platform
   - Filter by status, date range
   - Export to CSV
   - Revenue analytics (for paid items)

4. **Analytics Tab**
   - Platform-wide ESG metrics
   - Geographic heat maps
   - Peak usage times
   - Category popularity

5. **Complaints Tab** (Future)
   - Quality issue reports
   - Dispute mediation
   - Resolution tracking

### 6.3 Food Safety Compliance

**BPOM/HACCP Standards Implementation**:

Each surplus item shows safety guidelines based on category:

**Example: Prepared Rice Dishes**
- ✅ Safe at room temp: 4 hours max
- ✅ Refrigerated: 12 hours max
- ✅ Reheat to: 165°F (74°C) internal temp
- ❌ Do not: Leave uncovered, expose to sun
- ⚠️ Allergens: May contain gluten, nuts (if applicable)

**Auto-Expiration Logic**:
```typescript
// Runs every hour via cron job
function checkExpiredItems() {
  const now = new Date();
  surplusItems
    .filter(item => new Date(item.expiryTime) < now)
    .forEach(item => {
      item.status = 'expired';
      // Archive to expired_items table
      // Send notification to provider
    });
}
```

---

## 7. Keamanan & Compliance

### 7.1 Authentication & Authorization

**Method**: JWT (JSON Web Tokens) + Supabase Auth

**Flow**:
```
1. User submits credentials → POST /api/auth/login
2. Backend validates with Supabase Auth
3. Supabase returns JWT access token + refresh token
4. Gateway stores JWT in httpOnly cookie
5. Subsequent requests include JWT in Authorization header
6. Middleware validates JWT on protected routes
7. Token expires after 1 hour → Auto-refresh
```

**Password Security**:
- Bcrypt hashing (cost factor: 10)
- No plaintext storage
- Password strength validation (min 8 chars)
- Future: 2FA with email OTP

**Authorization Levels**:
```typescript
enum UserRole {
  PENERIMA = 'penerima',
  PENYEDIA = 'penyedia',
  ADMIN = 'admin'
}

// Middleware checks role before allowing access
function requireRole(role: UserRole) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### 7.2 Database Security (Supabase RLS)

**Row Level Security Policies**:

```sql
-- Surplus Items: Users can only see active items
CREATE POLICY "Public can view active surplus"
ON surplus_items FOR SELECT
USING (status = 'active' AND expiry_time > NOW());

-- Surplus Items: Providers can only edit their own
CREATE POLICY "Providers can update own items"
ON surplus_items FOR UPDATE
USING (auth.uid() = provider_id);

-- Bookings: Users can only see their own bookings
CREATE POLICY "Users view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = recipient_id OR auth.uid() = provider_id);

-- Messages: Users can only see messages from their bookings
CREATE POLICY "Users view own messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = messages.booking_id
    AND (bookings.recipient_id = auth.uid() OR bookings.provider_id = auth.uid())
  )
);
```

### 7.3 API Security

**Measures**:
- Rate limiting (100 requests/minute per IP)
- Input validation & sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy headers)
- CORS policy (only allow trusted origins)
- HTTPS enforcement (Vercel auto-SSL)

**Headers**:
```typescript
// Next.js middleware security headers
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(self)');
  return NextResponse.next({ headers });
}
```

### 7.4 Data Privacy (GDPR/UU PDP Compliance)

**User Rights**:
- ✅ Right to access (users can export their data)
- ✅ Right to deletion (account deletion request)
- ✅ Right to rectification (edit profile)
- ✅ Data minimization (only collect necessary data)
- ✅ Purpose limitation (data used only for platform)
- ✅ Transparency (Privacy Policy displayed)

**Data Retention**:
- Active bookings: Retained indefinitely
- Completed bookings: Retained 1 year for analytics
- Cancelled bookings: Deleted after 30 days
- Expired surplus: Archived 90 days, then deleted
- Chat messages: Retained 1 year
- Audit logs: Retained 5 years (legal requirement)

**PII Handling**:
- Email: Encrypted at rest
- Phone: Masked in UI (081***456)
- Location: Only stored as lat/lng (no address unless provided)
- No sensitive data in URLs or logs

---

## 8. Deployment & Infrastructure

### 8.1 Production Deployment (Vercel)

**Platform**: Vercel Serverless

**Configuration**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"], // Singapore
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

**Build Process**:
```bash
1. Push to GitHub main branch
2. Vercel webhook triggered
3. Clone repository
4. npm install (dependencies)
5. npm run build (Next.js build)
   - TypeScript compilation
   - Turbopack optimization
   - Static page generation
6. Deploy to Vercel Edge Network
7. Update production URL
8. Run post-deploy health checks
```

**Performance Optimizations**:
- Server-Side Rendering (SSR) for dynamic pages
- Static Generation for marketing pages
- Image optimization (Next.js Image component)
- Code splitting & lazy loading
- CDN caching (Vercel Edge Network)
- Gzip compression

**Monitoring**:
- Vercel Analytics (Web Vitals)
- Error tracking (Sentry integration - future)
- Uptime monitoring (Pingdom - future)

### 8.2 Docker Multi-Container Deployment

**For Local Development & Self-Hosting**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  web-gateway:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AUTH_SERVICE_URL=http://auth-service:3001
      - INVENTORY_SERVICE_URL=http://inventory-service:3002
      - BOOKING_SERVICE_URL=http://booking-service:3003
      - ANALYTICS_SERVICE_URL=http://analytics-service:3004
      - GOVERNANCE_SERVICE_URL=http://governance-service:3005
    networks:
      - aksespangan-network
    depends_on:
      - auth-service
      - inventory-service
      - booking-service
      - analytics-service
      - governance-service

  auth-service:
    build:
      context: ./microservices
      dockerfile: Dockerfile
    command: node auth.js
    ports:
      - "3001:3001"
    networks:
      - aksespangan-network

  inventory-service:
    build:
      context: ./microservices
      dockerfile: Dockerfile
    command: node inventory.js
    ports:
      - "3002:3002"
    networks:
      - aksespangan-network

  booking-service:
    build:
      context: ./microservices
      dockerfile: Dockerfile
    command: node booking.js
    ports:
      - "3003:3003"
    networks:
      - aksespangan-network

  analytics-service:
    build:
      context: ./microservices
      dockerfile: Dockerfile
    command: node analytics.js
    ports:
      - "3004:3004"
    networks:
      - aksespangan-network

  governance-service:
    build:
      context: ./microservices
      dockerfile: Dockerfile
    command: node governance.js
    ports:
      - "3005:3005"
    networks:
      - aksespangan-network

networks:
  aksespangan-network:
    driver: bridge
```

**Build & Run**:
```bash
# Build all containers
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Health check
curl http://localhost:3000/api/admin/health
```

### 8.3 Database Hosting (Supabase)

**Configuration**:
- Region: Singapore (ap-southeast-1)
- Instance: Free tier (500MB database, 1GB file storage)
- Connections: Pooled (max 60 concurrent)
- Backups: Daily automated backups (7-day retention)
- Realtime: Enabled for `messages` table

**Connection String**:
```
postgresql://postgres:[password]@db.supabase.co:5432/postgres
```

**Tables**:
1. `users` - 100+ rows
2. `surplus_items` - 500+ rows
3. `bookings` - 1000+ rows
4. `messages` - 5000+ rows
5. `audit_logs` - 10000+ rows
6. `certificates` - 50+ rows

**Indexes**:
```sql
-- Performance optimization indexes
CREATE INDEX idx_surplus_provider ON surplus_items(provider_id);
CREATE INDEX idx_surplus_status ON surplus_items(status);
CREATE INDEX idx_surplus_expiry ON surplus_items(expiry_time);
CREATE INDEX idx_bookings_recipient ON bookings(recipient_id);
CREATE INDEX idx_bookings_surplus ON bookings(surplus_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
```

### 8.4 CI/CD Pipeline

**Workflow**:
```
Developer → Git Push → GitHub
                         ↓
                 Vercel Auto-Deploy
                         ↓
                 Build & Test
                         ↓
             Deploy to Preview URL
                         ↓
         Manual Approval (optional)
                         ↓
          Deploy to Production
                         ↓
              Health Checks
                         ↓
            Rollback if Failed
```

**Future Enhancements**:
- GitHub Actions for automated testing
- Playwright E2E tests before deploy
- Lighthouse performance audits
- Security scanning (Snyk)

---

## 9. Panduan Pengembangan

### 9.1 Setup Development Environment

**Prerequisites**:
- Node.js 20.x or higher
- npm 10.x or higher
- Git
- Visual Studio Code (recommended)
- Kiro IDE extension (optional)

**Installation Steps**:

```bash
# 1. Clone repository
git clone https://github.com/MaurellioChristopher/Bojongsantos-Empire.git
cd Bojongsantos-Empire

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 5. Run development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

**Supabase Setup**:
1. Go to https://supabase.com/dashboard
2. Create new project (select Singapore region)
3. Go to Settings → API
4. Copy Project URL & anon/public key
5. Paste into `.env.local`

### 9.2 Project Structure

```
Bojongsantos-Empire/
├── .next/                    # Next.js build output
├── microservices/            # Standalone microservices
│   ├── auth.js
│   ├── inventory.js
│   ├── booking.js
│   ├── analytics.js
│   ├── governance.js
│   ├── Dockerfile
│   └── package.json
├── public/                   # Static assets
│   ├── images/
│   │   ├── surplus-*.jpg     # Surplus food images
│   │   └── hero-*.jpg        # Landing page images
│   ├── videos/
│   │   └── hero-food.webm
│   └── manifest.json
├── src/
│   ├── app/                  # Next.js 16 App Router
│   │   ├── api/              # API route handlers
│   │   │   ├── auth/
│   │   │   ├── surplus/
│   │   │   ├── bookings/
│   │   │   ├── impact/
│   │   │   ├── admin/
│   │   │   ├── chat/
│   │   │   └── ai-chat/
│   │   ├── page.tsx          # Landing page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── pages/            # Page-level components
│   │   │   ├── Homepage.tsx
│   │   │   ├── PenerimaMap.tsx
│   │   │   ├── PenyediaSurplus.tsx
│   │   │   ├── PenyediaBookings.tsx
│   │   │   ├── ESGDashboard.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── shared/           # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── features/         # Feature-specific components
│   │       ├── ChatModal.tsx
│   │       ├── QRCodeDisplay.tsx
│   │       └── FoodSafetyBanner.tsx
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/                  # Utility functions
│   │   ├── data.ts           # LocalStorage CRUD
│   │   ├── utils.ts          # Helper functions
│   │   ├── serverStore.ts    # In-memory cache
│   │   ├── microserviceGate.ts # Service health check
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client
│   │       └── server.ts     # Supabase server client
│   ├── services/             # API client services
│   │   ├── apiClient.ts      # Base HTTP client
│   │   ├── surplusService.ts
│   │   ├── bookingService.ts
│   │   ├── authService.ts
│   │   └── analyticsService.ts
│   └── types/                # TypeScript definitions
│       ├── index.ts          # Core types
│       └── api.ts            # API request/response types
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── AGENTS.md                 # AI Agent documentation (this file)
├── CLAUDE.md                 # Project brief for Claude AI
└── README.md                 # Project README
```

### 9.3 Coding Standards

**TypeScript Rules**:
- Always use explicit types (no `any` unless unavoidable)
- Use interfaces for objects, types for unions
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks

**React Best Practices**:
- Functional components only (no class components)
- Use hooks (useState, useEffect, useContext)
- Props destructuring
- Memoization for expensive computations (useMemo, useCallback)
- Lazy loading for heavy components

**CSS/Styling**:
- Tailwind utility classes preferred
- CSS modules for complex components
- Design tokens for colors & spacing
- Mobile-first responsive design
- Accessibility (ARIA labels, semantic HTML)

**Naming Conventions**:
- Components: PascalCase (`UserProfile.tsx`)
- Functions: camelCase (`getUserData()`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Files: kebab-case (`user-profile.tsx`) or PascalCase for components
- Database: snake_case (`user_id`, `created_at`)

### 9.4 Git Workflow

**Branching Strategy**:
```
main                 # Production-ready code
├── develop          # Integration branch
│   ├── feature/map-filters
│   ├── feature/esg-dashboard
│   ├── bugfix/booking-pin
│   └── hotfix/security-patch
```

**Commit Message Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Maintenance tasks

**Example**:
```
feat(map): add radius filter to surplus map

- Added dropdown for radius selection (1km, 3km, 5km, 10km, 25km)
- Implemented Haversine distance calculation
- Updated PenerimaMap component
- Added filter state management

Closes #42
```

### 9.5 AI-Assisted Development with Kiro

**Available AI Agents**:
- `@architect` - System design questions
- `@uiux` - UI/component design
- `@security` - Security reviews
- `@geo` - Geospatial features
- `@testing` - Test generation

**Example Usage**:
```
// In Kiro IDE chat
You: @architect I need to add a notification system for expired surplus items. What's the best approach?

Architect Agent: I recommend implementing a scheduled background job using Next.js cron API routes:
1. Create /api/cron/check-expiry route
2. Use Vercel Cron Jobs (cron.schedule)
3. Query surplus items where expiry_time < now()
4. Send notifications via Supabase Realtime
5. Archive expired items to separate table

Would you like me to generate the code?
```

**Code Generation**:
```
You: @uiux Create a notification toast component with success/error/warning variants

UI/UX Agent: [Generates complete component with Tailwind + Framer Motion]
```

**Security Review**:
```
You: @security Review this API endpoint for vulnerabilities
[paste code]

Security Agent: Found 2 issues:
1. Missing input validation on userId parameter (SQL injection risk)
2. No rate limiting (DDoS vulnerability)

Recommended fixes:
[provides code diff]
```

### 9.6 Testing Strategy

**Test Types**:
1. **Unit Tests** (Jest + React Testing Library)
   - Component rendering
   - Function logic
   - Utility helpers

2. **Integration Tests**
   - API route handlers
   - Database queries
   - Service interactions

3. **E2E Tests** (Playwright - future)
   - User flows
   - Critical paths
   - Cross-browser testing

**Example Unit Test**:
```typescript
// __tests__/lib/utils.test.ts
import { formatCountdown } from '@/lib/utils';

describe('formatCountdown', () => {
  it('should format hours correctly', () => {
    const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
    expect(formatCountdown(future.toISOString())).toBe('2h 0m');
  });

  it('should show expired when past', () => {
    const past = new Date(Date.now() - 1000);
    expect(formatCountdown(past.toISOString())).toBe('Expired');
  });
});
```

**Run Tests**:
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 10. Appendix: AI-Assisted Development

### 10.1 Kiro IDE Integration

**What is Kiro IDE?**
Kiro is an AI-powered development environment built on VS Code that provides specialized AI agents for different aspects of software development.

**Key Features Used**:
1. **Context-Aware Code Generation**
   - Understands entire codebase
   - Generates code matching project style
   - Suggests improvements based on existing patterns

2. **Multi-Agent Collaboration**
   - Different agents for different tasks
   - Agents communicate to solve complex problems
   - Maintains consistency across codebase

3. **Real-Time Code Review**
   - Security agent reviews every commit
   - Performance optimization suggestions
   - Accessibility compliance checks

4. **Documentation Generation**
   - Auto-generates JSDoc comments
   - Creates README sections
   - Keeps docs in sync with code

### 10.2 Development Statistics

**AI Contribution Metrics** (Estimated):
- Code generation: ~40% of total codebase
- Code review & refactoring: ~30%
- Documentation: ~60%
- Bug fixes: ~25%
- Test generation: ~50%

**Time Savings**:
- Component boilerplate: 80% faster
- API route handlers: 70% faster
- TypeScript type definitions: 90% faster
- Test case generation: 85% faster

**Quality Improvements**:
- Fewer security vulnerabilities (Security agent pre-review)
- More consistent code style (AI follows patterns)
- Better accessibility (UI/UX agent enforces WCAG)
- Improved documentation coverage

### 10.3 Human-AI Collaboration Model

```
┌─────────────────────────────────────────────────────┐
│              Human Developer                        │
│  • Strategic decisions                              │
│  • Business logic design                            │
│  • UX decisions                                     │
│  • Code review & approval                           │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   Task Assignment   │
         └──────────┬──────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│Architect │  │  UI/UX   │  │ Security │
│  Agent   │  │  Agent   │  │  Agent   │
└─────┬────┘  └─────┬────┘  └─────┬────┘
      │             │             │
      └─────────────┼─────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Code Generation    │
         │  • Implementation   │
         │  • Tests            │
         │  • Documentation    │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Human Review       │
         │  • Validate logic   │
         │  • Test manually    │
         │  • Approve/reject   │
         └──────────┬──────────┘
                    │
                    ▼
              Git Commit
```

**Best Practices**:
1. **Clear Instructions**: Give agents specific, detailed prompts
2. **Iterative Refinement**: Review and refine AI-generated code
3. **Domain Knowledge**: Provide context about business requirements
4. **Code Ownership**: Human developer is responsible for final code
5. **Continuous Learning**: AI learns from feedback and corrections

---

## 📸 UI/UX Screenshots

*Note: Screenshots harus diambil dari aplikasi yang sedang berjalan. Berikut adalah halaman-halaman yang perlu di-screenshot:*

### Landing Page (`/`)
- Hero section dengan video background
- Feature highlights
- Call-to-action buttons

### Penerima Dashboard (`/penerima`)
- Interactive map dengan surplus markers
- Filter controls (radius, price, category)
- Surplus detail modal
- Booking flow

### Penyedia Dashboard (`/penyedia`)
- Surplus inventory management
- Two-tab interface (Prepared / Raw)
- Create surplus form
- Edit surplus modal

### ESG Dashboard (`/penyedia/esg`)
- Impact metrics (CO₂, meals, value)
- Charts & visualizations
- Certificate generation

### Admin Panel (`/#/admin`)
- System health monitoring
- User management
- Transaction history

### Chat Interface
- Real-time messaging
- Message history
- Typing indicators

### Booking Details
- QR code display
- Pickup PIN
- Countdown timer

---

## 🎯 Kesimpulan

AksesPangan adalah platform lengkap yang menggabungkan teknologi modern (Next.js 16, React 19, Supabase) dengan arsitektur mikroservis untuk mengatasi masalah food waste dan food insecurity di Indonesia.

**Key Achievements**:
- ✅ Production-ready web application
- ✅ 5 independent microservices
- ✅ Real-time geolocation & mapping
- ✅ ESG impact tracking & reporting
- ✅ BPOM/HACCP compliance
- ✅ Secure authentication & authorization
- ✅ Cloud database with Supabase
- ✅ Docker containerization
- ✅ Deployed on Vercel

**Social Impact**:
- 🌍 Potential to reduce 1000+ kg food waste daily
- 🍽️ Feed 5000+ people monthly
- 🌱 Reduce 2.5 tons CO₂ emissions monthly
- 💚 Strengthen community food security

**Technical Excellence**:
- Modern tech stack (Next.js 16, React 19)
- Scalable microservices architecture
- Comprehensive security measures
- AI-assisted development (Kiro IDE)
- Production-grade deployment

---

**Dokumen ini dibuat dengan bantuan Kiro AI**  
**Tim Bojongsantos Empire © 2024**
