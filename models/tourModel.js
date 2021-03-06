const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require(`${__dirname}/userModel.js`);

const tourSchema = new mongoose.Schema(
  {
    // the thing within the curly brackets is schema type options
    name: {
      type: String,
      required: [true, 'A name of tour should be present'],
      unique: true,
      trim: true
    },
    slug: {
      type: String
    },
    difficulty: {
      type: String
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have have a group size']
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      set: val => Math.floor(val * 10) / 10 // callback function called each time ratingAverage is set
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price of tour must be present']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//setting indexes
// tourSchema.index({ price: 1 });
//Compound indexing
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

// adds virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
  //arrow function not used because this keyword would not have been defined then
});

// this is virtual populate
//This is the name of the field in the other model.
// So in the Review model in this case,
// where the reference to the current model is stored.

// this allows us to basically do the following.
// So, keeping a reference to all the child documents
// on the parent document,
// but without actually persisting that information
// to the database.

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//document middleware-runs between save command is initiated and the actual saving
// runs between .save() and .create()
// also called pre save hook
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//DOCUMENT MIDDLEWARE which adds tour guides to a tour document

// This is embeding-we have embeded the user document into the tour document

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => {
//     return await User.findById(id);
//   });

//   this.guides = await Promise.all(guidesPromises);
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document');
//   next();
// });
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  //this here is query object
  console.log('Query middleware');
  const old = this;
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });

  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});
// post middleware
tourSchema.post(/^find/, function(docs, next) {
  console.log(`This query took ${Date.now() - this.start}miliseconds`);
  // console.log(docs);
  next();
});
//aggregate  middleware\
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
