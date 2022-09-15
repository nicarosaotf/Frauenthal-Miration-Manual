require('dotenv').config();
const axios = require('axios');
const {authToken} = require('./etix.controller');

const API_URL = process.env.API_URL;

const getEvents = async(req,res) => {

    try {

        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': "application/json",
            'Content-Type': "application/x-www-form-urlencoded",
            'Cache-Control': 'no-cache'
        }

        const pageNumberRequest = await axios.get(`${API_URL}/events/upcoming`, {headers: headers});
        let pageNumber = pageNumberRequest.data.totalPages;

        let finalData = [];

        for(let i = 0; i < pageNumber; i++){
            let currPageRequest = await axios.get(`${API_URL}/events/upcoming?pageNumber=${i+1}`, {headers: headers});
            let pageData = currPageRequest.data.data;

            for(let j = 0; j < pageData.length; j++){
                finalData.push(pageData[j]);
            }
        }
        
        res.end();

        return finalData;

    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    }
};

const getEventDetails = async(req,res) => {

    try {

        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': "application/json",
            'Content-Type': "application/x-www-form-urlencoded",
            'Cache-Control': 'no-cache'
        }

        const eventDetailsRequest = await axios.get(`${API_URL}/events/upcoming`, {headers: headers});
        const details = eventDetailsRequest.data;
        
        console.log(details);
        res.end();

    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    }
};

module.exports = {
    getEvents,
    getEventDetails
};