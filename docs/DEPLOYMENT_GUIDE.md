# VOTEX - Deployment & Hosting Guide

## 🚀 Deployment Overview

VOTEX uses a split architecture:
- **Frontend:** Static files (HTML/CSS/JS)
- **Backend:** Python Flask server with ML models

### Deployment Options

| Option | Frontend | Backend | Cost | Complexity | Best For |
|--------|----------|---------|------|------------|----------|
| **Local Development** | Python HTTP Server | Flask Local | Free | Easy | Testing |
| **Netlify + Your Server** | Netlify CDN | Your VPS | $5-20/mo | Medium | Small teams |
| **AWS Full Stack** | CloudFront/S3 | EC2 + RDS | $10-50/mo | Hard | Enterprise |
| **Docker + Heroku** | Heroku | Heroku | Free-$50/mo | Medium | Rapid deployment |
| **School Server** | School Apache | School Linux | Free | Easy | Educational use |

---

## 📦 Option 1: Netlify (Frontend) + Your VPS (Backend) - RECOMMENDED

### Why This is Best for You
- Frontend automatically deploys on every git push
- Backend runs on your server (full control)
- Low cost ($5-10/mo for VPS)
- Scalable approach
- Free SSL certificates

### Prerequisites
- Netlify account (free at netlify.com)
- VPS account (DigitalOcean, Linode, AWS, etc.)
- Git repository on GitHub

---

### Step 1: Deploy Frontend to Netlify

#### 1.1 Connect GitHub to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up" → Choose "GitHub"
3. Authorize Netlify to access your repositories
4. Click "New site from Git"
5. Select your `VoiceotTextConverter` repository

#### 1.2 Configure Build Settings

```
Build command: (leave empty - static files)
Publish directory: frontend
```

#### 1.3 Set Environment Variables

In Netlify dashboard:
- Settings → Build & deploy → Environment
- Add: `REACT_APP_BACKEND_URL=https://your-backend.com:5000`

#### 1.4 Deploy

- Click "Deploy site"
- Netlify will automatically build and deploy
- Your site is now live at: `https://your-site-name.netlify.app`

### Continuous Deployment (Auto-update)

Every time you push to GitHub:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Netlify automatically rebuilds and deploys! ✅

---

### Step 2: Deploy Backend to Your VPS

#### 2.1 Choose a VPS Provider

**Recommended (for beginners):**
- **DigitalOcean** - $5/mo droplet, simple interface
- **Linode** - $5/mo, good for learning
- **Vultr** - Pay-as-you-go, flexible

**Enterprise:**
- **AWS EC2** - More complex but scalable
- **Google Cloud** - Good if using Google services
- **Azure** - Microsoft ecosystem

#### 2.2 Set Up VPS (Example: DigitalOcean)

1. Create a Droplet
   - OS: Ubuntu 22.04
   - Size: $5/month (1GB RAM, 25GB SSD)
   - Region: Closest to your users
   
2. Get SSH access
   ```bash
   # Use the IP address provided
   ssh root@YOUR_VPS_IP
   ```

3. Initial setup
   ```bash
   # Update system
   apt update
   apt upgrade -y
   
   # Install Python and dependencies
   apt install -y python3 python3-pip python3-venv git
   
   # Install Node.js (for npm if needed)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   ```

#### 2.3 Clone Repository and Set Up

```bash
# Navigate to home directory
cd ~

# Clone repository
git clone https://github.com/your-org/VoiceotTextConverter.git
cd VoiceotTextConverter

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
pip install gunicorn  # Production server

# Install Node dependencies (for home_page assets)
cd home_page
npm install --production
cd ..
```

#### 2.4 Configure Environment

```bash
# Create .env file
nano .env
```

