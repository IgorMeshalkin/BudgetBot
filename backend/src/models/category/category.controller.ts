import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from '@dto/category/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/tg/:telegramId')
  async getByTelegramId(
    @Param('telegramId', ParseIntPipe) telegramId: number,
  ): Promise<CategoryDto[] | null> {
    try {
      return await this.categoryService.findByTelegramId(telegramId);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }
}
