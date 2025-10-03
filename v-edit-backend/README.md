# V-Edit Backend

## Setup

1. Create `.env` in the project root with:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_jwt_secret_key_here
JWT_REFRESH_SECRET=your_long_random_refresh_secret_key_here
SESSION_SECRET=your_long_random_session_secret_key_here
RAZORPAY_KEY_ID=rzp_test_or_live_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=your_r2_bucket_name
R2_PUBLIC_BASE_URL=https://cdn.example.com
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

2. Install and run:

```
npm install
npm run dev
```

3. Seed admin user:

```
npm run seed:admin
```

## Endpoints

- POST `/api/auth/register` { name, email, password }
- POST `/api/auth/login` { email, password }
- POST `/folders` { name, parentId? } (admin)
- POST `/templates` form-data: title, description?, basePrice, discountPrice?, parentId?; files: video, qr (admin)
- GET `/hierarchy?folderId=<id>`
