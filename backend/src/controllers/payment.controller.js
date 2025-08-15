import { initiateSTKPush, handleDarajaCallback } from '../services/daraja.service.js';
import { supabase } from '../lib/supabase.js';

export const initiatePayment = async (req, res) => {
  const { amount, phoneNumber, eventId } = req.body;
  const userId = req.user.id; // From protect middleware

  if (!amount || !phoneNumber || !eventId) {
    return res.status(400).json({ message: 'Amount, phone number, and eventId are required.' });
  }

  try {
    const response = await initiateSTKPush(amount, phoneNumber, eventId, userId);
    
    // Log the transaction attempt in our database
    await supabase.from('payments').insert({
      user_id: userId,
      event_id: eventId,
      amount,
      phone_number: phoneNumber,
      checkout_request_id: response.CheckoutRequestID,
      merchant_request_id: response.MerchantRequestID,
      status: 'Pending',
    });

    res.status(200).json({ message: 'STK push initiated. Please check your phone.' });
  } catch (error) {
    console.error('STK Push Error:', error);
    res.status(500).json({ message: 'Failed to initiate payment.', error: error.message });
  }
};

export const paymentCallback = async (req, res) => {
  const darajaResponse = req.body;
  console.log('--- Daraja Callback Received ---', JSON.stringify(darajaResponse, null, 2));

  try {
    await handleDarajaCallback(darajaResponse);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback handling error:', error);
    // Even if we fail, we must respond to Safaricom with success
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};