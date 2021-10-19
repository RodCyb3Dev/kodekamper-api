const Bootcamp = require('../models/Bootcamp');

// @desc       GET all bootcamps
// @route      GET /api/v1/bootcamps
// @access     Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find()
    res.status(200).json({ success: true, data: bootcamps })
  } catch (error) {
    res.status(400).json({ success: false, msg: `No bootcamps not found: ${error}` })
  }
}

// @desc       GET single bootcamp
// @route      GET /api/v1/bootcamps/:id
// @access     Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
      return next(
        new res.status(400).json(`Bootcamp not found with id of ${req.params.id}`)
      );
    }

    res.status(200).json({ success: true, data: bootcamp })

  } catch (error) {
    res.status(400).json({ success: false, msg: `Bootcamp not found with id: ${req.params.id}` })
  }
}

// @desc       Create new bootcamp
// @route      POST /api/v1/bootcamps
// @access     Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp
    })
  } catch (error) {
    res.status(400).json({success: true, msg: `Error creating bootcamp due to: ${error}`})
  }
}

// @desc       Update bootcamp
// @route      PUT /api/v1/bootcamps/:id
// @access     Private
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: false, msg: `Update bootcamp ${ req.params.id }`})
}

// @desc       Delete bootcamp
// @route      DELETE /api/v1/bootcamps/:id
// @access     Private
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete bootcamp ${ req.params.id }`})
}