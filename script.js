// FameBoost E-commerce Website JavaScript
// This file contains all the shopping cart logic, payment modal functionality, and order processing

// Configuration - Easy to modify for the client
const CONFIG = {
    // Change this email address to your actual email
    ownerEmail: 'nicetarafdar3@gmail.com',
    
    // Change this URL to your actual QR code image (relative path supported)
    qrCodeUrl: './WhatsApp Image 2025-10-20 at 23.26.36_45cc7e19.jpg',
    
    // Business name for email subject
    businessName: 'FameBoost'
};

// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.initializeEventListeners();
        this.updateCartDisplay();
    }

    // Initialize all event listeners for cart functionality
    initializeEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = e.target.getAttribute('data-product');
                const price = parseInt(e.target.getAttribute('data-price'));
                this.addItem(product, price);
            });
        });

        // Buy now buttons
        document.querySelectorAll('.buy-now').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = e.target.getAttribute('data-product');
                const price = parseInt(e.target.getAttribute('data-price'));
                this.buyNow(product, price);
            });
        });

        // Cart button click
        document.getElementById('cartButton').addEventListener('click', () => {
            this.toggleCartSummary();
        });

        // Checkout button
        document.getElementById('checkoutButton').addEventListener('click', () => {
            this.showPaymentModal();
        });

        // Modal close button
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hidePaymentModal();
        });

        // Close modal when clicking outside
        document.getElementById('paymentModal').addEventListener('click', (e) => {
            if (e.target.id === 'paymentModal') {
                this.hidePaymentModal();
            }
        });

        // Download QR button
        const downloadBtn = document.getElementById('downloadQrButton');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadQrImage();
            });
        }

        // Order form submission
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder();
        });

        // Form validation - enable/disable confirm button based on form completion
        this.initializeFormValidation();

        // Close success message
        document.getElementById('successMessage').addEventListener('click', () => {
            this.hideSuccessMessage();
        });
    }

    // Add item to cart
    addItem(product, price) {
        const existingItem = this.items.find(item => item.product === product);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                product: product,
                price: price,
                quantity: 1
            });
        }
        
        this.updateCartDisplay();
        this.showCartNotification();
    }

    // Buy now functionality - adds to cart and shows payment modal
    buyNow(product, price) {
        // Clear cart and add single item
        this.items = [{
            product: product,
            price: price,
            quantity: 1
        }];
        
        this.updateCartDisplay();
        this.showPaymentModal();
    }

    // Update cart display and calculations
    updateCartDisplay() {
        this.calculateTotal();
        this.updateCartCount();
        this.updateCartSummary();
    }

    // Calculate total price
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Update cart count badge
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
    }

    // Update cart summary section
    updateCartSummary() {
        const cartSummary = document.getElementById('cartSummary');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (this.items.length === 0) {
            cartSummary.classList.add('hidden');
            return;
        }
        
        cartSummary.classList.remove('hidden');
        cartItems.innerHTML = '';
        
        this.items.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item flex justify-between items-center p-3 bg-gray-50 rounded-lg';
            cartItem.innerHTML = `
                <div>
                    <div class="font-medium">${item.product}</div>
                    <div class="text-sm text-gray-600">₹${item.price} × ${item.quantity}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-semibold">₹${item.price * item.quantity}</span>
                    <button class="remove-item text-red-500 hover:text-red-700" data-index="${index}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            // Add remove item functionality
            cartItem.querySelector('.remove-item').addEventListener('click', () => {
                this.removeItem(index);
            });
            
            cartItems.appendChild(cartItem);
        });
        
        cartTotal.textContent = `₹${this.total}`;
    }

    // Remove item from cart
    removeItem(index) {
        this.items.splice(index, 1);
        this.updateCartDisplay();
    }

    // Toggle cart summary visibility
    toggleCartSummary() {
        const cartSummary = document.getElementById('cartSummary');
        if (this.items.length > 0) {
            cartSummary.classList.remove('hidden');
            cartSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            this.showInfoMessage('You should add something to your cart.');
        }
    }

    // Show cart notification
    showCartNotification() {
        const cartCount = document.getElementById('cartCount');
        cartCount.style.animation = 'none';
        setTimeout(() => {
            cartCount.style.animation = 'pulse 0.3s ease-in-out';
        }, 10);
    }

    // Show payment modal
    showPaymentModal() {
        const modal = document.getElementById('paymentModal');
        const modalTotal = document.getElementById('modalTotal');
        
        modalTotal.textContent = `₹${this.total}`;
        modal.classList.remove('hidden');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    // Hide payment modal
    hidePaymentModal() {
        const modal = document.getElementById('paymentModal');
        modal.classList.add('hidden');
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
        
        // Reset form
        document.getElementById('orderForm').reset();
    }

    // Download QR image shown in modal
    downloadQrImage() {
        const img = document.getElementById('paymentQr');
        if (!img) return;

        // Create a temporary link to download the image
        const link = document.createElement('a');
        link.href = img.src;
        // Best-effort filename
        const urlParts = img.src.split('/');
        const fallbackName = 'payment-qr.jpg';
        link.download = (urlParts[urlParts.length - 1] || fallbackName).split('?')[0] || fallbackName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Process order and send email notification
    processOrder() {
        const customerEmail = document.getElementById('customerEmail').value;
        const profileLink = document.getElementById('profileLink').value;
        const transactionId = document.getElementById('transactionId').value;
        
        // Validate form inputs
        if (!customerEmail || !profileLink || !transactionId) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Validate email format
        if (!Utils.isValidEmail(customerEmail)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Validate URL format
        try {
            new URL(profileLink);
        } catch (e) {
            alert('Please enter a valid social media profile URL.');
            return;
        }
        
        // Prepare order details
        const orderDetails = this.prepareOrderDetails(customerEmail, profileLink, transactionId);
        
        // Send email notification
        this.sendOrderNotification(orderDetails);
        
        // Hide modal and show success message
        this.hidePaymentModal();
        this.showSuccessMessage();
        
        // Clear cart
        this.clearCart();
    }

    // Prepare order details for email
    prepareOrderDetails(customerEmail, profileLink, transactionId) {
        const packageList = this.items.map(item => 
            `${item.product} (₹${item.price} × ${item.quantity})`
        ).join('\n');
        
        return {
            customerEmail: customerEmail,
            packages: packageList,
            total: this.total,
            profileLink: profileLink,
            transactionId: transactionId,
            itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    // Send order notification via mailto
    sendOrderNotification(orderDetails) {
        const subject = `New Order Notification - ${orderDetails.itemCount} Package(s) - ${CONFIG.businessName}`;
        
        const body = `New Order Received!

Package(s) Ordered:
${orderDetails.packages}

Total Price: ₹${orderDetails.total}

Customer Details:
Email: ${orderDetails.customerEmail}
Profile Link: ${orderDetails.profileLink}
Transaction ID: ${orderDetails.transactionId}

Order Time: ${new Date().toLocaleString()}

Please process this order within 24 hours.

---
This order was placed through ${CONFIG.businessName} website.`;

        // Create mailto link with owner email as recipient
        const mailtoLink = `mailto:${CONFIG.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open email client
        window.location.href = mailtoLink;
    }

    // Show success message
    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideSuccessMessage();
        }, 5000);
    }

    // Hide success message
    hideSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.add('hidden');
    }

    // Show informational toast using the existing success message element
    showInfoMessage(message) {
        const el = document.getElementById('successMessage');
        if (!el) {
            alert(message);
            return;
        }
        const originalText = el.textContent;
        const wasGreen = el.classList.contains('bg-green-500');
        el.textContent = message;
        if (wasGreen) {
            el.classList.remove('bg-green-500');
            el.classList.add('bg-blue-500');
        }
        el.classList.remove('hidden');
        setTimeout(() => {
            el.classList.add('hidden');
            // Restore original styling and text
            if (wasGreen) {
                el.classList.remove('bg-blue-500');
                el.classList.add('bg-green-500');
            }
            el.textContent = originalText;
        }, 3000);
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.updateCartDisplay();
    }

    // Initialize form validation to enable/disable confirm button
    initializeFormValidation() {
        const form = document.getElementById('orderForm');
        const confirmButton = document.getElementById('confirmOrderButton');
        const requiredFields = ['customerEmail', 'profileLink', 'transactionId'];

        // Function to validate all required fields
        const validateForm = () => {
            let allValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field || !field.value.trim()) {
                    allValid = false;
                    return;
                }
                
                // Additional validation for specific fields
                if (fieldId === 'customerEmail' && !Utils.isValidEmail(field.value.trim())) {
                    allValid = false;
                } else if (fieldId === 'profileLink') {
                    try {
                        new URL(field.value.trim());
                    } catch (e) {
                        allValid = false;
                    }
                }
            });
            
            // Enable/disable button based on validation
            if (confirmButton) {
                confirmButton.disabled = !allValid;
            }
        };

        // Add event listeners to all required fields
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', validateForm);
                field.addEventListener('blur', validateForm);
            }
        });

        // Initial validation
        validateForm();
    }
}

