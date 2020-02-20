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
        if (curPvdIdx >= this.providers.length) {
            return false;
        }
        const provider = this.providers[curPvdIdx];
        console.log('try to send email via ' + provider.name);
        try {
            const result = await provider.send(emailDTO);
            console.log(result);
            return true;
        } catch (e) {
            return this.send(emailDTO, ++curPvdIdx);
        }
    }
}

module.exports = EmailService;