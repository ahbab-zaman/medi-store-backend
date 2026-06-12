/**
 * Professional email templates for MediStore
 * Logo: https://i.ibb.co.com/gZYhLStM/favicon.png
 */

interface OrderEmailParams {
  userName: string;
  orderId: string;
  orderStatus: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  userEmail: string;
}

export const getOrderConfirmationTemplate = (params: OrderEmailParams): string => {
  const { userName, orderId, orderStatus, paymentMethod, items, totalAmount } = params;

  const itemsHtml = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left; color: #333;">${item.name}</td>
      <td style="padding: 12px; text-align: center; color: #333;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right; color: #333;">৳${item.price.toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; color: #333;">৳${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - MediStore</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    
    .wrapper {
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    
    .logo {
      display: inline-block;
      margin-bottom: 15px;
    }
    
    .logo img {
      height: 50px;
      width: auto;
      display: block;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 10px 0 5px;
      letter-spacing: 0.5px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.95;
      margin: 0;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #333;
    }
    
    .greeting strong {
      color: #0d9488;
      font-weight: 600;
    }
    
    .message {
      font-size: 15px;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    
    .order-status-box {
      background-color: #f0fdf4;
      border-left: 4px solid #0d9488;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    
    .order-status-box h3 {
      color: #0d9488;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .status-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .status-label {
      color: #666;
      font-weight: 500;
    }
    
    .status-value {
      color: #333;
      font-weight: 600;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #333;
      margin: 30px 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #0d9488;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .items-table thead {
      background-color: #f9fafb;
      border-bottom: 2px solid #0d9488;
    }
    
    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #0d9488;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .items-table th:nth-child(2),
    .items-table th:nth-child(3),
    .items-table th:nth-child(4) {
      text-align: right;
    }
    
    .items-table td {
      padding: 12px;
      color: #555;
      font-size: 14px;
    }
    
    .items-table td:nth-child(2),
    .items-table td:nth-child(3),
    .items-table td:nth-child(4) {
      text-align: right;
    }
    
    .price-summary {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    
    .price-details {
      width: 300px;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      color: #666;
      border-bottom: 1px solid #eee;
    }
    
    .price-row:last-child {
      border-bottom: none;
    }
    
    .price-row.total {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #0d9488;
      font-size: 18px;
      font-weight: 700;
      color: #0d9488;
    }
    
    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
    }
    
    .info-box strong {
      color: #1e40af;
      display: block;
      margin-bottom: 5px;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eee;
    }
    
    .footer p {
      font-size: 13px;
      color: #666;
      margin: 8px 0;
      line-height: 1.6;
    }
    
    .footer a {
      color: #0d9488;
      text-decoration: none;
      font-weight: 600;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .support-link {
      display: inline-block;
      margin-top: 15px;
      padding: 10px 20px;
      background-color: #0d9488;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .support-link:hover {
      background-color: #0f766e;
      text-decoration: none;
    }
    
    .divider {
      height: 1px;
      background-color: #eee;
      margin: 20px 0;
    }
    
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px 15px;
      }
      
      .header {
        padding: 25px 15px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .items-table th,
      .items-table td {
        padding: 8px;
        font-size: 12px;
      }
      
      .section-title {
        font-size: 16px;
      }
      
      .price-details {
        width: 250px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <img src="https://i.ibb.co.com/gZYhLStM/favicon.png" alt="MediStore Logo" />
        </div>
        <h1>MediStore</h1>
        <p>Your Trusted Medicine Delivery Partner</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <!-- Greeting -->
        <p class="greeting">
          Hello <strong>${userName}</strong>,
        </p>
        
        <p class="message">
          Thank you for your purchase! We're excited to process your order. Below you'll find all the details about your order and what to expect next.
        </p>
        
        <!-- Order Status Box -->
        <div class="order-status-box">
          <h3>Order Status</h3>
          <div class="status-item">
            <span class="status-label">Order ID:</span>
            <span class="status-value">#${orderId}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Status:</span>
            <span class="status-value">${orderStatus}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Payment Method:</span>
            <span class="status-value">${paymentMethod}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Order Date:</span>
            <span class="status-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        <!-- Order Items -->
        <h2 class="section-title">Order Items</h2>
        <table class="items-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <!-- Price Summary -->
        <div class="price-summary">
          <div class="price-details">
            <div class="price-row">
              <span>Subtotal:</span>
              <span>৳${totalAmount.toFixed(2)}</span>
            </div>
            <div class="price-row">
              <span>Shipping:</span>
              <span>৳0.00</span>
            </div>
            <div class="price-row">
              <span>Tax:</span>
              <span>৳0.00</span>
            </div>
            <div class="price-row total">
              <span>Total Amount:</span>
              <span>৳${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Info Box -->
        <div class="info-box">
          <strong>📦 What's Next?</strong>
          Our team will process your order immediately. You'll receive a shipping confirmation email with tracking details once your order has been dispatched.
        </div>
        
        <div class="info-box" style="border-left-color: #10b981; background-color: #f0fdf4;">
          <strong style="color: #065f46;">✓ Order Confirmed</strong>
          Your payment has been received successfully. We'll start preparing your order right away.
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>
          <strong style="color: #333; font-size: 14px;">Need Help?</strong>
        </p>
        <p>
          If you have any questions about your order, please don't hesitate to contact us:
        </p>
        <p>
          📧 <a href="mailto:support@medistore.com">support@medistore.com</a><br/>
          📞 +880 1234 567890<br/>
          🌐 <a href="https://www.medistore.com">www.medistore.com</a>
        </p>
        <p style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
          © ${new Date().getFullYear()} MediStore. All rights reserved.<br/>
          <span style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this email.</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Payment Confirmation Email Template
 */
export const getPaymentConfirmationTemplate = (params: OrderEmailParams): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed - MediStore</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px;">
      <img src="https://i.ibb.co.com/gZYhLStM/favicon.png" alt="MediStore" style="height: 50px; margin-bottom: 10px;" />
      <h1 style="color: #0d9488; margin: 0; font-size: 28px;">Payment Confirmed</h1>
    </div>
    
    <p style="font-size: 16px;">Dear <strong>${params.userName}</strong>,</p>
    
    <p style="color: #666; font-size: 15px;">
      Your payment has been successfully processed. Your order is now being prepared for shipment.
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46;">
        <strong>✓ Payment Status: Confirmed</strong><br/>
        Amount: <strong>৳${params.totalAmount.toFixed(2)}</strong><br/>
        Order ID: <strong>#${params.orderId}</strong>
      </p>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      You will receive a shipping notification as soon as your order is dispatched.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    
    <p style="text-align: center; color: #999; font-size: 13px;">
      © ${new Date().getFullYear()} MediStore. All rights reserved.
    </p>
  </div>
</body>
</html>
  `;
};

/**
 * Shipping Confirmation Email Template
 */
export const getShippingConfirmationTemplate = (
  userName: string,
  orderId: string,
  trackingNumber?: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped - MediStore</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px;">
      <img src="https://i.ibb.co.com/gZYhLStM/favicon.png" alt="MediStore" style="height: 50px; margin-bottom: 10px;" />
      <h1 style="color: #0d9488; margin: 0; font-size: 28px;">Your Order is On the Way!</h1>
    </div>
    
    <p style="font-size: 16px;">Dear <strong>${userName}</strong>,</p>
    
    <p style="color: #666; font-size: 15px;">
      Great news! Your order has been shipped and is on its way to you.
    </p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af;">
        <strong>📦 Tracking Information</strong><br/>
        Order ID: <strong>#${orderId}</strong><br/>
        ${trackingNumber ? `Tracking Number: <strong>${trackingNumber}</strong>` : 'Tracking number will be updated soon'}
      </p>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      You can track your order status in real-time by logging into your account on our website.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    
    <p style="text-align: center; color: #999; font-size: 13px;">
      © ${new Date().getFullYear()} MediStore. All rights reserved.
    </p>
  </div>
</body>
</html>
  `;
};

/**
 * Delivery Confirmation Email Template
 */
export const getDeliveryConfirmationTemplate = (userName: string, orderId: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Confirmed - MediStore</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px;">
      <img src="https://i.ibb.co.com/gZYhLStM/favicon.png" alt="MediStore" style="height: 50px; margin-bottom: 10px;" />
      <h1 style="color: #0d9488; margin: 0; font-size: 28px;">Order Delivered!</h1>
    </div>
    
    <p style="font-size: 16px;">Dear <strong>${userName}</strong>,</p>
    
    <p style="color: #666; font-size: 15px;">
      Your order has been successfully delivered! We hope you're satisfied with your purchase.
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46;">
        <strong>✓ Order Delivered</strong><br/>
        Order ID: <strong>#${orderId}</strong><br/>
        Delivery Date: <strong>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
      </p>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Please review your order and let us know if everything is in order. We'd love to hear your feedback!
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    
    <p style="text-align: center; color: #999; font-size: 13px;">
      © ${new Date().getFullYear()} MediStore. All rights reserved.
    </p>
  </div>
</body>
</html>
  `;
};
