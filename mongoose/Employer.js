const mongoose = require('mongoose')

const employerSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    discriminatorKey: 'rule' // Field used to differentiate between sub-documents
  },
  name: String,
  email: String,
  age: Number
})

// Create a model before creating the subdocuments
const Employer = mongoose.model('Employer', employerSchema);

// Create sub-documents for different employer types
const VeterinaryEmployer = Employer.discriminator('Veterinary', {VetNumber: {type: Number, required: true}, specialty: String})
const NurseEmployer = Employer.discriminator('Nurse', {appliesVaccine: Boolean})

// Creating the model
module.exports = { 
  Employer, 
  VeterinaryEmployer, 
  NurseEmployer 
}; 
