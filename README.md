# 🛒 ShopEase — MERN eCommerce with Gmail-Based Admin

A full-stack eCommerce platform where **one specific Gmail address** is the admin.
No role panels, no separate login page — just set your Gmail in `.env` and you're done.

---

## 🔑 How Admin Works

```
ADMIN_EMAIL=yourgmail@gmail.com   ← only this email is admin
```

- Admin logs in at the **same `/login` page** as everyone else
- After login, the backend detects the email → returns `isAdmin: true`
- Frontend auto-redirects to `/admin` dashboard
- Every `/api/admin/*` route and product write checks `email === ADMIN_EMAIL`
- Normal users cannot access `/admin` — they get redirected to home

**No separate admin login. No role tables. No complex JWT scopes.**

---

## ⚡ Setup in 5 Minutes

### Step 1 — Clone & install
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2 — Configure `.env`
```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:
```env
PORT=5000
MONGO_URI=mongodb+srv://...         ← your MongoDB Atlas URI
ADMIN_EMAIL=yourgmail@gmail.com     ← THE admin Gmail
ADMIN_PASSWORD=YourStrongPass123    ← admin account password
JWT_SECRET=some_long_random_string  ← any 32+ char secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:5173
```

### Step 3 — Create the admin account (run once)
```bash
cd backend
npm run create-admin
```

This creates the admin user in MongoDB with `isAdmin: true`.

### Step 4 — Start servers
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

### Step 5 — Login as admin

1. Go to **https://cart-sphere.vercel.app/login**

2. Enter your `ADMIN_EMAIL` and `ADMIN_PASSWORD`

3. You are automatically redirected to **https://cart-sphere.vercel.app/admin**

---

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     ← register, login (auto-detects admin email)
│   │   ├── adminController.js    ← dashboard, orders, users, CRUD
│   │   ├── productController.js  ← full product CRUD + image upload
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   └── authMiddleware.js     ← protect, adminOnly, isAdminEmail()
│   ├── models/
│   │   ├── User.js               ← isAdmin: Boolean (derived from ADMIN_EMAIL)
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js         ← POST /register, POST /login
│   │   ├── adminRoutes.js        ← all protected by protect + adminOnly
│   │   ├── productRoutes.js      ← writes protected by protect + adminOnly
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── paymentRoutes.js
│   ├── utils/
│   │   └── createAdmin.js        ← npm run create-admin
│   └── server.js
│
└── frontend/
    └── src/
        ├── redux/slices/
        │   ├── authSlice.js      ← user.isAdmin from backend response
        │   ├── cartSlice.js
        │   ├── productSlice.js
        │   └── orderSlice.js
        ├── components/
        │   ├── common/
        │   │   ├── AdminRoute.jsx   ← checks user.isAdmin from auth slice
        │   │   └── PrivateRoute.jsx
        │   └── admin/
        │       └── AdminLayout.jsx  ← sidebar, admin info, logout
        └── pages/
            ├── LoginPage.jsx        ← single login; redirects admin to /admin
            ├── admin/
            │   ├── AdminDashboard.jsx   ← stats, revenue chart, low-stock
            │   ├── AdminProducts.jsx    ← list + search + delete
            │   ├── AdminProductForm.jsx ← add / edit with image upload
            │   ├── AdminOrders.jsx      ← update status, expandable rows
            │   └── AdminUsers.jsx       ← list users, activate/deactivate
            └── (all user pages)
```

---

## 🔌 API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register (blocks ADMIN_EMAIL) |
| POST | `/api/auth/login` | — | Login — returns `isAdmin:true` for admin email |
| GET  | `/api/auth/profile` | ✅ User | Get own profile |
| PUT  | `/api/auth/profile` | ✅ User | Update name / addresses |
| POST | `/api/auth/wishlist/:id` | ✅ User | Toggle wishlist item |

