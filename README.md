# Fight Calendar - Web UI

React + TypeScript frontend for [Fight Calendar](https://github.com/T3mon/fight-calendar-api). Fetches events from the API and plots them on a calendar, with checkboxes to filter by promotion.

See the [project wiki](https://github.com/T3mon/fight-calendar-api/wiki) for the full system architecture and new-contributor onboarding guide. This README covers only what's specific to this repo.

## Tech stack

- [Vite](https://vite.dev) + React + TypeScript
- [Bootstrap](https://getbootstrap.com) for styling
- [react-big-calendar](https://github.com/jquense/react-big-calendar) for the calendar view

## Local development

Prerequisites: [Node.js](https://nodejs.org), and the [fight-calendar-api](https://github.com/T3mon/fight-calendar-api) running locally (see that repo's README).

```bash
git clone https://github.com/T3mon/fight-calendar-web-ui.git
cd fight-calendar-web-ui
npm install
cp .env.example .env   # defaults to http://localhost:5080, the local API
npm run dev
```

Visit `http://localhost:5173`.

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the Fight Calendar API | `http://localhost:5080` |
