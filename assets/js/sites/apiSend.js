$(function () {
  getUserData();

  $(document).on("click", ".send_api_button", function(e) {
    e.preventDefault();
    if (isUserLoggedIn()) {
      $("#send_api_form").submit();
    } else {
      var formElement = $(this).next();
      if (formElement
        && formElement.prop
        && formElement.attr
        && formElement.prop('tagName') === 'FORM'
        && formElement.attr('action').trim().length > 0) {
        globalInfo("returnUrl", $(this).next().attr('action'), {path: "/"});
        globalInfo("isFormReturnUrl", 1, {path: "/"});
      } else {
        globalInfo("returnUrl", location.href, {path: "/"});
      }
      toLocationHref(link.loginUser);
    }
  });

  function getUserData() {
    // Send api to get data
    if (isUserLoggedIn()) {
      var contractTermId = globalInfo("contract_term_id");
      var id = globalInfo("id_" + contractTermId);
      var jwt = globalInfo("jwt_" + contractTermId);
      return $.ajax({
        url: rootVariables.apiUrl + '/students/' + id + '/me',
        type: 'get',
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': 'application/json'
        }
      }).done(wrapUserData).fail(function (err) {
        console.log(err);
      });
    }
  }

  function wrapUserData(rs) {
    // kokoshiritsu : university.public_type　 *for only https://www.diamond-enquete.jp/
    var sendData = {
      uid: rs.data.temporary_id,
      name_sei: rs.data.family_name,
      name_mei: rs.data.given_name,
      daigaku: rs.data.university,
      gakubu: rs.data.department,
      gakka: rs.data.section,
      bunri: rs.data.department_type_id,
      zip: rs.data.postcode,
      address: rs.data.prefecture + rs.data.city + rs.data.address_line1 + (rs.data.address_line2 !== null ? rs.data.address_line2 : ""),
      phone: rs.data.mobile,
      mobile: rs.data.tel !== null ? rs.data.tel : "",
      email: rs.data.email1,
      kokoshiritsu: rs.data.university_public_type
    };

    // Assign value
    for (var key in sendData) {
      var input = $("<input type='hidden' name='" + key + "' value='" + sendData[key] + "'>");
      $("#send_api_form").append(input);
    }
  }

});
