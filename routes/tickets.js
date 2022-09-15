const {Router} = require('express');
const {getTicketsFromEvent, getSpecificTicket, getAllTicketCount, getTicketList, getTicketsToMigrate} = require('../controllers/tickets.controller');

const router = Router();

router.get('/', getTicketsFromEvent);

router.get('/specific', getSpecificTicket);

router.get('/all', getAllTicketCount);

router.get('/list', getTicketList);

router.get('/migration', getTicketsToMigrate);

module.exports = router;