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
     hiddenLayers: [ 30 ]
});

let totalIterations = 200000;
let startTime = (new Date()).getTime();
let currentIteration = 0
net.train(trainingData, {
     iterations: totalIterations,
     errorThresh: 0.005,
     callbackPeriod: totalIterations / 100,
     logPeriod: totalIterations / 100,
     log: true,
     callback: () => {
          currentIteration += totalIterations / 100;
          currentTime = (new Date()).getTime();
          console.log("ETA: " + ((currentTime - startTime) / 1000) * (100 - (100 * currentIteration / totalIterations)));
          startTime = currentTime;
     }
});

const model = JSON.stringify(net.toJSON());
fs.writeFileSync(path.resolve("./model.json"), model);