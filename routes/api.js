const router = require('express').Router();
const EmailService = require('../services/emailService');
const service = new EmailService();

router.get('/', function (req, res) {
    res.send('email service APIs');
});
router.post('/send_email', async (req, res) => {
    const emailDTO = req.body;
    const result = await service.send(emailDTO);
    res.end(result);
});

module.exports = router;
