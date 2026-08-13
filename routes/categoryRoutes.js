const express = require('express');
const router = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { categoryCreateRules, categoryUpdateRules } = require('../utils/validators');
const validate = require('../middleware/validate');

router.route('/').get(getCategories).post(categoryCreateRules, validate, createCategory);
router.route('/:id')
  .get(getCategory)
  .put(categoryUpdateRules, validate, updateCategory)
  .patch(categoryUpdateRules, validate, updateCategory)
  .delete(deleteCategory);

module.exports = router;