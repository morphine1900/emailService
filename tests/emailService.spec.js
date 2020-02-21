const SendGrid = require('../services/SendGrid');
const SES = require('../services/SES');
const EmailService = require('../services/emailService');
const service = new EmailService();
const emailDTO = require('./test');

describe("email service", () => {
    it("Should be able to send email with specific value", async () => {
        await expect(service.send(emailDTO)).toBeTrue();
    });
    it("Should be able to failover to next provider", async() => {
        jest.mock('SendGrid');
        SendGrid.send.mockRejectedValue(new Error());
        const spy = jest.spyOn(service, 'send');
        const result = await service.send(emailDTO);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(result).toBeTrue();
    });
    it("Should fail if all providers failed", async () => {
        jest.mock('SendGrid');
        SendGrid.send.mockRejectedValue(new Error());
        jest.mock('SES');
        SES.Send.mockRejectedValue(new Error())
        const spy = jest.spyOn(service, 'send');
        const result = await service.send(emailDTO);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(result).toBeFalse();
    })
});