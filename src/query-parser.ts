interface T {
  fields?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export class QueryParser<U extends T> {
  filterObj?: object;
  projectionStr?: string;
  sortingStr?: string;
  limit?: number;
  skip?: number;

  constructor(private query: U) {}

  filter() {
    const unwantedFields = ['fields', 'sort', 'page', 'limit'];

    const filterObj = JSON.parse(JSON.stringify(this.query));
    unwantedFields.forEach((field) => delete filterObj[field]);

    let filterStr = JSON.stringify(filterObj);
    let operator: string | undefined;
    let key: string | undefined;
    let value: string | undefined;

    filterStr = filterStr.replace(/\[(lte|gte|lt|gt)\]/g, (match) => {
      operator = match;
      return '';
    });

    operator?.replace(/lte|gte|lt|gt/g, (match) => {
      operator = `$${match}`;
      return '';
    });

    const [right, left] = filterStr.split(':');
    key = right;
    value = left;

    key?.replace(/"([^']+)"/g, (match) => {
      key = match;
      return '';
    });

    value?.replace(/"([^']+)"/g, (match) => {
      value = match;
      return '';
    });

    key = key?.replace(/^"(.*)"$/, '$1');
    value = value?.replace(/^"(.*)"$/, '$1');
    this.filterObj = { [key]: { [operator as string]: value } };

    return this;
  }

  project() {
    this.projectionStr = this.query.fields?.replace(/,/g, ' ');

    return this;
  }

  sort() {
    this.sortingStr = this.query.sort?.replace(/,/g, ' ');

    return this;
  }

  paginate(defaultPage = 1, defaultLimit = 10) {
    const page = Math.abs(parseInt(this.query.page as string, 10)) || defaultPage;
    this.limit = Math.abs(parseInt(this.query.limit as string, 10)) || defaultLimit;
    this.skip = this.limit * (page - 1);

    return this;
  }
}
