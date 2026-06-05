const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RSVP_FILE = path.join(DATA_DIR, 'rsvps.json');
const DONATIONS_FILE = path.join(DATA_DIR, 'donations.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

function ensureDataFile(file, defaultValue) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function navBar() {
  return `
    <nav class="site-nav">
      <a class="nav-logo" href="/">SONO<span>LX</span></a>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/notifications">Notifications</a>
        <a href="/donate">Donate</a>
        <a href="/blog">Blog</a>
        <a href="/groups">Groups</a>
        <a href="/members">Members</a>
      </div>
    </nav>
  `;
}

function pageFrame(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · SONO</title>
  <style>
    :root {
      --gold: #c9a84c;
      --teal: #00e5cc;
      --deep: #020a14;
      --mid: #061220;
      --surface: #0a1e30;
      --text: #d8e8f0;
      --text-dim: #7a9ab0;
      --border: rgba(201,168,76,0.2);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Rajdhani', sans-serif;
      background: radial-gradient(circle at top, rgba(0,229,204,0.08), transparent 40%), var(--deep);
      color: var(--text);
      min-height: 100vh;
    }
    a { color: var(--gold); text-decoration: none; }
    .site-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: rgba(2,10,20,0.96);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .site-nav .nav-logo {
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      letter-spacing: 4px;
      color: var(--gold);
    }
    .site-nav .nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .site-nav .nav-links a {
      font-size: 0.85rem;
      letter-spacing: 1px;
      color: var(--text-dim);
      transition: color 0.2s;
    }
    .site-nav .nav-links a:hover { color: var(--gold); }
    .page-shell {
      max-width: 1000px;
      margin: 0 auto;
      padding: 5rem 2rem 3rem;
    }
    .page-shell h1 {
      margin-top: 1rem;
      font-size: clamp(2rem, 4vw, 3rem);
      color: var(--gold);
    }
    .card {
      background: rgba(10,30,50,0.95);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      margin: 1.5rem 0;
    }
    .card + .card { margin-top: 1rem; }
    .button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, rgba(201,168,76,0.14), rgba(0,229,204,0.18));
      border: 1px solid rgba(201,168,76,0.3);
      color: var(--gold);
      padding: 0.9rem 1.3rem;
      border-radius: 8px;
      font-weight: 700;
      transition: transform 0.2s, background 0.2s;
    }
    .button:hover { transform: translateY(-2px); background: rgba(201,168,76,0.2); }
    .field-group { margin-bottom: 1rem; }
    .field-group label {
      display: block;
      margin-bottom: 0.4rem;
      color: var(--text-dim);
      font-size: 0.85rem;
    }
    .field-group input,
    .field-group textarea,
    .field-group select {
      width: 100%;
      padding: 0.95rem 1rem;
      background: rgba(255,255,255,0.03);
      color: var(--text);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      font-size: 1rem;
    }
    .field-group textarea { min-height: 120px; resize: vertical; }
    .notice {
      background: rgba(0,229,204,0.08);
      border: 1px solid rgba(0,229,204,0.2);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      color: var(--text);
      margin-top: 1rem;
    }
    .footer {
      color: var(--text-dim);
      text-align: center;
      padding: 2rem 1rem 1rem;
      font-size: 0.85rem;
    }
    @media (max-width: 768px) {
      .site-nav { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
      .page-shell { padding: 3rem 1rem 2rem; }
    }
  </style>
</head>
<body>
  ${navBar()}
  <main class="page-shell">
    ${content}
  </main>
  <footer class="footer">Built with a local backend and no external redirection for events, donations, notifications, and policy pages.</footer>
</body>
</html>
  `;
}

function makeList(items, render) {
  return items.map(render).join('\n');
}

function renderEventCard(event) {
  return `
    <div class="card">
      <h2>${event.title}</h2>
      <p style="color: var(--text-dim); margin: 0.5rem 0;"><strong>${event.date}</strong> · ${event.location}</p>
      <p style="color: var(--text-dim); margin-bottom: 1rem;">${event.description}</p>
      <a href="/event-details/${event.slug}" class="button">View Event & RSVP</a>
    </div>
  `;
}

app.get('/notifications', (req, res) => {
  const notifications = readJson(NOTIFICATIONS_FILE, []);
  const itemsHtml = makeList(notifications, (item) => `
    <div class="card">
      <h2>${item.title}</h2>
      <p style="color: var(--text-dim); margin: 0.75rem 0;">${item.date}</p>
      <p>${item.message}</p>
    </div>
  `);

  res.send(pageFrame('Notifications', `
    <h1>Notifications</h1>
    <p style="color: var(--text-dim); max-width: 760px;">All notification content is now served locally via this website backend. No external site is required to open this page.</p>
    ${itemsHtml}
  `));
});

app.get('/donate', (req, res) => {
  res.send(pageFrame('Donate', `
    <h1>Donate to SONO Research</h1>
    <div class="card">
      <p style="color: var(--text-dim);">Support UCLA sonoluminescence research and help fund the SONO community platform. This donation page is fully local, with donation interest recorded on-site by the backend.</p>
      <form id="donate-form" method="post" action="/api/donate">
        <div class="field-group">
          <label for="donor-name">Name</label>
          <input id="donor-name" name="name" type="text" required placeholder="Your name">
        </div>
        <div class="field-group">
          <label for="donor-email">Email</label>
          <input id="donor-email" name="email" type="email" required placeholder="you@example.com">
        </div>
        <div class="field-group">
          <label for="donation-amount">Amount</label>
          <select id="donation-amount" name="amount" required>
            <option value="$50">$50</option>
            <option value="$100">$100</option>
            <option value="$200">$200</option>
            <option value="$1000">$1,000</option>
          </select>
        </div>
        <div class="field-group">
          <label for="donation-message">Message</label>
          <textarea id="donation-message" name="message" placeholder="Share a note or special request"></textarea>
        </div>
        <button class="button" type="submit">Submit Donation Interest</button>
      </form>
      <div id="donate-result" class="notice" style="display:none;"></div>
    </div>
    <script>
      const donateForm = document.getElementById('donate-form');
      donateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(donateForm);
        const response = await fetch('/api/donate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });
        const result = await response.json();
        const output = document.getElementById('donate-result');
        output.style.display = 'block';
        output.textContent = result.message || 'Request submitted.';
      });
    </script>
  `));
});

app.get('/blank', (req, res) => {
  res.send(pageFrame('Policy', `
    <h1>Privacy & Policy</h1>
    <div class="card">
      <h2>Privacy Policy</h2>
      <p>This website now serves its content locally and does not redirect to an external policy portal. Any data entry on this site is stored on the backend here in the project.</p>
    </div>
    <div class="card">
      <h2>Terms & Conditions</h2>
      <p>Local terms are enforced by the website content. This page acts as the policy reference for the SONO website without requiring another domain.</p>
    </div>
    <div class="card">
      <h2>Refund Policy</h2>
      <p>No payments are processed directly through this demo backend. Donation interest is recorded for follow-up, and payment checkout is handled outside the site.</p>
    </div>
    <div class="card">
      <h2>Accessibility</h2>
      <p>The site uses clear headings, accessible buttons, and responsive design to make the experience easier on desktop and mobile.</p>
    </div>
  `));
});

app.get('/blog', (req, res) => {
  res.send(pageFrame('Blog', `
    <h1>Blog Updates</h1>
    <div class="card">
      <h2>Join the Sonoluminescence Community</h2>
      <p>This article is served locally. The backend hosts blog pages and keeps the content internal so visitors stay on this site.</p>
    </div>
    <div class="card">
      <h2>How Sonoluminescence Creates Solar-Level Heat</h2>
      <p>Sound-driven bubble implosion generates extreme temperatures and light. Our local backend now serves all event and blog data without external redirects.</p>
    </div>
    <div class="card">
      <h2>Why 10% Goes to UCLA</h2>
      <p>The SONO ecosystem is designed to route community support to research efforts. This page is part of the site infrastructure that keeps the experience self-contained.</p>
    </div>
  `));
});

app.get('/groups', (req, res) => {
  res.send(pageFrame('Groups', `
    <h1>Community Groups</h1>
    <div class="card">
      <h2>Telegram Army</h2>
      <p>Join the main community for launch updates, reward announcements, and event RSVPs.</p>
    </div>
    <div class="card">
      <h2>Research Circle</h2>
      <p>Connect with scientists and data contributors who are helping build the open sonoluminescence database.</p>
    </div>
  `));
});

app.get('/members', (req, res) => {
  res.send(pageFrame('Members', `
    <h1>Members</h1>
    <div class="card">
      <h2>Research Army</h2>
      <p>Active supporters and verified contributors are featured here. This page is built by the same local backend powering event registration and notifications.</p>
    </div>
  `));
});

app.get('/events', (req, res) => {
  const events = readJson(EVENTS_FILE, []);
  const eventCards = events.length > 0 ? makeList(events, renderEventCard) : '<div class="card"><p style="color: var(--text-dim);">No events are currently available.</p></div>';

  res.send(pageFrame('Events | Sonoluminescence', `
    <h1>Events</h1>
    <p style="color: var(--text-dim); max-width: 760px; margin-bottom: 1.5rem;">Browse upcoming SONO events and RSVP directly through this local backend. Your registration is saved on-site in the project data store.</p>
    ${eventCards}
  `));
});

app.get('/event-details/:slug', (req, res) => {
  const events = readJson(EVENTS_FILE, []);
  const event = events.find((item) => item.slug === req.params.slug);
  if (!event) {
    return res.status(404).send(pageFrame('Event Not Found', `<h1>Event Not Found</h1><p>The requested event does not exist.</p>`));
  }

  const rsvps = readJson(RSVP_FILE, []);
  const eventRsvps = rsvps.filter((entry) => entry.eventSlug === event.slug);

  const rsvpRows = eventRsvps.length > 0
    ? eventRsvps.map((entry) => `
        <tr>
          <td>${entry.name}</td>
          <td>${entry.email}</td>
          <td>${entry.guests}</td>
          <td>${entry.notes || '—'}</td>
          <td>${new Date(entry.createdAt).toLocaleString()}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" style="color: var(--text-dim); text-align:center;">No RSVPs submitted yet.</td></tr>`;

  res.send(pageFrame(event.title, `
    <h1>${event.title}</h1>
    <div class="card">
      <p style="color: var(--text-dim); margin-bottom: 1rem;">${event.date} · ${event.location}</p>
      <p>${event.description}</p>
      <p style="color: var(--text-dim); margin-top: 1rem;"><strong>Status:</strong> ${event.status || 'Open'}</p>
      <h3 style="margin-top: 2rem;">RSVP to Attend</h3>
      <form id="rsvp-form">
        <div class="field-group">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" required placeholder="Full name">
        </div>
        <div class="field-group">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com">
        </div>
        <div class="field-group">
          <label for="guests">Guests</label>
          <select id="guests" name="guests">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div class="field-group">
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Any accessibility needs or questions"></textarea>
        </div>
        <button class="button" type="submit">Submit RSVP</button>
      </form>
      <div id="rsvp-result" class="notice" style="display:none;"></div>
    </div>
    <div class="card" style="margin-top:2rem; overflow-x:auto;">
      <h2>Current RSVP List</h2>
      <table style="width:100%; border-collapse: collapse; color: var(--text);">
        <thead>
          <tr>
            <th style="text-align:left; padding:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1);">Name</th>
            <th style="text-align:left; padding:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1);">Email</th>
            <th style="text-align:left; padding:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1);">Guests</th>
            <th style="text-align:left; padding:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1);">Notes</th>
            <th style="text-align:left; padding:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1);">Submitted</th>
          </tr>
        </thead>
        <tbody id="rsvp-table-body">
          ${rsvpRows}
        </tbody>
      </table>
      <p id="rsvp-count" style="color: var(--text-dim); margin-top: 1rem;">${eventRsvps.length} confirmed attendee${eventRsvps.length === 1 ? '' : 's'}.</p>
    </div>
    <script>
      const form = document.getElementById('rsvp-form');
      const rsvpBody = document.getElementById('rsvp-table-body');
      const rsvpCount = document.getElementById('rsvp-count');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const values = new FormData(form);
        const payload = {
          eventSlug: '${event.slug}',
          name: values.get('name'),
          email: values.get('email'),
          guests: values.get('guests'),
          notes: values.get('notes')
        };
        const response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        const output = document.getElementById('rsvp-result');
        output.style.display = 'block';
        output.textContent = result.message || 'Your RSVP is confirmed.';
        if (result.success && result.rsvp) {
          const row = document.createElement('tr');
          row.innerHTML =
            '<td>' + result.rsvp.name + '</td>' +
            '<td>' + result.rsvp.email + '</td>' +
            '<td>' + result.rsvp.guests + '</td>' +
            '<td>' + (result.rsvp.notes || '—') + '</td>' +
            '<td>' + new Date(result.rsvp.createdAt).toLocaleString() + '</td>';
          rsvpBody.appendChild(row);
          const currentCount = parseInt(rsvpCount.textContent, 10) || 0;
          const nextCount = currentCount + 1;
          rsvpCount.textContent = nextCount + ' confirmed attendee' + (nextCount === 1 ? '' : 's') + '.';
          form.reset();
        }
      });
    </script>
  `));
});

