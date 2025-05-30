const express = require('express');
const router = express.Router();
const recruitController = require('../controller/recruitController');

router.get('/', recruitController.getAllRecruits.bind(recruitController));
router.post('/', recruitController.createRecruit.bind(recruitController));
router.put('/:id', recruitController.updateRecruit.bind(recruitController));

module.exports = router;
//