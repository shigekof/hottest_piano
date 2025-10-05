import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    getAccessTokenSilently,
    user,
  } = useAuth0();

  const callBackend = async () => {
    try {
      // Get the Auth0 token for accessing the management API
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://dev-uuzc8f4uhchmjfcb.us.auth0.com/api/v2/',
          scope: 'read:current_user',
        },
      });

      // Call backend
      const res = await fetch(
        `${process.env.REACT_APP_API_SERVER_URL}/check-subscriber`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log('Backend response:', data);

      if (data.isSubscribed) {
        alert('✅ You are subscribed to HottestPianoSongs channel!');
      } else {
        alert(
          '❌ You are not subscribed to HottestPianoSongs channel. Please subscribe to support us!'
        );
      }
    } catch (err) {
      console.error(err);
      alert('Failed to call backend');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      {!isAuthenticated && (
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
      )}

      {isAuthenticated && (
        <>
          <h2>Welcome, {user.name}</h2>
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log out
          </button>
          <button onClick={callBackend} style={{ marginLeft: 10 }}>
            Check YouTube Subscription
          </button>
        </>
      )}
    </div>
  );
}

export default App;
