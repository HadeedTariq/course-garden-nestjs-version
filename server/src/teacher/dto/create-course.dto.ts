import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsIn,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

class CouponCodeDto {
  @IsString()
  coupon: string;

  @IsNumber()
  quantity: number;
}

enum Category {
  'Cs' = 'Cs',
  'It' = 'It',
  'FullStack' = 'FullStack',
  'AppDev' = 'AppDev',
  'Ml' = 'Ml',
  'DataScience' = 'DataScience',
  'Frontend' = 'Frontend',
  'Backend' = 'Backend',
  'Other' = 'Other',
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  thumbnail: string;

  @IsIn(['free', 'paid'])
  @IsOptional()
  status: 'free' | 'paid';

  @IsEnum(Category)
  category: Category;

  @ValidateNested()
  @Type(() => CouponCodeDto)
  couponCode: CouponCodeDto;
}

export class PublishCourseDto {
  @IsEnum(['freed', 'paid'])
  status: 'free' | 'paid';

  @IsString()
  @IsOptional()
  price: string;

  @IsString()
  courseId: string;
}

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsNumber()
  @IsNotEmpty()
  chapterNumber: number;

  @IsNumber()
  @IsNotEmpty()
  totalChapters: number;

  @IsString()
  @IsNotEmpty()
  video: string;

  @IsString()
  courseId: string;
}
