/* ==========================================================================
   Cartiva - 100% Static E-Commerce Engine (HTML + CSS + Vanilla JS)
   ========================================================================== */

// --- Data Persistence Helpers ---
function getProducts() {
  const stored = localStorage.getItem('cartiva_products');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  if (typeof PRODUCTS !== 'undefined') {
    localStorage.setItem('cartiva_products', JSON.stringify(PRODUCTS));
    return PRODUCTS;
  }
  return [];
}

function saveProducts(products) {
  localStorage.setItem('cartiva_products', JSON.stringify(products));
}

function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id == id);
}

function getCart() {
  const stored = localStorage.getItem('cartiva_cart');
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem('cartiva_cart', JSON.stringify(cart));
  updateNavbarBadges();
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartSubtotal() {
  const cart = getCart();
  const products = getProducts();
  return cart.reduce((total, item) => {
    const p = products.find(prod => prod.id == item.product_id);
    return total + (p ? p.price * item.quantity : 0);
  }, 0);
}

function getWishlist() {
  const stored = localStorage.getItem('cartiva_wishlist');
  return stored ? JSON.parse(stored) : [];
}

function saveWishlist(list) {
  localStorage.setItem('cartiva_wishlist', JSON.stringify(list));
  updateNavbarBadges();
}

function isInWishlist(productId) {
  const list = getWishlist();
  return list.includes(Number(productId));
}

function getCurrentUser() {
  const stored = localStorage.getItem('cartiva_user');
  return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('cartiva_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('cartiva_user');
  }
  updateNavbarBadges();
}

function logoutUser() {
  localStorage.removeItem('cartiva_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

function getOrders() {
  const stored = localStorage.getItem('cartiva_orders');
  return stored ? JSON.parse(stored) : [
    {
      order_number: 'ORD-2026-9841',
      created_at: '2026-09-05 14:30',
      total_amount: 134900,
      status: 'Delivered',
      shipping_name: 'Rahul Sharma',
      shipping_email: 'rahul@example.com',
      shipping_phone: '+91 98765 43210',
      shipping_address: 'Flat 402, Sunshine Heights',
      shipping_city: 'Mumbai',
      shipping_state: 'Maharashtra',
      payment_method: 'UPI',
      items: [
        { product_id: 625, product_name: 'iPhone 15 Pro Max', price: 134900, quantity: 1, image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80' }
      ]
    }
  ];
}

function saveOrders(orders) {
  localStorage.setItem('cartiva_orders', JSON.stringify(orders));
}

function formatPrice(val) {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

// --- Toast Helper ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'warning') icon = 'fa-exclamation-triangle';
  if (type === 'danger') icon = 'fa-exclamation-circle';

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Actions ---
function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found', 'danger');
    return;
  }

  const cart = getCart();
  const index = cart.findIndex(item => item.product_id == productId);

  if (index > -1) {
    cart[index].quantity += quantity;
  } else {
    cart.push({ product_id: Number(productId), quantity: quantity });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" to cart!`, 'success');
}

function updateCartQty(productId, quantity) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(item => item.product_id != productId);
  } else {
    const item = cart.find(item => item.product_id == productId);
    if (item) item.quantity = quantity;
  }
  saveCart(cart);
  if (document.getElementById('cartItemsBody')) {
    initCartPage();
  }
}

function removeCartItem(productId) {
  if (!confirm('Are you sure you want to remove this item from your cart?')) return;
  let cart = getCart();
  cart = cart.filter(item => item.product_id != productId);
  saveCart(cart);
  showToast('Item removed from cart', 'info');
  if (document.getElementById('cartItemsBody')) {
    initCartPage();
  }
}

function toggleWishlist(productId, btn = null) {
  productId = Number(productId);
  let wishlist = getWishlist();
  let added = false;

  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    showToast('Removed from Wishlist', 'info');
  } else {
    wishlist.push(productId);
    added = true;
    showToast('Added to Wishlist!', 'success');
  }

  saveWishlist(wishlist);

  if (btn) {
    btn.classList.toggle('active', added);
    const icon = btn.querySelector('i');
    if (icon) {
      if (added) {
        icon.classList.remove('far');
        icon.classList.add('fas');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
      }
    }
  }

  if (document.getElementById('wishlistGrid')) {
    initWishlistPage();
  }
}

// --- Navbar Badges & User Menu ---
function updateNavbarBadges() {
  const cartCount = getCartCount();
  const wishlistCount = getWishlist().length;

  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.innerText = cartCount;
    badge.style.display = cartCount > 0 ? 'flex' : 'none';
  });

  document.querySelectorAll('.wishlist-badge').forEach(badge => {
    badge.innerText = wishlistCount;
    badge.style.display = wishlistCount > 0 ? 'flex' : 'none';
  });

  const user = getCurrentUser();
  const userActions = document.getElementById('userNavAction');
  if (userActions) {
    if (user) {
      userActions.innerHTML = `
        <div class="user-dropdown">
          <a href="profile.html" class="icon-btn" title="Profile">
            <i class="fas fa-user-circle"></i>
          </a>
          <div class="dropdown-menu">
            <div class="dropdown-item" style="font-weight: 700; border-bottom: 1px solid var(--border-color); color: var(--primary);">
              Hi, ${user.name}
            </div>
            ${user.role === 'admin' ? '<a href="admin.html" class="dropdown-item"><i class="fas fa-chart-line"></i> Admin Dashboard</a>' : ''}
            <a href="profile.html" class="dropdown-item"><i class="fas fa-user-edit"></i> My Profile</a>
            <a href="orders.html" class="dropdown-item"><i class="fas fa-box-open"></i> My Orders</a>
            <a href="javascript:void(0)" onclick="logoutUser()" class="dropdown-item" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      `;
    } else {
      userActions.innerHTML = `
        <a href="login.html" class="btn btn-primary btn-sm">
          <i class="fas fa-user"></i> Login
        </a>
      `;
    }
  }
}

