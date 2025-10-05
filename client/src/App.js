import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import GoogleSignInButton from './components/GoogleSignInButton';

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

  const pianoSheetLinks = [
    {
      title: 'PLEAD LMS Piano Sheet Music',
      url: '/assets/sheets/plead.pdf',
      downloadName: 'plead-piano-sheet.pdf',
    },
    // Add more sheet music links as needed
  ];

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
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              🎹 Hottest Piano Sheets
            </h1>
            <p className="text-lg text-gray-600">
              Join our community and get access to exclusive piano sheet music
            </p>
          </div>
          <div className="mt-8">
            <GoogleSignInButton
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: {
                    scope:
                      'openid profile email https://www.googleapis.com/auth/youtube.readonly',
                  },
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              🎹 Hottest Piano Sheets
            </h2>
            <button
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: `${window.location.origin}${window.location.pathname}`,
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pianoSheetLinks.map((sheet, index) => (
                        <div
                          key={sheet.url}
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 space-y-4"
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-8 h-8 text-indigo-600 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                              />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900">
                              {sheet.title}
                            </h3>
                          </div>
                          <div className="flex gap-3">
                            <a
                              href={sheet.url}
                              download={sheet.downloadName}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-transparent rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              Download
                            </a>
                            <a
                              href={sheet.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View PDF
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center bg-gray-50 rounded-lg p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      🎵 Access Hottest Piano Sheets
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                      Subscribe to our YouTube channel to unlock your exclusive
                      piano sheet music collection!
                    </p>
                    <div className="space-y-4">
                      <a
                        href={subscriptionData.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-youtube hover:bg-youtube-hover text-white font-medium rounded-lg transition-all duration-200 hover:-translate-y-1"
                      >
                        <svg
                          className="w-6 h-6 mr-2"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
  );
}

export default App;
