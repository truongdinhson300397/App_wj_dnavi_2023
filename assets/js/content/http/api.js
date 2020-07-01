// Define GET, POST method using axios library
const api = (function () {
  function get(url) {
    return axios.get(url);
  }

  function post(url, body, config) {
    return axios.post(url, body, config);
  }

  return {
    get: get, post: post
  };

})();
