/* Reading the get and set documentation */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fuzzy_kittens_db');

const userEmailSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    get: obfuscate, // Getters do not impact the underlying data stored in MongoDB
    set: v => v.toLowerCase()
  }
}, { toJSON: { getters: true } });

// Mongoose passes the raw value in MongoDB `email` to the getter
function obfuscate(email) {
  const separatorIndex = email.indexOf('@');
  if (separatorIndex < 3) {
    // 'ab@gmail.com' -> '**@gmail.com'
    return email.slice(0, separatorIndex).replace(/./g, '*') +
      email.slice(separatorIndex);
  }
  // 'test42@gmail.com' -> 'te****@gmail.com'
  return email.slice(0, 2) +
    email.slice(2, separatorIndex).replace(/./g, '*') +
    email.slice(separatorIndex);
}

const UserEmail = mongoose.model('UserEmail', userEmailSchema);

const user = new UserEmail({name: 'Paula', email: 'mjPAULAS@gmail.com' });
console.log(user.email);