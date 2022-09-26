const {Router} = require('express');
const {getAllLists,createList} = require('../controllers/lists.controller');

const router = Router();

router.get('/', getAllLists);

router.post('/create', createList);

module.exports = router;