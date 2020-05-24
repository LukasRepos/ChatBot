const axios = require('axios').default;

let storyData = [];

module.exports = {
     run: async function() {
          console.log("Fetching news...");
          const response = await axios.get("https://hacker-news.firebaseio.com/v0/beststories.json");
          const rawData = response.data;

          let tmpData = []
          for (let i = 0; i < 10; i++) {
               const response = await axios.get("https://hacker-news.firebaseio.com/v0/item/" + rawData[i] + ".json");
               tmpData.push({ title: response.data.title, url: response.data.url });
          }
          storyData = tmpData;
          console.log("Done fectching news");

          setTimeout(this.run.bind(this), 5 * 60 * 1000); // 5 min between requests
     },
     getStories: () => {
          return storyData;
     }
}