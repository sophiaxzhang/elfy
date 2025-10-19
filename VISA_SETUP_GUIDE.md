# Visa Direct Integration Setup Guide

## Overview
This implementation adds Visa Direct Pull Funds API integration to your Elfly app, allowing automatic payouts when children reach their gem goals.

## Backend Implementation

### 1. Dependencies Added
- `axios` - For HTTP requests to Visa API
- Existing dependencies maintained

### 2. New Files Created
- `server/src/services/visaService.js` - Visa Direct API service
- `server/src/controllers/payoutController.js` - Payout logic controller
- `server/src/routes/payoutRoutes.js` - API routes for payouts
- `server/src/migrations/20250119_create_elfly_tables.js` - Database schema

### 3. Database Schema
The migration creates these tables:
- `parents` - Parent information including card details
- `children` - Child information and gem tracking
- `tasks` - Task management
- `transactions` - Payout transaction history

## Frontend Implementation

### 1. New Files Created
- `client/services/payoutService.ts` - Frontend payout service

### 2. Updated Files
- `ChildProgressBar.tsx` - Added payout trigger when goals are reached
- `ChildTaskDashboard.tsx` - Passes payout props to progress bar

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install axios
```

### 2. Environment Variables
Create a `.env` file in the server directory with:

 

### 4. Database Setup
Run the migration to create tables:
```bash
cd server/src/migrations
node 20250119_create_elfly_tables.js
```

### 5. Start the Server
```bash
cd server
npm run dev
```

## API Endpoints

### POST /api/trigger-payout
Triggers a payout when child reaches goal
```json
{
  "parentId": "string",
  "childId": "string", 
  "amount": number
}
```

### GET /api/transactions/:parentId
Get transaction history for a parent

### GET /api/parent/:parentId
Get parent information

### GET /api/child/:childId
Get child information

## How It Works

1. **Child completes tasks** → Earns gems
2. **Progress bar tracks gems** → Shows progress toward goal
3. **Goal reached** → Automatic payout trigger
4. **Visa Direct API called** → Processes payment
5. **Child's gems reset** → Ready for next goal

## Security Features

- **mTLS Authentication** - Mutual TLS with Visa certificates
- **JWT Token Validation** - All endpoints require authentication
- **Input Validation** - Request validation middleware
- **Error Handling** - Comprehensive error logging
- **Transaction Logging** - All transactions stored in database

## Testing

### 1. Test Payout Trigger
- Complete enough tasks to reach gem goal
- Progress bar should show payout alert
- Check server logs for Visa API calls

### 2. Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Trigger payout (with auth token)
curl -X POST http://localhost:3000/api/trigger-payout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"parentId":"1","childId":"1","amount":10}'
```

## Production Considerations

1. **Use Production Visa API** - Change `VISA_API_BASE_URL` to production URL
2. **Secure Certificate Storage** - Use secure storage for certificates
3. **Environment Variables** - Use proper secret management
4. **Database Security** - Enable SSL and proper access controls
5. **Monitoring** - Add logging and monitoring for transactions
6. **Error Handling** - Implement retry logic for failed transactions

## Troubleshooting

### Common Issues
1. **Certificate Errors** - Check certificate file paths and permissions
2. **Database Connection** - Verify DATABASE_URL and Neon connection
3. **Visa API Errors** - Check credentials and API endpoint
4. **CORS Issues** - Ensure frontend URL is allowed in CORS config

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=visa:*
```

This will log all Visa API requests and responses for debugging.
