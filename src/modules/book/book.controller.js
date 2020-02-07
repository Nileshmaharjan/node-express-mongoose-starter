/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
// const httpStatus = require('http-status');
const Book = require('./book.model');
// const APIError = require('../../helpers/APIError');


/**
 * Load book and append to req.
 */
function load(req, res, next, id) {
  Book.get(id)
    .then((book) => {
      req.book = book; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get book
 * @returns {Book}
 */
function get(req, res) {
  return res.json(req.book);
}

/**
 * Create new book
 * @property {string} req.body.bookName - The name of book.
 * @property {string} req.body.author - Author name of book.
 * @property {string} req.body.isbn- The isbn of book.
 * @returns {Book}
 */
// function create(req, res, next) {
//   const book = new Book(req.body);
//   book.owner = res.locals.session._id;

//   Book.findOne({ bookName: book.bookName })
//     .exec()
//     .then((foundBook) => {
//       if (foundBook) {
//         return Promise.reject(new APIError('Book name must be unique', httpStatus.CONFLICT, true));
//       }
//       return book.save();
//     })
//     .then(savedBook => res.json(savedBook))
//     .catch(e => next(e));
// }


async function createNewBook(req, res, next) {
  try {
    const book = new Book(req.body);
    book.owner = res.locals.session._id;

    const bookExists = await Book.findOne({ bookName: book.bookName });
    if (bookExists) {
      return res.status(400).json({
        message: 'Book Already exists',
      });
    } else {
      await book.save();
      return res.status(200).json({
        message: 'New Book Created',
      });
    }
  } catch (e) {
    next(e);
  }
}

// async function listBooksWithoutAggregate(req, res, next) {
//   try {
//     const query = { owner: res.locals.session._id };
//     // const query = await Book.find({email: 'mjn.nilesh@gmail.com'});
//     const paginatedBooks = await Book.paginate(query, options);

//     return res.status(200).json({
//       paginatedBooks,
//     });
//   } catch (e) {
//     return next(e);
//   }
// }

async function pagination(req, res, next) {
  try {
    const selectedUserFields = {
      path: 'owner',
      select: '-_id -password -__v',
    };
    const options = {
      page: req.query.page,
      populate: selectedUserFields,
      limit: req.query.limit,
      select: '-__v',
      collation: {
        locale: 'en',
      },
    };
    return options;
  } catch (e) {
    return next(e);
  }
}

async function listBooks(req, res, next) {
  try {
    let opt = {};
    opt = res.locals.session._id;

    const aggregateQuery = Book.listBooks(opt);
    const options = await pagination(req);
    const paginatedBooks = await Book.aggregatePaginate(aggregateQuery, options);

    return res.status(200).json({
      paginatedBooks,
    });
  } catch (e) {
    return next(e);
  }
}

async function findBookAndUpdate(req, res, next) {
  try {
    const book = await Book.findById(req.params.bookId);
    book.bookName = req.body.bookName;
    book.author = req.body.author;
    book.isbn = req.body.isbn;
    book.save();

    return res.status(200).json({
      message: 'Updated',
      data: book,
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * Delete book.
 * @returns {Book}
 */
function remove(req, res, next) {
  const { book } = req;
  book.remove()
    .then(deletedBook => res.json(deletedBook))
    .catch(e => next(e));
}

module.exports = {
  load,
  get,
  remove,
  createNewBook,
  listBooks,
  // listBooksWithoutAggregate,
  findBookAndUpdate,
};
