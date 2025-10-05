import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

function DebugToken() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getToken = async () => {
      if (!isAuthenticated) return;

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://www.googleapis.com/',
            scope:
              'openid profile email https://www.googleapis.com/auth/youtube.readonly',
          },
        });

        console.log('Google Access Token:', token);
      } catch (err) {
        console.error('Error getting token:', err);
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  return null;
}

export default DebugToken;
