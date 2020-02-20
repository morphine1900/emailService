const emailDTO = require('./test');
const EmailService = require('../services/emailService');
const service = new EmailService();

describe("email service", () => {
    it("Should be able to send email with specific value", async () => {
        expect(await service.send(emailDTO)).toBeTrue();
    })
});