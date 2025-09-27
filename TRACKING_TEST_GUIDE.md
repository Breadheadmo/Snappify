# 🧪 Order Tracking System - Testing Guide

## Quick Testing Steps

### 1. **Backend Database Test**
```bash
cd server
node scripts/test-tracking.js
```
This will:
- ✅ Create test user and order
- ✅ Test all tracking stages 
- ✅ Validate data models
- ✅ Simulate tracking updates

### 2. **API Endpoints Test**
```bash
cd server
node scripts/test-tracking-api.js
```
This will test:
- ✅ Public tracking endpoint
- ✅ Admin authentication
- ✅ Tracking updates
- ✅ Bulk operations

### 3. **Frontend Manual Tests**

#### **A. Tracking Page Test**
1. Navigate to: `http://localhost:3000/track/TEST123456789`
2. Should show: "Tracking number not found" (expected for new system)
3. Test responsive design on mobile

#### **B. Header Tracking Form**
1. Look for tracking form in header (desktop only)
2. Enter any tracking number
3. Should navigate to tracking page

#### **C. Admin Order Management**
1. Login as admin: `admin@snappy.com` / `admin123`
2. Go to Admin Dashboard → Orders
3. Update order tracking info
4. Test email notifications

### 4. **Create Test Data**

#### **Option A: Via Database Script**
```bash
cd server
node scripts/test-tracking.js
```

#### **Option B: Via Admin Panel**
1. Login as admin
2. Go to Orders section
3. Select an order
4. Add tracking information:
   - Tracking Number: `TR123456789`
   - Carrier: `DHL`
   - Stage: `shipped`
   - Estimated Delivery: 3 days from now

### 5. **Test Customer Experience**

1. **Order Tracking**:
   - Use tracking number from test data
   - Navigate to `/track/TR123456789`
   - Verify progress visualization

2. **Email Notifications** (if configured):
   - Update order to "shipped" status
   - Check email for shipping confirmation
   - Update to "delivered" status
   - Check email for delivery confirmation

## Testing Checklist

### ✅ **Backend Features**
- [ ] Tracking controller handles all endpoints
- [ ] Public tracking works without authentication
- [ ] Admin can update tracking information
- [ ] Bulk updates work for multiple orders
- [ ] Email notifications send correctly
- [ ] Database models store tracking data

### ✅ **Frontend Features**  
- [ ] Tracking page displays correctly
- [ ] Progress visualization shows current stage
- [ ] Responsive design works on mobile
- [ ] Header tracking form functions
- [ ] Error handling for invalid tracking numbers
- [ ] Loading states display properly

### ✅ **Integration Features**
- [ ] API endpoints respond correctly
- [ ] Authentication works for protected routes
- [ ] Real-time status updates
- [ ] Email service integration
- [ ] Admin dashboard integration

## Test Data Examples

### **Sample Tracking Numbers**
```
TEST123456789 - Basic test tracking
TR123456789   - DHL shipment
FX987654321   - FedEx shipment  
UP555666777   - UPS shipment
```

### **Tracking Stages**
```
processing        → Order being prepared
confirmed         → Order confirmed
preparing         → Items being packed
shipped           → Package shipped
in_transit        → Package in transit
out_for_delivery  → Out for delivery
delivered         → Package delivered
```

## API Testing with Postman

### **1. Public Tracking**
```
GET http://localhost:5001/api/tracking/TEST123456789
```

### **2. Update Tracking (Admin)**
```
PUT http://localhost:5001/api/tracking/order/{orderId}
Headers: Authorization: Bearer {admin_token}
Body:
{
  "trackingNumber": "TR123456789",
  "carrier": "DHL", 
  "currentStage": "shipped",
  "estimatedDelivery": "2025-01-15T00:00:00.000Z",
  "trackingUrl": "https://dhl.com/track/TR123456789"
}
```

### **3. Bulk Update (Admin)**
```
PUT http://localhost:5001/api/tracking/bulk-update
Headers: Authorization: Bearer {admin_token}
Body:
{
  "updates": [
    {
      "orderId": "order_id_here",
      "trackingNumber": "TR123456789",
      "carrier": "DHL",
      "currentStage": "delivered"
    }
  ]
}
```

## Troubleshooting

### **Common Issues**

1. **"Tracking number not found"**
   - ✅ Expected for new system
   - Create test data first

2. **"Server connection failed"**  
   - Start server: `cd server && npm start`
   - Check port 5001 is available

3. **Admin routes not working**
   - Login as admin first
   - Check JWT token in localStorage

4. **Email notifications not sending**
   - Check email service configuration
   - Verify SMTP settings in .env

### **Environment Variables Required**
```bash
# Server (.env)
MONGO_URI=mongodb://localhost:27017/snappy
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client (.env)
REACT_APP_API_URL=http://localhost:5001
```

## Performance Testing

### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# Create test scenario
artillery quick --count 10 --num 5 http://localhost:5001/api/tracking/TEST123
```

### **Database Performance**
```bash
# Test database queries
cd server
node -e "
  require('./config/db')();
  const Order = require('./models/orderModel');
  console.time('tracking-query');
  Order.findOne({trackingNumber: 'TEST123'}).then(result => {
    console.timeEnd('tracking-query');
    process.exit();
  });
"
```

---

## 🎯 Success Criteria

✅ **All tests pass**  
✅ **Tracking page renders correctly**  
✅ **API endpoints respond properly**  
✅ **Admin can manage tracking**  
✅ **Customers can track orders**  
✅ **Email notifications work**  
✅ **Responsive design functions**  
✅ **Error handling works**

---

**Ready for Production!** 🚀
