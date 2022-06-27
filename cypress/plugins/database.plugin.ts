import {RoleEnum} from "../../backend/src/core/schema/enum/role.enum";
import {Collection, MongoClient} from "mongodb";
import MeiliSearch from "meilisearch";
import neo4j from "neo4j-driver";

let client: MongoClient;
let meilisearch: MeiliSearch;

let userCollection: Collection;
let eventCollection: Collection;

export async function connectMongoDb() {
  const mongoUrl = 'mongodb://localhost:27017';
  client = new MongoClient(mongoUrl);
  await client.connect();
  const databaseName = 'test'

  const neo4jUrl = 'neo4j://localhost:7687'
  const neo4jUsername = 'neo4j'
  const neo4jPassword = 'dancewithme'

  const driver = neo4j.driver(
    neo4jUrl,
    neo4j.auth.basic(neo4jUsername, neo4jPassword),
  );
  const session = await driver.session({database: 'neo4j'});

  const meilisearchUrl = 'http://localhost:7700';
  const meilisearchAPIKey = 'masterKey';

  meilisearch = new MeiliSearch({
    host: meilisearchUrl,
    apiKey: meilisearchAPIKey,
  });

  const db = client.db(databaseName);
  eventCollection = db.collection('eventdocuments');
  userCollection = db.collection('userdocuments');

  await eventCollection.deleteMany({});
  await userCollection.deleteMany({});

  await session.run('MATCH (n) DETACH DELETE n');

  await meilisearch.index('events').delete();

  return null;
}

export async function disconnectMongoDb() {
  await client.close();

  return null;
}

export async function createUser() {
  const user = {
    _id: 'google:116424568853484173930',
    displayName: 'Lukas Spatschil',
    email: 'dancewithmease@gmail.com',
    firstName: 'Lukas',
    lastName: 'Spatschil',
    emailVerified: false,
    pictureUrl: 'https://lh3.googleusercontent.com/a/AATXAJyumMbI41MWVUWgj7zoRzhV6sUE-GQFsWn-9qYB=s96-c',
    role: RoleEnum.USER,
  };

  // @ts-ignore
  return userCollection.insertOne(user);
}

export async function createOrganiser() {
  const user = {
    _id: 'google:116424568853484173930',
    displayName: 'Lukas Spatschil',
    email: 'dancewithmease@gmail.com',
    firstName: 'Lukas',
    lastName: 'Spatschil',
    emailVerified: false,
    pictureUrl: 'https://lh3.googleusercontent.com/a/AATXAJyumMbI41MWVUWgj7zoRzhV6sUE-GQFsWn-9qYB=s96-c',
    role: RoleEnum.ORGANISER,
  };

  // @ts-ignore
  return userCollection.insertOne(user);
}
