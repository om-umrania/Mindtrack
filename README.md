# Mindtrack - Habit Tracking Made Simple

A modern habit tracking application built with Next.js 14, featuring AI-powered insights and nudges.

## Features

- **Habit Management**: Create and track boolean, count, and duration-based habits
- **Dashboard**: Visual overview of your progress with completion trends
- **Analytics**: Deep dive into your habit data with leaderboards and streaks
- **AI Insights**: Personalized nudges and habit recommendations
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Optimistic UI updates for instant feedback

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Lucide React icons
- **Data Fetching**: SWR for client-side data management
- **Charts**: Recharts for data visualization
- **Calendar**: react-calendar for date selection
- **State Management**: React Context for auth and theme

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes (mock endpoints)
│   ├── dashboard/         # Dashboard page and components
│   ├── habits/           # Habits page and components
│   ├── analytics/        # Analytics page
│   ├── login/           # Login page
│   └── lib/             # Shared utilities and types
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
└── hooks/              # Custom React hooks
```

## Key Components

### HabitToggleList
- One-click toggles for boolean habits
- Stepper controls for count/duration habits
- Optimistic updates with "Save Today" functionality

### DashboardCards
- Today's progress percentage
- Current streak tracking
- 7-day completion average

### CompletionTrend
- Interactive line chart showing habit completion over time
- Responsive design with tooltips

### AIPanel
- Generate motivational nudges
- View personalized habit recommendations
- Expandable context for AI insights

## API Endpoints

The app includes mock API endpoints for demonstration:

- `POST /api/auth/login` - Demo login
- `GET /api/habits` - Fetch user habits
- `POST /api/habits` - Create new habit
- `POST /api/checkins` - Save habit check-ins
- `GET /api/analytics/summary` - Get analytics data
- `POST /api/ai/nudge` - Generate AI nudge
- `GET /api/ai/recommendations` - Get habit recommendations

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_DEMO=true
NEXT_PUBLIC_AI_ON=true
```

## Demo Mode

When `NEXT_PUBLIC_DEMO=true`, the app shows:
- Demo banner in the top bar
- Any email works for login
- Mock data for all features

## Development

- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Start**: `npm start`

## Deployment

The app is ready for deployment on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

## Future Enhancements

- [ ] Calendar heatmap visualization
- [ ] Habit streak recovery
- [ ] Social features and sharing
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Real backend integration
- [ ] User authentication
- [ ] Data persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
