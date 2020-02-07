/* eslint-disable no-unused-vars */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
const Promise = require('bluebird');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
const httpStatus = require('http-status');
const APIError = require('../../helpers/APIError');


/**
 * Book Schema
 */
const BookSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bookName: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


/**
 * - pre-post-save hooks
 * - validations
 * - virtuals
 */

BookSchema.pre('save', function (next) {
  next();
});

/**
 * Methods
 */
BookSchema.method({
});

/**
 * Statics
 */
BookSchema.statics = {
  /**
   * Get book
   * @param {ObjectId} id - The objectId of book.
   * @returns {Promise<Book, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('owner')
      .exec()
      .then((book) => {
        if (book) {
          return book;
        }
        const err = new APIError('No such book exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  /**
   * List books and populate owner details to wich the book belongs to.
   * @returns {Promise<Book[]>}
   */
  list() {
    return this.find()
      .populate('owner')
      .exec();
  },

  /**
   * List books in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of books to be skipped.
   * @param {number} limit - Limit number of books to be returned.
   * @returns {Promise<Book[]>}
   */
  listLazy({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner')
      .exec();
  },

  listBooks(options) {
    options = options || {};

    return this.aggregate([{
      $match: {
        owner: mongoose.Types.ObjectId(options),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owners',
      },
    },
    { $unwind: '$owners' },
    {
      $project: {
        bookName: 1,
        author: 1,
        isActive: 1,
        'owners.email': 1,
        'owners.firstName': 1,
      },
    },
    ]);
  },
};

BookSchema.plugin(mongoosePaginate);
BookSchema.plugin(mongooseAggregatePaginate);
/**
 * @typedef Book
 */
module.exports = mongoose.model('Book', BookSchema);
