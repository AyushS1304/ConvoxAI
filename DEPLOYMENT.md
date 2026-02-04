# ConvoxAI Deployment Guide

## 🚂 Railway Deployment

Railway supports two deployment approaches for this project:

### Option 1: Separate Services (Recommended)

Deploy backend and frontend as separate Railway services for better scalability and independent scaling.

#### Backend Deployment

1. **Create a new Railway project**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your ConvoxAI repository
   - Choose "Backend" as the root directory

2. **Configure Environment Variables**
   
   Add these variables in Railway dashboard:
   ```
   Groq_API_Key=your_groq_api_key
   Gemini_API_Key=your_gemini_api_key
   Pinecone_API_Key=your_pinecone_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   JWT_SECRET=your_jwt_secret
   ```

3. **Deploy**
   - Railway will automatically detect the `Dockerfile` in the Backend directory
   - The `railway.toml` file configures the build and deployment
   - Note your backend URL (e.g., `https://your-backend.railway.app`)

#### Frontend Deployment

1. **Create another Railway service**
   - In the same project, click "New Service"
   - Select your repository again
   - Choose "Frontend" as the root directory

2. **Configure Environment Variables**
   
   Add these variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```
   
   ⚠️ **Important**: Replace `https://your-backend.railway.app` with your actual backend URL from step 3 above.

3. **Rebuild on Environment Changes**
   
   Since Vite bakes environment variables at build time, you need to trigger a rebuild whenever you change environment variables.

### Option 2: Monorepo Deployment

Deploy from the root directory (less common for Railway):

1. Use the root `railway.toml` which points to the Backend
2. Deploy frontend separately or use a different platform (Vercel, Netlify)

---

## 🐳 Docker Deployment

### Local Development with Docker Compose

1. **Create `.env` file** in the root directory:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your actual credentials

3. **Build and run**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Production Docker Deployment

#### Backend Only
```bash
cd Backend
docker build -t convoxai-backend .
docker run -p 8000:8000 --env-file .env convoxai-backend
```

#### Frontend Only
```bash
cd Frontend
docker build -t convoxai-frontend .
docker run -p 80:80 convoxai-frontend
```

---

## 🔧 Environment Variables Reference

### Backend Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `Groq_API_Key` | Groq API key for LLM | Yes |
| `Gemini_API_Key` | Google Gemini API key | Yes |
| `Pinecone_API_Key` | Pinecone vector DB key | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `PORT` | Server port (auto-set by Railway) | No |

### Frontend Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `VITE_API_BASE_URL` | Backend API URL | Yes |

---

## 📝 Post-Deployment Checklist

- [ ] Backend is accessible and `/docs` endpoint works
- [ ] Frontend loads and can connect to backend
- [ ] Authentication works (sign up/login)
- [ ] Audio upload and summarization works
- [ ] Chat interface connects to backend
- [ ] Supabase database tables are created (run SQL scripts)
- [ ] Supabase storage bucket `audio-files` is created
- [ ] CORS is configured correctly in backend for frontend domain
- [ ] Environment variables are set correctly
- [ ] Health checks are passing

---

## 🔍 Troubleshooting

### Backend Issues

**Error: "Module not found"**
- Ensure all dependencies are in `requirements.txt`
- Rebuild the Docker image

**Error: "API key not found"**
- Check environment variables are set in Railway dashboard
- Verify variable names match exactly (case-sensitive)

**Error: "Database connection failed"**
- Verify Supabase credentials
- Check if database tables are created
- Ensure RLS policies are set up

### Frontend Issues

**Error: "Failed to fetch"**
- Check `VITE_API_BASE_URL` points to correct backend URL
- Verify CORS settings in backend allow your frontend domain
- Check browser console for specific errors

**Environment variables not working**
- Remember: Vite variables must start with `VITE_`
- Rebuild after changing environment variables
- Variables are baked at build time, not runtime

### Railway-Specific Issues

**Build fails**
- Check Railway build logs
- Verify Dockerfile paths are correct
- Ensure `railway.toml` is in the correct directory

**Health check fails**
- Increase `healthcheckTimeout` in `railway.toml`
- Verify the health check path exists
- Check application logs for startup errors

---

## 🚀 Alternative Deployment Platforms

### Backend
- **Render**: Similar to Railway, supports Docker
- **Fly.io**: Global edge deployment
- **Google Cloud Run**: Serverless containers
- **AWS ECS/Fargate**: Enterprise-grade container service

### Frontend
- **Vercel**: Optimized for React/Vite (recommended)
- **Netlify**: Great for static sites
- **Cloudflare Pages**: Fast global CDN
- **AWS S3 + CloudFront**: Traditional static hosting

---

## 📊 Monitoring & Logs

### Railway
- View logs in Railway dashboard
- Set up log drains for external monitoring
- Use Railway's metrics for performance tracking

### Docker
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps
```

---

## 🔄 CI/CD

Railway automatically deploys on git push to your main branch. To set up manual deployments:

1. Go to Railway project settings
2. Disable automatic deployments
3. Use Railway CLI or API for manual deploys

---

## 💡 Tips

1. **Use separate Railway projects** for staging and production
2. **Enable Railway's automatic HTTPS** for secure connections
3. **Set up custom domains** in Railway for professional URLs
4. **Monitor costs** - Railway charges based on usage
5. **Use Railway's built-in PostgreSQL** if you need a database (though you're using Supabase)
6. **Enable Railway's metrics** to track performance
7. **Set up alerts** for service downtime

---

**Need help?** Check the [Railway documentation](https://docs.railway.app) or [Docker documentation](https://docs.docker.com).
