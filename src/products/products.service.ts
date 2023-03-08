import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { Product, ProductImage } from './entities';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      // En la creación del producto, typeorm infiere el id de producto para las imagenes
      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });

      // Guarda tanto el producto como las imagenes
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.logger.error(error);
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // Devuelve toda la información de la relación con las imagenes
      relations: {
        images: true,
      },
    });

    // Transformación de imagines para que retornen como array y no object
    return products.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url),
    }));
  }

  async findOne(arg: string) {
    let product: Product;
    if (isUUID(arg))
      product = await this.productRepository.findOneBy({ id: arg });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: arg.toUpperCase(),
          slug: arg.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product does not exist`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) throw new NotFoundException(`Product does not exist`);

    // Evaluar si el producto tiene imagenes
    // Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Si vienen imágenes en la actualización, se borran todas las que existen
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        // Se crea un array nuevo con las nuevas imagenes a guardar
        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }

      // Actualiza el usuario que hace la actualización
      product.user = user;
      // Intento de guardar
      await queryRunner.manager.save(product);
      // await this.productRepository.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return;
  }

  async findOnePlain(arg: string) {
    const { images = [], ...product } = await this.findOne(arg);
    return {
      ...product,
      images: images.map((img) => img.url),
    };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error)
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  // Solo para desarrollo
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      if (process.env.NODE_ENV === 'dev')
        return await query.delete().where({}).execute();
      throw new BadRequestException(
        'Cannot execute. Only for development enviroment',
      );
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
