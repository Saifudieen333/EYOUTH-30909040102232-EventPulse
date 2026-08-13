const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { userCreateRules, userUpdateRules } = require('../utils/validators');
const validate = require('../middleware/validate');

router.route('/').get(getUsers).post(userCreateRules, validate, createUser);
router.route('/:id')
  .get(getUser)
  .put(userUpdateRules, validate, updateUser)
  .patch(userUpdateRules, validate, updateUser)
  .delete(deleteUser);

module.exports = router;