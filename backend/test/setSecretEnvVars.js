process.env.GOOGLE_CLIENT_ID = 'googleClientIdMock';
process.env.GOOGLE_CLIENT_SECRET = 'googleClientSecretMock';

process.env.FACEBOOK_CLIENT_ID = 'facebookClientIdMock';
process.env.FACEBOOK_CLIENT_SECRET = 'facebookClientSecretMock';

process.env.POSITION_STACK_SECRET_ACCESS_KEY =
  'positionStackSecretAccessKeyMock';
process.env.POSITION_STACK_FORWARD_ENDPOINT = `https://mock.example.com/forward?access_key=${process.env.POSITION_STACK_SECRET_ACCESS_KEY}`;
process.env.POSITION_STACK_REVERSE_ENDPOINT = `https://mock.example.com/reverse?access_key=${process.env.POSITION_STACK_SECRET_ACCESS_KEY}`;

process.env.API_BASE = 'https://api.mock.example.com';
process.env.FRONTEND_URL = 'https://mock.example.com';
process.env.FRONTEND_LOGIN_CALLBACK = '/loginMock';

process.env.AWS_ACCESS_KEY_ID = 'minioadmin';
process.env.AWS_SECRET_ACCESS_KEY = 'minioadmin';
process.env.AWS_ENDPOINT = 'http://localhost:9000';
process.env.BUCKET_REGION = 'eu-west-1';
process.env.BUCKET_NAME_PREFIX = 'dancewithme-images-';
process.env.STAGE = 'test';

process.env.NEO4J_HOST = 'localhost';
process.env.NEO4J_SCHEME = 'neo4j';
process.env.NEO4J_USERNAME = 'neo4j';
process.env.NEO4J_PASSWORD = 'dancewithme';
process.env.NEO4J_PORT = 7687;
process.env.NEO4J_ENDPOINT = 'neo4j://localhost:7687';
process.env.NEO4J_AUTH = 'neo4j/dancewithme';

process.env.MEILI_SEARCH_HOST = 'http://localhost:7700';
process.env.MEILI_SEARCH_API_KEY = 'masterKey';

process.env.STRIPE_SECRET_KEY = 'sk_test_TyMeY76Ef4pXsM1rA5rznKax';
