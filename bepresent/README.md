# BePresent Clone — Full Stack App

A full-stack productivity app with screen-time tracking, focus sessions, XP/streak gamification, and leaderboards.

---

## Stack
- **Frontend**: React Native + Expo
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Auth**: JWT (stored in Expo SecureStore)
- **Charts**: react-native-chart-kit

---

## Project Structure

```
bepresent/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # register, login, getMe
│   │   ├── sessionController.js  # start/end session, XP & streak logic
│   │   ├── statsController.js    # overview, weekly, today
│   │   ├── userController.js     # update profile/password
│   │   └── leaderboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect()
│   │   └── errorMiddleware.js    # global error handler
│   ├── models/
│   │   ├── User.js               # XP, streak, badges, blockedApps
│   │   ├── Session.js            # focus sessions
│   │   └── Reward.js             # badge definitions + seed data
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sessionRoutes.js
│   │   ├── statsRoutes.js
│   │   ├── userRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── services/
│   │   └── badgeService.js       # badge unlock logic
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── App.js                    # Root: SafeAreaProvider + AuthProvider
    ├── app.json                  # Expo config
    ├── package.json
    ├── .env.example
    └── src/
        ├── api/
        │   ├── authApi.js        # login, register, fetchMe
        │   └── index.js          # sessions, stats, leaderboard, user
        ├── components/
        │   └── index.js          # StatCard, XPBar, ProgressBar, Button, BadgeChip...
        ├── constants/
        │   ├── index.js          # COLORS, FONT, RADIUS, level names
        │   └── badges.js         # badge icon/name map
        ├── context/
        │   └── AuthContext.js    # global auth state, login/register/logout
        ├── navigation/
        │   └── AppNavigator.js   # Auth stack + Main tab navigator
        ├── screens/
        │   ├── LoginScreen.js
        │   ├── SignupScreen.js
        │   ├── OnboardingScreen.js  # blocked apps + daily goal setup
        │   ├── HomeScreen.js        # dashboard: XP, streak, today goal
        │   ├── FocusScreen.js       # timer + AppState interrupt detection
        │   ├── StatsScreen.js       # bar chart + session history
        │   ├── LeaderboardScreen.js # global + weekly tabs
        │   └── ProfileScreen.js     # badges, goal edit, blocked apps, logout
        └── utils/
            └── formatters.js
```

---

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000
npm install
npx expo start
```

> ⚠️ Use your local network IP (e.g. `192.168.1.x`), not `localhost`, when testing on a physical device.

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Get JWT token |
| GET | /api/auth/me | ✅ | Get current user |
| POST | /api/sessions/start | ✅ | Start focus session |
| POST | /api/sessions/end | ✅ | End session, calculate XP |
| GET | /api/sessions/active | ✅ | Check for active session |
| GET | /api/sessions/history | ✅ | Paginated session history |
| GET | /api/stats/overview | ✅ | Total XP, streak, badges |
| GET | /api/stats/weekly | ✅ | Last 7 days data |
| GET | /api/stats/today | ✅ | Today's progress vs goal |
| GET | /api/leaderboard/global | ✅ | All-time XP rankings |
| GET | /api/leaderboard/weekly | ✅ | This week's XP rankings |
| PUT | /api/users/profile | ✅ | Update name, goal, blocked apps |
| PUT | /api/users/password | ✅ | Change password |

---

## Gamification Logic

### XP Formula
```
xpEarned = durationMinutes × 10 × streakMultiplier
streakMultiplier = 1.5 if streak >= 5, else 1.0
```

### Level Formula
```
level = floor(totalXP / 500) + 1
```

### Streak Rules
- Completing a session when `lastActive > 20h ago but < 48h ago` → streak +1
- Gap > 48h → streak resets to 1
- Failed session → streak = 0

### Badges
| Badge | Condition |
|-------|-----------|
| 🌱 First Step | 1 session completed |
| 🔥 Week Warrior | 7-day streak |
| ⚔️ Month Monster | 30-day streak |
| 💪 Half Century | 50 sessions |
| 🏆 Century Club | 100 focus hours |
| ⭐ XP Grinder | 1,000 XP |
| 👑 Elite Specimen | 10,000 XP |

---

## AppState Interrupt Detection (Critical)

`FocusScreen.js` uses React Native's `AppState` API to detect when a user backgrounds the app during a session. This counts interruptions but does **not** auto-fail — the streak only resets on explicit "give up". This avoids punishing users for notifications.

---

## Deployment

**Backend** → [Render](https://render.com) or [Railway](https://railway.app)
```bash
# Set env vars in dashboard: MONGO_URI, JWT_SECRET, NODE_ENV=production
```

**Frontend** → [Expo EAS Build](https://docs.expo.dev/build/introduction/)
```bash
npm install -g eas-cli
eas build --platform android
```
