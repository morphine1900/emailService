const request = require('request');
const config = require('config');

class SendGrid {
    constructor() {
        this.name = "SendGrid";
        this.key = config.get('SendGrid').get('key');
        this.uri = config.get('SendGrid').get('uri');
    }
    send(emailDTO) {
        const options = {
            uri: this.uri,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.key,
                'Content-Type': 'application/json'
            },
            json: {
                "personalizations": [
                    {
                        "to": [
                            {
                                "email": emailDTO.to
                            }
                        ],
                        "subject": emailDTO.subject
                    }
                ],
                "from": {
                    "email": emailDTO.from
                },
                "content": [
                    {
                        "type": "text/plain",
                        "value": "from sendGrid"//emailDTO.content
                    }
                ]
            }
        };
        return new Promise((resolve, reject) => {
            request(options, (err, resp) => {
                if (err) {
                    return reject(err);
                }
                if (resp.statusCode !== 200 && resp.statusCode !== 202) {
                    return reject(resp.statusCode);
                }
                return resolve(resp.statusCode);
            })
        });
    }
}

module.exports = SendGrid;