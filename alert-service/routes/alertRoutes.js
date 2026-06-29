const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, alertController.createAlert);
router.get('/', alertController.getAlerts);
router.post('/:alertId/confirm', authenticateToken, alertController.confirmAlert);

module.exports = router;

//TESTY
// const express = require('express');
// const router = express.Router();
// const alertController = require('../controllers/alertController');
// const authenticateToken = require('../middleware/authMiddleware');

// const mockAuth = (req, res, next) => {
//   req.user = { id: 'testowy_user_123' };
//   next();
// };

// router.post('/', mockAuth, alertController.createAlert);
// router.get('/', alertController.getAlerts); 
// router.post('/:alertId/confirm', mockAuth, alertController.confirmAlert);

// module.exports = router;