// --- Product Card Renderer ---
function renderProductCard(product, options = {}) {
  const inWishlist = isInWishlist(product.id);
  const isBestseller = product.is_bestseller;
  const isWishlistPage = options.isWishlistPage || false;

  return `
    <div class="product-card" id="product-card-${product.id}">
      ${product.discount_percent > 0 ? `<span class="product-badge">${product.discount_percent}% OFF</span>` : ''}
      ${isBestseller && product.discount_percent === 0 ? `<span class="product-badge" style="background-color: var(--primary);">BESTSELLER</span>` : ''}
      
      <button class="wishlist-btn ${inWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id}, this)" title="Add to Wishlist">
        <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
      </button>
      
      <a href="product-details.html?id=${product.id}" class="product-img-wrapper">
        <img src="${product.image_url}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';">
      </a>

      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <a href="product-details.html?id=${product.id}" class="product-title">${product.name}</a>
        
        <div class="rating-stars">
          <i class="fas fa-star"></i>
          <span>${product.rating}</span>
          <span class="reviews-count">(${product.reviews_count})</span>
        </div>

        <div class="product-price-row">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.original_price > product.price ? `<span class="price-original">${formatPrice(product.original_price)}</span>` : ''}
        </div>

        <button onclick="${isWishlistPage ? `addToCart(${product.id}); toggleWishlist(${product.id});` : `addToCart(${product.id});`}" class="btn btn-primary btn-block btn-sm">
          <i class="fas fa-shopping-cart"></i> ${isWishlistPage ? 'Move to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

// --- Page Specific Initialization Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => navMenu.classList.toggle('show'));
  }

  updateNavbarBadges();

  if (document.getElementById('featuredProductsGrid')) initIndexPage();
  if (document.getElementById('productsPageGrid')) initProductsPage();
  if (document.getElementById('productDetailPage')) initProductDetailsPage();
  if (document.getElementById('cartContentLayout')) initCartPage();
  if (document.getElementById('checkoutForm')) initCheckoutPage();
  if (document.getElementById('ordersListContainer')) initOrdersPage();
  if (document.getElementById('wishlistGrid')) initWishlistPage();
  if (document.getElementById('loginForm')) initLoginPage();
  if (document.getElementById('registerForm')) initRegisterPage();
  if (document.getElementById('profileTabWrapper')) initProfilePage();
  if (document.getElementById('adminLayoutWrapper')) initAdminPage();
});

// --- 1. Index Page ---
function initIndexPage() {
  const products = getProducts();
  const featured = products.filter(p => p.is_featured).slice(0, 8);
  const bestsellers = products.filter(p => p.is_bestseller).slice(0, 8);

  const featContainer = document.getElementById('featuredProductsGrid');
  if (featContainer) {
    featContainer.innerHTML = featured.map(p => renderProductCard(p)).join('');
  }

  const bestContainer = document.getElementById('bestsellerProductsGrid');
  if (bestContainer) {
    bestContainer.innerHTML = bestsellers.map(p => renderProductCard(p)).join('');
  }
}

// --- 2. Products Catalog Page ---
function initProductsPage() {
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q') || '';
  const categoryParam = params.get('category') || '';
  const minPrice = parseFloat(params.get('min_price')) || 0;
  const maxPrice = parseFloat(params.get('max_price')) || Infinity;
  const minRating = parseFloat(params.get('rating')) || 0;
  const sortBy = params.get('sort') || 'popular';

  let products = getProducts();

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (categoryParam) {
    products = products.filter(p => p.category.toLowerCase() === categoryParam.toLowerCase());
  }

  if (minPrice > 0) products = products.filter(p => p.price >= minPrice);
  if (maxPrice < Infinity && maxPrice > 0) products = products.filter(p => p.price <= maxPrice);
  if (minRating > 0) products = products.filter(p => p.rating >= minRating);

  if (sortBy === 'price_low') products.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_high') products.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') products.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'discount') products.sort((a, b) => b.discount_percent - a.discount_percent);

  const titleText = document.getElementById('catalogSubtitle');
  if (titleText) {
    if (searchQuery) titleText.innerHTML = `Search results for "<strong style="color: var(--primary);">${searchQuery}</strong>" (${products.length} items found)`;
    else if (categoryParam) titleText.innerHTML = `Showing category: <strong style="color: var(--primary);">${categoryParam}</strong> (${products.length} items)`;
    else titleText.innerHTML = `Browse all products (${products.length} items available)`;
  }

  const countSpan = document.getElementById('resultsCount');
  if (countSpan) countSpan.innerText = products.length;

  const grid = document.getElementById('productsPageGrid');
  if (grid) {
    if (products.length > 0) {
      grid.innerHTML = products.map(p => renderProductCard(p)).join('');
    } else {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
          <i class="fas fa-box-open" style="font-size: 3.5rem; color: var(--text-light); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.4rem; font-weight: 700; color: var(--dark);">No Products Found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try adjusting your filters or search keywords.</p>
          <a href="products.html" class="btn btn-primary">Clear All Filters</a>
        </div>
      `;
    }
  }

  if (document.getElementById('searchInput')) document.getElementById('searchInput').value = searchQuery;
  if (document.getElementById('sortSelect')) document.getElementById('sortSelect').value = sortBy;
  
  if (categoryParam) {
    const radio = document.querySelector(`input[name="category"][value="${categoryParam}"]`);
    if (radio) radio.checked = true;
  }
}

