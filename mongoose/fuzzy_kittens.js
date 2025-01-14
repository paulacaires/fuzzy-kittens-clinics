// Arquivo principal
const mongoose = require('mongoose');
const Kitten = require('./Kitten');
const Clinical = require('./Clinical');
const { Employer, VeterinaryEmployer, NurseEmployer } = require('./Employer');

mongoose.connect('mongodb://localhost:27017/fuzzy_kittens_db');

const kittens = [
  { name: "ElGato", contact: '(11) 9852-0023' },
  { name: "Lindinha", age: 12, allergies: ['cebola'], contact: '(11) 5544-3322'},
  { name: "Florzinha", age: 10, allergies: ['paracetamol', 'camarão', 'dipirona'], contact: '(11) 5544-3322'},
  { name: "Docinho", age: 8, allergies: ['buscopan', 'dipirona'], contact: '(11) 5544-3322'},
  { name: "Ursinho", age: 4, allergies: [], contact: '(11) 1111-1111'},
  { name: "Mingau", age: 3, allergies: ['mingau', 'dipirona'], contact: '(22) 1212-1212'},
]

async function superPoderosas() {
  /*
  Função que procura por "Lindinha", "Florzinha" e "Docinho"
  e atualiza o campo livesTogether.
  */

  const lindinha_id =  await Kitten.findOne(condition = {name: 'Lindinha'}).select({_id: 1})
  const docinho_id =  await Kitten.findOne(condition = {name: 'Docinho'}).select({_id: 1})
  const florzinha_id =  await Kitten.findOne(condition = {name: 'Florzinha'}).select({_id: 1})

  await Kitten.updateOne({_id: lindinha_id}, {'livesTogether': [docinho_id, florzinha_id]})
  await Kitten.updateOne({_id: docinho_id}, {'livesTogether': [lindinha_id, florzinha_id]})
  await Kitten.updateOne({_id: florzinha_id}, {'livesTogether': [docinho_id, lindinha_id]})
}

async function insereConsultas() {
  // Lindinha
  const lindinha_id =  await Kitten.findOne(condition = {name: 'Lindinha'}).select({_id: 1})
  // Mingau
  const mingau_id =  await Kitten.findOne(condition = {name: 'Mingau'}).select({_id: 1})
  // Ursinho
  const ursinho_id =  await Kitten.findOne(condition = {name: 'Ursinho'}).select({_id: 1})

  const appointments = [
    { kittens_id: lindinha_id, procedure: 'grooming', wasSuccess: true, medicationUsed: 'anti pulga'},
    { kittens_id: mingau_id, procedure: 'allergy_test', wasSuccess: true, medicationUsed: 'dipirona'},
    { kittens_id: ursinho_id, procedure: 'vaccine', wasSuccess: false, medicationUsed: 'paracetamol'}
  ]

  await Clinical.insertMany(appointments);
}

async function query() {
  // Gatos que tem todas as alergias do ".all"
  const query1 = await Kitten.find().where('allergies').all(['paracetamol', 'dipirona']);
  //console.log(query1);

  // Gatos com mais de 5 anos e que têm alergia à dipirona
  const query2 = await Kitten.find().and([{age: {$gt: 5}}, {allergies: {$in: ['dipirona']}}])
  //console.log(query2);

  // Testando o q.exec().
  const q = Kitten.findOne({title: 'Lindinha'});
  // await q.exec();
  // Executar a função abaixo gera o erro: "Query was already executed"
  // await q.exec(); 
  // await q.clone().exec();

  // Testando o prototype.cursor()
  const cursor = Kitten.find({"age": {$gte: 6}}, projection = {'name': 1, _id: 0}).cursor();
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    console.log(`O nome do gato é ${doc.name}!`);
  }

  // [NÃO FUNCIONA!!] Testando o elemmatch()
  /*
    Match documents that contain an array field with
    at least one element that matches all the specified
    query criteria.
  */
  const query3 = await Kitten.find().elemMatch('allergies', {allergies: "cebola"});
  //console.log(query3);

  // A primeira alergia de todos os gatos
  const query4 = await Kitten.find().select({"name": 1, "allergies": 1, _id: 0}).slice('allergies', 1)
  //console.log(query4);

  // Trying population
  const trio = await Kitten.findOne({name: 'Lindinha'}).populate('livesTogether').select({"livesTogether": 1}).exec();

  console.log(`Os gatos que moram juntos são ${trio.livesTogether}.`)
}

