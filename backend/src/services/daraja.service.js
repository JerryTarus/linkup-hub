// Import axios for making HTTP requests to the Daraja API.
import axios from 'axios';
// Import the Supabase client to update our database after payment events.
import { supabase } from '../lib/supabase.js';

// Determine the correct Daraja API base URL based on the environment.
const DARAJA_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

// --- Function to get a new Daraja API access token ---
// This token is required for all subsequent API calls and expires every hour.
const getDarajaToken = async () => {
  // The consumer key and secret are combined and base64 encoded for the Authorization header.
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    // Make a GET request to the OAuth endpoint.
    const response = await axios.get(
      `${DARAJA_API_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    // Return the access token from the response.
    return response.data.access_token;
  } catch (error) {
    // Log detailed error information and re-throw to be caught by the caller.
    console.error('Error fetching Daraja token:', error.response ? error.response.data : error.message);
    throw new Error('Could not fetch Daraja API token.');
  }
};

// --- Function to initiate an M-PESA STK Push payment ---
export const initiateSTKPush = async (amount, phoneNumber, eventId, userId) => {
  // First, get a valid access token.
  const token = await getDarajaToken();
  
  // Format the timestamp as required by the Daraja API (YYYYMMDDHHMMSS).
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14);

  // The password for the STK Push request is a base64 encoded string of:
  // ShortCode + Passkey + Timestamp
  const shortCode = process.env.DARAJA_BUSINESS_SHORT_CODE;
  const passkey = process.env.DARAJA_PASSKEY;
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
  
  // The phone number must be in the format 254...
  const formattedPhoneNumber = phoneNumber.startsWith('0') 
    ? `254${phoneNumber.substring(1)}`
    : phoneNumber;

  // Construct the request payload for the STK Push API.
  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: process.env.DARAJA_TRANSACTION_TYPE, // 'CustomerPayBillOnline' or 'CustomerBuyGoodsOnline'
    Amount: amount,
    PartyA: formattedPhoneNumber, // The customer's phone number
    PartyB: shortCode, // Your Paybill or Till number
    PhoneNumber: formattedPhoneNumber,
    CallBackURL: process.env.DARAJA_CALLBACK_URL,
    AccountReference: `LHU-${eventId.substring(0, 8)}`, // A reference for the transaction (e.g., Event ID)
    TransactionDesc: 'Payment for Link Up Hub Event',
  };

  try {
    // Make the POST request to initiate the payment.
    const response = await axios.post(
      `${DARAJA_API_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Return the response from Daraja, which includes CheckoutRequestID and MerchantRequestID.
    return response.data;
  } catch (error) {
    console.error('Error initiating STK Push:', error.response ? error.response.data : error.message);
    throw new Error('Failed to initiate STK Push.');
  }
};

// --- Function to handle the callback from Daraja API ---
export const handleDarajaCallback = async (darajaResponse) => {
    // The callback body contains the result of the transaction.
    const body = darajaResponse.Body.stkCallback;
    const checkoutRequestID = body.CheckoutRequestID;
    const resultCode = body.ResultCode;

    // First, find the corresponding payment record in our database.
    const { data: payment, error: findError } = await supabase
        .from('payments')
        .select('id, event_id, user_id')
        .eq('checkout_request_id', checkoutRequestID)
        .single();

    if (findError || !payment) {
        console.error('Callback received for an unknown transaction:', checkoutRequestID);
        // We throw an error, but the controller will still return a success response to Safaricom.
        throw new Error('Payment record not found.');
    }

    if (resultCode === 0) {
        // --- Payment was successful ---
        // 1. Update the payment record status to 'Completed'.
        const { error: updateError } = await supabase
            .from('payments')
            .update({ status: 'Completed', daraja_response: body })
            .eq('id', payment.id);

        if (updateError) throw updateError;
        
        // 2. Generate a ticket (RSVP) for the user for the event.
        const qrCodeData = JSON.stringify({ rsvpId: payment.id, eventId: payment.event_id, userId: payment.user_id });
        const { error: rsvpError } = await supabase
            .from('rsvps')
            .insert({
                event_id: payment.event_id,
                user_id: payment.user_id,
                qr_code_data: qrCodeData, // Store data to generate QR on the fly or store the full QR data URL
            });
        
        if (rsvpError) throw rsvpError;
        
        console.log(`Successfully processed payment and created RSVP for CheckoutRequestID: ${checkoutRequestID}`);

    } else {
        // --- Payment failed or was cancelled by the user ---
        // Update the payment record status to 'Failed'.
        await supabase
            .from('payments')
            .update({ status: 'Failed', daraja_response: body })
            .eq('id', payment.id);

        console.log(`Failed payment processing for CheckoutRequestID: ${checkoutRequestID}. ResultCode: ${resultCode}, ResultDesc: ${body.ResultDesc}`);
    }
};