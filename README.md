# Fuzzy Kittens Clinics

Modelagem de dados que contém informações clínicas de gatos e as informações deles, como nome, idade, alergias.

## Kittens 
(Schema e modelagem em Kitten.js)
Informação dos animais.


## Clinical
(Schema e modelagem em Clinical.js)
Informações clínicas referentes aos procedimentos que os gatos já passaram.

## To Do:
[] Ver como criar um índice

[] Terminar de implementar a View

[] Ler toda a página de Schemas (O que eu não fiz) https://mongoosejs.com/docs/guide.html#schemas

[] Trabalhar com algum subdocument (Coisa que eu não fiz)

## Ideia de visão
Materialized views are database objects containing the result of a query.
Quero saber o nome dos medicamentos que foram utilizados em appointments e a quantidade.
Fonte: [Dev.to](https://dev.to/ilinieja/mongodb-materialized-views-in-nodejs-mongoose-1593)

## Change Streams
O que eu implementei seguindo a documentação:
```
async function main() { 
 // await Kitten.insertMany(kittens);
  // superPoderosas();
 // insereConsultas();


 Clinical.watch().on('change', data => console.log(data))
 const lindinha_id =  await Kitten.findOne(condition = {name: 'Lindinha'}).select({_id: 1})
 await Clinical.create({ kittens_id: lindinha_id, procedure: 'grooming' });
}
```
De acordo com a documentação: “Note that you must be connected to a MongoDB replica set or sharded cluster to use change streams. If you try to call watch() when connected to a standalone MongoDB server, you'll get the below error.
MongoServerError: The $changeStream stage is only supported on replica sets”
Como eu não estou conectada à nenhum replica set ou sharded cluster, o que eu recebi ao executar a minha implementação foi o erro.
