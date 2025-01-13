/* 
Visão criada sobre o modelo Clinical.
*/

const pipeline = [
    {
        $group: { _id: "$medicationUsed", totalQuantity: { $sum: "$quantity" } }
    }
]

await MedsQuantity.createCollection({
    viewOn: 'clinicals', // Set `viewOn` to the collection name, not model name
    pipeline
});
