const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// --- Get all events (Public) ---
// Fetches a list of all events, ordered by the most recently created.
const getAllEvents = async (req, res) => {
  try {
    // Select all columns from the 'events' table.
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    // If there's a database error, log it and send a 500 status.
    if (error) throw error;

    // Send the list of events with a 200 OK status.
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// --- Get a single event by ID (Public) ---
// Fetches detailed information for a specific event.
const getEventById = async (req, res) => {
  try {
    const { id } = req.params; // Get the event ID from the URL parameters.

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id) // Filter by the provided ID.
      .single(); // Expect only one result.

    if (error) throw error;

    // If no event is found with that ID, return a 404 status.
    if (!data) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching event by ID:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// --- Create a new event (Protected, Admin-only) ---
// Creates a new event record in the database.
const createEvent = async (req, res) => {
  try {
    // The 'protect' and 'checkRole' middleware have already run.
    // The authenticated user's ID is available in req.user.id.
    const created_by = req.user.id;

    // Destructure event details from the request body.
    const { title, description, poster_url, event_date, location, is_free, price } = req.body;

    // Basic validation to ensure required fields are present.
    if (!title || !description || !event_date || !location) {
      return res.status(400).json({ message: 'Please provide all required event details.' });
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        poster_url,
        event_date,
        location,
        is_free,
        price: is_free ? 0 : price, // Ensure price is 0 if the event is free.
        created_by,
      })
      .select() // Return the newly created record.
      .single();

    if (error) throw error;

    // Respond with the newly created event data and a 201 Created status.
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// --- Update an existing event (Protected, Admin-only) ---
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // The fields to update.

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: 'Event not found or you do not have permission to update it.' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// --- Delete an event (Protected, Admin-only) ---
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // A successful deletion doesn't return data, so we send a 204 No Content response.
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add RSVP functionality to event controller
const rsvpToEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is paid (should use payment flow instead)
    if (!event.is_free) {
      return res.status(400).json({ 
        message: 'This is a paid event. Please use the payment flow.' 
      });
    }

    // Check if user already RSVP'd
    const { data: existingRSVP } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingRSVP) {
      return res.status(400).json({ message: 'You have already RSVP\'d to this event' });
    }

    // Create RSVP
    const { data: rsvp, error: rsvpError } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        rsvp_status: 'confirmed'
      })
      .select()
      .single();

    if (rsvpError) {
      console.error('RSVP Error:', rsvpError);
      return res.status(500).json({ message: 'Failed to create RSVP' });
    }

    res.status(201).json({
      message: 'Successfully RSVP\'d to event',
      rsvp
    });

  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent
};