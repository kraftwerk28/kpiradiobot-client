'use strict';

const date_yyyymmdd = (date) => {
  return date.toISOString().substring(0, 10)
}

const parseDate = (val) => {
  const t = new Date(val * 1000);
  const hh = t.getHours();
  const mm = t.getMinutes();
  return `${hh < 10 ? '0' : ''}${hh}:${mm < 10 ? '0' : ''}${mm}`;
}

module.exports = { date_yyyymmdd, parseDate };
