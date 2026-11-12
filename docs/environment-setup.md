# TRADESCOUT — Local Development & Environment Setup Guide

> **Primary Operating System:** Windows 10/11 (PowerShell)  
> **Repository:** `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`  
> **Prerequisites:** Python 3.12+, Node.js 20+, pnpm, Docker Desktop, Git

---

## 1. Prerequisites Installation (Windows)

Ensure the following tools are installed and accessible in your PowerShell environment:

1. **Python 3.12+:**
   ```powershell
   python --version
   # Expected: Python 3.12.x or Python 3.13.x
   ```
2. **Node.js 20 LTS & pnpm:**
   ```powershell
   node -v
   # Expected: v20.x.x
   npm install -g pnpm
   pnpm -v
   ```
3. **Docker Desktop:** Ensure Docker Desktop for Windows is running with WSL 2 backend enabled.
   ```powershell
   docker --version
   docker compose version
   ```

---

## 2. Step-by-Step Environment Initialization

### Step 1: Clone / Navigate to Repository
```powershell
cd "C:\Users\pc\OneDrive\Desktop\TRADESCOUT"
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```powershell
Copy-Item .env.example .env
```
Open `.env` in your editor and configure your Supabase project keys and local credentials.

---

### Step 3: Launch Local Database & Redis Containers
From the repository root, start PostgreSQL 16 and Redis 7:
```powershell
docker compose -f infra/docker-compose.yml up -d
```
Verify containers are healthy:
```powershell
docker compose -f infra/docker-compose.yml ps
```
- PostgreSQL accessible at: `localhost:5432`
- Redis accessible at: `localhost:6379`
- pgAdmin (optional debug tool) at: `http://localhost:5050` (Login: `admin@tradescout.dev` / `admin`)

---

### Step 4: Backend Setup (`api/`)
```powershell
cd "C:\Users\pc\OneDrive\Desktop\TRADESCOUT\api"

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment in PowerShell
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install pinned dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Verify backend installation by launching the Uvicorn development server:
```powershell
uvicorn app.main:app --reload --port 8000
```
Open another PowerShell tab and test the health probe:
```powershell
curl http://localhost:8000/healthz
# Should return: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

---

### Step 5: Frontend Setup (`web/`)
Open a new PowerShell terminal:
```powershell
cd "C:\Users\pc\OneDrive\Desktop\TRADESCOUT\web"

# Install Node dependencies via pnpm
pnpm install

# Start Next.js development server
pnpm dev --port 3000
```
Open your browser at `http://localhost:3000`. You will see the TRADESCOUT landing screen.

---

## 3. Remote Supabase Database Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in the Supabase Dashboard.
3. Open `docs/Backend scheme.md` and copy the entire SQL script from Section 2.
4. Paste the SQL into the Supabase editor and click **Run**.
5. Copy your **Project URL** and **anon public key** into your `.env` file under `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 4. Troubleshooting Common Windows Issues

### Issue 1: PowerShell Script Execution Policy Error (`Activate.ps1`)
**Error:** `File ...\Activate.ps1 cannot be loaded because running scripts is disabled on this system.`  
**Fix:** Run this once in an Administrator PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 2: Docker Port 5432 or 6379 Already in Use
**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated.`  
**Fix:** Stop any existing local PostgreSQL/Redis Windows services:
```powershell
Stop-Service -Name "postgresql*" -Force -ErrorAction SilentlyContinue
Stop-Service -Name "redis*" -Force -ErrorAction SilentlyContinue
```

### Issue 3: Line Endings (CRLF vs LF)
Git on Windows may check out files with CRLF line endings. To enforce clean LF across both Python and TypeScript:
```powershell
git config --global core.autocrlf input
```
