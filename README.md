# SONO Local Backend

This project now includes a local Express backend that serves the main site and the following internal pages without redirecting to `soundcreateslight.com`:

- `/notifications`
- `/donate`
- `/blank`
- `/blog`
- `/groups`
- `/members`
- `/event-details/:slug`
- `/api/rsvp`
- `/api/donate`

## Run locally

1. Open a terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser.

## Notes

- RSVP submissions are stored in `data/rsvps.json`.
- Notifications are served from `data/notifications.json`.
- Event metadata is in `data/events.json`.
