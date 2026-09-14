# Smart Duka - Next.js Retail & Inventory System

A modern web application for managing product inventory, sales, and seller accounts. Built with **Next.js 16**, **React 19**, **TypeScript**, and **MySQL**.

## Features

✅ **User Authentication**
- JWT-based authentication
- Secure password hashing with bcryptjs
- Session management

✅ **Product Management**
- Create, read, update, delete products
- Track cost and selling prices
- Manage inventory levels
- Seller isolation

✅ **Sales Tracking**
- Record product sales
- Automatic stock updates
- Sales history & reporting
- Profit calculations

✅ **Printable Documents**
- Download sales reports, receipts, and inventory lists as PDF files
- Print documents directly with print-friendly layouts

✅ **Database**
- MySQL with connection pooling
- Transaction support for data consistency
- Performance optimizations with indexes

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL 8+ with mysql2
- **Authentication**: JWT + bcryptjs
- **Language**: TypeScript (full type safety)

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+ (or compatible)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/duka_system.git
cd dukabora-frontend
```

2. **Install dependencies** (run as Administrator if on Windows)
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Update `.env.local` with your database credentials**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dukabora
JWT_SECRET=your-secret-key
```

5. **Keep the existing database unchanged**

Use the existing `dukabora` database and its current schema. Do not run schema initialization, migrations, renames, or destructive database commands as part of this frontend setup.

6. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## API Documentation

Complete API documentation is available in [API_DOCS.md](API_DOCS.md).

### Quick API Examples

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"seller1","password":"password123"}'
```

**Get Products:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/products
```

## Setup & Configuration

For detailed setup instructions, see [SETUP.md](SETUP.md).

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # Authentication endpoints
│   ├── products/     # Product management
│   └── sales/        # Sales tracking
├── page.tsx          # Homepage
└── layout.tsx        # Root layout

lib/
├── db.ts            # Database utilities
├── auth.ts          # Auth & JWT utilities
└── types.ts         # TypeScript interfaces

public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Database Schema

### Users
- id, name, username, password, created_at

### Products
- id, name, selling_price, cost_price, stock_quantity, seller_id

### Sales
- id, product_id, quantity, sale_price, total, sold_by, sale_date

See `init_db.sql` for full schema.

## Security

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT authentication on protected routes
- ✅ Parameterized SQL queries (prevent injection)
- ✅ Seller isolation (users can only access their data)
- ✅ Transaction support for consistency
- ✅ CORS ready for frontend integration

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import repository on Vercel
3. Set environment variables
4. Deploy automatically

### Self-Hosted
The commands below assume Ubuntu, Apache, and an existing `dukabora` database. Run them from `dukabora-frontend`:

```bash
rm -rf .next
npm install
npm run build
pm2 start npm --name "smart-duka" -- start
pm2 save
pm2 startup
```

Enable Apache proxy modules:

```bash
sudo a2enmod proxy proxy_http
sudo systemctl restart apache2
```

Use this block in `/etc/apache2/sites-available/000-default.conf` inside the default VirtualHost. It forwards port 80 to the Next.js server on port 3000:

```apache
<VirtualHost *:80>
  ServerName 10.10.9.201

  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/

  ErrorLog ${APACHE_LOG_DIR}/smart-duka-error.log
  CustomLog ${APACHE_LOG_DIR}/smart-duka-access.log combined
</VirtualHost>
```

Apply the configuration and verify the process:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
pm2 status
curl http://10.10.9.201
```

### Local Verification

```bash
cd dukabora-frontend
rm -rf .next
npm install
npm run dev
```

Open `http://localhost:3000`. Stop the development server with `Ctrl+C`, then compile and run the production server:

```bash
rm -rf .next
npm run build
npm start
```

## Troubleshooting

### Database Connection Failed
- Ensure MySQL is running
- Check credentials in `.env.local`
- Verify database `dukabora` exists

### Unauthorized API Errors
- Include `Authorization: Bearer <token>` header
- Get new token by logging in
- Tokens expire after 7 days

### Permission Errors on npm install
- Run PowerShell as Administrator
- Clear npm cache: `npm cache clean --force`
- Try `npm install` again

See [SETUP.md](SETUP.md#troubleshooting) for more solutions.

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Ready to get started?** Follow the [Quick Start](#quick-start) guide above!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
