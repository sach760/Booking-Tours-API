class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    console.log('Filter');

    //1A) Filtering
    // console.log(queryString);
    let queryObj = { ...this.queryString };
    const excludedObj = ['page', 'sort', 'limit', 'fields'];
    excludedObj.forEach(ele => delete queryObj[ele]);
    //1B)Advanced filtering
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);
    // console.log(this.queryString);
    this.query = this.query.find(JSON.parse(queryObj));
    return this;
    // console.log(JSON.parse(queryString));
  }

  sort() {
    console.log('sort');

    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      // query = query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    console.log('Field');

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    console.log('page');

    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const totalTours = await Tour.countDocuments();
    //   if (skip >= totalTours) throw new Error('This page does not exist');
    // }
    return this;
  }
}
module.exports = ApiFeatures;
