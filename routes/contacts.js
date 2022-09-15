const {Router} = require('express');
const {getContacts, addContact, migrationTest , migrateContacts} = require('../controllers/contacts.controller');

const router = Router();

router.get('/', getContacts);

router.post('/add', addContact);

router.get('/test', migrationTest);

router.post('/migrate', migrateContacts);

module.exports = router;