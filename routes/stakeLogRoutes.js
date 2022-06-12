const express = require('express');
const router = express.Router();
const stakeLogController = require('../controllers/stakeLogController');

router.post('/get', stakeLogController.getAllStakeLogs);
router.post('/get/:address', stakeLogController.getStakeLog);
router.post('/add', stakeLogController.addStakeLog);
router.post('/finishlog', stakeLogController.getFinishStakeLog)
router.post('/unstake', stakeLogController.unStake);



module.exports = router;