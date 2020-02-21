const emailDTO = require('./testingEmail');

describe("email service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should be able to failover to next provider", async() => {
        jest.mock('../services/SendGrid', () => {
            return jest.fn().mockImplementation(() => {
                return {
                    send: () => {throw new Error()}
                };
            });
        });
        const EmailService = require('../services/emailService');
        const service = new EmailService();

        const spy = jest.spyOn(service, 'send');
        const result = await service.send(emailDTO);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(result).toBe(true);
    });

    it.skip("Should fail if all providers failed", async () => {
        jest.mock('../services/SendGrid', () => {
            return jest.fn().mockImplementation(() => {
                return {
                    send: () => {throw new Error()}
                };
            });
        });
        jest.mock('../services/SES',  () => {
            return jest.fn().mockImplementation(() => {
                return {
                    send: () => {throw new Error()}
                };
            });
        });
        const EmailService = require('../services/emailService');
        const service = new EmailService();

        const spy = jest.spyOn(service, 'send');
        const result = await service.send(emailDTO);
        //  2 fails and the last call for quit
        expect(spy).toHaveBeenCalledTimes(3);
        expect(result).toBe(false);
    });

    it("Should be able to send email with specific value", async () => {
        const EmailService = require('../services/emailService');
        const service = new EmailService();
        await expect(service.send(emailDTO)).toBeTruthy();
    });
});