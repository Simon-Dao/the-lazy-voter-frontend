exports.handler = async (event) => {

  const people_id = event.pathParameters?.bill_id

  const queryParam = event.queryStringParameters?.key;
    
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, world!" }),
  };
};