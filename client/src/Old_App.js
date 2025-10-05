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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {!isAuthenticated && (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">🎹 Hottest Piano Songs</h1>
            <p className="mt-4 text-gray-600">Join our community and get access to exclusive piano sheet music</p>
          </div>
          <div className="mt-8">
            <button
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: {
                    scope:
                      'openid profile email https://www.googleapis.com/auth/youtube.readonly',
                  },
                })
              }
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.679-4.147-2.701-6.735-2.701-5.522 0-10 4.478-10 10s4.478 10 10 10c8.836 0 10.998-8.223 10.998-12.291 0-0.815-0.107-1.624-0.255-2.376h-10.743z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
            <button
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {subscriptionData && !loading && (
              <div className="space-y-6">
                {subscriptionData.isSubscribed ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                      🎵 Your Piano Sheet Music
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {subscriptionData.pianoSheetLinks.map((sheet, index) => (
                        <a
                          key={`sheet-${index}`}
                          href={sheet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                        >
                          <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                          </svg>
                          <span className="text-gray-700 font-medium">{sheet.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center bg-gray-50 rounded-lg p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      🎵 Access Premium Sheet Music
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                      Subscribe to our YouTube channel to unlock your exclusive piano sheet music collection!
                    </p>
                    <div className="space-y-4">
                      <a
                        href={subscriptionData.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-youtube hover:bg-youtube-hover text-white font-medium rounded-lg transition-all duration-200 hover:-translate-y-1"
                      >
                        <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Subscribe to our YouTube Channel
                      </a>
                      <button
                        onClick={checkSubscription}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        I've Subscribed - Check Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
      )}

      {isAuthenticated && (
        <div className="content-container">
          <div className="header">
            <h2>Welcome back, {user.name.split(' ')[0]}! 👋</h2>
            <button
              className="button logout"
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                })
              }
            >
              Sign Out
            </button>
          </div>

          {loading && <div className="loading-spinner" />}

          {error && <div className="error">{error}</div>}

          {subscriptionData && !loading && (
            <div className="subscription-content">
              {subscriptionData.isSubscribed ? (
                <div className="sheet-music">
                  <h3>
                    <span style={{ marginRight: '8px' }}>🎵</span>
                    Your Piano Sheet Music Collection
                  </h3>
                  <div className="sheet-links">
                    {subscriptionData.pianoSheetLinks.map((sheet, index) => (
                      <a
                        key={`sheet-${index}`}
                        href={sheet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sheet-link"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          style={{ marginRight: '8px', fill: 'currentColor' }}
                        >
                          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                        </svg>
                        {sheet.title}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="subscribe-prompt">
                  <h3>
                    <span style={{ marginRight: '8px' }}>🎵</span>
                    Access Premium Sheet Music
                  </h3>
                  <p>
                    Subscribe to our YouTube channel to unlock your exclusive
                    piano sheet music collection!
                  </p>
                  <a
                    href={subscriptionData.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      style={{ marginRight: '8px', fill: 'currentColor' }}
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
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
