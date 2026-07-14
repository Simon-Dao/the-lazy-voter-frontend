const { handler } = require('../api\\bills\\[bill_id]\\sponsors\\GET.js');
handler({ pathParameters: { bill_id: '123' }, queryStringParameters: { page: '1' } })
  .then(console.log);