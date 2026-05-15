Simple MERN To-Do App

This is a very small to-do app built with Express, React, Node, and MongoDB.
There is one root `package.json` for both the backend and frontend.

Features:

- Add a task
- Mark a task complete or incomplete
- Delete a task
- Frontend is served by the backend, so the deployed app stays same-origin and avoids CORS issues

## Run locally

1. Install Node.js and MongoDB.
2. Copy [.env.example](.env.example) to `.env` and update the values if needed.
3. If you want to create it manually, use:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/todo_app
NODE_ENV=development
```

4. Install dependencies:

```bash
npm install
```

5. Start the app in development mode:

```bash
npm run dev
```

6. Open the frontend at `http://localhost:5173`.

## Build for VM deployment

1. Make sure MongoDB is running on the VM or use a remote MongoDB URI.
2. Set the environment variables in the VM shell or a `.env` file.
3. Build the frontend:

```bash
npm run build
```

4. Start the backend:

```bash
npm start
```

The frontend React app is what gets built, and the backend serves the generated files from `server/public` in production mode.

Here’s a clean production-style deployment flow for a MERN app on an Azure Linux VM where:

* React frontend is built and served by Express backend
* MongoDB is external (Atlas/local)
* Nginx acts as reverse proxy
* Backend runs with PM2
* HTTPS optional via Certbot

---

# 1. Create Azure VM

Create an Ubuntu VM from the Azure Portal.

Recommended:

* Ubuntu 22.04 LTS
* Size: B1s/B2s for small projects

Open inbound ports:

* `22` → SSH
* `80` → HTTP
* `443` → HTTPS

After VM creation:

```bash
ssh azureuser@YOUR_VM_IP
```

---

# 2. Update Server

```bash
sudo apt update && sudo apt upgrade -y
```

---

# 3. Install Node.js

Install Node.js LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

---

# 4. Install Nginx

```bash
sudo apt install nginx -y
```

Start and enable:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

Check:

```bash
sudo systemctl status nginx
```

Open browser:

```text
http://YOUR_VM_IP
```

You should see the Nginx welcome page.

---

# 5. Install PM2

PM2 keeps backend running forever.

```bash
sudo npm install -g pm2
```

---

# 6. Clone Your MERN Project

Install Git:

```bash
sudo apt install git -y
```

Clone project:

```bash
git clone YOUR_GITHUB_REPO_URL
cd YOUR_PROJECT
```

Example:

```bash
git clone https://github.com/user/mern-app.git
cd mern-app
```

---

# 7. Install Backend Dependencies

```bash
npm install
```

If frontend is inside `client/`:

```bash
cd client
npm install
```

---

# 8. Build React Frontend

Inside frontend folder:

```bash
npm run build
```

This creates:

```text
client/build
```

or

```text
dist
```

depending on React/Vite.

---

# 9. Serve Frontend from Express

Example Express setup:

```js
const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});
```

For Vite:

```js
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});
```

---

# 10. Create Environment Variables

Create `.env`:

```bash
nano .env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
NODE_ENV=production
```

Save:

* `CTRL + X`
* `Y`
* `ENTER`

---

# 11. Start Backend Using PM2

Example:

```bash
pm2 start server.js --name mern-app
```

Check:

```bash
pm2 status
```

Save PM2 startup:

```bash
pm2 startup
```

Run command shown by PM2.

Then:

```bash
pm2 save
```

---

# 12. Configure Nginx Reverse Proxy

Create config:

```bash
sudo nano /etc/nginx/sites-available/mern-app
```

Paste:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:5000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save.

---

# 13. Enable Nginx Config

```bash
sudo ln -s /etc/nginx/sites-available/mern-app /etc/nginx/sites-enabled/
```

Remove default config:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test config:

```bash
sudo nginx -t
```

Restart:

```bash
sudo systemctl restart nginx
```

---

# 14. Configure Azure Network Security Group

In Azure Portal:

* VM → Networking

Allow:

* Port 80
* Port 443

---

# 15. Test Deployment

Visit:

```text
http://YOUR_VM_IP
```

Your MERN app should load.

---

# 16. (Optional but Recommended) Add Domain

Point your domain DNS A record to VM IP.

Example:

```text
example.com -> YOUR_VM_IP
```

---

# 17. Enable HTTPS with Certbot

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Run:

```bash
sudo certbot --nginx
```

Follow prompts.

Certbot automatically:

* installs SSL
* updates nginx config
* redirects HTTP → HTTPS

Test:

```text
https://yourdomain.com
```

---

# 18. Useful PM2 Commands

Restart app:

```bash
pm2 restart mern-app
```

Logs:

```bash
pm2 logs
```

Stop:

```bash
pm2 stop mern-app
```

Delete:

```bash
pm2 delete mern-app
```

---

# 19. Deployment Workflow for Updates

Whenever code changes:

```bash
git pull
npm install

cd client
npm install
npm run build

cd ..
pm2 restart mern-app
```

---

# Recommended Final Structure

```text
mern-app/
│
├── client/
│   ├── build/
│
├── server.js
├── package.json
├── .env
```

---

# Architecture

```text
Internet
   ↓
Nginx (80/443)
   ↓
Node/Express (5000)
   ↓
MongoDB Atlas
```

---

Useful technologies involved:

* Nginx
* PM2
* Microsoft Azure
* Node.js
* Express.js
* MongoDB
