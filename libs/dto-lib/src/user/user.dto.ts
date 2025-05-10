export class UserDto {
  uuid: string;
  userName: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(init: {
    uuid: string;
    userName: string;
    telegramId: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.uuid = init.uuid;
    this.userName = init.userName;
    this.telegramId = init.telegramId;
    this.firstName = init.firstName;
    this.lastName = init.lastName;
    this.createdAt = init.createdAt;
    this.updatedAt = init.updatedAt;
  }

  static fromEntity(entity: any): UserDto {
    return new UserDto({
      uuid: entity.uuid,
      userName: entity.userName,
      telegramId: entity.telegramId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}