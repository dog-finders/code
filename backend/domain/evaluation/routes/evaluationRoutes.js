const express = require('express');
const router = express.Router();
const evaluationController = require('../controller/evaluationController');
const isAuth = require('../../auth/middleware/inAuth');

router.post('/', isAuth, evaluationController.submitEvaluations);

module.exports = router;