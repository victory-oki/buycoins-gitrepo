
exports.handler = async (event, context, callback) => {
    const pass = (body) => {callback(null, {statusCode: 200, data: JSON.stringify(body)})}
  
    try {
      let response = await fetch("https://api.github.com/graphql", 
        {
        method: event.httpMethod,
        headers: {
        "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`, 
        "Content-Type": "application/json"
        },
        body: event.body
        })
     let data = await response.json()
     console.log(data)
     await pass(data)
   } catch(err) {
       let error = {
         statusCode: err.statusCode || 500,
         body: JSON.stringify({error: err.message})
         }
    await pass(error)
   }
}