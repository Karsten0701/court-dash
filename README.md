## Court Admin Dashboard

Desktop-first admin dashboard for the King of Court API. It lets you manage players and games, assign/remove players from games, view high-level stats, and monitor API health — all using the existing dark, card-based design language.

### Tech stack

- **Framework**: Vue 3 + `<script setup>`
- **Routing**: `vue-router`
- **Styling**: Tailwind CSS + custom dark theme (`court`, `charcoal`, `asphalt`, `racket`, etc.)
- **Charts & icons**: Font Awesome, Chart.js (existing)
- **API**: [`court-api`](https://github.com/BramvAndel/court-api) (`http://localhost:3000/api` by default)

### Project structure (high level)

- `src/App.vue` – Desktop admin shell (header + top tabs + transitions)
- `src/router/index.js` – Routes for:
  - `/` → `Dashboard.vue` (Overview)
  - `/players` → `Players.vue`
  - `/games` → `Games.vue`
  - `/status` → `ApiStatus.vue`
- `src/components` – Reusable UI (inputs, error blocks, empty state, loading spinner, header)
- `src/pages` – Route-level pages (dashboard, players, games, API status, legacy views)
- `src/services` – API abstraction:
  - `apiService.js` – low-level wrapper (fetch, auth, refresh)
  - `playersService.js` – players CRUD via `/player` + `/users`
  - `gamesService.js` – games CRUD and player assignment
  - `statusService.js` – `/api/health` monitor
- `src/composables` – Reusable logic:
  - `useApiRequest.js` – loading/error/retry/timing
  - `useAnimatedNumber.js` – animated counters

### Features

- **Overview dashboard**
  - Total players, total planned games, active games (animated counters)
  - API health widget (online/offline, DB status, last response time)
  - Skeleton loading and smooth page transitions

- **Players management**
  - Table view with search, sorting (rank/name/ELO), and pagination
  - Create player (email, username, password)
  - Edit player (username/email)
  - Delete player (with confirmation modal)
  - Inline success/error toasts

- **Games management**
  - List planned games, ordered by planned time
  - Expandable rows showing players in each game
  - Create game (name, description, plannedAt)
  - Add players to games (search by username, assign via admin endpoint)
  - Remove players from games
  - Delete game (best-effort; surfaced via API response)

- **API status**
  - Detailed `/api/health` view with status, DB connectivity, timestamp, and response time

### Running the dashboard

1. **Install dependencies**

```bash
npm install
```

2. **Start the court-api backend**

Follow the instructions in the `court-api` repository. In short:

```bash
cd ../court-api            # adjust if needed
npm install
cp .env.example .env       # configure DB + JWT secrets
npm run setup:db
npm run dev                # API on http://localhost:3000
```

Make sure `apiBaseUrl` in `src/config/appConfig.js` matches your API base, e.g.:

```js
apiBaseUrl: "http://localhost:3000/api";
```

3. **Run the admin dashboard**

From this project root:

```bash
npm run dev
```

Then open the printed URL in your browser (typically `http://localhost:5173`).

4. **Authentication**

- The dashboard expects a valid session against `court-api` (HTTP-only JWT cookies).
- Use the existing login flow (`/login`) to authenticate as an **admin** user.
- Once authenticated, the main routes (`/`, `/players`, `/games`, `/status`) become accessible.

### Notes

- Existing visual language, colors, and transitions are preserved as much as possible.
- All new UI (tables, cards, modals, skeletons) reuses the same Tailwind utility patterns and color tokens.
