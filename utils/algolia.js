exports.generateCategoryQuery = (categoryName, catgories) => {
  const categoriesArray = catgories.split(';');
  const categoryQueryArray = categoriesArray.map(
    (category) => `${categoryName}:${category}`
  );

  return categoryQueryArray.join(' AND ');
};
