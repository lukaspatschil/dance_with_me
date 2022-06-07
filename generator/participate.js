const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');

const PARTICIPATES_RELATIONSHIP = 'PARTICIPATES';
const databaseName = 'test';

const client = new MongoClient('mongodb://localhost:27017');
const driver = neo4j.driver(
  'neo4j://localhost:7687',
  neo4j.auth.basic('neo4j', 'dancewithme'),
)
let session;
let eventIds = [];
let idToAdd = process.argv[2];

async function participateMongo() {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(databaseName);
  const eventCollection = db.collection('eventdocuments');
  const events = await eventCollection.find({'participants.2':{ $exists: true }}).limit(20);
  for await (let event of events) {
    if(!event.participants.includes(idToAdd)) {
      await eventCollection.updateOne(
        {_id: event._id},
        { $push: { participants : idToAdd } });
      eventIds.push(event._id);
    }
  }
}

async function participateNeo4j() {
  session = await driver.session({database: 'neo4j'});
  const addNode = await session.run(`OPTIONAL MATCH (n:User {id: '${idToAdd}'}) RETURN n IS NOT NULL AS exists`);
  if(!addNode.records[0].get('exists')){
    await session.run(`CREATE (u:User {id: '${idToAdd}'});`)
  }

  for(let eventId of eventIds){
    await session.run(`Match (e:Event {id: '${eventId}'}), (u:User {id: '${idToAdd}'}) CREATE (u)-[p:${PARTICIPATES_RELATIONSHIP}]->(e)`)
  }
}

async function main() {
  if(idToAdd) {
    console.log('Creating matches for User with ID ' + idToAdd);
    await participateMongo();
    await participateNeo4j();
  }
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => {
    client.close();
    if(session)
      session.close();
    driver.close();
  });
