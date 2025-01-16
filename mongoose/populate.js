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
    const fan1 = await Person.create({name: 'Maria', age: 43})
    await Story.updateOne({title: 'Dom Casmurro'}, {$push:{fans: {$each:[fan1._id]}}});

    //const story = await Story.findOne({title: 'Dom Casmurro'}).populate('fans')
    //console.log(story)

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

    // Doesn't satisfing match 
    const story_null = await Story.findOne({'title': 'Dom Casmurro'}).populate({path: 'author', match: {name: {$ne: 'Machado de Assis'}}, select: 'name -_id'})
    console.log('Deve retornar null:', story_null.author)
}

async function limit_vs_perDocumentLimit() {
  /*
  // Creating two new stories for testing
  await Story.create(
    {title: 'Harry Potter'},
    {title: 'Lusiadas'}
  )

  // Inserting more fans
  const fan1 = await Person.create({ name: 'Mariana' });
  const fan2 = await Person.create({ name: 'Giovana' });
  const fan3 = await Person.create({ name: 'Guilherme' });
  const fan4 = await Person.create({ name: 'Júlia' });
  const fan5 = await Person.create({ name: 'Gustavo' });
  const fan6 = await Person.create({ name: 'Davi' });
  const fan7 = await Person.create({ name: 'Michael' });
  const fan8 = await Person.create({ name: 'Ana' });
  const fan9 = await Person.create({ name: 'Murillo' });
  await Story.updateOne({title: 'Harry Potter'}, {$push:{fans: {$each:[fan1._id, fan2._id, fan3._id, fan4._id, fan5._id, fan6._id, fan7._id]}}});    
  await Story.updateOne({title: 'Lusiadas'}, {$push:{fans: {$each:[fan8._id, fan9._id]}}});
  */

  // Populating using the limit option
  /*
  
  */
  const stories = await Story.find().populate({path: 'fans', options: {limit: 2}});
  //console.log(stories); // The fans of second is []

  /*
  perDocumentLimit is a option that tells Mongoose to execute
  a separate query for each 'story'. So get 2 fans to each story.
  */
  const stories1 = await Story.find().populate({path: 'fans', options: {perDocumentLimit: 2}, transform: stories1 => storySchema == null ? null : stories1.title});
  //const stories1 = await Story.find().populate({path: 'author', transform: story.author => story.author == null? 'Sem autor' : story.author.name});
  console.log(stories1);
}

async function refs_to_children() {
  // Inserting 'Dom Casmurro' as Machado de Assis story (I lost the reference)
  // const dom_casmurro = await Story.findOne({'title': 'Dom Casmurro'});
  // const res = await Person.updateOne({name: 'Machado de Assis'}, {$push: {stories: {$each: [dom_casmurro._id]}}});

  // Want the author to know which stories are theirs. 
  const person = await Person.find({'name': 'Machado de Assis'}).populate('stories')
  console.log(person)
}

async function cross_database_populate() {
  const db1 = mongoose.createConnection('mongodb://localhost:27017/pop_db_1');
  const db2 = mongoose.createConnection('mongodb://localhost:27017/pop_db_2');

  const conversationSchema = new mongoose.Schema({numMessages: Number});
  const Conversation = db2.model('Conversation', conversationSchema);

  const eventSchema = new mongoose.Schema({
    name: String,
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: Conversation
    }
  })

  const Event = db1.model('Event', eventSchema);

  const events = await Event.find().populate('conversation');
  //console.log(events)

  // Or you can specify the model to use for populating
  const events1 = await Event.find().populate({path: 'conversation', model: Conversation})
  console.log(events1);
}

