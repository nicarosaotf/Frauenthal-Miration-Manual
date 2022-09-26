require('dotenv').config();
const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const {authToken} = require('./etix.controller');
const {getEvents} = require('./events.controller');

const API_URL = process.env.API_URL;
const DATE_TO_CHECK = '2022-09-23T06:00:00.000Z';

const getTicketsFromEvent = async(event) => {
    try {
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': "application/json",
            'Content-Type': "application/x-www-form-urlencoded",
            'Cache-Control': 'no-cache'
        }
        const x = await axios.get(`${API_URL}/events/${event}/tickets/details`, {headers: headers});

        let mappedByDate = [];

        let tickets = x.data.tickets;

        for(let ticket of tickets){           
            if(ticket.statusChangeDateISO8601 > DATE_TO_CHECK){
                if(ticket.email !== null){
                    mappedByDate.push(ticket);
                }              
            }
        }
        
        let uniqueObjArray = [
            ...new Map(mappedByDate.map((ticket) => [ticket["email"], ticket])).values(),
        ];
        
        return uniqueObjArray;
    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    }
};

const getTicketCount = async(event) => {
    try {
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': "application/json",
            'Content-Type': "application/x-www-form-urlencoded",
            'Cache-Control': 'no-cache'
        }
        const x = await axios.get(`${API_URL}/events/${event}/tickets/details`, {headers: headers});
        

        let uniqueObjArray = [
            ...new Map(x.data.tickets.map((ticket) => [ticket["email"], ticket])).values(),
        ];

        let ticketCounter = 0;
        uniqueObjArray.forEach(ticket => ticketCounter += 1);
        
        return ticketCounter;
    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    }
};

const getSpecificTicket = async(req, res) => {
    try {
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': "application/json",
            'Content-Type': "application/x-www-form-urlencoded",
            'Cache-Control': 'no-cache'
        }
        const x = await axios.get(`${API_URL}/events/${req.query.event}/tickets/details`, {headers: headers});
        let specific = x.data.tickets.find(ticket => ticket.email === req.query.email.toUpperCase());

        console.log(specific);
        res.end();
        return specific;
        
    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    }
};

const getAllTicketCount = async (req, res, next) => {
    const events = await getEvents(req, res);

    let count = 0;
    
    console.log('Count start');
    for(const event of events){
        let eventCount = await getTicketCount(event);
        count = count + eventCount;
        console.log("The current count is: " + count);
    }

    console.log("The Total count is: " + count);
    res.end();
    return count;
};

const getTicketList = async(req,res) => {

    try {
        const events = await getEvents(req, res);
        const doc = new PDFDocument();

        let contactNumber = 1;
        let tempList = [];
        let contactList = [];

        console.log('Running...');

        for(const event of events){

            tempList = await getTicketsFromEvent(event.id);

            for(let temp of tempList){
                temp.performanceName = event.performanceName;
                temp.venueName = event.venueName;
                temp.dateTime = event.datetimeISO8601;
                temp.contactNumber = contactNumber;

                if(event.performanceName === "Beatles vs Stones: A Musical Showdown"){
                    contactList.push(temp);
                } 
            };
        };

        for(let contact of contactList){
            contact.contactNumber = contactNumber;
            contactNumber++;
        }
        
        doc.pipe(fs.createWriteStream('list.pdf'));

        doc.text('Frauenthal - Etix Contacts');
        doc.text('   ');

        contactList.forEach((contact) => {
            doc.text(`Contact # ${contact.contactNumber}`);
            doc.text(`Contact Name: ${contact.firstName}`);
            doc.text(`Contact Last Name: ${contact.lastName}`);
            doc.text(`Contact Email: ${contact.email}`);
            doc.text(`Performance to attend: ${contact.performanceName} `);
            doc.text(`Performance Venue: ${contact.venueName}`);
            doc.text(`Performance Date: ${contact.dateTime}`);
            doc.text('   ');
        });

        doc.end();
        console.log('Completed');
        res.end();
    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    };   
};

const getTicketsToMigrate = async(req, res) => {
    try {
        const events = await getEvents(req, res);

        let contactNumber = 0;
        let tempList = [];
        let contactList = [];

        console.log('Starting Check...');

        for(const event of events){

            tempList = await getTicketsFromEvent(event.id);

            for(let temp of tempList){
                temp.performanceName = event.performanceName;
                temp.venueName = event.venueName;
                temp.dateTime = event.datetimeISO8601;
                temp.email = temp.email.toLowerCase();
                temp.contactNumber = contactNumber;

                contactList.push(temp);
                contactNumber++;
            };
        };

        console.log(`There are ${contactNumber} contacts ready to migrate`);
        
        res.end();
        //console.log(contactList);
        return contactList;
    } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(JSON.stringify(e.response, null, 2))
          : console.error(e)
    }; 
}

module.exports = {
    getAllTicketCount,
    getTicketsFromEvent,
    getSpecificTicket,
    getTicketList,
    getTicketsToMigrate
};