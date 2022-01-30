Moralis.Cloud.define("getAmount", async (request) => {
    const logger = Moralis.Cloud.getLogger();
    logger.info("Hello World");
    const query = new Moralis.Query("User");
    query.equalTo("uniqueID", request.params.code);
    var results = await query.find({useMasterKey:true});
    logger.info("Successfully retrieved " + results.length)
    logger.info(results);
    if (results.length > 0) {
        return results[0].get("amount")
    } else {
        return 0;
    }
    },{
        fields : ['code']
});