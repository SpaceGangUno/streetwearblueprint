// Streetwear Blueprint Theme - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  initMobileMenu();
  initProductGallery();
  initQuantitySelectors();
  initProductVariants();
  initAjaxCart();
  initCollectionFilters();
  initNewsletterForm();
});

/**
 * Mobile Menu
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.js-menu-toggle');
  const mobileMenu = document.querySelector('.js-mobile-menu');
  const menuOverlay = document.querySelector('.js-menu-overlay');
  
  if (!menuToggle || !mobileMenu) return;
  
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    
    menuToggle.setAttribute('aria-expanded', !isOpen);
    mobileMenu.classList.toggle('is-active');
    document.body.classList.toggle('menu-open');
    
    if (menuOverlay) {
      menuOverlay.classList.toggle('is-active');
    }
  });
  
  // Close menu when clicking outside
  if (menuOverlay) {
    menuOverlay.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-active');
      menuOverlay.classList.remove('is-active');
      document.body.classList.remove('menu-open');
    });
  }
  
  // Close menu on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-active')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-active');
      if (menuOverlay) menuOverlay.classList.remove('is-active');
      document.body.classList.remove('menu-open');
    }
  });
}

/**
 * Product Gallery
 */
function initProductGallery() {
  const productGallery = document.querySelector('.js-product-gallery');
  if (!productGallery) return;
  
  const mainImage = productGallery.querySelector('.js-product-featured-image');
  const thumbnails = productGallery.querySelectorAll('.js-product-thumbnail');
  
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active state
      thumbnails.forEach(thumb => thumb.classList.remove('is-active'));
      thumbnail.classList.add('is-active');
      
      // Update main image
      const newSrc = thumbnail.getAttribute('data-src');
      const newSrcset = thumbnail.getAttribute('data-srcset');
      const newAlt = thumbnail.getAttribute('data-alt');
      
      if (mainImage) {
        mainImage.setAttribute('src', newSrc);
        if (newSrcset) mainImage.setAttribute('srcset', newSrcset);
        if (newAlt) mainImage.setAttribute('alt', newAlt);
      }
    });
  });
}

/**
 * Quantity Selectors
 */
function initQuantitySelectors() {
  const quantitySelectors = document.querySelectorAll('.js-quantity-selector');
  
  quantitySelectors.forEach(selector => {
    const input = selector.querySelector('.js-quantity-input');
    const decreaseButton = selector.querySelector('.js-quantity-decrease');
    const increaseButton = selector.querySelector('.js-quantity-increase');
    
    if (!input || !decreaseButton || !increaseButton) return;
    
    decreaseButton.addEventListener('click', () => {
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        input.dispatchEvent(new Event('change'));
      }
    });
    
    increaseButton.addEventListener('click', () => {
      const currentValue = parseInt(input.value);
      input.value = currentValue + 1;
      input.dispatchEvent(new Event('change'));
    });
    
    input.addEventListener('change', () => {
      const value = parseInt(input.value);
      if (isNaN(value) || value < 1) {
        input.value = 1;
      }
    });
  });
}

/**
 * Product Variants
 */
function initProductVariants() {
  const productForm = document.querySelector('.js-product-form');
  if (!productForm) return;
  
  const variantSelectors = productForm.querySelectorAll('.js-variant-selector');
  const variantJson = document.getElementById('ProductVariantJson');
  
  if (!variantJson || !variantSelectors.length) return;
  
  try {
    const variants = JSON.parse(variantJson.textContent);
    
    // Update variant when selectors change
    variantSelectors.forEach(selector => {
      selector.addEventListener('change', () => {
        updateVariantSelection(variants, variantSelectors);
      });
    });
    
    // Initial update
    updateVariantSelection(variants, variantSelectors);
  } catch (error) {
    console.error('Error parsing variant JSON:', error);
  }
}

