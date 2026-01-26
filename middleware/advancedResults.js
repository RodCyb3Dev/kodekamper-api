const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query and exclude control fields
  const { select, sort, page, limit, ...reqQuery } = req.query;

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (select) {
    const fields = select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 25;
  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = pageNumber * limitNumber;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limitNumber);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: pageNumber + 1,
      limit: limitNumber,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: pageNumber - 1,
      limit: limitNumber,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