app.get('/api/events', (req, res) => {
  res.json(readJson(EVENTS_FILE, []));
});

app.get('/api/notifications', (req, res) => {
  res.json(readJson(NOTIFICATIONS_FILE, []));
});

app.get('/api/rsvps', (req, res) => {
  res.json(readJson(RSVP_FILE, []));
});

app.post('/api/rsvp', (req, res) => {
  const { eventSlug, name, email, guests, notes } = req.body;
  if (!eventSlug || !name || !email) {
    return res.status(400).json({ success: false, message: 'Name, email, and event are required.' });
  }

  const events = readJson(EVENTS_FILE, []);
  const event = events.find((item) => item.slug === eventSlug);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const rsvps = readJson(RSVP_FILE, []);
  const duplicate = rsvps.find((entry) => entry.eventSlug === eventSlug && entry.email.toLowerCase() === email.toLowerCase());
  if (duplicate) {
    return res.status(409).json({ success: false, message: 'You have already RSVP’d for this event with this email.' });
  }

  const newRsvp = {
    id: Date.now(),
    eventSlug,
    name,
    email,
    guests: guests || '1',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
  rsvps.push(newRsvp);
  writeJson(RSVP_FILE, rsvps);

  res.json({ success: true, message: 'RSVP confirmed. You will receive updates for this event.', rsvp: newRsvp });
});

app.post('/api/donate', (req, res) => {
  const { name, email, amount, message } = req.body;
  if (!name || !email || !amount) {
    return res.status(400).json({ success: false, message: 'Name, email, and donation amount are required.' });
  }

  const donations = readJson(DONATIONS_FILE, []);
  donations.push({ id: Date.now(), name, email, amount, message: message || '', createdAt: new Date().toISOString() });
  writeJson(DONATIONS_FILE, donations);

  res.json({ success: true, message: 'Donation request recorded. Thank you for your support.' });
});

app.use((req, res) => {
  res.status(404).send(pageFrame('Page Not Found', '<h1>404 — Not Found</h1><p>The page you requested does not exist.</p>'));
});

ensureDataFile(RSVP_FILE, []);
ensureDataFile(DONATIONS_FILE, []);
ensureDataFile(EVENTS_FILE, []);
ensureDataFile(NOTIFICATIONS_FILE, []);

const server = app.listen(PORT, () => {
  console.log(`SONO backend running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Either stop the existing process or set a different PORT before starting the server.`);
    process.exit(1);
  }
  throw err;
});
