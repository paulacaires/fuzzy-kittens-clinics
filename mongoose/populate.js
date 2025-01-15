const mongoose = require('mongoose');
const { urlToHttpOptions } = require('url');

const personSchema = new mongoose.Schema({
    name: String,
    age: Number,
    stories: [{type: mongoose.SchemaTypes.ObjectId, ref: "Story"}]
});

const storySchema = new mongoose.Schema({
    author: {type: mongoose.SchemaTypes.ObjectId, ref: "Person"},
    title: String,
    fans: [{type: mongoose.SchemaTypes.ObjectId, ref: "Person"}]
});

const Story = mongoose.model('Story', storySchema);
const Person = mongoose.model('Person', personSchema);

mongoose.connect('mongodb://localhost:27017/populate_db');

async function saving_refs() {
    const newAuthor = await Person.create({'name': 'Machado de Assis', 'age': 45});
    
    const story1 = new Story({
        title: 'Dom Casmurro',
        author: newAuthor._id
    });
    await story1.save();
}

async function populate() {
    const story = await Story.findOne({'title': 'Dom Casmurro'}).populate('author').exec()

    console.log('Document:', story);
    console.log('The', story.title, 'author is', story.author.name);
}

async function setting_populated_fields() {
    /*
    Manually populate a property by setting it to a document.
    */

    // First way: Didn't work 

    // Second way
    // Push documents or POJOs onto a populated array
    //const fan1 = await Person.create({name: 'Maria', age: 43})
    //await Story.updateOne({title: 'Dom Casmurro'}, {$push:{fans: {$each:[fan1._id]}}});

    const story = await Story.findOne({title: 'Dom Casmurro'}).populate('fans')
    console.log(story)

    // Adding documentation example
    const fan2 = await Person.create({ name: 'George' });
    await Story.updateOne({title: 'Dom Casmurro'}, {$push:{fans: {$each:[fan2._id]}}});    

    const fan3 = await Person.create({ name: 'Roger' });
    await Story.updateOne({title: 'Dom Casmurro'}, {$push:{fans: {$each:[fan3._id]}}});
}

async function check_if_field_populated() {
    const story = await Story.findOne({title: 'Dom Casmurro'}).populate('fans');
    console.log(story);
    console.log('Is story populated?', story.populated('fans')); // Returns a truth value
    story.depopulate('fans')
    console.log(story);
    console.log('Is story populated?', story.populated('fans'));
}

async function what_if_no_foreign_doc() {
    // Populate an Story that haven't author
    await Person.deleteOne({name: 'Machado de Assis'});
    const story = await Story.findOne({name: 'Dom Casmurro'}).populate('author');
    const story1 = await Story.findOne({name: 'Dom Casmurro'});
    console.log(story1); 

    // Adding Machado de Assis again
    const newAuthor = await Person.create({'name': 'Machado de Assis', 'age': 45});
    await Story.updateOne({title: 'Dom Casmurro'}, {author: newAuthor._id})
    console.log(newAuthor)
}

async function field_selector() {
    // Only specific fields for the populated documents
    const story = await Story.findOne({'title': 'Dom Casmurro'}).populate('author', 'name') // Only returns the persons name
    console.log(story)
}

async function populating_multiple_paths() {
    // If I want to populate both authors and fans
    const story = await Story.findOne({title: 'Dom Casmurro'}).populate('author').populate('fans')
    console.log(story) // Both paths took effect????
}

async function query_conditions() {
    /* Populate our fans array based on their age and select just their names */
    const story = await Story.findOne({'title': 'Dom Casmurro'}).populate({path: 'fans', match: {age: {$gt: 15}}, select: 'name -_id'})
    console.log(story)

    // Doesn't satisfing match || IT WORKED!!
    const story_null = await Story.findOne({'title': 'Dom Casmurro'}).populate({path: 'author', match: {name: {$ne: 'Machado de Assis'}}, select: 'name -_id'})
    console.log('Deve retornar null:', story_null.author)
}

async function main() {
    // saving_refs();
    // populate()
    // setting_populated_fields() 
    // check_if_field_populated();
    // what_if_no_foreign_doc();
    // field_selector();
    // populating_multiple_paths();
    query_conditions();
}

main ();