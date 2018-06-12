function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

function formatSeconds(time) {
  var h = 0,
    m = 0,
    s = 0,
    _h = '00',
    _m = '00',
    _s = '00';
  h = Math.floor(time / 3600);
  time = Math.floor(time % 3600);
  m = Math.floor(time / 60);
  s = Math.floor(time % 60);
  _s = s < 10 ? '0' + s : s + '';
  _m = m < 10 ? '0' + m : m + '';
  _h = h < 10 ? '0' + h : h + '';
  return _m + ":" + _s;
}

module.exports = {
  formatTime: formatTime,
  formatLocation: formatLocation,
  formatSeconds:formatSeconds
}