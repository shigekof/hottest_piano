import express from 'express';
import fetch from 'node-fetch';
import { checkJwt } from '../utils/auth0.js';

const router = express.Router();

// Step 1: Exchange M2M credentials for Management API token
async function getManagementApiToken() {
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  return data.access_token;
}

// Step 2: Get full user profile with IdP tokens
async function getUserProfile(userId, mgmtToken) {
  const res = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
      userId
    )}`,
    {
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
      },
    }
  );
  return res.json();
}

// Step 3: Call YouTube API
async function checkYoutubeSubscription(googleAccessToken, channelId) {
  try {
    console.log(
      'Making YouTube API request with token:',
      googleAccessToken.substring(0, 20) + '...'
    );

    const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&forChannelId=${channelId}&mine=true`;
    console.log('YouTube API URL:', url);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    console.log('YouTube API Response:', JSON.stringify(data, null, 2));

    if (!res.ok) {
      console.error('YouTube API Error:', data);
      throw new Error(
        data.error?.message || 'Failed to check subscription status'
      );
    }

    return data;
  } catch (error) {
    console.error('Error in checkYoutubeSubscription:', error);
    throw error;
  }
}

// Route
router.get('/check-subscriber', checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.payload?.sub;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // Get Management API token
    const mgmtToken = await getManagementApiToken();

    // Get user profile from Auth0 Management API
    const profile = await getUserProfile(userId, mgmtToken);

    // Get the user's Google identity
    const identity = profile?.identities?.find(
      (i) => i.provider === 'google-oauth2'
    );
    if (!identity || !identity.access_token) {
      return res.status(400).json({
        error:
          'Google access token not found. Please logout and login again with Google.',
        profile: profile,
      });
    }

    console.log('Found Google identity:', {
      provider: identity.provider,
      connection: identity.connection,
      hasAccessToken: !!identity.access_token,
    });

    // Replace with your channel ID
    const channelId = process.env.MY_CHANNEL_ID;
    if (!channelId) {
      return res
        .status(500)
        .json({ error: 'YouTube channel ID not configured' });
    }

    const ytResponse = await checkYoutubeSubscription(
      identity.access_token,
      channelId
    );
    const isSubscribed = ytResponse.items && ytResponse.items.length > 0;

    // Get subscription details if subscribed
    const subscriptionDetails = isSubscribed
      ? {
          subscribedAt: ytResponse.items[0].snippet.publishedAt,
          channelTitle: ytResponse.items[0].snippet.title,
          channelDescription: ytResponse.items[0].snippet.description,
        }
      : null;

    res.json({
      isSubscribed,
      subscriptionDetails,
      channelId,
    });
  } catch (err) {
    console.error('Error in route handler:', err);
    res.status(500).json({
      error: 'Failed to check subscriber status',
      message: err.message,
    });
  }
});

export default router;