Add:
```
FLASK_ENV=production
FLASK_APP=home_page/server.py
API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

#### 2.5 Start Backend with Gunicorn (Production Server)

```bash
# From project root
cd home_page
gunicorn --bind 0.0.0.0:5000 --workers 4 server:app
```

**Expected output:**
```
[2026-04-19 10:00:00 +0000] [1234] [INFO] Starting gunicorn
[2026-04-19 10:00:00 +0000] [1234] [INFO] Listening at: http://0.0.0.0:5000
```

#### 2.6 Set Up Systemd Service (Auto-start)

Create service file:
```bash
sudo nano /etc/systemd/system/votex.service
```

Add:
```ini
[Unit]
Description=VOTEX Flask Backend
After=network.target

[Service]
User=root
WorkingDirectory=/root/VoiceotTextConverter
Environment="PATH=/root/VoiceotTextConverter/venv/bin"
ExecStart=/root/VoiceotTextConverter/venv/bin/gunicorn \
    --bind 0.0.0.0:5000 \
    --workers 4 \
    --timeout 120 \
    home_page.server:app

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable votex
sudo systemctl start votex
sudo systemctl status votex  # Verify running
```

---

### Step 3: Set Up SSL/HTTPS

#### 3.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 3.2 Get Free SSL Certificate

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

#### 3.3 Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create config file
sudo nano /etc/nginx/sites-available/votex
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/votex /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

---

### Step 4: Update Netlify Frontend with Backend URL

In your `frontend/` files, update API calls:

```javascript
// BACKEND_BASE_URL automatically detects:
// - Local dev: http://127.0.0.1:5000
// - Production: https://yourdomain.com:5000

const BACKEND_BASE_URL = (() => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';  // Local
  }
  return 'https://yourdomain.com:5000';  // Production
})();
```

Or set via environment variable:
```bash
# In Netlify dashboard:
# REACT_APP_BACKEND_URL = https://yourdomain.com:5000
```

---

## 🐳 Option 2: Docker + Heroku (Quick Deployment)

### Prerequisites
- Docker installed locally
- Heroku account (free tier available)
- GitHub repository

### Step 1: Create Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy code
COPY . .

# Expose port
EXPOSE 5000

# Run Flask
CMD ["python", "home_page/server.py"]
```

### Step 2: Create .dockerignore

```
venv/
__pycache__/
*.pyc
.git/
.env
node_modules/
```

### Step 3: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create votex-backend

# Set buildpack
heroku buildpacks:set heroku/python

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

Your backend is now at: `https://votex-backend.herokuapp.com`

---

## 🏫 Option 3: School/Local Server Deployment

If deploying on school infrastructure:

### Requirements
- Apache/Nginx web server (usually available)
- Python 3.9+ installed
- SSH access to server

### Installation

```bash
# SSH into school server
ssh username@school-server.edu

# Clone repository
git clone https://github.com/your-org/VoiceotTextConverter.git
cd VoiceotTextConverter

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install mod_wsgi  # For Apache integration

# Start Flask development server (simple method)
python home_page/server.py  # Runs on port 5000
```

### For Production Use (Apache)

Create WSGI file: `/app/votex.wsgi`
```python
import sys
sys.path.insert(0, '/app/VoiceotTextConverter/home_page')

from server import app
application = app
```

Configure Apache virtual host: `/etc/apache2/sites-available/votex.conf`
```apache
<VirtualHost *:80>
    ServerName votex.school.edu
    
    WSGIDaemonProcess votex python-home=/app/venv
    WSGIProcessGroup votex
    WSGIScriptAlias / /app/votex.wsgi
    
    <Directory /app>
        Require all granted
    </Directory>
</VirtualHost>
```

Enable and restart:
```bash
sudo a2ensite votex
sudo apachectl restart
```

---

## 📊 Monitoring & Maintenance

### Check Backend Status

```bash
# SSH into VPS
ssh root@your-vps-ip

# Check if service is running
sudo systemctl status votex

# View recent logs
sudo journalctl -u votex -n 50 -f

# Check resource usage
top  # Press 'q' to quit
```

### Monitor Performance

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
mpstat 1 5
```

### Regular Maintenance

```bash
# Update system packages (monthly)
sudo apt update
sudo apt upgrade -y

# Renew SSL certificate (automatic with certbot)
sudo certbot renew --dry-run

