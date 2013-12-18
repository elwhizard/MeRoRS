'use strict';

var mongoose = require('mongoose'),
  ReservationModel = mongoose.model('Reservation'),
  roomsController = require('./rooms'),
  async = require('async');

var baucis = require('baucis');

// Query daily reservations
function getReservations ( req, res, next ) {
	var params = req.query;
	var userId, roomId;

	switch(params.getBy) {
		case 'user':
			if (req.isAuthenticated()) {

				userId = req.user._doc._id;

			} else {
				userId = params.reservedBy;
			}
			
			if (!userId) {
				req.json({error: 'Invalid user id!'});
			} else {
				getReservationByUser(userId, req, res, next);
			}

			break;
		case 'room':
			roomId = params.roomId;

			getReservationByRoom(roomId, req, res, next);

			break;
		default:
			getAllRservationByDate(req, res, next);
	}

}

function getReservationByUser ( userId, req, res, next ) {
	ReservationModel.find({
        reservedBy: userId
    }).lean().exec(function ( err, results ) {
		if (err) {
			res.send(err);
		} else {
			res.json(results);
		}
    });
}

function getReservationByRoom (roomId, req, res, next) {
	var params = req.query;
	// Todo check roomId
	ReservationModel.find({
		roomId: roomId,
        dateStart: {
            $gte: params.dateStart,
            $lte: params.dateEnd
        },
        dateEnd: {
            $gte: params.dateEnd,
            $lte: params.dateStart
        }
    }).lean().exec(function ( err, results ) {
    	
		if (err) {
			res.send(err);
		} else {
			res.json(results);
		}
    });
}

function getAllRservationByDate (req, res, next) {
	var params = req.query;
	// Todo check roomId
	ReservationModel.find({
        dateStart: {
            $gte: params.dateStart,
            $lte: params.dateEnd
        },
        dateEnd: {
            $gte: params.dateEnd,
            $lte: params.dateStart
        }
    }).lean().exec(function ( err, results ) {
		if (err) {
			res.send(err);
		} else {
			res.json(results);
		}
    });
}

function addOneTimeReservation ( req, res, next ) {
	var params = req.body;
	var userId = req.user._doc._id;

	async.series({
		checkRoom: function (callback) {

			roomsController.checkRoomExists(params.roomId, function ( err, results ) {
				if (err) {
					callback(err);
				} else if (results) {
					callback(null, results);
				} else {
					callback(true);
				}
			});

		},
		checkConflicts: function (callback) {

			ReservationModel.find({
		        roomId: params.roomId,
		        $or: [{
		            dateStart: {
		                $gte: params.dateStart,
		                $lte: params.dateEnd
		            },
		            $or: [{
		                timeStart: {
		                    $gte: params.timeStart,
		                    $lt: params.dateEnd
		                }
		            }, {
		                timeEnd: {
		                    $gt: params.timeStart,
		                    $lte: params.timeEnd
		                }
		            }]
		        }, {
		            dateEnd: {
		                $gte: params.dateEnd,
		                $lte: params.dateStart
		            },
		            $or: [{
		                timeStart: {
		                    $gte: params.timeStart,
		                    $lt: params.timeEnd
		                }
		            }, {
		                timeEnd: {
		                    $gt: params.timeStart,
		                    $lte: params.timeEnd
		                }
		            }]
		        }]
		    }, function ( err, results ) {

				callback(err, results);

		    });
		}
	}, function (err, results) {

		if (err) {
			if (!results.checkRoom) {
				res.json({error: 'Room does not exist!'});
			} else {
				next(err);
			}
		} else if (results.checkConflicts.length) {
			// Event conflict
			// Return the number of events
			res.json({results: results.checkConflicts.length});

        } else {
			// Add userId
			req.body.reservedBy = userId;

			next();
        }

	});

}

function addDailyReservation (req, res, next) {

}

function addWeeklyReservation ( req, res, next ) {
	
}

function updateOneTimeReservation ( req, res, next ) {
	
}

function updateDailyReservation (req, res, next) {

}

function updateWeeklyReservation ( req, res, next ) {
	
}

function buildRESTController () {
	var restController = baucis.rest('Reservation');


	// Query daily reservations
	restController.get('/', getReservations);

	// Create reservation
	restController.post('/', function ( req, res, next ) {
		var params = req.params;
		
		if (!req.isAuthenticated()) {
			res.send(401);
		}

		switch (req.body.recurType) {
			case 'daily':
				addDailyReservation(req, res, next);
				break;
			case 'weekly':
				addWeeklyReservation(req, res, next);
				break;
			default:
				// One time
				addOneTimeReservation(req, res, next);
		}

	});

	// Update reservation
	restController.put('/', function ( req, res, next ) {
		var params = req.params;
		
		if (!req.isAuthenticated()) {
			res.send(401);
		}

		switch (req.params.recurType) {
			case 'daily':
				updateDailyReservation(req, res, next);
				break;
			case 'weekly':
				updateWeeklyReservation(req, res, next);
				break;
			default:
				updateOneTimeReservation(req, res, next);
		}
	});

	// Delete reservation
	restController.delete('/', function ( req, res, next ) {
		var params = req.params;

		// Todo: make truthy on live
		if (!req.isAuthenticated()) {
			res.send(401);
		}

	});

	return restController;
}

function restController () {
	return buildRESTController();
}

module.exports = {
	getRESTController: restController
};

/* add your methods here...please refer to users.js */