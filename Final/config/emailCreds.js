var emailCreds =
    {
        email:
            {
                user: process.env['emailUser'],
                password: process.env['emailPass'],
            }
    };

module.exports = emailCreds;
