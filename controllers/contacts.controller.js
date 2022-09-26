const hubspotClient = require('../model/hubspot');
const {getSpecificTicket, getTicketsToMigrate} = require('./tickets.controller');
const {createList, validateCurrentList, addContactToList} = require('./lists.controller');

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

    let counter = 0;

    console.log("Starting Migration...");

    for(let ticket of tickets){

        counter += 1;

        const filter = { filterGroups: [{"filters":[{"value":ticket.email,"propertyName":"email","operator":"EQ"}]}]};

        const properties = {
            "firstname": ticket.firstName,
            "lastname": ticket.lastName,
            "email": ticket.email,
            "event_name": ticket.performanceName,
            "event_venue": ticket.venueName,
            "event_date": ticket.dateTime
        }

        const propertiesIfUpdate = {
            "event_name": ticket.performanceName,
            "event_venue": ticket.venueName,
            "event_date": ticket.dateTime
        }
        console.log('--------------------------------');
        console.log('Contact # ' + counter);
        console.log("Email: " + properties.email);

        try {

            const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(filter);

            if(apiResponse.results[0]){
                    const propertiesToUpdate = {properties: propertiesIfUpdate};
                    const contactId = apiResponse.results[0].id;              
    
                    try {
                        const apiResponse = await hubspotClient.crm.contacts.basicApi.update(contactId, propertiesToUpdate);
                        console.log("Contact Updated");

                        try {
                            const isValidId = await validateCurrentList(properties.event_name);
                            console.log('List id exists: ' + isValidId);
                            if(isValidId !== false){
                                const contactAddition = await addContactToList(properties.email, isValidId);
                                console.log("Contact added to list: " + properties.event_name);
                            }else if(isValidId === false){
                                const listCreation = await createList(properties.event_name);
                                console.log("List created from event: " + properties.event_name);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                const contactAddition = await addContactToList(properties.email, listCreation.listId);
                                console.log("Contact added to list: " + properties.event_name);
                            }
                        } catch (e) {
                            e.message === 'HTTP request failed'
                          ? console.error(JSON.stringify(e.response, null, 2))
                          : console.error(e)
                        }

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

                    try {
                        const isValidId = await validateCurrentList(properties.event_name);
                        console.log(isValidId);
                        if(isValidId !== false){
                            const contactAddition = await addContactToList(properties.email, isValidId);
                            console.log("Contact added to list: " + properties.event_name);
                        }else if(isValidId === false){
                            const listCreation = await createList(properties.event_name);
                            console.log("List created from event: " + properties.event_name);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            const contactAddition = await addContactToList(properties.email, listCreation.listId);
                            console.log("Contact added to list: " + properties.event_name);
                        }
                    } catch (e) {
                        e.message === 'HTTP request failed'
                      ? console.error(JSON.stringify(e.response, null, 2))
                      : console.error(e)
                    }

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
    const PublicObjectSearchRequest = { filterGroups: [{"filters":[{"value":"zzizzah1234@gmail.com","propertyName":"email","operator":"EQ"}]}]};
    
    try {

        const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(PublicObjectSearchRequest);
        console.log(apiResponse.results[0]);

        if(apiResponse.results[0].properties.email === 'zzizzah123@gmail.com'){
            console.log(apiResponse.results[0]);
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