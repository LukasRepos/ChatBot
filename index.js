if (!process.env.NODE_ENV) {
     process.env.NODE_ENV = 'development'
}

const brain = require('brain.js');
const fs = require('fs');
const http = require('http');
const path = require('path');
const natural = require('natural');
const stemmer = natural.PorterStemmer;

let backgroundProcesses = [
     require('./processes/news').run()
];
Promise.all(backgroundProcesses);

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
          path: element.path,
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

const net = new brain.NeuralNetwork({
     hiddenLayers: [30],
     activation: 'sigmoid'
});

net.fromJSON(JSON.parse(fs.readFileSync(path.resolve("./model.json"), "utf8")));

const server = http.createServer((request, response) => {
     let body = '';
     request.on('data', chunk => {
          body += chunk.toString();
     });

     request.on("end", () => {
          response.writeHead(200, { "Content-Type": "text/plain" });
          if (body !== '') {
               let processedBody = stemmer.tokenizeAndStem(body);
               let input = new Array(bagOfWords.length).fill(0);

               processedBody.forEach(word => {
                    if (bagOfWords.indexOf(word) >= 0) {
                         input[bagOfWords.indexOf(word)] = 1;
                    }
               });

               let netResult = net.run(input);
               let max = 0;
               for (let i = 0; i < bagOfWords.length; i++) {
                    if (netResult[i] > netResult[max]) {
                         max = i;
                    }
               }

               if (process.env.NODE_ENV === 'development') {
                    console.log("Network results:");
                    console.log(netResult);
               }
               if (netResult[max] > 0.70) {
                    processedData.forEach(data => {
                         if (data.tag == bagOfTags[max]) {
                              if (process.env.NODE_ENV === 'development') {
                                   console.log("Choosed: " + max);
                                   console.log("Chosed tag: " + bagOfTags[max]);
                              }
                              if (data.path != undefined) {
                                   let predicate = require("./intents/" + data.path);
                                   response.write(predicate.run());
                              } else {
                                   response.write(data.responses[Math.floor(Math.random() * data.responses.length)]);
                              }
                              return;
                         }
                    });
               } else {
                    response.write("I didn't understand...");
               }

          }
          response.end('');
     });
});

server.listen(process.env.PORT || 5000);