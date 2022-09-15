require('dotenv').config();
const hubspot = require('@hubspot/api-client');

const hubspotClient = new hubspot.Client({ accessToken: process.env.PRIVATE_KEY });

module.exports = hubspotClient;
