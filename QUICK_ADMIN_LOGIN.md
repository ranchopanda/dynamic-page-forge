# 🚀 Quick Admin Login Test

## Option 1: Via Browser Console

Open your browser console (F12) and paste this:

```javascript
// Quick admin login
async function loginAsAdmin() {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@hennaharmony.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  console.log('Login response:', data);
  
  // Store token
  localStorage.setItem('auth_token', data.token);
  
  // Reload page
  window.location.reload();
}

// Run it
loginAsAdmin();
```

## Option 2: Via Auth Modal

1. Click "Login" in the header
2. Enter:
   - Email: `admin@hennaharmony.com`
   - Password: `admin123`
3. Click "Sign In"

## Option 3: Check Current Auth

```javascript
// Check if you're already logged in
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? 'EXISTS' : 'MISSING');

// Check user data
fetch('http://localhost:3001/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(user => {
  console.log('Current user:', user);
  console.log('Role:', user.role);
});
```

## What to Look For

After login, you should see in the debug panel (bottom-right):
- ✅ Authenticated: Yes
- ✅ Role: **ADMIN** (in green)

Then the Admin link should appear in the header!
