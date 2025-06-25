import {
  Document,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  Model,
  PopulateOptions,
  FlattenMaps,
} from 'mongoose';

// Define a reusable type for the query options
export type FindType<T> = {
  projection?: ProjectionType<T> | null | string;
  options?: QueryOptions<T> | null;
  populateOptions?: PopulateOptions | PopulateOptions[] | null;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: string;
  search?: string;
  omitFields?: string[];
  conditions?: string[];
};

interface PaginationResult<T> {
  result: FlattenMaps<T>[] | T[] | Record<string, any>[] | Array<Partial<T>>;

  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;
  };
}

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(doc: Partial<T>): Promise<T> {
    const createdEntity = new this.model(doc);
    return await createdEntity.save();
  }

  async findOne(
    filterQuery: FilterQuery<T>,
    option: FindType<T> = {},
    includePassword = false,
  ): Promise<T | null> {
    return this._findBy(filterQuery, option, includePassword, 'findOne');
  }

  async _findBy(
    filterQuery: FilterQuery<T> | string,
    { projection = null, options = null, populateOptions = null }: FindType<T>,
    includePassword = false,
    queryMethod: string,
  ) {
    let query = this.model[queryMethod](filterQuery, projection, options);
    if (includePassword) {
      query = query.select('+password');
    }
    if (populateOptions) {
      query.populate(populateOptions);
    }
    return await query;
  }

  async findById(
    id: string,
    option: FindType<T> = {},
    includePassword = false,
  ): Promise<T | null> {
    return this._findBy(id, option, includePassword, 'findById');
  }

  async find(
    filterQuery: FilterQuery<T>,
    option: FindType<T> = {},
    includePassword = false,
  ): Promise<T[]> {
    return this._findBy(filterQuery, option, includePassword, 'find');
  }

  async update(
    filterQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
  ): Promise<T | null> {
    return await this.model
      .findOneAndUpdate(filterQuery, updateQuery, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async deleteOne(filterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.model.deleteOne(filterQuery).exec();
    return deleteResult.deletedCount >= 1;
  }

  async insertMany(documents: T[]): Promise<T[]> {
    return await this.model.insertMany(documents);
  }
  async aggregate(pipeline: any[]): Promise<any[]> {
    return await this.model.aggregate(pipeline).exec();
  }

  async findWithPagination(
    filterQuery: FilterQuery<T>,
    options: FindType<T> = {},
  ): Promise<PaginationResult<T>> {
    const page = Number(options.page) || 1;
    const limit = Math.min(Number(options.limit) || 20, 200);
    const skip = (page - 1) * limit;

    try {
      let queryConditions = { ...filterQuery };

      // Apply search if provided
      if (options.search && options.conditions?.length) {
        const regex = new RegExp(options.search, 'i'); // Case-insensitive search
        const searchConditions = options.conditions.map((field) => ({
          [field]: { $regex: regex },
        }));

        queryConditions = {
          ...queryConditions,
          $or: searchConditions,
        };
      }

      // Build the base query
      let query = this.model
        .find(queryConditions)
        .skip(skip)
        .limit(limit)
        .lean();

      // Apply sorting if provided
      if (options.sort) {
        const sortField = options.sort || '_id'; // Default sort field: _id
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1; // Default to descending
        query = query.sort({ [sortField]: sortOrder });
        // query = query.sort(options.sort);
      }

      // Apply projection if provided
      if (options.projection) {
        if (
          typeof options.projection === 'string' ||
          Array.isArray(options.projection)
        ) {
          query = query.select(options.projection);
        } else if (
          typeof options.projection === 'object' &&
          options.projection !== null
        ) {
          query = query.select(options.projection as Record<string, 1 | 0>);
        }
      }

      // Select fields to omit if specified
      if (options.omitFields?.length) {
        const omittedFields = options.omitFields
          .map((field) => `-${field}`)
          .join(' ');
        query = query.select(omittedFields);
      }

      // Apply population if provided
      if (options.populateOptions) {
        query = query.populate(options.populateOptions);
      }

      // Execute the query and get results
      const [result, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(queryConditions).exec(),
      ]);

      return {
        result,
        pagination: {
          total,
          currentPage: page,
          pageSize: limit,
        },
      };
    } catch (error) {
      console.error('Error executing findWithPagination:', error);
      throw new Error('Failed to fetch data');
    }
  }
}
