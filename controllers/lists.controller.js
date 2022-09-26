require('dotenv').config();
const hubspotClient = require('../model/hubspot');

const getAllLists = async() => {
  const response = await hubspotClient.apiRequest({
    method: 'GET',
    path: '/contacts/v1/lists?count=250'
  })

  const json = await response.json();
  return json.lists;
};

const createList = async(name) => {
  const response = await hubspotClient.apiRequest({
    method: 'POST',
    path: '/contacts/v1/lists',
    body: {
      name: name
    }
  })

  const json = await response.json();
  return json;
};

const validateCurrentList = async(name) => {
  const lists = await getAllLists();

  for(let list of lists){
    if(list.name === name){
      return list.listId;
    }
  }

  return false;
};

const addContactToList = async(email, listId) => {
  const response = await hubspotClient.apiRequest({
    method: 'POST',
    path: `/contacts/v1/lists/${listId}/add`,
    body: {
      emails: [email]
    }
  })

  const json = await response.json();
  return json;
};

module.exports = {getAllLists, createList, validateCurrentList, addContactToList}