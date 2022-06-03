import {connect, disconnect, model, Model} from "mongoose";
import {UserDocument, UserSchema} from "../../backend/src/core/schema/user.schema";
import {RoleEnum} from "../../backend/src/core/schema/enum/role.enum";
import {EventDocument, EventSchema} from "../../backend/src/core/schema/event.schema";

const User: Model<UserDocument> = model<UserDocument>(
  'userdocuments',
  UserSchema,
);

const Event: Model<EventDocument> = model<EventDocument>(
  'eventdocuments',
  EventSchema,
);

export async function connectMongoDb() {
  await connect('mongodb://localhost:27017');
  await User.ensureIndexes();
  await Event.ensureIndexes();
  const users = await User.remove({}).exec();
  const events = await Event.remove({}).exec();

  return {users, events};
}

export async function disconnectMongoDb() {
  await disconnect();

  return null;
}

export async function createUser() {
    const user = new User({
      _id: 'google:116424568853484173930',
      displayName: 'Lukas Spatschil',
      email: 'dancewithmease@gmail.com',
      firstName: 'Lukas',
      lastName: 'Spatschil',
      emailVerified: false,
      pictureUrl: 'https://lh3.googleusercontent.com/a/AATXAJyumMbI41MWVUWgj7zoRzhV6sUE-GQFsWn-9qYB=s96-c',
      role: RoleEnum.USER,
    });

    return await user.save();
}

export async function createOrganiser() {
  const user = new User({
    _id: 'google:116424568853484173930',
    displayName: 'Lukas Spatschil',
    email: 'dancewithmease@gmail.com',
    firstName: 'Lukas',
    lastName: 'Spatschil',
    emailVerified: false,
    pictureUrl: 'https://lh3.googleusercontent.com/a/AATXAJyumMbI41MWVUWgj7zoRzhV6sUE-GQFsWn-9qYB=s96-c',
    role: RoleEnum.ORGANISER,
  });

  return await user.save();
}
