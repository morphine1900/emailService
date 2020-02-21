const SendGrid = require('../services/SendGrid');
const SES = require('../services/SES');
const emailDTO = require('./testingEmail');

describe("sendgrid", () => {
    const provider = new SendGrid();
    it("Should be able to send email via sendgrid", async () => {
        const res = await provider.send(emailDTO);
        expect(res).toEqual('success');
    });
    it("Should fail when source address invalid", () => {
        const invalidSrcDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidSrcDTO.from = "invalid";
        return expect(provider.send(invalidSrcDTO)).rejects.toBeTruthy();
    });
    it("Should fail when target address invalid", async () => {
        const invalidDstDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidDstDTO.to = "invalid";
        await expect(provider.send(invalidDstDTO)).rejects.toBeTruthy();
    })
});
describe("ses", () => {
    const provider = new SES();
    it("Should be able to send email via ses", async () => {
        expect(await provider.send(emailDTO)).toEqual('success');
    });
    it("Should fail when source address invalid", async () => {
        const invalidSrcDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidSrcDTO.from = "invalid";
        await expect(provider.send(invalidSrcDTO)).rejects.toBeTruthy();
    });
    it("Should fail when target address invalid", async () => {
        const invalidDstDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidDstDTO.to = "invalid";
        await expect(provider.send(invalidDstDTO)).rejects.toBeTruthy();
    })
});