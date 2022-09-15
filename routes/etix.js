const {Router} = require('express');
const {authorize} = require('../controllers/etix.controller');

const router = Router();

router.post('/', authorize);

module.exports = router;