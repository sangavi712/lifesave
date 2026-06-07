/**
 * Custom security headers middleware to enhance API protection
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking by preventing the page from being framed
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Basic XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information sent in headers
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Basic Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' *;"
  );

  next();
};
