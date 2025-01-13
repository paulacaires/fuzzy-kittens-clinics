const mongoose = require('mongoose')

// Função de validação para telefone
function validatePhone (phone) {
    // Source: https://medium.com/@igorrozani/criando-uma-express%C3%A3o-regular-para-telefone-fef7a8f98828
    const re = /(\(\d{2}\)\s)(\d{4,5}\-\d{4})/;
    const result = re.test(phone);
    return result;
}

const kittenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: [0, 'Insert an age greater than 0, got {VALUE}'],
    },
    allergies: [String],
    contact: {
        type: String,
        validate: {
            validator: validatePhone,
            message: function(props) { return `${props.value} is an invalid format number. ${props.path} correct pattern: (12) 1234-4567` }
        }
    },
    livesTogether: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Kitten"
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Index Schema
/*const kitten_index = new mongoose.Schema({

})*/

// Creating the model
module.exports = mongoose.model('Kitten', kittenSchema);
