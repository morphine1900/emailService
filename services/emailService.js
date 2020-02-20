const SendGrid = require('./SendGrid');
const SES = require('./SES');

class EmailService {
    constructor() {
        this.providers = [
            new SendGrid(),
            new SES()
        ];
    }

    async send(emailDTO, curPvdIdx = 0) {
        const provider = this.providers[curPvdIdx];
        console.log('try to send email via ' + provider.name);
        try {
            console.log(await provider.send(emailDTO));
            return "OK";
        } catch (e) {
            return this.send(emailDTO, ++curPvdIdx % this.providers.length);
        }
    }
}

module.exports = EmailService;