// --- 3. Product Details Page ---
function initProductDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 625;
  const product = getProductById(id);

  if (!product) {
    document.getElementById('productDetailPage').innerHTML = `
      <div style="text-align: center; padding: 5rem 2rem;">
        <h2>Product Not Found</h2>
        <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Catalog</a>
      </div>
    `;
    return;
  }

  document.title = `${product.name} - Cartiva`;

  if (document.getElementById('detailCategoryLink')) {
    document.getElementById('detailCategoryLink').innerText = product.category;
    document.getElementById('detailCategoryLink').href = `products.html?category=${encodeURIComponent(product.category)}`;
  }
  if (document.getElementById('detailBreadcrumbName')) document.getElementById('detailBreadcrumbName').innerText = product.name;
  if (document.getElementById('detailBrand')) document.getElementById('detailBrand').innerText = product.brand;
  if (document.getElementById('detailTitle')) document.getElementById('detailTitle').innerText = product.name;
  if (document.getElementById('detailRating')) document.getElementById('detailRating').innerText = product.rating;
  if (document.getElementById('detailReviews')) document.getElementById('detailReviews').innerText = `(${product.reviews_count} Verified Customer Reviews)`;
  if (document.getElementById('detailStock')) document.getElementById('detailStock').innerText = `In Stock (${product.stock} units available)`;
  if (document.getElementById('detailPrice')) document.getElementById('detailPrice').innerText = formatPrice(product.price);
  
  if (document.getElementById('detailOriginalPrice')) {
    if (product.original_price > product.price) {
      document.getElementById('detailOriginalPrice').innerText = formatPrice(product.original_price);
      document.getElementById('detailDiscountBadge').innerText = `SAVE ${product.discount_percent}%`;
    } else {
      document.getElementById('detailOriginalPrice').style.display = 'none';
      document.getElementById('detailDiscountBadge').style.display = 'none';
    }
  }

  if (document.getElementById('detailDesc')) document.getElementById('detailDesc').innerText = product.description;

  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) mainImg.src = product.image_url;

  const thumbRow = document.getElementById('thumbnailRow');
  if (thumbRow) {
    thumbRow.innerHTML = `
      <img src="${product.image_url}" alt="Thumb 1" class="thumb-img active" onclick="switchMainImage('${product.image_url}', this)">
      <img src="${product.image_url}" alt="Thumb 2" class="thumb-img" onclick="switchMainImage('${product.image_url}', this)">
    `;
  }

  const wishBtn = document.getElementById('detailWishlistBtn');
  if (wishBtn) {
    const inWish = isInWishlist(product.id);
    wishBtn.classList.toggle('active', inWish);
    wishBtn.onclick = () => toggleWishlist(product.id, wishBtn);
  }

  const addBtn = document.getElementById('detailAddToCartBtn');
  if (addBtn) {
    addBtn.onclick = () => {
      const qty = parseInt(document.getElementById('itemQty').value) || 1;
      addToCart(product.id, qty);
    };
  }

  const buyNowBtn = document.getElementById('detailBuyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.onclick = () => {
      const qty = parseInt(document.getElementById('itemQty').value) || 1;
      addToCart(product.id, qty);
      window.location.href = 'checkout.html';
    };
  }

  const related = getProducts().filter(p => p.category === product.category && p.id != product.id).slice(0, 4);
  const relatedGrid = document.getElementById('relatedProductsGrid');
  if (relatedGrid && related.length > 0) {
    relatedGrid.innerHTML = related.map(p => renderProductCard(p)).join('');
  }
}