async function query_terca() {
  /*
  Queries de terça-feira.
  Testando o q.exec() para melhorar o código.
  */ 
  const q1 = Kitten.findOne({name: 'Lindinha'}).populate('livesTogether', {'name': 1, _id: 0}).select({"livesTogether": 1});
  //const exec = await q1.exec();
  //console.log(`Os gatos que moram juntos da Lindinha são ${exec.livesTogether}.`)

  // Using async operators
  // Utilizando cursors
  /*for await (const doc of Kitten.find({age: {$gt: 8}}).select({"name": 1, "age": 1, _id: 0})   ) {
    console.log(doc); // Prints documents one at a time
  }*/

  // Trying aggregation
  const aggr_query = await Clinical.aggregate([{ $match: { 'procedure': 'grooming' } }]);
  //console.log(aggr_query);

  // Teste de aggregation com problema de type casting
  /*const test_agg = await Kitten.findOne({name: "Lindinha"})
  const id_lindinha_string = test_agg._id.toString();
  console.log(id_lindinha_string)
  const test_agg_ok = await Kitten.findOne({_id: id_lindinha_string})
  console.log(`Resultado Query: ${test_agg_ok}.`)
  const test_agg_err = await Kitten.aggregate([{$match: {_id: id_lindinha_string}}])
  console.log(`Resultado Aggregation: ${test_agg_err}`)*/

  //const query_filter = Kitten.find({name: 'Docinho'})
  //query_filter.find({age: {$gt: 2}})
  //console.log('O filtro da query:', query_filter.getFilter());

  // Procurar por gatos que miaram mais de 10 vezes.
  const query_casting = await Kitten.find({meowQuantity: {$gt: 10}})
  console.log(query_casting) 
  // Espera-se que não dê erro.
  // Se eu quiser que dê erro: Ir para o Schema e strictQuery: 'throw'

  /*
  const filter = {name: 'Lindinha'}
  const update = {'age': 100}
  const oldDoc = await Kitten.findOneAndUpdate(filter, update);
  console.log(oldDoc.age)
  const newDoc = await Kitten.findOne(filter)
  console.log(`O novo documento: ${newDoc.age}`)
  */
 
  const filter = { name: 'Frajola' };
  const update = { age: 29 };

  const res = await Kitten.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    // Return additional properties about the operation, not just the document
    includeResultMetadata: true
  });

  /*console.log('Res document:', res)
  if (res.lastErrorObject.updatedExisting) {
    console.log('A already existing document was updated.');
  } else {
    console.log('A new document was inserted')
  }*/

  
}

async function employersFunction() {
  // Creating a employers
  const vetEmployers = [
    { type: 'Veterinary', name: 'Michel', age: 54, email: 'michel@gmail.com', VetNumber: 123, speciality: 'oncology'},
    { type: 'Veterinary', name: 'Davi', age: 21, email: 'davi@gmail.com', VetNumber: 456, speciality: 'fuzzy kittens'},
    { type: 'Veterinary', name: 'José', age: 85, email: 'jose@gmail.com', VetNumber: 789}
  ]

  const nurseEmployers = [
    { type: 'Nurse', name: 'João', age: 23, email: 'joao@gmail.com', appliesVaccine: true},
    { type: 'Nurse', name: 'Maria', age: 30, email: 'maria@gmail.com', appliesVaccine: false},
    { type: 'Nurse', name: 'Ana', age: 45, email: 'ana@gmail.com', appliesVaccine: true},
  ]

  //await NurseEmployer.insertMany(nurseEmployers);
  //await VeterinaryEmployer.insertMany(vetEmployers);

  // Trying to add wrong information
  const wrongAdds = [
    { type: 'Teacher', name: 'Laura', age: 23, email: 'laura@gmail.com', appliesVaccine: true},
    { type: 'Programmer', name: 'Alan Turing', age: 30, email: 'alanturing@gmail.com', appliesVaccine: false}
  ]  
  
  await Employer.insertMany(wrongAdds);
}

main()

async function main() {  
  //await Kitten.insertMany(kittens);
  
  //superPoderosas();
  //insereConsultas();

  // Queries
  employersFunction();


}
