const {createList, getAllLists, validateCurrentList, addContactToList} = require('./controllers/lists.controller');

const test = async() => {
    const response = await getAllLists();
    console.log(response);
    console.log(response.length);
    return response;
};

test();