function updateVariantSelection(variants, selectors) {
  // Get currently selected options
  const selectedOptions = Array.from(selectors).map(selector => {
    return selector.value;
  });
  
  // Find the matching variant
  const matchingVariant = variants.find(variant => {
    return variant.options.every((option, index) => {
      return option === selectedOptions[index];
    });
  });
  
  if (matchingVariant) {
    // Update variant ID input
    const variantInput = document.querySelector('.js-variant-id-input');
    if (variantInput) {
      variantInput.value = matchingVariant.id;
    }
    
    // Update price
    const priceElement = document.querySelector('.js-product-price');
    if (priceElement && matchingVariant.price) {
      priceElement.innerHTML = formatMoney(matchingVariant.price);
    }
    
    // Update compare at price
    const compareElement = document.querySelector('.js-product-compare-price');
    if (compareElement) {
      if (matchingVariant.compare_at_price && matchingVariant.compare_at_price > matchingVariant.price) {
        compareElement.innerHTML = formatMoney(matchingVariant.compare_at_price);
        compareElement.style.display = '';
      } else {
        compareElement.style.display = 'none';
      }
    }
    
    // Update availability
    const availabilityElement = document.querySelector('.js-product-availability');
    if (availabilityElement) {
      if (matchingVariant.available) {
        availabilityElement.innerHTML = 'In stock';
        availabilityElement.classList.remove('unavailable');
        availabilityElement.classList.add('available');
      } else {
        availabilityElement.innerHTML = 'Sold out';
        availabilityElement.classList.remove('available');
        availabilityElement.classList.add('unavailable');
      }
    }
    
    // Update add to cart button
    const addToCartButton = document.querySelector('.js-add-to-cart');
    if (addToCartButton) {
      if (matchingVariant.available) {
        addToCartButton.disabled = false;
        addToCartButton.textContent = 'Add to Cart';
      } else {
        addToCartButton.disabled = true;
        addToCartButton.textContent = 'Sold Out';
      }
    }
  }
}

/**
 * Ajax Cart
 */
function initAjaxCart() {
  const cartDrawer = document.querySelector('.js-cart-drawer');
  const cartToggle = document.querySelector('.js-cart-toggle');
  const cartOverlay = document.querySelector('.js-cart-overlay');
  const cartClose = document.querySelector('.js-cart-close');
  const addToCartForms = document.querySelectorAll('.js-add-to-cart-form');
  
  if (!cartDrawer || !cartToggle) return;
  
  // Open cart drawer
  cartToggle.addEventListener('click', (e) => {
    e.preventDefault();
    openCartDrawer();
  });
  
  // Close cart drawer
  if (cartClose) {
    cartClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeCartDrawer();
    });
  }
  
  // Close when clicking overlay
  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
      closeCartDrawer();
    });
  }
  
  // Close on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && cartDrawer.classList.contains('is-active')) {
      closeCartDrawer();
    }
  });
  
  // Add to cart forms
  addToCartForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        updateCart();
        openCartDrawer();
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
      });
    });
  });
  
  // Update cart quantity
  document.addEventListener('click', (e) => {
    if (e.target.matches('.js-cart-item-quantity-update')) {
      const input = e.target.closest('.js-cart-item').querySelector('.js-cart-item-quantity');
      const itemKey = input.getAttribute('data-item-key');
      const newQuantity = parseInt(input.value);
      
      updateCartItem(itemKey, newQuantity);
    }
  });
  
  // Remove cart item
  document.addEventListener('click', (e) => {
    if (e.target.matches('.js-cart-item-remove')) {
      e.preventDefault();
      
      const itemKey = e.target.getAttribute('data-item-key');
      updateCartItem(itemKey, 0);
    }
  });
  
  // Initial cart update
  updateCart();
}

function openCartDrawer() {
  const cartDrawer = document.querySelector('.js-cart-drawer');
  const cartOverlay = document.querySelector('.js-cart-overlay');
  
  if (cartDrawer) {
    cartDrawer.classList.add('is-active');
    document.body.classList.add('cart-open');
    
    if (cartOverlay) {
      cartOverlay.classList.add('is-active');
    }
  }
}

function closeCartDrawer() {
  const cartDrawer = document.querySelector('.js-cart-drawer');
  const cartOverlay = document.querySelector('.js-cart-overlay');
  
  if (cartDrawer) {
    cartDrawer.classList.remove('is-active');
    document.body.classList.remove('cart-open');
    
    if (cartOverlay) {
      cartOverlay.classList.remove('is-active');
    }
  }
}

function updateCart() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      updateCartCount(cart.item_count);
      updateCartDrawerContents(cart);
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
    });
}

function updateCartItem(itemKey, quantity) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: itemKey,
      quantity: quantity
    })
  })
  .then(response => response.json())
  .then(cart => {
    updateCartCount(cart.item_count);
    updateCartDrawerContents(cart);
  })
  .catch(error => {
    console.error('Error updating cart item:', error);
  });
}

function updateCartCount(count) {
  const cartCount = document.querySelector('.js-cart-count');
  if (cartCount) {
    cartCount.textContent = count;
    cartCount.classList.toggle('is-hidden', count === 0);
  }
}

