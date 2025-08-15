
import { supabase } from '../lib/supabase.js';

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get Profile Error:', error);
      return res.status(500).json({ message: 'Failed to fetch profile' });
    }

    // Remove sensitive data
    const { password, ...userProfile } = user;

    res.json(userProfile);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio, phone_number } = req.body;

    // Validate required fields
    if (!username?.trim()) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Check if username is already taken by another user
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .neq('id', userId)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        bio: bio?.trim() || null,
        phone_number: phone_number?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update Profile Error:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    // Remove sensitive data
    const { password, ...userProfile } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getProfile,
  updateProfile
};
