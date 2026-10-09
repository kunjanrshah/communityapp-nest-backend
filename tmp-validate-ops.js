/* Temporary: validate client-side operations against the generated GraphQL schema. */
async function main() {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { buildSchema, parse, validate } = await import('graphql');

  const schemaPath = path.join(__dirname, 'src', 'schema.gql');
  const schema = buildSchema(fs.readFileSync(schemaPath, 'utf8'));

  const operations = {
    'UpdateDeviceToken (as written by Android)': `mutation UpdateDeviceToken {
    updateDeviceToken
}`,
    'UpdateDeviceToken (with a variable)': `mutation UpdateDeviceToken($deviceToken: String!) {
    updateDeviceToken(deviceToken: $deviceToken)
}`,
    'SendNotification (as written by Android)': `mutation SendNotification($userId: Float!, $title: String!, $message: String!) {
    sendNotification(userId: $userId, title: $title, message: $message)
}`,
  };

  for (const [name, doc] of Object.entries(operations)) {
    const errors = validate(schema, parse(doc));
    console.log(
      errors.length === 0
        ? `VALID   -> ${name}`
        : `INVALID -> ${name}\n          ${errors.map((e) => e.message).join(', ')}`,
    );
  }
}

main();
