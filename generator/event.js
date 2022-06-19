const { faker } = require('@faker-js/faker');
const generateEvents = (amount) => {
  let employees = []
  for (let x = 0; x < amount; x++) {
    employees.push(createEvent())
  }
  return employees
}

const organiser = [
  faker.database.mongodbObjectId(),
  faker.database.mongodbObjectId(),
  faker.database.mongodbObjectId(),
  faker.database.mongodbObjectId(),
]

const createEvent = () => {
  const categories = [
    "Salsa",
    "Bachata",
    "Zouk",
    "Reggeaton",
    "Merengue",
  ]
  const categoryArray = [];
  const numberOfCategories = Math.floor(Math.random() * categories.length);
  categoryArray.push(categories[numberOfCategories]);
  for(let i = 0; i < numberOfCategories; i++){
    const category = categories[Math.floor(Math.random() * categories.length)];
    if(!categoryArray.includes(category))
      categoryArray.push(category)
  }
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const start = faker.date.soon(5, today);
  const event = {
    name: faker.name.findName(),
    description: faker.lorem.paragraph(),
    startDateTime: start,
    endDateTime: faker.date.soon(7, start),
    location: {
      type: 'Point',
      coordinates: [ Number(faker.address.longitude(16.9796667823,9.47996951665)), Number(faker.address.latitude(49.0390742051, 46.4318173285))]
    },
    address: {
      country: faker.address.country(),
      city: faker.address.city(),
      postalcode: faker.address.zipCode(),
      street: faker.address.street(),
      housenumber: faker.address.buildingNumber(),
    },
    price: Number(faker.finance.amount(0)),
    public: true,
    imageId: `${faker.database.mongodbObjectId()}.png`,
    organizerId: organiser[Math.floor(Math.random() * organiser.length)],
    category: categoryArray,
    participants: [],
    paid: true,
  }
  return event
}

module.exports = {
  generateEvents,
}
