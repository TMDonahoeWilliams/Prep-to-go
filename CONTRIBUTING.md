# Contributing to College Prep Organizer

Thank you for your interest in contributing to College Prep Organizer! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to create a welcoming environment for all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/college-prep-organizer.git
   cd college-prep-organizer
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Fill in your development values
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the coding guidelines below
3. **Test your changes** thoroughly
4. **Commit your changes**:
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** on GitHub

## Coding Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible
- Use Zod schemas for validation

### React Components
- Use functional components with hooks
- Follow the component structure in existing code
- Use proper prop types
- Implement proper error boundaries

### CSS/Styling
- Use TailwindCSS for styling
- Use Shadcn/ui components when possible
- Follow the existing design system
- Ensure responsive design

### Backend
- Use proper error handling
- Validate all inputs with Zod schemas
- Follow RESTful API conventions
- Add proper authentication checks

## Commit Message Format

We use conventional commits:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple browsers and devices
- Test both authenticated and unauthenticated flows

## Pull Request Guidelines

- **Description**: Provide a clear description of what your PR does
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Clearly document any breaking changes
- **Documentation**: Update documentation if needed

## Issues

When creating an issue:

- **Bug Reports**: Include steps to reproduce, expected behavior, and actual behavior
- **Feature Requests**: Clearly describe the feature and its use case
- **Questions**: Check existing documentation and issues first

## Development Environment

### Required Tools
- Node.js 18+ and npm 8+
- PostgreSQL database (Neon recommended for development)
- Git for version control

### Optional Tools
- VS Code with recommended extensions
- Stripe CLI for webhook testing
- Postman or similar for API testing

## Project Structure

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

## Getting Help

- Check the [README](README.md) for setup instructions
- Look at existing issues for similar problems
- Join our community discussions
- Contact the maintainers

Thank you for contributing! 🎉