function switchMainImage(src, thumbElement) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
  if (thumbElement) thumbElement.classList.add('active');
}

// --- 4. Cart Page ---
function initCartPage() {
  const cart = getCart();
  const products = getProducts();

  const emptyWrapper = document.getElementById('emptyCartWrapper');
  const cartLayout = document.getElementById('cartContentLayout');
  const tbody = document.getElementById('cartItemsBody');

  if (!cart || cart.length === 0) {
    if (cartLayout) cartLayout.style.display = 'none';
    if (emptyWrapper) emptyWrapper.style.display = 'block';
    return;
  }

  if (cartLayout) cartLayout.style.display = 'grid';
  if (emptyWrapper) emptyWrapper.style.display = 'none';

  let subtotal = 0;

  if (tbody) {
    tbody.innerHTML = cart.map(item => {
      const p = products.find(prod => prod.id == item.product_id);
      if (!p) return '';
      const lineTotal = p.price * item.quantity;
      subtotal += lineTotal;

      return `
        <tr>
          <td>
            <div class="cart-product-info">
              <img src="${p.image_url}" alt="${p.name}" class="cart-product-img">
              <div>
                <span class="product-brand">${p.brand}</span>
                <a href="product-details.html?id=${p.id}" style="font-weight: 700; color: var(--dark); display: block; line-height: 1.3;">${p.name}</a>
              </div>
            </div>
          </td>
          <td style="font-weight: 600;">${formatPrice(p.price)}</td>
          <td>
            <div class="qty-counter">
              <button class="qty-btn" onclick="updateCartQty(${p.id}, ${item.quantity - 1})">-</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly>
              <button class="qty-btn" onclick="updateCartQty(${p.id}, ${item.quantity + 1})">+</button>
            </div>
          </td>
          <td style="font-weight: 800; color: var(--dark);">${formatPrice(lineTotal)}</td>
          <td>
            <button onclick="removeCartItem(${p.id})" class="icon-btn" style="color: var(--danger);" title="Remove Item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  const shipping = subtotal >= 1000 ? 0 : (subtotal > 0 ? 99 : 0);
  const total = subtotal + shipping;

  if (document.getElementById('summarySubtotal')) document.getElementById('summarySubtotal').innerText = formatPrice(subtotal);
  if (document.getElementById('summaryShipping')) {
    document.getElementById('summaryShipping').innerText = shipping === 0 ? 'FREE' : formatPrice(shipping);
    document.getElementById('summaryShipping').style.color = shipping === 0 ? 'var(--success)' : 'inherit';
  }
  if (document.getElementById('summaryTotal')) document.getElementById('summaryTotal').innerText = formatPrice(total);

  const hint = document.getElementById('freeShippingHint');
  if (hint) {
    if (subtotal < 1000 && subtotal > 0) {
      hint.style.display = 'block';
      hint.innerHTML = `<i class="fas fa-info-circle"></i> Add ${formatPrice(1000 - subtotal)} more for FREE Shipping!`;
    } else {
      hint.style.display = 'none';
    }
  }
}

// --- 5. Checkout Page ---
function initCheckoutPage() {
  const cart = getCart();
  const products = getProducts();

  if (!cart || cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  const user = getCurrentUser();
  if (user) {
    if (document.getElementById('checkoutName')) document.getElementById('checkoutName').value = user.name || '';
    if (document.getElementById('checkoutEmail')) document.getElementById('checkoutEmail').value = user.email || '';
    if (document.getElementById('checkoutPhone')) document.getElementById('checkoutPhone').value = user.phone || '';
    if (document.getElementById('checkoutAddress')) document.getElementById('checkoutAddress').value = user.address || '';
    if (document.getElementById('checkoutCity')) document.getElementById('checkoutCity').value = user.city || '';
    if (document.getElementById('checkoutState')) document.getElementById('checkoutState').value = user.state || '';
    if (document.getElementById('checkoutPincode')) document.getElementById('checkoutPincode').value = user.pincode || '';
  }

  const itemsContainer = document.getElementById('checkoutItemsList');
  let subtotal = 0;

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => {
      const p = products.find(prod => prod.id == item.product_id);
      if (!p) return '';
      const lineTotal = p.price * item.quantity;
      subtotal += lineTotal;

      return `
        <div style="display: flex; gap: 0.85rem; margin-bottom: 1rem; align-items: center;">
          <img src="${p.image_url}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="flex: 1;">
            <strong style="font-size: 0.88rem; color: var(--dark); display: block; line-height: 1.2;">${p.name}</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Qty: ${item.quantity}</span>
          </div>
          <strong style="font-size: 0.9rem; color: var(--dark);">${formatPrice(lineTotal)}</strong>
        </div>
      `;
    }).join('');
  }

  const shipping = subtotal >= 1000 ? 0 : 99;
  const total = subtotal + shipping;

  if (document.getElementById('checkoutSubtotal')) document.getElementById('checkoutSubtotal').innerText = formatPrice(subtotal);
  if (document.getElementById('checkoutShipping')) document.getElementById('checkoutShipping').innerText = shipping === 0 ? 'FREE' : formatPrice(shipping);
  if (document.getElementById('checkoutTotal')) document.getElementById('checkoutTotal').innerText = formatPrice(total);

  const form = document.getElementById('checkoutForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const orderNum = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const paymentMethod = document.getElementById('paymentMethodInput').value || 'UPI';

      const orderItems = cart.map(item => {
        const p = products.find(prod => prod.id == item.product_id);
        return {
          product_id: item.product_id,
          product_name: p ? p.name : 'Product',
          price: p ? p.price : 0,
          quantity: item.quantity,
          image_url: p ? p.image_url : ''
        };
      });

      const newOrder = {
        order_number: orderNum,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        total_amount: total,
        status: 'Processing',
        shipping_name: document.getElementById('checkoutName').value,
        shipping_email: document.getElementById('checkoutEmail').value,
        shipping_phone: document.getElementById('checkoutPhone').value,
        shipping_address: document.getElementById('checkoutAddress').value,
        shipping_city: document.getElementById('checkoutCity').value,
        shipping_state: document.getElementById('checkoutState').value,
        shipping_pincode: document.getElementById('checkoutPincode').value,
        payment_method: paymentMethod,
        items: orderItems
      };

      const orders = getOrders();
      orders.unshift(newOrder);
      saveOrders(orders);

      localStorage.removeItem('cartiva_cart');
      updateNavbarBadges();

      document.getElementById('checkoutFormLayout').style.display = 'none';
      document.getElementById('orderSuccessScreen').style.display = 'block';
      if (document.getElementById('successOrderRef')) document.getElementById('successOrderRef').innerText = orderNum;
      if (document.getElementById('successOrderTotal')) document.getElementById('successOrderTotal').innerText = formatPrice(total);
    };
  }
}

function selectPaymentMethod(element, method) {
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
  element.classList.add('active');
  const input = document.getElementById('paymentMethodInput');
  if (input) input.value = method;
}

// --- 6. Orders Page ---
function initOrdersPage() {
  const orders = getOrders();
  const container = document.getElementById('ordersListContainer');
  const emptyState = document.getElementById('emptyOrdersState');

  if (!orders || orders.length === 0) {
    if (container) container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (container) {
    container.style.display = 'flex';
    container.innerHTML = orders.map(order => {
      const st = order.status.toLowerCase();
      return `
        <div style="background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); margin-bottom: 1.5rem;">
          <div style="background-color: var(--bg-alt); padding: 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">ORDER ID</span>
              <strong style="font-size: 1.1rem; color: var(--dark);">${order.order_number}</strong>
            </div>

            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">DATE PLACED</span>
              <span style="font-size: 0.95rem; color: var(--text-main); font-weight: 500;">${order.created_at}</span>
            </div>

            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">TOTAL AMOUNT</span>
              <strong style="font-size: 1.1rem; color: var(--dark);">${formatPrice(order.total_amount)}</strong>
            </div>

            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.2rem;">STATUS</span>
              <span class="status-pill status-${st}">${order.status}</span>
            </div>
          </div>

          <div style="padding: 1.5rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--dark);">Items in Package:</h4>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${order.items.map(item => `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${item.image_url}" alt="${item.product_name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    <div>
                      <a href="product-details.html?id=${item.product_id}" style="font-weight: 700; color: var(--dark); display: block;">${item.product_name}</a>
                      <span style="font-size: 0.85rem; color: var(--text-muted);">Quantity: ${item.quantity}</span>
                    </div>
                  </div>
                  <strong style="font-size: 1rem; color: var(--dark);">${formatPrice(item.price * item.quantity)}</strong>
                </div>
              `).join('')}
            </div>

            <div style="margin-top: 1.25rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <i class="fas fa-truck" style="color: var(--primary);"></i> Shipping to: <strong>${order.shipping_name}</strong>, ${order.shipping_city}, ${order.shipping_state}
              </div>
              <div style="font-weight: 600;">
                Payment Method: ${order.payment_method}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// --- 7. Wishlist Page ---
function initWishlistPage() {
  const wishlistIds = getWishlist();
  const products = getProducts();
  const items = products.filter(p => wishlistIds.includes(p.id));

  const grid = document.getElementById('wishlistGrid');
  const emptyState = document.getElementById('emptyWishlistState');

  if (items.length === 0) {
    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (grid) {
    grid.style.display = 'grid';
    grid.innerHTML = items.map(p => renderProductCard(p, { isWishlistPage: true })).join('');
  }
}

// --- 8. Login Page ---
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      if (email === 'admin@cartiva.com') {
        const user = { name: 'Admin User', email: email, role: 'admin', phone: '+91 99999 88888', address: 'Cartiva HQs, Tech Park', city: 'Bengaluru', state: 'Karnataka', pincode: '560100' };
        setCurrentUser(user);
        showToast('Welcome Admin!', 'success');
        setTimeout(() => window.location.href = 'admin.html', 500);
      } else {
        const name = email.split('@')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        const user = { name: formattedName || 'Valued Customer', email: email, role: 'user', phone: '+91 98765 43210', address: 'Flat 402, Sunshine Heights', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' };
        setCurrentUser(user);
        showToast(`Welcome back, ${user.name}!`, 'success');
        setTimeout(() => window.location.href = 'index.html', 500);
      }
    };
  }
}

// --- 9. Register Page ---
function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const pass = document.getElementById('regPassword').value;
      const confirmPass = document.getElementById('regConfirmPassword').value;

      if (pass !== confirmPass) {
        showToast('Passwords do not match!', 'danger');
        return;
      }

      const user = { name: name, email: email, phone: phone, role: 'user', address: '', city: '', state: '', pincode: '' };
      setCurrentUser(user);
      showToast('Account created successfully!', 'success');
      setTimeout(() => window.location.href = 'index.html', 500);
    };
  }
}

