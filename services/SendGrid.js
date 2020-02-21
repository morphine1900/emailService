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
        return axios(options)
            .then(resp => 'success');
    };
}

module.exports = SendGrid;