### Admin (all require `isAdmin`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/dashboard` | Stats, revenue, low stock, top products |
| GET | `/api/admin/orders` | All orders (filter by status, paginate) |
| PUT | `/api/admin/orders/:id` | Update order status |
| GET | `/api/admin/users` | All users (search, paginate) |
| PUT | `/api/admin/users/:id/toggle-active` | Activate / deactivate user |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/api/products`    | — | List (filter, search, sort, paginate) |
| GET    | `/api/products/:id`| — | Single product with reviews |
| POST   | `/api/products`    | 🔑 Admin | Create with images (multipart) |
| PUT    | `/api/products/:id`| 🔑 Admin | Update |
| DELETE | `/api/products/:id`| 🔑 Admin | Delete + remove Cloudinary images |
| POST   | `/api/products/:id/reviews` | ✅ User | Add review |

### Cart / Orders / Payment
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST/PUT/DELETE | `/api/cart/*` | ✅ User | Cart management |
| POST | `/api/orders` | ✅ User | Place order |
| GET  | `/api/orders` | ✅ User | My orders |
| GET  | `/api/orders/:id` | ✅ User | Order detail |
| PUT  | `/api/orders/:id/cancel` | ✅ User | Cancel order |
| POST | `/api/payment/create-order` | ✅ User | Razorpay order |
| POST | `/api/payment/verify` | ✅ User | Verify payment |

---

## 🛡️ Security

| Concern | Solution |
|---------|----------|
| Admin detection | `email.toLowerCase() === ADMIN_EMAIL.toLowerCase()` in middleware |
| Admin registration blocked | `authController` rejects registration with `ADMIN_EMAIL` |
| Route protection | `protect` (JWT) + `adminOnly` (email check) on every admin route |
| Frontend guard | `AdminRoute` checks `user.isAdmin` from Redux; redirects non-admins |
| Changing admin | Update `ADMIN_EMAIL` in `.env` and restart — takes effect immediately |
| Passwords | bcrypt with 12 rounds |
| CORS | Restricted to `CLIENT_URL` |
| Rate limiting | 100 req / 15 min on all `/api/*` routes |

---

## 🎨 Admin Panel Features

| Page | URL | Features |
|------|-----|---------|
| Dashboard | `/admin` | Revenue chart, order stats, low-stock alerts, top products, new users |
| Products | `/admin/products` | Table with search + category filter, stock warnings, edit/delete |
| Add/Edit Product | `/admin/products/new` or `/:id/edit` | Title, description, price, sale price, stock, category, images (Cloudinary), featured toggle |
| Orders | `/admin/orders` | Filter by status, expandable rows with items + address, inline status update |
| Users | `/admin/users` | Search, role badge, last login, activate/deactivate |

---

## 🚀 Deployment

### Backend → Render.com
1. New Web Service → connect your GitHub repo
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add environment variables (all from `.env`)
5. After deploy, open Render shell and run: `npm run create-admin`

### Frontend → Vercel
1. Import repo on vercel.com, framework = Vite
2. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
3. Deploy

### Database → MongoDB Atlas
1. Free tier cluster at cloud.mongodb.com
2. Network Access → Add `0.0.0.0/0`
3. Copy connection string → set as `MONGO_URI`

### Images → Cloudinary
1. Free account at cloudinary.com
2. Dashboard → copy Cloud Name, API Key, API Secret

---

## 🗄️ Database Schemas

### User
```
name, email, password (bcrypt), isAdmin (Boolean), isActive,
wishlist[], addresses[], lastLogin, createdAt
```

### Product
```
title, description, price, discountPrice, category, brand,
images[{url, public_id}], stock, reviews[], ratings, numReviews,
isFeatured, tags[], createdAt
```

### Order
```
user, items[{product, title, image, quantity, price}],
shippingAddress, totalPrice, taxPrice, shippingPrice, grandTotal,
paymentMethod (cod|razorpay), paymentStatus, orderStatus,
statusHistory[], deliveredAt, createdAt
```

---

## ✅ Quick Checklist

- [ ] Set `ADMIN_EMAIL` to your Gmail in `.env`
- [ ] Set a strong `ADMIN_PASSWORD`
- [ ] Set a long random `JWT_SECRET`
- [ ] Add MongoDB Atlas URI as `MONGO_URI`
- [ ] Add Cloudinary credentials
- [ ] Run `npm run create-admin` once
- [ ] Login at `/login` with your admin Gmail
- [ ] Verify redirect to `/admin` dashboard
- [ ] Add your first product at `/admin/products/new`

---

## ⚠️ Important Notes

- **Never commit `.env` to git** — add it to `.gitignore`
- To change the admin email: update `ADMIN_EMAIL` in `.env` and restart the server
- The old admin account stays in the database but loses admin access immediately
- Run `npm run create-admin` again to seed the new email as admin














 


| 39 | Image Upload Integration                          | **Support product image uploads**          |