// --- 10. Profile Page ---
function initProfilePage() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (document.getElementById('profileAvatar')) document.getElementById('profileAvatar').innerText = user.name[0].toUpperCase();
  if (document.getElementById('profileName')) document.getElementById('profileName').innerText = user.name;
  if (document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = user.email;

  if (document.getElementById('profileEditName')) document.getElementById('profileEditName').value = user.name;
  if (document.getElementById('profileEditEmail')) document.getElementById('profileEditEmail').value = user.email;
  if (document.getElementById('profileEditPhone')) document.getElementById('profileEditPhone').value = user.phone || '';
  if (document.getElementById('profileEditAddress')) document.getElementById('profileEditAddress').value = user.address || '';
  if (document.getElementById('profileEditCity')) document.getElementById('profileEditCity').value = user.city || '';
  if (document.getElementById('profileEditState')) document.getElementById('profileEditState').value = user.state || '';
  if (document.getElementById('profileEditPincode')) document.getElementById('profileEditPincode').value = user.pincode || '';

  const form = document.getElementById('profileEditForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      user.name = document.getElementById('profileEditName').value;
      user.phone = document.getElementById('profileEditPhone').value;
      user.address = document.getElementById('profileEditAddress').value;
      user.city = document.getElementById('profileEditCity').value;
      user.state = document.getElementById('profileEditState').value;
      user.pincode = document.getElementById('profileEditPincode').value;

      setCurrentUser(user);
      showToast('Profile updated successfully!', 'success');
      initProfilePage();
    };
  }

  const addrBox = document.getElementById('profileSavedAddressBox');
  if (addrBox) {
    if (user.address) {
      addrBox.innerHTML = `
        <div style="border: 2px solid var(--primary-border); background-color: var(--primary-light); border-radius: var(--radius-md); padding: 1.25rem;">
          <span class="badge" style="background-color: var(--primary); position: static; display: inline-block; margin-bottom: 0.5rem;">DEFAULT ADDRESS</span>
          <strong style="display: block; font-size: 1.05rem; color: var(--dark); margin-bottom: 0.2rem;">${user.name}</strong>
          <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.5rem;">
            ${user.address}, ${user.city}, ${user.state} - ${user.pincode}
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted);"><i class="fas fa-phone-alt"></i> Phone: ${user.phone}</p>
        </div>
      `;
    } else {
      addrBox.innerHTML = `<p style="color: var(--text-muted);">No saved addresses found. Please update your profile information.</p>`;
    }
  }

  const wishGrid = document.getElementById('profileWishlistGrid');
  if (wishGrid) {
    const wishlistIds = getWishlist();
    const prods = getProducts().filter(p => wishlistIds.includes(p.id));
    if (prods.length > 0) {
      wishGrid.innerHTML = prods.map(p => renderProductCard(p)).join('');
    } else {
      wishGrid.innerHTML = `<p style="color: var(--text-muted);">Your wishlist is empty. Browse products and click the heart icon to save items for later.</p>`;
    }
  }
}

