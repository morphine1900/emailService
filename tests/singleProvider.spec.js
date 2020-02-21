const SendGrid = require('../services/SendGrid');
const SES = require('../services/SES');
const emailDTO = require('./test');

describe("sendgrid", () => {
    const provider = new SendGrid();
    it("Should be able to send email via sendgrid", async () => {
        await expect(provider.send(emailDTO)).resolves.toEqual('success');
    });
    it("Should fail when source address invalid", async () => {
        invalidSrcDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidSrcDTO.from = "invalid";
        await expect(provider.send(invalidSrcDTO)).rejects.toEqual('error');
    });
    it("Should fail when target address invalid", async () => {
        invalidDstDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidDstDTO.to = "invalid";
        await expect(provider.send(invalidDstDTO)).rejects.toEqual('error');
    })
});
describe("ses", () => {
    const provider = new SES();
    it("Should be able to send email via ses", async () => {
        await expect(provider.send(emailDTO)).toEqual('success');
    });
    it("Should fail when source address invalid", async () => {
        invalidSrcDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidSrcDTO.from = "invalid";
        await expect(provider.send(invalidSrcDTO)).rejects.toEqual('error');
    });
    it("Should fail when target address invalid", async () => {
        invalidDstDTO = JSON.parse(JSON.stringify(emailDTO));
        invalidDstDTO.to = "invalid";
        await expect(provider.send(invalidDstDTO)).rejects.toEqual('error');
    })
});