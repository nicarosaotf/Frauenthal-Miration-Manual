const {Router} = require('express');
const {getEvents, getEventDetails} = require('../controllers/events.controller');

const router = Router();

router.get('/', getEvents);

router.get('/details', getEventDetails);

module.exports = router;