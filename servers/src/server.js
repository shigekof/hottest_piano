import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config(); // 🔹 Load .env file before anything else uses env vars

const app = express();

// 🔹 Allow requests from your React app
app.use(cors({ origin: 'http://localhost:3000' }));

async function getManagementApiToken() {
  const resp = await fetch(
    `https://dev-uuzc8f4uhchmjfcb.us.auth0.com/oauth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    }
  );

  const data = await resp.json();
  return data.access_token;
}

async function getGoogleToken(userId) {
  const mgmtToken = await getManagementApiToken();

  const resp = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
      },
    }
  );

  const user = await resp.json();

  // Google token is here
  const googleAccessToken = user.identities[0].access_token;
  console.log('Google Access Token:', googleAccessToken);

  return googleAccessToken;
}

// Example route
app.get('/check-subscriber', async (req, res) => {
  const userId = req.user.sub; // from Auth0 decoded JWT
  const accessToken = await getGoogleToken(userId);
  console.log('Access Token in /check-subscriber:', accessToken);

  const channelId = process.env.MY_CHANNEL_ID;

  if (!accessToken) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&forChannelId=${channelId}&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      res.json({ subscribed: true });
    } else {
      res.json({ subscribed: false });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: 'YouTube API request failed', details: err.message });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 4000}`);
});
