
var APIKeys =
    {
        yelp:
            {
                key: process.env['yelpKey'],
                clientId: process.env['yelpClientId']
            },
        positionStack:
            {
                key: process.env['positionStackKey']
            },
        bing:
            {
                key: process.env['bingKey']
            }
    };

module.exports = APIKeys;

