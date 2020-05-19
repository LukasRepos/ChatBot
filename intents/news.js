const newsProcess = require('../processes/news');

module.exports = {
     run: () => {
          let newsList = newsProcess.getStories();
          let news = newsList[Math.floor(Math.random() * newsList.length)];
          if (news) {
               return "One of the news is the '" + news.title + "'! Awesome, isn't it? You can learn more in this link: " + news.url;
          } else {
               return "No news right now... =( Come again later!";
          }
     }
}