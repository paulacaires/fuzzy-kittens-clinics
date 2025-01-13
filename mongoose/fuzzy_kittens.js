// Arquivo principal
const mongoose = require('mongoose');
const Kitten = require('./Kitten');
const Clinical = require('./Clinical');

mongoose.connect('mongodb://127.0.0.1:27017/fuzzy_kittens_db');

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
  await q.exec();
  // Executar a função abaixo gera o erro: "Query was already executed"
  // await q.exec(); 
  // await q.clone().exec();

  console.log("=  =   =   =   =   =    =    =");
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

main()

async function main() {  
  // await Kitten.insertMany(kittens);
  
  // superPoderosas();
  // insereConsultas();

  // Queries
  query();

}
