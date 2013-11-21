var mongoose = require( 'mongoose' ),
        Schema = mongoose.Schema;

var userSchema = new Schema( {
        email: String,
        password: String // hashed
} );

module.exports = mongoose.model( 'user', userSchema );
