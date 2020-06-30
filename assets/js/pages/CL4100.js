_headerUIHandler(null, null, null);

if (_.isUndefined(contractTermId)) {
    window.location.href = '/';
}

var urlHelper = new UrlHelper();
var $internshipWrapper = $('#internshipWrapper');
var $industryWrapper = $('#industries');
var $selectBoxMonth = $('#select-box-month');
var $prefectureWrapper = $('#prefectures');
var $showMore = $('.intern-more');
var $groupSearch = $('#group-search-select-box');
var $jsSearchBtn = $('#js-search-btn');
var $searchResultBox = $('.search-result-box');
var $keywordsBox = $('.keywords-box');

var cPartnerId = globalInfo('partner_id');
var partnerId = _.isUndefined(cPartnerId) || _.isEmpty(cPartnerId) ? 0 : cPartnerId;

// Pagination
var perPage = 5;
var page = 1;
var searchKeyWord = null;
var searchIndustrie = null;
var searchMonth = null;
var searchPrefecture = null;
var searchImplement = null;

function _fetchAllIndustry() {
    $.ajax({
        url: rootVariables.apiUrl + '/master_data/industry_types_for_company?per_page=999999',
        dataType: 'json',
        type: 'GET',
        headers: {
            contentType: 'application/json',
            accept: 'application/json'
        },
        success: function (res) {
            var industries = res.data;
            if (industries.length > 0) {
                _generateIndustry(industries);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function _fechAllPrefecture() {
    $.ajax({
        url: rootVariables.apiUrl + '/master_data/prefectures?per_page=999999',
        dataType: 'json',
        type: 'GET',
        headers: {
            contentType: 'application/json',
            accept: 'application/json'
        },
        success: function (res) {
            var prefectures = res.data;
            if (prefectures.length > 0) {
                _generatePrefecture(prefectures);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function _fetchInternship(_isShowMore, _page, _perPage) {
    _page = page || 1;
    _perPage = _perPage || 10;
    // NOTE : approve_status='1,2' mean get all internships including waiting for approval.
    $.ajax({
        url: rootVariables.apiUrl + '/internships',
        dataType: 'json',
        type: 'GET',
        headers: {
            contentType: 'application/json',
            accept: 'application/json'
        },
        data: {
            contract_term_id: contractTermId,
            partner_id: partnerId,
            keyword: searchKeyWord,
            industry_id: searchIndustrie,
            prefecture_id: searchPrefecture,
            month: searchMonth,
            term_select: searchImplement,
            per_page: _perPage,
            page: _page,
            approve_status: '1,2'
        },
        success: function (res) {
            var internships = res.data;

            $searchResultBox.empty();
            $searchResultBox.append('<span class="search-result-num">' + res.pagination.total + '</span>社が検索されました。');

            if (internships.length > 0) {
                _generateIntership(internships);

                var totalItem = res.pagination.total;
                if (totalItem > 10) {
                    $showMore.show();
                } else {
                    $showMore.hide();
                }

                if (_isShowMore) {
                    var totalPages = parseInt(res.pagination.totalPages);
                    if (page < totalPages) {
                        page = _page + 1;
                    } else {
                        $showMore.hide();
                    }
                }
            } else {
                $('#imminentHeader').hide();
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            $showMore.hide();
            $searchResultBox.text();
            $searchResultBox.hide();
            $searchResultBox.text();
            $searchResultBox.hide();
            console.log(errorThrown);
            $internshipWrapper.text('該当のインターンシップはありません。');
        }
    });
}

function _generateIndustry(_industries) {
    $industryWrapper.append('<option value="">業種</option>');
    _.forEach(_industries, function (__indus, __idx) {
        $industryWrapper.append('<option value="' + __indus.industry_type_for_company_id + '" name="' + __indus.industry_type + '">' + __indus.industry_type + '</option>');
    });
}

function _generateIntership(_internships) {
    _.forEach(_internships, function (__internship, __idx) {
        var getMonthDate = (__internship.entry_term_date !== null) ? moment(__internship.entry_term_date).format('MM月DD日') : '';
        var monthDateTemplate = getMonthDate ? '<div class="intern-deadline">応募期限：' + getMonthDate + '</div>' : '';
        var yearFrom = (__internship.internship_year_from !== null) ? (__internship.internship_year_from + '年') : '';
        var monthFrom = (__internship.internship_month_from !== null) ? (__internship.internship_month_from + '月') : '';

        var yearTo = (__internship.internship_year_to !== null) ? (' 〜 ' + __internship.internship_year_to + '年') : '';
        var monthTo = (__internship.internship_month_to !== null) ? (__internship.internship_month_to + '月') : '';
        $internshipWrapper.append(
            '<li class="intern-ul-li">' +
            '  <div class="intern-info-box">' +
            '    <div class="intern-loc">' + __internship.place_select_string + '</div>' +
            '    <div class="intern-dateday">' + yearFrom + monthFrom + yearTo + monthTo + '</div>' +
            '    <div class="intern-length">' + __internship.term_select_string + '</div>' +
            '    <div class="intern-cmp">' + __internship.company.company_name + '</div>' +
            '    <div class="intern-ttl">' + __internship.title + '</div>' +
            '  </div>' +
            '  <div class="intern-btn-box">' +
            monthDateTemplate +
            '    <a href="/company/detail?company_id=' + __internship.company_id + '&go_tab=internship&internship_id=' + __internship.internship_id + '" class="btn-small btn-blue">詳細</a>' +
            '  </div>' +
            '</li>'
        );
    });
}

function _generatePrefecture(_prefectures) {
    $prefectureWrapper.append('<option value="">開催場所</option>');
    _.forEach(_prefectures, function (__prefect, __idx) {
        $prefectureWrapper.append('<option value="' + __prefect.prefecture_id + '" name="' + __prefect.prefecture + '">' + __prefect.prefecture + '</option>');
    });
}

function _showMore(e) {
    e.preventDefault();
    _fetchInternship(true, page, perPage);
}

function _clearText() {
    $internshipWrapper.empty();
    $showMore.hide();
}

function _resetPagination() {
    page = 1;
    perPage = 5;
    // searchKeyWord = null;
}

function _resetSelectBox() {
    searchIndustrie = null;
    searchMonth = null;
    searchPrefecture = null;
    searchImplement = null;
}

function _searchByKeyword() {
    $('#search-by-keyword-btn').on('click', function () {
        localStorage.removeItem('searchDetail');
        _resetSelectBox();
        _resetPagination();
        _clearText();
        _hideSearchAdvance();

        // remove header text
        $('#imminentHeader').hide();

        searchKeyWord = $('#value-search-keyword').val() || '';
        $searchResultBox.empty();
        $searchResultBox.show();
        $keywordsBox.empty();
        $keywordsBox.show();

        _fetchInternship(false, 1, 10, searchKeyWord);
        $keywordsBox.append('<span class="keywords">' + searchKeyWord + '</span>');
    });
}

function _searchSelectBox() {
    $('#js-search-btn').on('click', function () {
        localStorage.removeItem('searchDetail');
        _hideSearchAdvance();
        _clearText();

        $('#imminentHeader').hide();

        searchIndustrie = $industryWrapper.val();
        searchMonth = $selectBoxMonth.val();
        searchPrefecture = $prefectureWrapper.val();

        $searchResultBox.empty();
        $searchResultBox.show();
        $keywordsBox.empty();
        $keywordsBox.show();

        _fetchInternship(false, _page = 1, _perPage = 10, searchIndustrie, searchMonth, searchPrefecture);
        var nameIndustry = $industryWrapper.find('option:selected').attr('name') || '';
        var nameMonth = $selectBoxMonth.find('option:selected').attr('name') || '';
        var namePrefecture = $prefectureWrapper.find('option:selected').attr('name') || '';

        var arrSearchSelectBox = [nameIndustry, nameMonth, namePrefecture];
        $keywordsBox.empty();
        _.forEach(arrSearchSelectBox, function (__value, __idx) {
            if (__value) {
                $keywordsBox.append('<span class="keywords"> ' + __value + '</span>');
            }
        });
    });
}

function _hideSearchAdvance() {
    $groupSearch.hide();
    $jsSearchBtn.hide();
}

function _searchDetail() {
    searchKeyWord = urlHelper.getParamByName('keywords');
    searchIndustrie = urlHelper.getParamByName('industries');
    searchMonth = urlHelper.getParamByName('months');
    searchImplement = urlHelper.getParamByName('implements');
    searchPrefecture = urlHelper.getParamByName('prefectures');

    if (searchKeyWord !== null || searchIndustrie !== null || searchMonth !== null || searchImplement !== null || searchPrefecture !== null) {
        _hideSearchAdvance();
        $searchResultBox.empty();
        $searchResultBox.show();
        $keywordsBox.empty();
        $keywordsBox.show();
        $keywordsBox.empty();
        $('#imminentHeader').hide();

        var getLocalStorage = localStorage.getItem('searchDetail');
        var nameSearDetail = JSON.parse(getLocalStorage);

        _.forEach(nameSearDetail, function (_name) {
            if (_name !== null) {
                $keywordsBox.append('<span class="keywords"> ' + _name + '</span>');
            }
        });

        _fetchInternship(false, 1, 10, searchKeyWord, searchIndustrie, searchMonth, searchImplement, searchPrefecture);
    } else {
        _fetchInternship();
    }
}

$(function () {
    _searchDetail();
    _resetPagination();
    _searchByKeyword();
    _fetchAllIndustry();
    _fechAllPrefecture();
    _searchSelectBox();
});
