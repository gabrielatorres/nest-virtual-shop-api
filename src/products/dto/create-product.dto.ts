import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Teslo T Shirt',
    description: 'Product title',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 5.99,
    default: 0,
    description: 'Product price',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'Teslo T Shirt',
    description: 'Product Description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'teslo_t_shirt',
    description: 'Product SLUG for SEO',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    example: ['XS', 'S', 'M', 'L'],
    description: 'Product sizes',
    isArray: true,
  })
  @IsString({ each: true }) // todas las condiciones del arreglo deben cumplirse
  @IsArray()
  sizes: string[];

  @ApiProperty({
    example: 'woman',
    description: 'Product gender',
  })
  @IsIn(['women', 'men', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    example: ['shirt', 'white'],
    description: 'Product sizes',
    isArray: true,
  })
  @IsString({ each: true }) // todas las condiciones del arreglo deben cumplirse
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty()
  @IsString({ each: true }) // todas las condiciones del arreglo deben cumplirse
  @IsArray()
  @IsOptional()
  images?: string[];
}
