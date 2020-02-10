const express = require('express');
// const validate = require('express-validation');
// const Joi = require('@hapi/joi');
const bookCtrl = require('./book.controller');

const router = express.Router(); // eslint-disable-line new-cap
// const paramValidation = {
//   createBook: {
//     body: {
//       bookName: Joi.string().required(),
//       author: Joi.string().required(),
//       isbn: Joi.string().min(10).max(13).required(),
//     },
//   },
//   updateBook: {
//     params: {
//       bookId: Joi.string().required(),
//     },
//     body: {
//       bookName: Joi.string().required(),
//       author: Joi.string().required(),
//       isbn: Joi.string().min(10).max(13).required(),
//     },
//   },
// };

router.route('/')
  /** GET /api/books - Get list of books */
  .get(bookCtrl.listBooks)

  /** POST /api/books - Create new book */
  // .post(validate(paramValidation.createBook), bookCtrl.create);
  .post(bookCtrl.createNewBook);

router.route('/:bookId')
  /** GET /api/books/:bookId - Get book */
  .get(bookCtrl.get)

/** PUT /api/books/:bookId - Update book */
// .put(validate(paramValidation.updateBook), bookCtrl.update)

  /** DELETE /api/books/:bookId - Delete book */
  .delete(bookCtrl.remove)

  .put(bookCtrl.findBookAndUpdate);

/** Load book when API with bookId route parameter is hit */
router.param('bookId', bookCtrl.load);

router.route('/csv').post(bookCtrl.createNewCSV);

module.exports = router;
