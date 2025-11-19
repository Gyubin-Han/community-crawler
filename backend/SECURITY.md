# Security Guide

## Database Configuration

**IMPORTANT:** Never commit database credentials to Git!

### Setup Instructions

1. Copy the example configuration file:
   ```bash
   cd backend/src/main/resources
   cp application.properties.example application.properties
   ```

2. Edit `application.properties` with your actual credentials:
   ```properties
   spring.datasource.username=your_actual_username
   spring.datasource.password=your_actual_password
   ```

3. The `application.properties` file is already in `.gitignore` and will not be committed.

### Environment Variables (Recommended for Production)

Instead of hardcoding credentials, use environment variables:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://[::1]:3306/community_aggregator}
spring.datasource.username=${DB_USERNAME:aggregator}
spring.datasource.password=${DB_PASSWORD}
```

Then set environment variables:

**Windows:**
```cmd
set DB_USERNAME=your_username
set DB_PASSWORD=your_password
```

**Linux/Mac:**
```bash
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
```

**Docker:**
```yaml
environment:
  - DB_USERNAME=your_username
  - DB_PASSWORD=your_password
```

## Files to NEVER Commit

- `application.properties` (contains credentials)
- `application-*.properties` (profile-specific configs)
- `.env` files
- Any files containing API keys, passwords, or tokens
- Log files with sensitive data

## What to Do If You Accidentally Commit Credentials

1. **Immediately change the password** in your database
2. Remove the file from Git history (contact DevOps team)
3. Rotate any API keys or tokens that were exposed

## Secure Development Practices

1. Use `application.properties.example` as a template
2. Store credentials in environment variables or secret management systems
3. Use different credentials for development, staging, and production
4. Never log passwords or sensitive data
5. Review commits before pushing to ensure no secrets are included
