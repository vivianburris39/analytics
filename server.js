const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Google IP ranges (as before)
const googleIPRanges = [
  '66.249.', '64.233.', '72.14.', '209.85.', '216.58.', '142.250.',
  '2a00:1450:', '2607:f8b0:'
];

function isGoogleIP(ip) {
  return googleIPRanges.some(range => ip.startsWith(range));
}

function isBot(userAgent) {
  const bots = ['Googlebot', 'AdsBot', 'bingbot', 'Slurp', 'DuckDuckBot'];
  return bots.some(bot => userAgent.includes(bot));
}

app.get('*', (req, res) => {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  const accessToken = url.searchParams.get('access'); // Your custom param
  const userAgent = req.get('User-Agent') || '';
  const clientIP = req.get('X-Forwarded-For') || req.connection.remoteAddress || '';

  // Quick bot block
  if (isBot(userAgent)) {
    return res.status(404).send(`
      <html><body><h1>404 - Page Not Found</h1><p>Sorry, nothing here.</p></body></html>
    `);
  }

  // Google IP whitelist (for reviewers)
  if (isGoogleIP(clientIP)) {
    return res.send(`
      <html><body><h1>About Us</h1><p>Generic public content. Private access requires valid credentials.</p></body></html>
    `);
  }

  // Custom param check: If matches secret, redirect
  if (accessToken === 'supersecretkey123') { // Your fixed secret
    // Optional: Log for analytics (console.log(`Access granted from ${clientIP}`);)
    return res.redirect(302, 'https://your-sensitive-site.com/real-content'); // Append params if needed for tracking
  }

  // Fallback: Generic for everyone else (no param)
  res.send(`
    <html><body><h1>About Us</h1><p>Generic content here. For access, use our ad links.</p></body></html>
  `);
});

app.listen(port, () => console.log(`Listening on ${port}`));
