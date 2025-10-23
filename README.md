# College Prep Organizer

A comprehensive web application designed to help students and families organize their college preparation journey. Features include task management, document tracking, progress monitoring, and integrated payment processing.

## 🚀 Features

- **Task Management**: Organize college preparation tasks by category
- **Document Tracking**: Upload and manage important college documents
- **Progress Monitoring**: Visual progress tracking and statistics
- **Calendar Integration**: Deadline management and scheduling
- **Payment Integration**: Secure payment processing via Stripe
- **Multi-User Support**: Parent and student collaboration
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Neon database
- **Drizzle ORM** for database operations
- **Stripe** for payment processing
- **Passport.js** for authentication

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL database (Neon recommended)
- Stripe account for payment processing
- Git for version control

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/college-prep-organizer.git
cd college-prep-organizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:

```bash
# Database
DATABASE_URL=your_neon_database_url

# Session Security
SESSION_SECRET=your_secure_random_string

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_or_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_or_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_your_key
```

### 4. Database Setup

Push the database schema:

```bash
npm run db:push
```

### 5. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏗️ Production Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Set the following environment variables in your production environment:

- `NODE_ENV=production`
- `DATABASE_URL` - Your production PostgreSQL URL
- `SESSION_SECRET` - A secure random string
- `STRIPE_SECRET_KEY` - Your live Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your live Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your live Stripe publishable key
- `PORT` - Server port (default: 5000)

### Deployment Platforms

This application can be deployed to various platforms:

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

#### Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Heroku
1. Create a new Heroku app
2. Set environment variables using Heroku CLI or dashboard
3. Deploy using Git

#### DigitalOcean App Platform
1. Create a new app from GitHub repository
2. Configure environment variables
3. Deploy

## 🗃️ Database Schema

The application uses the following main entities:

- **Users**: User accounts and authentication
- **Tasks**: College preparation tasks
- **Documents**: File uploads and document tracking
- **Categories**: Task categorization
- **Payments**: Stripe payment records
- **Subscriptions**: User access levels

## 🔐 Authentication

The application supports multiple authentication strategies:

- **Production**: Replit OAuth integration
- **Development**: Mock authentication for local development

## 💳 Payment Integration

Stripe is integrated for payment processing:

- One-time payment of $4.99 for full access
- Secure checkout flow
- Webhook handling for payment verification
- Payment status tracking

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate database migrations

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── pages/          # Page components
├── server/                 # Backend Express application
│   ├── db.ts              # Database configuration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript types
└── dist/                  # Production build output
```

## 🔒 Security Features

- Environment variable management
- CORS protection
- Session security
- Input validation with Zod
- SQL injection prevention with Drizzle ORM
- Secure payment processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit them: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/college-prep-organizer/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔗 Links

- [Live Demo](https://your-app-domain.com)
- [Documentation](https://github.com/yourusername/college-prep-organizer/wiki)
- [Changelog](CHANGELOG.md)

---

Made with ❤️ for students preparing for college