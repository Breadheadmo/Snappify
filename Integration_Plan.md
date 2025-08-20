# Integration Plan for Connecting Frontend to Backend

## 1. Create a .env File for the Frontend

Create a `.env.local` file in the client directory with environment variables to control the API connection:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_MOCK_DATA=false
```

## 2. Update API Routes to Match Backend

The following changes need to be made to the `api.ts` file:

### Authentication Routes:
- Update login to use `/api/users/login` instead of `/api/auth/login`
- Update register to use `/api/users` instead of `/api/auth/register`
- Update getCurrentUser to use `/api/users/profile` instead of `/api/auth/me`

### Wishlist Routes:
- Update to use `/api/users/wishlist` instead of `/api/wishlist`

### Product Routes:
- Make sure the product routes match our backend implementation
- Update the response handling to match our backend's response format

### Order Routes:
- Update to use our backend's order structure

## 3. Testing Strategy

1. First test authentication by registering a user and logging in
2. Then test product listing and filtering
3. Test wishlist functionality
4. Test cart and checkout process
5. Verify order history display

## 4. Gradually Transition from Mock Data

Rather than converting everything at once, we'll implement this gradually:

1. Start with authentication and user management
2. Move on to product listing and details
3. Then implement cart and checkout
4. Finally add wishlist and order history

This allows us to test each component individually.

## 5. MongoDB Setup Requirements

For local development, you'll need:
1. MongoDB installed locally or use MongoDB Atlas
2. Database seeded with initial product data

## 6. Running the Full Stack

1. Backend: `cd server && npm run dev`
2. Frontend: `cd client && npm start`
3. Make sure MongoDB is running

This integration connects our React frontend to our Express backend, giving us a fully functional e-commerce platform.