function switchProfileTab(tabId, el) {
  document.querySelectorAll('.profile-tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  el.classList.add('active');
}

// --- 11. Admin Dashboard Page ---
function initAdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    const adminUser = { name: 'Admin User', email: 'admin@cartiva.com', role: 'admin' };
    setCurrentUser(adminUser);
  }

  const products = getProducts();
  const orders = getOrders();

  if (document.getElementById('statTotalProducts')) document.getElementById('statTotalProducts').innerText = products.length;
  if (document.getElementById('statTotalUsers')) document.getElementById('statTotalUsers').innerText = 4;
  if (document.getElementById('statTotalOrders')) document.getElementById('statTotalOrders').innerText = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  if (document.getElementById('statPendingOrders')) document.getElementById('statPendingOrders').innerText = pendingCount;
  const totalRev = orders.reduce((sum, o) => sum + o.total_amount, 0);
  if (document.getElementById('statTotalRevenue')) document.getElementById('statTotalRevenue').innerText = formatPrice(totalRev);

  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Toys'];
  const catChart = document.getElementById('adminCategoryChart');
  if (catChart) {
    catChart.innerHTML = categories.map(cat => {
      const count = products.filter(p => p.category === cat).length;
      const pct = Math.round((count / (products.length || 1)) * 100);
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary);">${count} items</span>
          <div style="width: 100%; max-width: 60px; height: ${Math.max(pct * 2, 20)}px; background: linear-gradient(180deg, var(--primary), #60a5fa); border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: height 0.5s ease;"></div>
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-align: center;">${cat}</span>
        </div>
      `;
    }).join('');
  }

  const prodBody = document.getElementById('adminProductsTableBody');
  if (prodBody) {
    prodBody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div class="cart-product-info">
            <img src="${p.image_url}" alt="${p.name}" class="cart-product-img">
            <div>
              <strong style="color: var(--dark); display: block;">${p.name}</strong>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Brand: ${p.brand}</span>
            </div>
          </div>
        </td>
        <td><span class="badge" style="background-color: var(--primary-light); color: var(--primary); position: static;">${p.category}</span></td>
        <td><strong>${formatPrice(p.price)}</strong></td>
        <td>${p.stock} units</td>
        <td><i class="fas fa-star" style="color: #f59e0b;"></i> ${p.rating}</td>
        <td>
          <button onclick="adminDeleteProduct(${p.id})" class="icon-btn" style="color: var(--danger);" title="Delete Product">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  const ordersBody = document.getElementById('adminOrdersTableBody');
  if (ordersBody) {
    ordersBody.innerHTML = orders.map((o, idx) => `
      <tr>
        <td><strong style="color: var(--dark);">${o.order_number}</strong></td>
        <td>${o.shipping_name}<br><span style="font-size: 0.78rem; color: var(--text-muted);">${o.shipping_email}</span></td>
        <td style="font-size: 0.85rem; max-width: 200px;">${o.shipping_address}, ${o.shipping_city}</td>
        <td><strong>${formatPrice(o.total_amount)}</strong></td>
        <td>
          <span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span>
        </td>
        <td>
          <select onchange="adminUpdateOrderStatus(${idx}, this.value)" class="form-select" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: auto;">
            <option value="Pending" ${o.status==='Pending'?'selected':''}>Pending</option>
            <option value="Processing" ${o.status==='Processing'?'selected':''}>Processing</option>
            <option value="Shipped" ${o.status==='Shipped'?'selected':''}>Shipped</option>
            <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
            <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  const addForm = document.getElementById('adminAddProductForm');
  if (addForm) {
    addForm.onsubmit = (e) => {
      e.preventDefault();
      const newP = {
        id: Date.now(),
        name: document.getElementById('adminPName').value,
        brand: document.getElementById('adminPBrand').value,
        category: document.getElementById('adminPCategory').value,
        price: parseFloat(document.getElementById('adminPPrice').value),
        original_price: parseFloat(document.getElementById('adminPOriginalPrice').value) || parseFloat(document.getElementById('adminPPrice').value),
        discount_percent: parseInt(document.getElementById('adminPDiscount').value) || 0,
        rating: 4.8,
        reviews_count: 1,
        stock: parseInt(document.getElementById('adminPStock').value) || 50,
        image_url: document.getElementById('adminPImage').value || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        description: document.getElementById('adminPDesc').value,
        is_featured: document.getElementById('adminPFeatured').checked ? 1 : 0,
        is_bestseller: document.getElementById('adminPBestseller').checked ? 1 : 0
      };

      const prods = getProducts();
      prods.unshift(newP);
      saveProducts(prods);

      showToast(`Product "${newP.name}" added successfully!`, 'success');
      addForm.reset();
      initAdminPage();
      switchAdminTab('productsTab', document.querySelectorAll('.admin-nav-item')[1]);
    };
  }
}

function switchAdminTab(tabId, el) {
  document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  el.classList.add('active');
}

function adminDeleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  let prods = getProducts().filter(p => p.id != id);
  saveProducts(prods);
  showToast('Product deleted from inventory', 'info');
  initAdminPage();
}

function adminUpdateOrderStatus(index, newStatus) {
  const orders = getOrders();
  if (orders[index]) {
    orders[index].status = newStatus;
    saveOrders(orders);
    showToast(`Order status updated to ${newStatus}`, 'success');
    initAdminPage();
  }
}
