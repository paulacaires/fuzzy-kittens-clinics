const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    age: {
        type: Number,
        min: 1,
        max: 100,
    },
    email: {
        type: String,
        lowercase: true // Automaticamente lowecase 
    },
    updatedAt: Date,
    bestFriend: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User" // A qual modelo se refere
    },
    hobbies: [String],
    address: {
        street: String,
        number: Number
    }
});

userSchema.methods.sayHi = function() {
    console.log(`Hi! My name is ${this.name}`)
}

userSchema.statics.findByName = function (name) {
    return this.find({name: new RegExp(name, "i")})
}

userSchema.query.byName = function (name) {
    return this.where({name: new RegExp(name, "i")})
}

userSchema.virtual('namedEmail').get( function() {
    return `${this.name} <${this.email}>`
} )

// Antes de salvar o usuário    
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now() // Update the date
    next() // Continuar para o resto do código
})

/*
Função que pega o nome do nosso modelo (nome que será visto dentro da database do MongoDB),
e recebe também o schema.
*/
module.exports = mongoose.model("User", userSchema);