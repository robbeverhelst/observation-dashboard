import { ObservationClient } from 'observation-js';

// Create authenticated client instance
export const createAuthenticatedClient = () => {
  const client = new ObservationClient();

  // TODO: Configure OAuth authentication when the API is properly documented
  // For now, we'll use the client without explicit auth configuration
  // The API may use the credentials in the background

  return client;
};

// Export default client instance
export const client = createAuthenticatedClient();
