import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    getAccessTokenSilently,
    user,
  } = useAuth0();

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to check subscription status
  const checkSubscription = async () => {
    if (!isAuthenticated) return;

    setError(null);
    setLoading(true);

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://dev-uuzc8f4uhchmjfcb.us.auth0.com/api/v2/',
          scope: 'read:current_user',
        },
      });

      const res = await fetch(
        `${process.env.REACT_APP_API_SERVER_URL}/check-subscriber`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setSubscriptionData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to check subscription status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Check subscription status when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription();
    }
  }, [isAuthenticated]);

  return (
    <div style={{ padding: 40 }}>
      {!isAuthenticated && (
        <div className="login-container">
          <h1>Welcome to Hottest Piano Songs</h1>
          <p>Please log in with Google to access piano sheet music.</p>
          <button
            onClick={() =>
              loginWithRedirect({
                authorizationParams: {
                  scope:
                    'openid profile email https://www.googleapis.com/auth/youtube.readonly',
                },
              })
            }
          >
            Log in with Google
          </button>
        </div>
      )}

      {isAuthenticated && (
        <div className="content-container">
          <div className="header">
            <h2>Welcome, {user.name}</h2>
            <button
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                })
              }
            >
              Log out
            </button>
          </div>

          {loading && <p>Checking subscription status...</p>}

          {error && <p className="error">{error}</p>}

          {subscriptionData && !loading && (
            <div className="subscription-content">
              {subscriptionData.isSubscribed ? (
                <div className="sheet-music">
                  <h3>🎵 Your Piano Sheet Music</h3>
                  <div className="sheet-links">
                    {subscriptionData.pianoSheetLinks.map((sheet, index) => (
                      <a
                        key={index}
                        href={sheet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sheet-link"
                      >
                        {sheet.title}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="subscribe-prompt">
                  <h3>📺 Subscribe to Access Sheet Music</h3>
                  <p>
                    Please subscribe to our YouTube channel to access the piano
                    sheet music!
                  </p>
                  <a
                    href={subscriptionData.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-button"
                  >
                    Subscribe to our YouTube Channel
                  </a>
                  <button onClick={checkSubscription} className="check-button">
                    I've Subscribed - Check Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
