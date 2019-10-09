const moment = require("moment");
const got = require("got");
const ical = require("ical-generator");

const flatten = list =>
  list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

const clean = (str = "") =>
  str
    .trim()
    .replace(/"/g, "")
    .replace(/'/g, "");

const processWeek = ({ nadal, tunnid }) => {
  return Object.entries(tunnid).map(([day, lesson]) => {
    return lesson.map(l => {
      return {
        week: nadal,
        day: day,
        start: clean(l.algus || ""),
        stop: clean(l.lopp || ""),
        summary: [l.aine, l.ruum, l.grupp].map(l => l).join(", ")
      };
    });
  });
};

async function calendar(teacher_id) {
  const weeks_subtract = 8;
  const weeks_total = 16;
  const base_url = "https://siseveeb.ee/ametikool/veebilehe_andmed/tunniplaan";

  var urls = [];

  for (var i = 0; i < weeks_total + 1; i++) {
    var week = moment()
      .day(1)
      .subtract(weeks_subtract, "w")
      .add(i, "w")
      .format("YYYY-MM-DD");
    urls.push(base_url + "?nadal=" + week + "&opetaja=" + teacher_id);
  }

  const sourceData = await Promise.all(
    urls.map(async url => {
      return await got(url, { json: true });
    })
  );

  const cal = ical({
    timezone: "EET"
  });
  
  flatten(sourceData.map(d => d.body).map(processWeek)).forEach(d => {
    cal.createEvent({
      start: moment(d.day + " " + d.start, "YYYY-MM-DD HH:mm"),
      end: moment(d.day + " " + d.stop, "YYYY-MM-DD HH:mm"),
      timestamp: moment(d.day + " " + d.start, "YYYY-MM-DD HH:mm"),
      summary: d.summary
    });
  });

  return cal.toString();
}

module.exports = calendar
