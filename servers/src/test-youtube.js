import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.GOOGLE_ACCESS_TOKEN;
const channelId = process.env.YOUTUBE_CHANNEL_ID;

async function checkSubscription() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=subscriberSnippet&forChannelId=${channelId}&mine=true`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.items && data.items.length > 0) {
      console.log('✅ You ARE subscribed to the channel.');
    } else {
      console.log('❌ You are NOT subscribed to the channel.');
    }
  } catch (err) {
    console.error('Error checking subscription:', err);
  }
}

checkSubscription();
