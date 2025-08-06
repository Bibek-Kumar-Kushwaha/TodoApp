# Modern Todo Application

A feature-rich, high-performance todo application built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## ✨ Features

- **Complete CRUD Operations**: Create, read, update, and delete todos
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Advanced Filtering**: Search, filter by status/priority, and sort todos
- **Responsive Design**: Works perfectly on all devices
- **Markdown Support**: Rich text descriptions with Markdown rendering
- **Due Date Tracking**: Visual indicators for overdue and upcoming tasks
- **Priority Management**: Color-coded priority system
- **Authentication**: Secure JWT-based user authentication
- **Pagination**: Efficient handling of large todo lists

## 🚀 Performance Optimizations

- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Custom React Hooks**: Efficient state management with `useTodos` hook
- **Memoization**: Extensive use of React.memo, useMemo, and useCallback
- **Next.js Features**: App Router, Server Components, and automatic code splitting

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components, Shadcn
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod schemas
- **Forms**: React Hook Form

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd todo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
.env.local
```

Add your database URL and JWT secret:
```env
# Database connection URL
DATABASE_URL="your-postgresql-connection-string"

# Authentication
JWT_SECRET="super-secret-jwt-key-for-development-only-change-in-production"
EXPIREDIN="7d"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)

## 📱 Key Features Implemented

### ✅ Todo Management
- Create todos with title, description, priority, category, and due date
- Edit todos inline with modal dialog
- Delete todos with confirmation dialog
- Toggle completion status with optimistic updates

### ✅ Advanced Filtering & Search
- Text search across title and description
- Filter by completion status (All, Completed, Pending)
- Filter by priority (Low, Medium, High, Urgent)
- Sort by creation date, due date, priority, or title

### ✅ User Experience
- Responsive design for all screen sizes
- Loading states and error handling
- Visual feedback for all user actions
- Keyboard accessibility

### ✅ Performance Features
- Optimistic UI updates for instant feedback
- Memoized components to prevent unnecessary re-renders
- Efficient API calls with proper caching
- Automatic error recovery and rollback

## 🏗️ Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── todos/         # Todo CRUD operations
│   ├── todos/             # Todo management page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── Todo/              # Todo-specific components
│   ├── Auth/              # Authentication components
│   └── ui/                # Reusable UI components (Radix)
├── hooks/                 # Custom React hooks
│   └── useTodos.ts        # Todo state management
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication helpers
│   ├── prisma.ts          # Database client
│   └── types/             # TypeScript definitions
└── prisma/                # Database schema and migrations
```

## 🔐 Authentication

The app includes a complete authentication system:
- User registration and login
- JWT-based sessions
- Protected routes
- Automatic redirect to login for unauthenticated users

## 📊 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique()
  password  String
  name      String?
  todo      Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Todo {
  id          String    @id @default(cuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  priority    Priority  @default(MEDIUM)
  category    String?
  dueDate     DateTime?
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`

## 📈 Performance Metrics

- **Bundle Size**: Optimized to ~103kB for main bundle
- **Loading Time**: Instant UI feedback with optimistic updates
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile Performance**: Responsive design with touch-friendly interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
# TodoApp
