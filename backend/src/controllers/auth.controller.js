// Import necessary libraries
import bcrypt from 'bcryptjs'; // For hashing and comparing passwords securely.
import jwt from 'jsonwebtoken'; // For creating and verifying JSON Web Tokens.
import { supabase } from '../lib/supabase.js'; // Import the centralized Supabase client.

// --- User Signup Controller ---
export const signup = async (req, res) => {
  try {
    // Destructure required fields from the request body.
    const { email, password, username } = req.body;

    // --- Input Validation ---
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required.' });
    }

    // --- Sign up the user with Supabase Auth ---
    // This handles the creation of the user in the 'auth.users' table.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // If Supabase returns an error (e.g., user already exists), forward it.
      return res.status(400).json({ message: authError.message });
    }
    
    // Check if user object is present
    if (!authData.user) {
        return res.status(400).json({ message: "Signup successful, but user data not returned. Please verify your email." });
    }

    // --- Create a corresponding profile in our public 'profiles' table ---
    // This links our custom profile data to the auth user.
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id, // The foreign key linking to auth.users.id
      username,
      email, // We can store email here for easier access if needed
    });

    if (profileError) {
      // If profile creation fails, this is a critical server error.
      // In a real app, you might want to delete the auth user to prevent orphaned users.
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ message: 'User created, but failed to create profile.' });
    }

    // --- Respond with success ---
    res.status(201).json({ message: 'User created successfully. Please check your email to verify your account.' });

  } catch (error) {
    console.error('Signup Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// --- User Login Controller ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // --- Authenticate user with Supabase Auth ---
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return res.status(401).json({ message: authError.message });
        }

        if (!authData.user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // --- User is authenticated, now fetch their profile for role info ---
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, is_shadow_banned')
            .eq('id', authData.user.id)
            .single();
        
        if(profileError || !profile) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        if (profile.is_shadow_banned) {
            return res.status(403).json({ message: 'Your account has been suspended.' });
        }
        
        // --- Create a custom JWT ---
        // While Supabase provides a JWT, creating our own gives us more control over the payload and expiration.
        // It also decouples our backend API's session management from Supabase's.
        const tokenPayload = {
            userId: profile.id,
            role: profile.role,
            // You can add more non-sensitive info here if needed
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '7d', // Token expires in 7 days
        });

        // --- Set the JWT in an HttpOnly cookie for security ---
        // HttpOnly prevents client-side JavaScript from accessing the cookie, mitigating XSS attacks.
        // 'secure: true' should be used in production to ensure the cookie is only sent over HTTPS.
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', // Helps prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });

        // --- Respond with success ---
        res.status(200).json({ message: 'Logged in successfully.' });

    } catch (error) {
        console.error('Login Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// --- User Logout Controller ---
export const logout = (req, res) => {
  // To log out, we simply clear the accessToken cookie.
  // We send a cookie with the same name but with an immediate expiration date.
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiration to a past date
  });
  res.status(200).json({ message: 'Logged out successfully.' });
};

// --- Get Current User Controller ---
export const getMe = async (req, res) => {
  // The 'protect' middleware has already run and attached the user object (with id and role) to the request.
  // We can now fetch the full profile information to send to the client.
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, profession, role') // Select only the data needed by the UI
      .eq('id', req.user.id) // req.user.id comes from the decoded JWT in the 'protect' middleware
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return the user's profile data.
    res.status(200).json(profile);

  } catch (error) {
    console.error('GetMe Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};