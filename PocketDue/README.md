# PocketDue

A minimalist finance tracking app designed for students to manage their personal payments.

## Features

- **Google OAuth**: Secure login with Google account
- **Payment Tracking**: Track payments you need to make and receive
- **Status Management**: Toggle between Paid/Unpaid or Received/Pending
- **Clean UI**: Modern, card-based design with smooth animations
- **Real-time Updates**: Optimistic UI updates for better user experience

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Update `lib/supabase.ts` with your credentials:

```typescript
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
```

### 3. Configure Google OAuth

1. **Google Cloud Console Setup:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Set Application Type to "Web application"
   - Add authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
     - `pocketdue://auth/callback`

2. **Supabase Auth Settings:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials:
     - Client ID: Your Google OAuth Client ID
     - Client Secret: Your Google OAuth Client Secret
   - Save the configuration

### 4. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('to_pay', 'to_receive')),
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'received', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can access their own payments"
ON payments
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_type ON payments(type);
```

### 5. Run the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Usage

1. **Sign In**: Tap "Continue with Google" to sign in with your Google account
2. **Add Payments**: Tap the + button to add new payments
3. **Switch Tabs**: Use the tabs to switch between "To Pay" and "To Receive"
4. **Toggle Status**: Tap the status badge to mark payments as paid/received
5. **Edit/Delete**: Tap a payment to edit, long press to delete

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Supabase** for backend (Auth + Database)
- **Google OAuth** for authentication
- **Expo Linear Gradient** for beautiful gradients
- **React Native DateTimePicker** for date selection

## Project Structure

```
PocketDue/
├── components/
│   ├── PaymentCard.tsx      # Individual payment display
│   ├── Tabs.tsx            # Tab navigation
│   └── AddPaymentDrawer.tsx # Payment form modal
├── screens/
│   ├── AuthScreen.tsx       # Google OAuth login screen
│   └── HomeScreen.tsx       # Main app screen
├── lib/
│   └── supabase.ts         # Supabase configuration
└── App.tsx                 # Main app component
```

## Development

The app follows a clean architecture with:

- **Components**: Reusable UI components
- **Screens**: Main app screens
- **Services**: API and database interactions
- **Types**: TypeScript type definitions

All components are designed to be accessible and work well in both light and dark modes.
