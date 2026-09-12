# Cartiva - 100% Static E-Commerce Website

Cartiva is a fully responsive, static e-commerce website built with **HTML5**, **CSS3**, and **Vanilla JavaScript**. It runs directly in any modern web browser and is **100% ready for hosting on GitHub Pages**.

---

## Key Features

- **GitHub Pages Ready**: Zero backend setup, zero server requirements. Runs directly from `index.html`.
- **Modern UI & Design**: Clean white theme, blue accents, responsive layout across mobile, tablet, and desktop.
- **Product Catalog (100 Items)**: Includes live search bar, category filtering (Electronics, Fashion, Home & Living, Beauty, Sports, Toys), price range filter, rating filter, and sorting options (Price low/high, rating, discount, popularity).
- **Product Details View**: Image gallery, stock tracking badges, discount indicators, trust guarantee badges, and related recommendations.
- **Client-Side Cart & Wishlist**: Managed persistently via browser `localStorage` with real-time navbar badge updates.
- **Checkout & Order History**: 2-column checkout form, payment method selector (UPI, Credit/Debit Card, Net Banking, COD), instant order confirmation, and order history tracking (`orders.html`).
- **Admin Dashboard**: Full CRUD panel (`admin.html`) to add custom products, delete items, manage orders, and view category distribution charts.

---

## Test Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cartiva.com` | `admin123` | Admin Portal (`admin.html`), Product CRUD, Order Status |
| **Customer** | `user@cartiva.com` | `user123` | Shopping, Checkout, My Orders (`orders.html`), Profile (`profile.html`) |

---

## Project Folder Structure

```text
cartiva/
│
├── index.html              # Main homepage entry file for GitHub Pages
├── products.html           # Product catalog page with search & sidebar filters
├── product-details.html    # Detailed product view & recommendations
├── cart.html               # Shopping cart page
├── checkout.html           # Checkout form & order success screen
├── orders.html             # Order tracking history page
├── wishlist.html           # Saved items wishlist page
├── login.html              # Customer & Admin login page
├── register.html           # User registration page
├── profile.html            # User profile & saved addresses
├── admin.html              # Admin dashboard & inventory manager
├── README.md               # Project documentation
├── .gitignore              # Git ignore rules
│
└── static/
    ├── css/
    │   └── style.css       # Custom responsive stylesheet & animations
    ├── downloads/
    │   └── CartivaApp.apk  # Android App package
    └── js/
        ├── products-data.js # Complete 100-item product catalog data store
        └── script.js       # Client-side engine & LocalStorage manager
```

---

## How to Host on GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy static Cartiva website"
   git push origin main
   ```

2. On GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder, then click **Save**.
5. Your live site will be published at `https://<your-username>.github.io/cartiva/`.