function updateCartDrawerContents(cart) {
  const cartDrawerContents = document.querySelector('.js-cart-drawer-contents');
  if (!cartDrawerContents) return;
  
  if (cart.item_count === 0) {
    cartDrawerContents.innerHTML = '<div class="cart-drawer__empty">Your cart is empty</div>';
    return;
  }
  
  let html = '';
  
  // Cart items
  html += '<div class="cart-drawer__items">';
  cart.items.forEach(item => {
    html += `
      <div class="cart-drawer__item js-cart-item">
        <div class="cart-drawer__item-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-drawer__item-content">
          <h4 class="cart-drawer__item-title">${item.title}</h4>
          ${item.variant_title ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>` : ''}
          <div class="cart-drawer__item-price">${formatMoney(item.price)}</div>
          <div class="cart-drawer__item-quantity">
            <button class="cart-drawer__item-quantity-button js-cart-item-quantity-update" data-action="decrease">-</button>
            <input type="number" class="cart-drawer__item-quantity-input js-cart-item-quantity" value="${item.quantity}" min="1" data-item-key="${item.key}">
            <button class="cart-drawer__item-quantity-button js-cart-item-quantity-update" data-action="increase">+</button>
          </div>
        </div>
        <button class="cart-drawer__item-remove js-cart-item-remove" data-item-key="${item.key}">&times;</button>
      </div>
    `;
  });
  html += '</div>';
  
  // Cart footer
  html += `
    <div class="cart-drawer__footer">
      <div class="cart-drawer__subtotal">
        <span class="cart-drawer__subtotal-label">Subtotal</span>
        <span class="cart-drawer__subtotal-price">${formatMoney(cart.total_price)}</span>
      </div>
      <p class="cart-drawer__disclaimer">Shipping, taxes, and discounts calculated at checkout.</p>
      <a href="/checkout" class="button cart-drawer__checkout">Checkout</a>
      <a href="/cart" class="cart-drawer__view-cart">View Cart</a>
    </div>
  `;
  
  cartDrawerContents.innerHTML = html;
}

/**
 * Collection Filters
 */
function initCollectionFilters() {
  const filterToggle = document.querySelector('.js-filter-toggle');
  const filterDrawer = document.querySelector('.js-filter-drawer');
  const filterOverlay = document.querySelector('.js-filter-overlay');
  const filterClose = document.querySelector('.js-filter-close');
  
  if (!filterToggle || !filterDrawer) return;
  
  // Open filter drawer
  filterToggle.addEventListener('click', (e) => {
    e.preventDefault();
    
    filterDrawer.classList.add('is-active');
    document.body.classList.add('filter-open');
    
    if (filterOverlay) {
      filterOverlay.classList.add('is-active');
    }
  });
  
  // Close filter drawer
  if (filterClose) {
    filterClose.addEventListener('click', (e) => {
      e.preventDefault();
      
      filterDrawer.classList.remove('is-active');
      document.body.classList.remove('filter-open');
      
      if (filterOverlay) {
        filterOverlay.classList.remove('is-active');
      }
    });
  }
  
  // Close when clicking overlay
  if (filterOverlay) {
    filterOverlay.addEventListener('click', () => {
      filterDrawer.classList.remove('is-active');
      document.body.classList.remove('filter-open');
      filterOverlay.classList.remove('is-active');
    });
  }
  
  // Close on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && filterDrawer.classList.contains('is-active')) {
      filterDrawer.classList.remove('is-active');
      document.body.classList.remove('filter-open');
      
      if (filterOverlay) {
        filterOverlay.classList.remove('is-active');
      }
    }
  });
}

/**
 * Newsletter Form
 */
function initNewsletterForm() {
  const newsletterForm = document.querySelector('.js-newsletter-form');
  if (!newsletterForm) return;
  
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const statusElement = newsletterForm.querySelector('.js-newsletter-status');
    
    if (!emailInput || !statusElement) return;
    
    const email = emailInput.value.trim();
    if (!email) {
      statusElement.textContent = 'Please enter your email address';
      statusElement.classList.add('error');
      return;
    }
    
    // Simulate form submission (in a real theme, this would submit to Shopify)
    statusElement.textContent = 'Subscribing...';
    statusElement.classList.remove('error', 'success');
    
    // Simulate API call
    setTimeout(() => {
      statusElement.textContent = 'Thank you for subscribing!';
      statusElement.classList.add('success');
      emailInput.value = '';
    }, 1000);
  });
}

/**
 * Utility Functions
 */
function formatMoney(cents) {
  const value = (cents / 100).toFixed(2);
  return '$' + value;
}
