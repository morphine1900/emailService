const axios = require('axios');
const config = require('config');

class SendGrid {
    constructor() {
        this.name = "SendGrid";
        this.key = config.get('SendGrid').get('key');
        this.uri = config.get('SendGrid').get('uri');
    }
    send(emailDTO) {
        const options = {
            url: this.uri,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.key,
                'Content-Type': 'application/json'
            },
            data: {
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
                        "value": emailDTO.content
                    }
                ]
            }
        };
        return new Promise((resolve, reject) => {
            axios(options, (err, resp) => {
                if (err) {
                    return reject(err);
                }
                if (resp.statusCode !== 200 && resp.statusCode !== 202) {
                    return reject(new Error(resp.statusCode));
                }
                return resolve('success');
            })
        });
    }
}

module.exports = SendGrid;