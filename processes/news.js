const axios = require('axios').default;

let storyData = [];

module.exports = {
     run: async () => {
          let time = (new Date()).getTime();
          let delta = 0;
          let timer = 60000;

          while (true) {
               if (delta < timer) {
                    delta += (new Date()).getTime() - time;
                    time = (new Date()).getTime();
                    continue;
               } else {
                    delta = 0;
               }

               const response = await axios.get("https://hacker-news.firebaseio.com/v0/beststories.json");
               const rawData = response.data;

               let tmpData = []
               for (let i = 0; i < 10; i++) {
                    const response = await axios.get("https://hacker-news.firebaseio.com/v0/item/" + rawData[i] + ".json");
                    tmpData.push({ title: response.data.title, url: response.data.url });
               }
               storyData = tmpData;
          }
     },
     getStories: () => {
          return storyData;
     }
}