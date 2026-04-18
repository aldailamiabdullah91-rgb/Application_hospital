const generateFileNumber = () => {
  const prefix = 'MRN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const paginate = (page = 1, limit = 10) => {
  const p = parseInt(page, 10) || 1;
  const l = parseInt(limit, 10) || 10;
  const skip = (p - 1) * l;
  return { skip, take: l };
};

const formatPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = { generateFileNumber, paginate, formatPaginationResponse };
