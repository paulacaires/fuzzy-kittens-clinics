const mongoose = require('mongoose')

const clinicalSchema = new mongoose.Schema({
    kittens_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Kitten"
    },
    procedure: {
        type: String,
        enum: {
            values: ['vaccine', 'allergy_test', 'grooming'],
            message: '{VALUE} is not supported.',
            required: true
        }
    },
    wasSuccess: Boolean,
    medicationUsed: [String],
    procedureDate: {
        type: Date,
        default: Date.now
    }
})

// Creating the model
module.exports = mongoose.model('Clinical', clinicalSchema);

// Criando a visão
