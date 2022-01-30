Moralis.Cloud.define("getPackages", async (request) => {
    Moralis.Cloud.httpRequest({
        method: 'POST',
        url: 'https://alfa.top/api/v1/lookup',
        headers: {
            'content-type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
            phone: request.params.pnum,
            cryptocurrency: 'btc'
        }
    }).then(function(httpResponse) {
        return httpResponse;
    }, function(httpResponse) {
        console.error('Request failed with response code ' + httpResponse.status);
    });
});