// Utility Functions
class Utils {
    // Format currency
    static formatCurrency(amount) {
        return `₹${amount}`;
    }

    // Validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate URL format
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Show loading state on button
    static showLoading(button) {
        button.classList.add('loading');
        button.disabled = true;
    }

    // Hide loading state on button
    static hideLoading(button) {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping cart
    const cart = new ShoppingCart();
    
    // Ensure payment QR uses configured path
    const qrImg = document.getElementById('paymentQr');
    if (qrImg && CONFIG.qrCodeUrl) {
        qrImg.src = CONFIG.qrCodeUrl;
    }
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Close modal with Escape key
        if (e.key === 'Escape') {
            const modal = document.getElementById('paymentModal');
            if (!modal.classList.contains('hidden')) {
                cart.hidePaymentModal();
            }
        }
    });
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for animations (optional enhancement)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });
        
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    console.log('FameBoost website initialized successfully!');
    console.log('To customize:');
    console.log('1. Change CONFIG.ownerEmail to your email address');
    console.log('2. Change CONFIG.qrCodeUrl to your QR code image URL');
    console.log('3. Update CONFIG.businessName if needed');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart, Utils, CONFIG };
}

// Banner Management - Permanent Banner
class BannerManager {
    constructor() {
        this.banner = document.getElementById('offerBanner');
        this.init();
    }

    init() {
        // Show banner immediately when page loads
        this.showBanner();
    }

    showBanner() {
        if (this.banner) {
            this.banner.classList.remove('-translate-y-full');
            this.banner.classList.add('translate-y-0');
            
            // Add body padding to prevent content jump
            document.body.style.paddingTop = this.banner.offsetHeight + 'px';
        }
    }
}

// Initialize banner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BannerManager();
});
