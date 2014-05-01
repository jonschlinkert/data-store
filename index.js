var cheerio = require('cheerio');
var matter = require('gray-matter');
var _ = require('lodash');

var Store = function (html) {
  this.html = html;
};

Store.prototype.set = function(id, context) {
  if (_.isObject(id)) {
    context = id;
    id = undefined;
  }
  context = context || {};

  var page = matter(this.html);
  var _id = id || context.id || 'metadata';

  var metadata = _.extend({}, context, page.context);
  var content = page.content;
  var $ = cheerio.load(content);

  var script = '<script type="text/x-metadata" id="'+_id+'"></script>';

  if ($('#' + _id).length === 0) {
    if ($('body').length) {
      $('body').append(script);
      content = $.html();
    } else {
      content += script;
    }
  }

  $ = cheerio.load(content);
  $('#' + _id).attr('data-metadata', JSON.stringify(metadata));

  this.html = $.html();
};


Store.prototype.get = function(id) {
  var _id = id || 'metadata';
  var results = cheerio.load(this.html)('#' + _id).data('metadata');
  return results;
};


module.exports = function(html) {
  return new Store(html);
};