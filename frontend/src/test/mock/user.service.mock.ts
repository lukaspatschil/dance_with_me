import {of} from "rxjs";
import {RoleEnum} from "../../app/enums/role.enum";

export class UserServiceMock  {
  _user = jest.fn().mockReturnValue(
    of(  {
      id: 'google:12345',
      displayName: 'Max1',
      firstName: 'Max',
      lastName: 'Hermannus',
      email: 'Mail@mail.com',
      emailVerified: true,
      role: RoleEnum.USER
    })
  )

  user$ =
    of(  {
  id: 'google:12345',
  displayName: 'Max1',
  firstName: 'Max',
  lastName: 'Hermannus',
  email: 'Mail@mail.com',
  emailVerified: true,
  role: RoleEnum.USER
})


  updateUser = jest.fn().mockReturnValue(
    of(  {
      id: 'google:12345',
      displayName: 'Max1',
      firstName: 'Max',
      lastName: 'Hermannus',
      email: 'Mail@mail.com',
      emailVerified: true,
      role: RoleEnum.USER
    })
  )

  resetUser = jest.fn()

  deleteUser = jest.fn().mockReturnValue(
    of(204))
}
