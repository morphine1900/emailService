## Email Service

### Target:
Create a service that accepts the necessary information and sends emails.
It should provide an abstraction between two different email service providers.
If one of the services goes down, your service can quickly failover to a different
provider without affecting your customers

### Design and implementation:
The email service is powered by the following email providers:
 * SendGrid
 * AWS SES
And a very simple react front end

### Run locally:
 * Install: npm install
 * Build & run: npm start
 * Test: npm run test
 * Front end: npm run startFE

### Known Issues:
 * AWS SES need both source and target email address validated
 * My sendgrid and ses keys not included in the project, for safety reason
 * The second test case in emailService.spec.js can be run separately

### Future improvements:
 * Migrate to Typescript for a stricter abstraction
 * AWS IAM roles are better practice for authorization
 * Error handling
  
### Existing code show:
A simple GraphQL tag parser:
 * ext/graphTagParser.ts
 
For more information of the basic syntax for graphql please ref to https://graphql.org/learn/schema
