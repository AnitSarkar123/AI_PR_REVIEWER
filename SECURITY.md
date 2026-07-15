# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of AI PR Reviewer seriously. If you discover a security vulnerability, please report it responsibly.

**Do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to the project maintainers, or open a draft security advisory on GitHub.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if applicable)

### What to Expect

- We will acknowledge receipt within 48 hours
- We will provide an initial assessment within 5 business days
- We will keep you informed of progress toward a fix
- We will credit you when the fix is released (unless you prefer to remain anonymous)

## Security Practices

### Environment Variables

- All secrets (API keys, tokens, webhook secrets) should be stored in environment variables
- Never commit `.env` files to version control
- Use strong, randomly generated secrets (e.g., `openssl rand -base64 32`)
- Rotate secrets regularly

### GitHub OAuth

- The application requests the `repo` scope for GitHub OAuth — full access to public and private repositories
- OAuth tokens are stored in the database and should be treated as sensitive
- Token refresh and revocation should be handled according to GitHub's OAuth best practices

### Webhook Security

- All GitHub webhook payloads are verified using HMAC-SHA256 signatures
- The `GITHUB_WEBHOOK_SECRET` environment variable must be configured in production
- Webhook endpoints have IP-based rate limiting (30 requests/minute per IP)

### Data Protection

- User data is stored in PostgreSQL
- Passwords are not stored directly (authentication is handled via GitHub OAuth)
- Consider encrypting GitHub access tokens at rest for production deployments

### Dependencies

- Regularly update dependencies to patch known vulnerabilities
- Use `npm audit` to check for vulnerabilities
- Review dependency changes before updating

## Security Checklist for Production Deployments

- [ ] `GITHUB_WEBHOOK_SECRET` is set to a strong random value
- [ ] `BETTER_AUTH_SECRET` is set to a strong random value
- [ ] `POLAR_WEBHOOK_SECRET` is set to a strong random value
- [ ] `POLAR_SERVER` is set to `production`
- [ ] Database is configured with strong credentials
- [ ] HTTPS is enforced (use a reverse proxy like Nginx or a platform like Vercel)
- [ ] Rate limiting is configured for API endpoints
- [ ] Regular security audits are scheduled

## Responsible Disclosure

We encourage responsible disclosure of security vulnerabilities. We will work with researchers to understand and address issues promptly, and we will credit researchers for their findings.
