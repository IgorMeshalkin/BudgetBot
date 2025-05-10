import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CategoryDto } from '@dto/category/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // TODO сильно упрощённая логика. Пока работаем только с базовыми категориями.
  // необходимо переделать и связать категории с юзером + сделать кастомные
  // по аналогии с валютами
  async findByTelegramId(telegramId: number): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.find();
    return categories.map((cat) => CategoryDto.fromEntity(cat));
  }
}
