/* Implement the domain property using a virtual. */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fuzzy_kittens_db');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    set: v => v.toLowerCase()
  }
})

// Creating the virtual
userSchema.virtual('domain').get(function() {
  return this.email.slice(this.email.indexOf('@') + 1);
})

userSchema.virtual('info').get(function() {
  return `Your name: ${this.name} <Your domain: ${this.domain}>`
})

// Creating the model
const User = mongoose.model('User', userSchema);

async function main() {
  const doc = await User.create({name: 'Teste', email: 'test@gmail.com' });
  console.log(doc);
  console.log(doc.info);
}

main ();