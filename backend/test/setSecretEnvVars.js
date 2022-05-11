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
