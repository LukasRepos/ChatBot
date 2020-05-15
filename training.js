const brain = require('brain.js');
const fs = require('fs');
const http = require('http');
const path = require('path');
const natural = require('natural');
const stemmer = natural.PorterStemmer;

const rawData = JSON.parse(fs.readFileSync(path.resolve('./intents.json'), 'utf8'));
const processedData = [];

// tokenize and stem all the patterns
rawData.intents.forEach(element => {
     const patterns = [];

     element.patterns.forEach(pattern => {
          patterns.push(stemmer.tokenizeAndStem(pattern))
     });

     processedData.push({
          tag: element.tag,
          responses: element.responses,
          patterns: patterns
     })
});

// makes the bagOfWords
const bagOfWords = [];
processedData.forEach(data => {
     const words = [];
     data.patterns.forEach(pattern => {
          pattern.forEach(pattern => {
               words.push(pattern);
          });
     });
     words.forEach(word => {
          if (bagOfWords.indexOf(word) < 0) {
               bagOfWords.push(word);
          }
     });
});
const bagOfTags = [];
processedData.forEach(data => {
     if (bagOfTags.indexOf(data.tag) < 0) {
          bagOfTags.push(data.tag)
     }
});

// creates the training data
let trainingData = [];
processedData.forEach(data => {
     data.patterns.forEach(pattern => {
          input = new Array(bagOfWords.length).fill(0);
          output = new Array(bagOfTags.length).fill(0);
          output[bagOfTags.indexOf(data.tag)] = 1;
          pattern.forEach(word => {
               input[bagOfWords.indexOf(word)] = 1;
          });
          trainingData.push({
               input,
               output
          });
     });
});

const net = new brain.NeuralNetwork({
     activation: 'sigmoid', // activation function
     hiddenLayers: [ Math.trunc((bagOfTags.length + bagOfWords.length) / 2) ]
});

net.train(trainingData, {
     log: true,
     logPeriod: 5000,
     iterations: 2000000,
     errorThresh: 0.005,
});

const model = JSON.stringify(net.toJSON());
fs.writeFileSync(path.resolve("./model.json"), model);