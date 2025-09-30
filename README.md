# 🚀 TrailBlix - AI-Powered Career Intelligence Platform

TrailBlix is an advanced career development platform that provides AI-driven market intelligence, predictive career modeling, and personalized insights to help professionals navigate their career journey with confidence.

## ✨ Features

- **🧠 Advanced AI Intelligence** - Real-time market analysis with 94%+ accuracy predictions
- **📊 Career Predictions** - ML-powered 18-month career trajectory forecasting
- **💰 Salary Intelligence** - Comprehensive compensation analysis with negotiation strategies
- **🎯 Personalized Insights** - Custom career recommendations based on your profile
- **📈 Progress Tracking** - Visual career progress monitoring with gamification
- **🔍 Smart Job Search** - AI-enhanced job matching and application tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trailblix-v1.git
   cd trailblix-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your keys
   ```

4. **Set up the database**
   ```bash
   # See docs/database-setup.md for detailed instructions
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see TrailBlix in action!

## 📁 Project Structure

```
trailblix-v1/
├── database/                 # Database schemas and migrations
│   ├── schema.sql           # Main database schema
│   └── migrations/          # Database migration files
├── docs/                    # Documentation
│   ├── database-setup.md    # Database setup guide
│   └── ai-system.md        # AI system documentation
├── src/
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── landing/        # Landing page components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utility functions and configurations
│   ├── pages/             # Next.js pages and API routes
│   │   └── api/           # API endpoints
│   └── types/             # TypeScript type definitions
└── public/                # Static assets
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm test` - Run tests
- `npm test:watch` - Run tests in watch mode

### Code Quality

TrailBlix maintains high code quality standards:

- **TypeScript** - Full type safety throughout the codebase
- **ESLint** - Comprehensive linting rules
- **Jest** - Unit testing framework
- **Zod** - Runtime type validation
- **Error Handling** - Centralized error management system

## 📚 Documentation

- **[Database Setup Guide](docs/database-setup.md)** - Complete database configuration
- **[AI System Overview](docs/ai-system.md)** - Advanced AI capabilities documentation

## 🔧 Configuration

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_claude_api_key
ADZUNA_APP_ID=your_adzuna_id (optional)
ADZUNA_APP_KEY=your_adzuna_key (optional)
```

## 🚀 Deployment

TrailBlix is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@trailblix.com
- 💬 Discord: [Join our community](https://discord.gg/trailblix)
- 📖 Documentation: [docs.trailblix.com](https://docs.trailblix.com)

---

Built with ❤️ by the TrailBlix team