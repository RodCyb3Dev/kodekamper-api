const NodeGeocoder = require('node-geocoder');

// In test environment, use a mock geocoder to avoid API calls
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    geocode: async (address) => [
      {
        latitude: 42.3601,
        longitude: -71.0589,
        formattedAddress: 'Boston, MA 02111, USA',
        city: 'Boston',
        state: 'MA',
        zipcode: '02111',
        country: 'US',
        countryCode: 'US',
      },
    ],
  };
} else {
  const options = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null,
  };

  module.exports = NodeGeocoder(options);
}
