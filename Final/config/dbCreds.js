var dbCreds =
    {
        development:
            {
                host: "",
                user: "",
                password: "",
                database: ""
            },
        production:
            {
                host: process.env['dbHost'],
                user: process.env['dbUser'],
                password: process.env['dbPass'],
                database: process.env['dbName']
            }
    };

module.exports = dbCreds;