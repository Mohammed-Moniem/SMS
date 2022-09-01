const mongoose = require("mongoose");
const Audit = require("../models/Audit");

const regex = new RegExp("^/api/v1/");

module.exports = async function (req, res) {
  if (req.method === "GET") return;
  const audit = new Audit({
    user: req.user,
    method: req.method,
    url: regex.test(req.originalUrl)
      ? req.originalUrl.slice(7)
      : req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    statusCode: res.statusCode,
  });
  await audit.save();
};
