var _      = require('lodash');
var fs     = require('fs');
var path   = require('path');
var glob   = require('glob');

exports.build = function(metadata, opts) {

  function fileInfo(data, file) {
    return {
      date: data.exif.date || data.fileDate,
      path: file,
      name: path.basename(file),
      video: data.mediaType === 'video',
      size: opts.thumbSize,
      urls: urls(file, data)
    }
  }

  function urls(file, data) {
    if (data.mediaType === 'video') {
      var urls = videoUrls(file);
      urls.download = opts.originalVideos ? urls.original : urls.video;
      return urls;
    } else {
      var urls = photoUrls(file);
      urls.download = opts.originalPhotos ? urls.original : urls.large;
      return urls;
    }
  }

  function videoUrls(file) {
    return {
      thumb:     path.join('media', 'thumbs', ext(file, 'jpg')),
      poster:    path.join('media', 'large',  ext(file, 'jpg')),
      video:     path.join('media', 'large',  ext(file, 'mp4')),
      original:  path.join('media', 'original', file)
    };
  }

  function photoUrls(file) {
    return {
      thumb:     path.join('media', 'thumbs', file),
      large:     path.join('media', 'large', file),
      original:  path.join('media', 'original', file)
    };
  }

  function ext(file, ext) {
    return file.replace(/\.[a-z0-9]+$/i, '.' + ext);
  }

  function byFolder(file) {
    return path.dirname(file.path);
  }

  function folderInfo(files, name) {
    return {
      name: name,
      media: files,
      url: name + '.html'
    };
  }

  var sortFunctions = {
    'name': function(folder) {
      return folder.name;
    },
    'date': function(folder) {
      return _(folder.media).sortBy('date').first().date;
    }
  };

  var chosenSort = sortFunctions[opts.sortFolders];

  return _(metadata).map(fileInfo)
                   .sortBy('date')
                   .groupBy(byFolder)
                   .map(folderInfo)
                   .sortBy(chosenSort)
                   .value();

};
