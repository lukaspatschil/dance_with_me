const { faker } = require('@faker-js/faker');
const { ObjectID } = require('mongodb');
const generateUsers = (amount) => {
  let user = []
  for (let x = 0; x < amount; x++) {
    user.push(createUser())
  }
  return user
}

const createUser = () => {
  const user = {
    _id: new ObjectID().toString()+'GoogleId',
    role: 'User',
    displayName: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    emailVerified: true,
    pictureUrl: faker.image.imageUrl(),
  }
  return user;
}

module.exports = {
  generateUsers,
}