# Clear cache (if using Redis)
redis-cli FLUSHALL

# Backup database (if applicable)
mysqldump -u root -p database_name > backup.sql
```

---

## 🔄 CI/CD Pipeline (Auto-deploy on Push)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './frontend'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          netlify-auth-token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          netlify-site-id: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: |
          ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} << 'EOF'
          cd ~/VoiceotTextConverter
          git pull origin main
          source venv/bin/activate
          pip install -r requirements.txt
          sudo systemctl restart votex
          EOF
```

Add secrets to GitHub:
- Settings → Secrets → New repository secret
  - `NETLIFY_AUTH_TOKEN`
  - `VPS_USER`
  - `VPS_HOST`
  - `VPS_PRIVATE_KEY`

---

## 🚨 Troubleshooting Deployment

### Issue: Backend returns 503 (Service Unavailable)

```bash
# Restart service
sudo systemctl restart votex

# Check if port is listening
sudo netstat -tulpn | grep 5000

# Check logs
sudo journalctl -u votex -n 100
```

### Issue: Frontend can't reach backend

```bash
# Check CORS headers
curl -I http://backend:5000/api/asl/gloss

# Add CORS configuration to server.py
from flask_cors import CORS
CORS(app)
```

### Issue: SSL certificate expired

```bash
# Renew certificate
sudo certbot renew

# Force renewal if needed
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: High memory usage

```bash
# Reduce worker count
# In votex.service: --workers 2

# Or use async workers
--worker-class gevent --worker-connections 100
```

---

## 📈 Scaling Strategies

### As Usage Grows

1. **Stage 1 (Small - <100 users)**
   - Single VPS ($5/mo)
   - Netlify CDN for frontend
   - Local SQLite database

2. **Stage 2 (Medium - 100-1000 users)**
   - Larger VPS ($20/mo)
   - CloudFlare CDN
   - PostgreSQL database
   - Redis caching

3. **Stage 3 (Large - 1000+ users)**
   - Multiple backend servers
   - Load balancer (Nginx, HAProxy)
   - Separate database server
   - Content Delivery Network (CDN)
   - Message queue (RabbitMQ)

### Load Balancing Example

```bash
# Install HAProxy
sudo apt install -y haproxy

# Configure /etc/haproxy/haproxy.cfg
global
    maxconn 4096

frontend votex_front
    bind *:80
    default_backend votex_backend

backend votex_backend
    balance roundrobin
    server backend1 127.0.0.1:5001
    server backend2 127.0.0.1:5002
    server backend3 127.0.0.1:5003
```

---

## 🔐 Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured (ufw)
- [ ] SSH key-based authentication
- [ ] Strong passwords for all accounts
- [ ] Rate limiting enabled
- [ ] Input validation on backend
- [ ] Environment variables (.env) not committed
- [ ] Regular security updates
- [ ] DDoS protection (Cloudflare)
- [ ] Regular backups (weekly)
- [ ] Monitor error logs
- [ ] Security headers configured

---

## 📞 Post-Deployment Support

### Common Post-Launch Issues

1. **High load after launch**
   - Add more worker processes
   - Enable caching
   - Use CDN

2. **Memory leaks**
   - Monitor with `top` or `htop`
   - Restart service nightly
   - Profile with `memory_profiler`

3. **Slow performance**
   - Check database queries
   - Add Redis caching
   - Optimize images

4. **SSL errors**
   - Check certificate expiration: `certbot certificates`
   - Renew if needed: `certbot renew`

---

## 📚 Resources

- **Netlify Docs:** https://docs.netlify.com/
- **DigitalOcean Tutorials:** https://www.digitalocean.com/community/tutorials
- **Heroku Docs:** https://devcenter.heroku.com/
- **Flask Deployment:** https://flask.palletsprojects.com/deployment/
- **SSL/HTTPS:** https://certbot.eff.org/

---

**Last Updated:** April 2026
**Version:** 1.0
**Deployment Team:** VOTEX Infrastructure
