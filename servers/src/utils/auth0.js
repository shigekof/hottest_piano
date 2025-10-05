import { auth } from 'express-oauth2-jwt-bearer';

export const checkJwt = auth({
  audience: 'https://dev-uuzc8f4uhchmjfcb.us.auth0.com/api/v2/',
  issuerBaseURL: 'https://dev-uuzc8f4uhchmjfcb.us.auth0.com',
});
