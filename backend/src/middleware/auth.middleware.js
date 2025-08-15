import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';

export const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user profile from Supabase to get the role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role, is_shadow_banned')
      .eq('id', decoded.userId)
      .single();

    if (error || !profile) {
      return res.status(401).json({ message: 'User not found.' });
    }
    
    if (profile.is_shadow_banned) {
      return res.status(403).json({ message: 'Account is suspended.' });
    }

    req.user = profile; // Attach user with role to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Role-based access control middleware
export const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
  }
  next();
};