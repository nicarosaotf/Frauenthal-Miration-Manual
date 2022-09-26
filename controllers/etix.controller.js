require('dotenv').config();
const axios = require('axios');

const AUTHENTICATION_URL = process.env.AUTHENTICATION_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const ETIX_API_KEY = process.env.ETIX_API_KEY;

let authToken = 'eV2Z0ec0aXdY0ZdVfZUWYcWXbYX1dYZ0U3VXe12Zd3e0fVYdcY2aZYV0eZab3Y31';

const authorize = async(req,res) => {

    try {

        const bodyData = {
            'grant_type': "refresh_token",
            'refresh_token': REFRESH_TOKEN,
        }

        const formBody = Object.keys(bodyData).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(bodyData[key])).join('&');

        const headers = {
            'Authorization': `Basic ${ETIX_API_KEY}`,
            'Accept': "application/json",
            'Content-Type': "application/x-www-form-urlencoded",
            'Cache-Control': 'no-cache'
        }

        const data = formBody;

        const x = await axios.post(`${AUTHENTICATION_URL}/v1/token/authorize`, data, {headers: headers});
        authToken = x.data.access_token;
        console.log(x.data.access_token);
        res.end();
    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    }
};

module.exports = {
    authToken,
    authorize
}