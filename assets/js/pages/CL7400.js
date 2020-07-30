_headerUIHandler(null, null, true);
var contractTermId = globalInfo("contract_term_id");
var http = new Http(rootVariables.apiUrl);
var studentId = globalInfo('id_' + contractTermId);
var token = globalInfo('jwt_' + contractTermId);
var $email1 = $('input[name=email1]');
var $email1_confirmation = $('input[name=email1_confirmation]');
var $email2 = $('input[name=email2]');
var $email2_confirmation = $('input[name=email2_confirmation]');
var $alert_email1 = $('#alert-email1');
var $alert_email1_confirmation = $('#alert-email1-confirmation');
var $alert_email2 = $('#alert-email2');
var $alert_email2_confirmation = $('#alert-email2-confirmation');
$('.form-alert').hide();

function scrollTop() {
    $('body, html').animate({scrollTop: 0}, 500);
}

function _fetchUpdateEmail(_postData) {
    $.ajax({
        url: rootVariables.apiUrl + '/students/' + studentId + '/update_email_contact',
        dataType: 'json',
        type: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        data: _postData,
        success: function (res) {
            var status = res.status;
            if (status === 'success') {
                toLocationHref(link.myPageResetMailComplete);
            }
        },
        error: function (error, jqXhr, textStatus, errorThrown) {
            $('#div-err').show();
            if (error && error.responseJSON && (_.isObject(error.responseJSON.errors) || _.isArray(error.responseJSON.errors))) {
                var errors = error.responseJSON.errors;
                var show_errors = '';
                _.forEach(errors, function (error) {
                    _.forEach(error, function (err) {
                        show_errors += '<p>' + err + '</p>';
                    });
                });
                $('#div-err').html(show_errors);
                scrollTop();
            }

        }
    });
}

function formAdjust(a) {
    // 配列を逆順にチェックしてvalueが空のものを削除
    for (i = a.length - 1; i > -1; i--) {
        if (a[i]['value'] == '') {
            a.splice(i, 1);
        }
    }

    // nameに[]が含まれるものをカンマを付けてまとめる
    var p = [];

    for (i = a.length - 1; i > -1; i--) {
        var n = a[i]['name'];
        if (n.match(/\[\]/)) {
            n = n.replace(/\[\]/g, '');
            if (!p[n]) {
                p[n] = [];
            }
            p[n] = a[i]['value'] + ',' + p[n];
            a.splice(i, 1);
        }
    }

    // カンマを付けてまとめたものを配列に戻す
    for (key in p) {
        p[key] = p[key].replace(/\,$/g, '');
        a.push({name: key, value: p[key]});
    }

    // 整理できた配列を検索APIに投げやすいようにオブジェクト形式に変更
    var obj = {};
    for (i in a) {
        obj[a[i]['name']] = a[i]['value'];
    }
    return obj;
}

function updateEmail() {
    $('#update-email').click(function () {

        if ($email1.val() === '') {
            $email1.addClass('input-alert');
            $alert_email1.show();
        } else {
            $email1.removeClass('input-alert');
            $alert_email1.hide();
        }
        if ($email1_confirmation.val() === '') {
            $email1_confirmation.addClass('input-alert');
            $alert_email1_confirmation.show();
        } else {
            $email1_confirmation.removeClass('input-alert');
            $alert_email1_confirmation.hide();
        }

        if (!_.isEmpty($email2.val())) {
            if ($email2_confirmation.val() === '') {
                $email2_confirmation.addClass('input-alert');
                $alert_email2_confirmation.show();
            } else {
                $email2_confirmation.removeClass('input-alert');
                $alert_email2_confirmation.hide();
            }
        }

        var fields = $(':input').serializeArray();
        var datas = formAdjust(fields);

        var defaultPostData = {
            email1: null,
            can_email1: null,
            email1_confirmation: null,
            email2: null,
            can_email2: null,
            email2_confirmation: null
        };
        datas = _.merge(defaultPostData, datas);
        if (typeof isApplican !== "undefined" && isApplican) {
            _.assign(datas, {is_applican: true});
        }
        var postData = JSON.stringify(datas);

        _fetchUpdateEmail(postData);
    });
}

function fetchCurrentUser() {
    var url = '/students/' + studentId + '/me';

    function fetchSuccess(res) {
        var user = res.data;
        dumpUserEmailInfo(user);
    }

    http.fetchOne(url, null, token, fetchSuccess, null, false);
}

function dumpUserEmailInfo(user) {
    var _email1 = trimStr(user.email1);
    var _email2 = trimStr(user.email2);

    if (user.user_contact) {
        var contact = user.user_contact;
        var _canEmail1 = string2literal(contact.can_email1) ? 1 : 0;
        var _canEmail2 = string2literal(contact.can_email2) ? 1 : 0;
    }

    if (!_.isEmpty(_email1)) {
        $('[name="email1"]').val(_email1);
        $('[name="email1_confirmation"]').val(_email1);
    }
    if (!_.isEmpty(_email2)) {
        $('[name="email2"]').val(_email2);
        $('[name="email2_confirmation"]').val(_email2);
    }
    $('[name="can_email1"]').val([_canEmail1]);

    // if email text is not empty, enable select radio input
    if($("input[name='email2']").val().length > 0) {
        $("[name='can_email2']").prop("disabled", false);
        $("[name='can_email2'][value='" + _canEmail2 + "']").prop("checked", true);
    }
}

function onKeyUpEmail2() {
    var isNotEmpty = $("input[name='email2']").val().length > 0;

    if(isNotEmpty) {
        $("[name='can_email2'][value='1']").prop("checked", true);
        $("[name='can_email2']").prop("disabled", false);
    } else {
        $("[name='can_email2']").prop("checked", false).prop("disabled", true);
    }
}

$(function () {
    fetchCurrentUser();
    $("input[name='email2']").on("keyup", onKeyUpEmail2);

    // listening...
    updateEmail();
});
