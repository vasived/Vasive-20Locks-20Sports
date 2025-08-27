# Clerk Role Management for Vasive Locks

This document explains how to manage user roles in Clerk Dashboard for the Vasive Locks platform.

## Available Roles

The platform supports two user roles:
- **`admin`** - Full access to admin dashboard, can create/edit/delete picks
- **`premium`** - Access to premium picks, bankroll management, and advanced analytics

## Setting Up Roles in Clerk Dashboard

### 1. Access Clerk Dashboard
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in with your Clerk account
3. Select your Vasive Locks project

### 2. Navigate to Users Section
1. In the left sidebar, click on **"Users"**
2. Find the user you want to assign a role to
3. Click on the user to open their profile

### 3. Assign Roles via Public Metadata

Since the application checks for roles in `user.publicMetadata`, you'll need to add the role there:

1. In the user's profile, scroll down to the **"Metadata"** section
2. Click on **"Public metadata"** tab
3. Add the role using one of these formats:

#### Option A: Single Role (Recommended)
```json
{
  "role": "admin"
}
```
or
```json
{
  "role": "premium"
}
```

#### Option B: Multiple Roles Array
```json
{
  "roles": ["premium", "admin"]
}
```

4. Click **"Save"** to apply the changes

## Pre-configured Admin User

The following user has been configured as an admin:
- **User ID**: `user_31s6AL1sBxq7Fg1P2e577W6ttGO`

This user will have access to the admin dashboard at `/admin` once the database is properly connected.

## Testing Role Access

### Testing with Multiple Accounts

1. **Create a test account**:
   - Sign up with a different email address
   - This user will have no roles by default

2. **Test Free User Flow**:
   - Access `/premium-picks` → Should show Discord invitation
   - Access `/settings` → Should show sign-in prompt when not logged in
   - When logged in without premium role → Settings should show Discord CTA for bankroll management

3. **Test Premium User**:
   - Assign `"role": "premium"` to the test user
   - Access `/premium-picks` → Should show full premium experience
   - Access `/settings` → Should have full bankroll management access

4. **Test Admin User**:
   - Assign `"role": "admin"` to the test user
   - Access `/admin` → Should have full admin dashboard access
   - Admin users automatically have premium access too

## How the Application Checks Roles

The application uses this logic to check user roles:

```typescript
function hasRole(user: any, role: string): boolean {
  return (
    user?.publicMetadata?.role === role ||
    user?.publicMetadata?.roles?.includes(role) ||
    false
  );
}

function isPremiumUser(user: any): boolean {
  return hasRole(user, "premium") || hasRole(user, "admin");
}
```

## Important Notes

1. **Role Changes**: Role changes take effect immediately after saving in Clerk Dashboard
2. **Admin Access**: Admin users automatically get premium access
3. **Database Connection**: Some features require database connection via `DATABASE_URL` environment variable
4. **Metadata Location**: Roles must be in **public metadata**, not private metadata
5. **Case Sensitivity**: Role names are case-sensitive (`"admin"`, not `"Admin"`)

## Troubleshooting

### User Not Getting Expected Access
1. Check the exact user ID in Clerk Dashboard
2. Verify the role is in **public metadata** (not private)
3. Ensure the role name is exactly `"admin"` or `"premium"`
4. Try refreshing the page or signing out/in again

### Database Issues
If you see "database disconnected" or features not working:
1. Set the `DATABASE_URL` environment variable with your Neon connection string
2. Run the database initialization script: `cd server && npx tsx init-db.ts`

### Role Assignment Format
The role can be assigned in either format:
- Single role: `{"role": "admin"}`
- Multiple roles: `{"roles": ["premium", "admin"]}`

Both formats are supported by the application logic.
