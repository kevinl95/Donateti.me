Moralis.Cloud.define("getAmount", async (request) => {
    const query = new Moralis.Query("User");
    query.equalTo("uniqueID", request.params.code);
    var results = await query.find({useMasterKey:true});
    if (results.length > 0) {
        return results[0].get("amount")
    } else {
        return 0;
    }
    },{
        fields : ['code']
});
Moralis.Cloud.define("getAddress", async (request) => {
    const query = new Moralis.Query("User");
    query.equalTo("uniqueID", request.params.code);
    var results = await query.find({useMasterKey:true});
    var user = results[0];
    let res;
    res = Moralis.Cloud.httpRequest({
        method: 'POST',
        url: 'https://cors.bridged.cc/https://alfa.top/api/v1/order/create',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: {
          phone: user.get("phone"),
          operator: user.get("operator"),
          amount: user.get("amount"),
          email: user.get("email"),
          create_order_confirm: "1",
          cryptocurrency: "bitcoin",
          refcode: "4875ddfa"
        }
      }).then(function(httpResponse) {
        var chunk1 = httpResponse.text.split('pay_url":"')[1];
        var url = chunk1.split('","deposit')[0]
        return(url)
      });
      return res;
    },{
        fields : ['code']
});