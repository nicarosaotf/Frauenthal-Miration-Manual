const hubspotClient = require('../model/hubspot');
const {getSpecificTicket, getTicketsToMigrate} = require('./tickets.controller');

const getContacts = async(req,res) => {
    const limit = 10;
    const after = undefined;
    const properties = undefined;
    const propertiesWithHistory = undefined;
    const associations = undefined;
    const archived = false;

    try {
        const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(limit, after, properties, propertiesWithHistory, associations, archived);

        console.log(JSON.stringify(apiResponse).results);
        res.end();
    } catch (e){
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(error.response, null, 2))
            : console.error(e);
    }
};

const migrateContacts = async(req, res) => {

    const tickets =  await getTicketsToMigrate(req, res);

    console.log("Starting Migration");

    for(let ticket of tickets){

        const filter = { filterGroups: [{"filters":[{"value":ticket.email,"propertyName":"email","operator":"EQ"}]}]};

        const properties = {
            "firstname": ticket.firstName,
            "lastname": ticket.lastName,
            "email": ticket.email,
            "event_name": ticket.performanceName,
            "event_venue": ticket.venueName,
            "event_date": ticket.statusChangeDateISO8601
        }

        const propertiesIfUpdate = {
            "event_name": ticket.performanceName,
            "event_venue": ticket.venueName,
            "event_date": ticket.statusChangeDateISO8601
        }

        try {

            const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(filter);

            if(apiResponse.results[0] !== undefined){
                    const propertiesToUpdate = {properties: propertiesIfUpdate};
                    const contactId = apiResponse.results[0].id;
    
                    try {
                        const apiResponse = await hubspotClient.crm.contacts.basicApi.update(contactId, propertiesToUpdate);
                        console.log("Contact Updated");
                      } catch (e) {
                        e.message === 'HTTP request failed'
                          ? console.error(JSON.stringify(e.response, null, 2))
                          : console.error(e)
                    }
            }else{
                try {
                    const propertiesToCreate = {properties};
                    const apiResponse = await hubspotClient.crm.contacts.basicApi.create(propertiesToCreate);
                    console.log("Contact Created");
                  } catch (e) {
                    e.message === 'HTTP request failed'
                      ? console.error(JSON.stringify(e.response, null, 2))
                      : console.error(e)
                }
            }
    
            res.end();
          } catch (e) {
            e.message === 'HTTP request failed'
              ? console.error(e.response)
              : console.error(e)
          }
    }
    console.log("Migration Complete");
    res.end();
};

const migrationTest = async (req, res) => {
    const PublicObjectSearchRequest = { filterGroups: [{"filters":[{"value":"zzizzah123@gmail.com","propertyName":"email","operator":"EQ"}]}]};
    
    try {

        const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(PublicObjectSearchRequest);
        console.log(apiResponse.results[0].id);
        if(apiResponse.results[0].properties.email === 'zzizzah123@gmail.com'){
            console.log('It exists !!!');
        }

        res.end();
      } catch (e) {
        e.message === 'HTTP request failed'
          ? console.error(e.response)
          : console.error(e)
      }
}

const addContact = async(req, res) => {
    const ticketInfo =  await getSpecificTicket(req, res);

    const properties = {
        "email": ticketInfo.email,
        "firstname": ticketInfo.firstName,
        "lastname": ticketInfo.lastName.toLowerCase()
    };

    const contact = {properties};

    try {
        const apiResponse = await hubspotClient.crm.contacts.basicApi.create(contact);
        console.log(JSON.stringify(apiResponse));
        
    } catch (error) {
        error.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2))
            : console.error(error)
    }
};

module.exports = {getContacts, addContact, migrationTest, migrateContacts};