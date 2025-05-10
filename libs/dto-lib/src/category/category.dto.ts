export class CategoryDto {
  uuid: string;
  name: string;
  description?: string;

  constructor(init: {
    uuid: string;
    name: string;
    description?: string;
  }) {
    this.uuid = init.uuid;
    this.name = init.name;
    this.description = init.description;
  }

  static fromEntity(entity: any): CategoryDto {
    return new CategoryDto({
      uuid: entity.uuid,
      name: entity.name,
      description: entity.description,
    });
  }
}
