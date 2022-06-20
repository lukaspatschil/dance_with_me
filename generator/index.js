const {MongoClient} = require('mongodb');
const neo4j = require('neo4j-driver');
const MeiliSearch = require('meilisearch')
const {generateEvents} = require("./event");
const {generateUsers} = require("./user")
const PARTICIPATES_RELATIONSHIP = 'PARTICIPATES';
const usersAmount = 20;
const eventsAmount = 500;


const users = generateUsers(usersAmount);
const events = generateEvents(eventsAmount);

let mongoUrl = process.env['MONGO_URL']
if (!mongoUrl) {
  mongoUrl = 'mongodb://localhost:27017';
}
console.log(`MongoDb: Connecting to ${mongoUrl}`);
const client = new MongoClient(mongoUrl);
const databaseName = 'test'

let neo4jUrl = process.env['NEO4J_ENDPOINT']
if (!neo4jUrl) {
  neo4jUrl = 'neo4j://localhost:7687';
}

let neo4jUsername = process.env['NEO4J_USERNAME']
if (!neo4jUsername) {
  neo4jUsername = 'neo4j';
}
let neo4jPassword = process.env['NEO4J_PASSWORD']
if (!neo4jPassword) {
  neo4jPassword = 'dancewithme';
}

console.log(`Neo4j: Connecting to ${neo4jUrl}`);
const driver = neo4j.driver(
  neo4jUrl,
  neo4j.auth.basic(neo4jUsername, neo4jPassword),
)
let session;

let meilisearchUrl = process.env['MEILI_SEARCH_HOST'] ?? 'http://localhost:7700';
let meilisearchAPIKey = process.env['MEILI_SEARCH_API_KEY'] ?? 'masterKey';

console.log(`MeiliSearch: Connecting to ${meilisearchUrl}`);
const meiliSearch = new MeiliSearch.MeiliSearch({
  host: meilisearchUrl,
  apiKey: meilisearchAPIKey,
})

async function main() {
  await mongoSeeder();
  await log4jSeeder()
  return `Generated ${usersAmount} users and ${eventsAmount} events!`;
}

async function log4jSeeder() {
  session = await driver.session({database: 'neo4j'});
  for (let index = 0; index < users.length; index++) {
    await session.run(`CREATE (u:User {id: '${users[index]._id}'});`)
  }

  for (let index = 0; index < events.length; index++) {
    await session.run(`CREATE (e:Event {id: '${events[index]._id}'})`)
    for (let userIndex = 0; userIndex < events[index].participants.length; userIndex++) {
      await session.run(`Match (e:Event {id: '${events[index]._id}'}), (u:User {id: '${events[index].participants[userIndex]}'}) CREATE (u)-[p:${PARTICIPATES_RELATIONSHIP}]->(e)`)
    }
  }
}

function mapToEventDto(tempEvent) {
  return {
    id: tempEvent._id.toString(),
    name: tempEvent.name,
    description: tempEvent.description,
    startDateTime: tempEvent.startDateTime,
    endDateTime: tempEvent.endDateTime,
    location: {
      type: tempEvent.location.type,
      coordinates: tempEvent.location.coordinates,
    },
    address: {
      country: tempEvent.address.country,
      city: tempEvent.address.city,
      postalcode: tempEvent.address.postalcode,
      street: tempEvent.address.street,
      housenumber: tempEvent.address.housenumber,
    },
    price: tempEvent.price,
    public: tempEvent.public,
    imageId: tempEvent.imageId,
    organizerId: tempEvent.organizerId,
    organizerName: tempEvent.organizerName,
    category: tempEvent.category,
    participants: tempEvent.participants,
    paid: tempEvent.paid,
  };
}

async function mongoSeeder() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(databaseName);
  const eventCollection = db.collection('eventdocuments');
  const userCollection = db.collection('userdocuments');
  const resultUsers = await userCollection.insertMany(users, {ordered: true});
  const base = Math.round(eventsAmount / usersAmount);
  for (let index = 0; index < usersAmount; index++) {
    const randomLower = Math.floor(Math.random() * eventsAmount)
    const randomUpper = Math.floor(Math.random() * (eventsAmount - randomLower)) + randomLower;
    for (let indexEvent = 0; indexEvent < eventsAmount; indexEvent++) {
      if (
        (index * base) <= indexEvent && indexEvent <= ((index + 1) * base) ||
        randomLower <= indexEvent && indexEvent <= randomUpper
      ) {
        events[indexEvent]['participants'].push(resultUsers.insertedIds[index]);
      }
    }
  }
  const resultEvents = await eventCollection.insertMany(events, {rawResult: true});

  const eventDocuments = [];
  for (let index = 0; index < resultEvents.insertedCount; index++) {
    const tempID = resultEvents.insertedIds[index];
    const tempEvent = await eventCollection.findOne({_id: tempID});
    const eventEntity = mapToEventDto(tempEvent);
    eventDocuments.push(eventEntity);
  }

  await meiliSearch
    .index('events')
    .addDocuments(eventDocuments)
    .catch(() => {
      console.error('Error while adding events to meili search');
    });
}


main()
  .then(console.log)
  .catch(console.error)
  .finally(() => {
    client.close();
    if (session)
      session.close();
    driver.close();
  });
