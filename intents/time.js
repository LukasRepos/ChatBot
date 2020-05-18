module.exports = {
    run: () => {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let date = new Date();
        return "Today is day " + date.getDate() + " of month " + months[date.getMonth()] + " of the year " + date.getFullYear() + " (" + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + ")";
    }
}