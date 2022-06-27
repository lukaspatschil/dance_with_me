// Plugins enable you to tap into, modify, or extend the internal behavior of Cypress
// For more info, visit https://on.cypress.io/plugins-api
import {connectMongoDb, createOrganiser, createUser, disconnectMongoDb} from "./database.plugin";

module.exports = (on: any, config: any) => {
  on('task', {
    'db:connect': connectMongoDb,
    'db:user': createUser,
    'db:organiser': createOrganiser,
    'db:disconnect': disconnectMongoDb
  })
}
