import { ObservationClient } from 'observation-js';

export async function getClient() {
  const client = new ObservationClient({
    platform: 'nl',
    test: false,
  });

  await client.getAccessTokenWithPassword({
    clientId: process.env.OAUTH_CLIENT_ID!,
    clientSecret: process.env.OAUTH_CLIENT_SECRET!,
    email: process.env.OAUTH_USERNAME!,
    password: process.env.OAUTH_PASSWORD!,
  });

  return client;
}

// Export a lazy client getter for other API routes
export const client = {
  async challenges() {
    const c = await getClient();
    return c.challenges;
  },
  async species() {
    const c = await getClient();
    return c.species;
  },
  async countries() {
    const c = await getClient();
    return c.countries;
  },
  async regions() {
    const c = await getClient();
    return c.regions;
  },
  async groups() {
    const c = await getClient();
    return c.groups;
  },
  async regionSpeciesLists() {
    const c = await getClient();
    return c.regionSpeciesLists;
  },
};