async function dynamic_ref_refPath() {
  /* Populate from multiple collections based on the
  value of a property in the document. */
  const commentSchema = new mongoose.Schema({
    body: {type: String, required: true},
    doc: {
      type: mongoose.Types.ObjectId,
      require: true,
      refPath: 'docModel'
      /* Mongoose will look at the 'docModel' property
      to find the right model */
      /* ref: hardcoded model name */
    },
    docModel: {
      type: String,
      required: true,
      enum: ['BlogPost', 'Product']
    }
  });

  const productSchema = new mongoose.Schema({
    name: String
  });

  const blogPostSchema = new mongoose.Schema({
    title: String
  })

  const Product = mongoose.model('Product', productSchema);
  const BlogPost = mongoose.model('BlogPost', blogPostSchema);
  const Comment = mongoose.model('Comment', commentSchema);

  const book = await Product.create({name: 'Memorias Postumas'});
  const post = await BlogPost.create({title: 'Top 10 French Novels'});

  /*const commentOnBook = await Comment.create({
    body: 'Great read',
    doc: book._id,
    docModel: 'Product'
  });

  const commentOnPost = await Comment.create({
    body: 'Very informative',
    doc: post._id,
    docModel: "BlogPost"
  });*/

  const comments = await Comment.find().populate('doc').sort({ body: 1 });
  //console.log(comments[0].doc.name); 
  //console.log(comments[1].doc.title);
}

async function populate_map() {
  const socialUserSchema = new mongoose.Schema({
    // `socialMediaHandles` is a map whose values are strings. A map's
    // keys are always strings. You specify the type of values using `of`.
    socialMediaHandles: {
      type: Map,
      of: String // Type of value (can be a ObjectId that references a Person)
    }
  });
  
  const SocialUser = mongoose.model('SocialUser', socialUserSchema);
  // Map { 'github' => 'vkarpov15', 'twitter' => '@code_barbarian' }
  console.log(new SocialUser({
    socialMediaHandles: {
      github: 'vkarpov15',
      twitter: '@code_barbarian'
    }
  }).socialMediaHandles);

  // Creating a new user
  const paula = await SocialUser.create({socialMediaHandles: {github: 'paulacaires', twitter: 'paulaTwitter', instagram: 'paulaInstagram', facebook: 'paulaFacebook'}});

  // populate() every element in the map by population the special path members
  const paula_redes = await SocialUser.findOne({}).populate('socialMediaHandles.$*')
  console.log('O meu Instagram:', paula_redes.socialMediaHandles.get('instagram'))
}

async function transform_populated() {
   /* $locals values on populated documents to pass
   parameters to getters and virtuals */
   const internationalizedStringSchema = new mongoose.Schema({
    en: String,
    es: String,
    pt: String,
   });
   
   const ingredientSchema = new mongoose.Schema({
    // 'name' map of language codes to strings
    name: {
      type: internationalizedStringSchema,
      get: function(value) {
        return value[this.$locals.language || 'en'];
      }
    }  
   });

   const recipeSchema = new mongoose.Schema({
    name: String,
    ingredients: [{type: mongoose.ObjectId, ref: 'Ingredient'}]
   });

   const Ingredient = mongoose.model('Ingredient', ingredientSchema)
   const Recipe = mongoose.model('Recipe', recipeSchema)

   // Creating an ingredient
   /*const egg = await Ingredient.create({
    name: {
      en: 'Eggs',
      pt: 'Ovos',
      es: 'Huevos'
    }
   })

   const flour = await Ingredient.create({
    name: {
      en: 'Flour',
      pt: 'Farinha',
      es: 'Harina'
    }
   })

   const recipe_cake = await Recipe.create({name: 'cake', ingredients: [egg._id, flour._id]});*/

   const language = 'pt';
   const recipes = await Recipe.find({'name': 'cake'}).populate({path: 'ingredients', transform: function(doc) {doc.$locals.language = language; return doc;} })

   console.log(recipes[0].ingredients[0].name)
}

async function main() {
    // saving_refs();
    // populate()
    // setting_populated_fields() 
    // check_if_field_populated();
    // what_if_no_foreign_doc();
    // field_selector();
    // populating_multiple_paths();
    // query_conditions();
    // limit_vs_perDocumentLimit()
    // refs_to_children();
    // cross_database_populate();
    // dynamic_ref_refPath();
    // populate_map();
    // transform_populated()
}

main ();
