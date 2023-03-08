/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {

  // @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ApiProperty()
  @Column('text')
  url: string;

  // @ApiProperty()
  @ManyToOne(
  () => Product, // Lo que devuelve
  (product) => product.images, // Como se relaciona
  {onDelete: 'CASCADE'} // Activa la eliminación de datos en cascada según las relaciones
  )
  product: Product;
}
