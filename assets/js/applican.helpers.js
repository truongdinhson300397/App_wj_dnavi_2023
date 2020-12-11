globalInfo = function (key, value, options) {
    if (typeof value === "undefined") {
        return localStorage.getItem(key);
    }
    return localStorage.setItem(key, value);
};
removeGlobalInfo = function (key) {
    return localStorage.removeItem(key);
}
// we will have some functions like handlebar helper function
if (typeof linkOrWebview === "undefined") {
    function linkOrWebview(link, appendRootDomain) {
        if (typeof isApplican !== "undefined" && isApplican) {
            var url = link;
            if (typeof appendRootDomain !== "undefined" && appendRootDomain) {
                url = concatAndResolveUrl(domain, link);
            }
            return 'javascript:applican.launcher.webview(\'' + url + '\');';
        }
        return link;
    }
}

if (typeof linkOrBrowser === "undefined") {
    function linkOrBrowser(link) {
        if (typeof isApplican !== "undefined" && isApplican) {
            return 'javascript:applican.launcher.urlScheme(\'' + link +'\')';
        }
        return link;
    }
}

if (typeof displayWebOnly === "undefined") {
    function displayWebOnly(content) {
        if (typeof isApplican !== "undefined" && isApplican) {
            return '';
        }
        return content;
    }
}

function replaceHrefToWebview(content) {
    var reLink = new RegExp(/href=(['"])(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})(['"])/gm);
    return content.replace(reLink, function (match, g1, g2, g3) {
        return 'href=' + g1 + linkOrWebview(g2) + g3;
    });
}
// Beacon
var watchId;
function beaconError(error){
    var dump = "Error\n";
    dump += "code:" + error.code + "\n";
    alert(error);
    alert(dump);
}
function initError(error) {
    error.reason = 'init error';
    beaconError(error);
}
function monitoringError(error) {
    error.reason = 'monitoring error';
    beaconError(error);
}
function watchError(error) {
    error.reason += 'watch error';
    beaconError(error);
}
function watchBeacon() {
    console.log('watch beacon');
    // 監視するビーコンの情報
    var beaconInfo = { uuid: '11111111-1111-1111-1111-111111111111'};
    // ビーコンの監視の開始
    watchId = applican.beacon.watchBeacon(beaconInfo, watchBeaconResult, watchBeaconSuccess, watchError);
    return watchId;
}
function watchBeaconSuccess(){
    console.log('watch beacon success');
    var dump = "watch id : " + watchId;
    console.log(dump);
}
function watchBeaconResult(beacon) {
    var uuid		= beacon.uuid;		// ビーコンの UUID
    var major		= beacon.major;		// ビーコンのメジャー番号
    var minor		= beacon.minor;		// ビーコンのマイナー番号
    var proximity	= beacon.proximity;	// 距離の精度（0:不明, 1:至近距離, 2:近距離, 3:遠距離）
    var accuracy	= beacon.accuracy;	// ビーコンまでの距離（メートル）
    var rssi		= beacon.rssi;		// 受信信号強度（dBm）
    var dump = "ビーコン情報:\n";
    dump += "uuid : " + uuid + "\n";
    dump += "major : " + major + "\n";
    dump += "minor : " + minor + "\n";
    dump += "proximity : " + proximity + "\n";
    dump += "accuracy : " + accuracy + "\n";
    dump += "rssi : " + rssi + "\n";
    console.log(dump);
}
function startMonitoringSuccess(){
    console.log('startMonitoring Success');
    watchBeacon();
}
function initBeaconSuccess() {
    console.log('initBeacon Success');
    applican.beacon.startMonitoring(startMonitoringSuccess, monitoringError);
}
// document.addEventListener('deviceready', function () {
//     applican.beacon.init(initBeaconSuccess, initError);
// });
function LocalNotificationWrapper(localNotificationInstance) {
    var localNotification;
    if (typeof localNotificationInstance !== "undefined") {
        localNotification = localNotificationInstance;
    } else {
        throw new Error('Missing beacon instance!');
    }
    this.schedule = function (options) {
        return new Promise((resolve, reject) => {
            localNotification.schedule(resolve, reject, options);
        });
    }
    this.cancel = function (options) {
        return new Promise((resolve, reject) => {
            try {
                localNotification.cancel(options);
                resolve();
            } catch (err) {
                resolve(reject);
            }
        });
    };
    this.allCancel = function () {
      return new Promise((resolve, reject) => {
          try {
              localNotification.allCancel();
              resolve();
          } catch (err) {
              reject(err);
          }
      });
    };
    this.getBadgeNum = function () {
        return new Promise((resolve, reject) => {
            try {
                localNotification.getBadgeNum(resolve);
            } catch (err) {
                reject(err);
            }
        });
    }
    this.setBadgeNum = function (badgeNum) {
        return new Promise((resolve, reject) => {
            try {
                localNotification.setBadgeNum(badgeNum);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    };
}
function BeaconWrapper(beaconInstance) {
    var beacon;
    if (typeof beaconInstance !== "undefined") {
        beacon = beaconInstance;
    } else {
        throw new Error('Missing beacon instance!');
    }
    this.init = function () {
        return new Promise(function (resolve, reject) {
            beacon.init(resolve, reject);
        });
    };
    this.startMonitoring = function () {
        return new Promise(function (resolve, reject) {
            beacon.startMonitoring(resolve, reject);
        });
    };
    this.stopMonitoring = function () {
        return new Promise(function (resolve, reject) {
            beacon.stopMonitoring(resolve, reject);
        });
    };
    this.isMonitoring = function () {
        return new Promise(function (resolve, reject) {
            beacon.isMonitoring(resolve, reject);
        });
    };
    this.watchBeacon = function (beaconInfo, resultCallback, successCallback) {
        return new Promise(function (resolve, reject) {
            resolve(beacon.watchBeacon(beaconInfo, resultCallback, successCallback, reject));
        });
    };
    this.clearBeacon = function (watchId) {
        return new Promise(function (resolve, reject) {
            beacon.clearBeacon(watchId, resolve, reject);
        });
    };
    this.getBeaconHistory = function (beaconInfo) {
        return new Promise(function (resolve, reject) {
            beacon.getBeaconHistory(beaconInfo, resolve, reject);
        });
    }
}
function SimpleStorageWrapper(simpleStorageInstance) {
    var simpleStorage;
    if (typeof simpleStorageInstance !== "undefined") {
        simpleStorage = simpleStorageInstance;
    } else {
        throw new Error('Missing simpleStorage instance!');
    }
    this.set = function (key, value) {
        return new Promise(function (resolve, reject) {
            try {
                simpleStorage.set(key, value, resolve);
            } catch (err) {
                reject(err);
            }
        });
    }
    this.get = function (key) {
        return new Promise(function (resolve, reject) {
            try {
                simpleStorage.get(key, resolve);
            } catch (err) {
                reject(err);
            }
        });
    }
    this.remove = function (key) {
        return new Promise(function (resolve, reject) {
            try {
                simpleStorage.remove(key, resolve);
            } catch (err) {
                reject(err);
            }
        });
    }
    this.clear = function () {
        return new Promise(function (resolve, reject) {
            try {
                simpleStorage.clear(resolve);
            } catch (err) {
                reject(err);
            }
        });
    }
}
function ConnectionWrapper(connectionInstance) {
    var connection;
    if (typeof connectionInstance !== "undefined") {
        connection = connectionInstance;
    } else {
        throw new Error('Missing connection instance!');
    }
    this.getCurrentConnectionType = function () {
        return new Promise(function (resolve, reject) {
            connection.getCurrentConnectionType(resolve, reject);
        });
    }
}
function ApplicanWrapper(applicanInstance) {
    if (typeof applicanInstance !== "undefined") {
        this.applican = applicanInstance;
        this.beacon = new BeaconWrapper(this.applican.beacon);
        this.simpleStorage = new SimpleStorageWrapper(this.applican.simpleStorage);
        this.localNotification = new LocalNotificationWrapper(this.applican.localNotification);
        this.connection = new ConnectionWrapper(this.applican.connection);
    } else if(typeof applican !== "undefined") {
        this.applican = applican;
        this.beacon = new BeaconWrapper(applican.beacon);
        this.simpleStorage = new SimpleStorageWrapper(applican.simpleStorage);
        this.localNotification = new LocalNotificationWrapper(applican.localNotification);
        this.connection = new ConnectionWrapper(applican.connection);
    } else {
        throw new Error('Missing applican instance!');
    }
}
function LocalStorageWrapper() {
    this.set = (key, value) => {
        return new Promise((resolve, reject) => {
            try {
                if (typeof value !=='undefined') {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, JSON.stringify({}));
                }
                resolve(value);
            } catch (err) {
                reject(err);
            }
        });
    };
    this.get = (key) => {
        return new Promise((resolve, reject) => {
            try {
                const result = JSON.parse(localStorage.getItem(key));
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    };
    this.remove = (key) => {
        return new Promise((resolve, reject) => {
            try {
                localStorage.removeItem(key);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    };
    this.clear = () => {
        return new Promise((resolve, reject) => {
            try {
                localStorage.clear();
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    };
}
function OfflineData(userId, jwt, partnerId) {
    const applicanWrapper = {
        simpleStorage: new LocalStorageWrapper(),
    };
    this.saveListForAsura = (data) => {
        return applicanWrapper.simpleStorage
            .set('list_for_asura', data);
    }
    this.getListForAsura = () => {
        const formDataOfCompany = {
            contract_term_id: contractTermId,
            partner_id: !(_.isEmpty(partnerId)) ? partnerId : 0,
            per_page: 9999,
            is_asura: true,
        };
        return new Promise((resolve, reject) => {
            $.ajax({
                url: rootVariables.apiUrl + '/companies/list_for_asura',
                dataType: 'json',
                type: 'GET',
                contentType: 'application/json',
                accept: 'application/json',
                data: formDataOfCompany,
                success: (data, textStatus, jqXHR) => {
                    this.saveListForAsura(data).then(() => {
                        resolve(data);
                    }).catch(reject);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    reject(errorThrown);
                }
            });
        });
    };
    this.saveBookedEvents = (data) => {
        return applicanWrapper.simpleStorage.set('booked_events', data);
    };
    this.getBookedEvents = () => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: apiUrl + '/students/' + userId + '/booked_events?contract_term_id=' + contractTermId + '&status=1&per_page=999999',
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + jwt,
                    'Content-Type': 'application/json'
                },
                success: (data, textStatus, jqXHR) => {
                    this.saveBookedEvents(data)
                        .then(() => resolve(data))
                        .catch(reject);
                    // resolve(data);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    reject(errorThrown);
                }
            });
        });
    };
    this.getEvent = (eventId, callback) => {
        return this.getOfflineData('booked_events', function (resp) {
            const event = _.find(resp.data, function (e) {
                return +e.event_id === +eventId;
            });
            if (typeof callback === 'function') {
                callback(event);
            }
        });
    };
    this.saveIsAsuraStudent = (data) => {
        return applicanWrapper.simpleStorage.set('is_asura_student', data);
    };
    this.getIsAsuraStudent = () => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: rootVariables.apiUrl + '/students/' + userId + '/is_asura_student',
                dataType: 'json',
                type: 'GET',
                headers: {
                    Authorization: 'Bearer ' + jwt,
                    ContentType: 'application/json',
                    Accept: 'application/json'
                },
                success: (data, textStatus, jqXHR) => {
                    this.saveIsAsuraStudent()
                        .then(() => {
                            resolve(data);
                        })
                        .catch(reject);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    reject(errorThrown);
                }
            });
        });
    };
    this.saveIsAsuraStudentNew = (data) => {
        return applicanWrapper.simpleStorage.set('is_asura_student_new', data);
    };
    this.getIsAsuraStudentNew = (asuraCompanyId) => {
        if (typeof asuraCompanyId === 'undefined') {
            return null;
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url: rootVariables.apiUrl + '/students/' + userId + '/is_asura_student_new',
                dataType: 'json',
                type: 'GET',
                headers: {
                    Authorization: 'Bearer ' + jwt,
                    ContentType: 'application/json',
                    Accept: 'application/json'
                },
                data: {
                    e2r_pro_id: asuraCompanyId
                },
                success: (data, textStatus, jqXHR) => {
                    this.saveIsAsuraStudentNew(data)
                        .then(() => {
                            resolve(data);
                        })
                        .catch(reject);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    reject(errorThrown);
                }
            });
        });
    };
    this.saveReserves = (data) => {
        return applicanWrapper.simpleStorage.set('get_reserves', data);
    };
    this.getReserves = (_registrantIds) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: apiUrlAsura + '/outside_events/get_reserves',
                dataType: 'json',
                type: 'POST',
                contentType: 'application/json',
                accept: 'application/json',
                data: JSON.stringify({
                    entries:
                        _.map(_registrantIds, function (__e2r) {
                            return {
                                asura_company_id: parseInt(__e2r.e2r_pro_id),
                                asura_student_id: parseInt(__e2r.registrant_id)
                            };
                        })
                }),
                processData: false,
                success: (data, textStatus, jqXHR) => {
                    this.saveReserves(data)
                        .then(() => {
                            resolve(data);
                        }).catch(reject);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    reject(errorThrown);
                }
            });
        });
    };
    this.saveCompanies = (data) => {
      return applicanWrapper.simpleStorage.set('companies', data);
    };
    this.getCompanies = (bookedEventsData) => {
        if (!_.isEmpty(bookedEventsData.data)) {
            const eventIds = bookedEventsData.data.map((event) => {
                return event.event_id;
            });
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: rootVariables.apiUrl + '/students/booked_event_companies',
                    dataType: 'json',
                    type: 'GET',
                    contentType: 'application/json',
                    accept: 'application/json',
                    data: {
                        event_ids: eventIds,
                        contract_term_id: contractTermId
                    },
                    headers: {
                        Authorization: 'Bearer ' + jwt,
                        ContentType: 'application/json',
                        Accept: 'application/json'
                    },
                    success: (data, textStatus, jqXHR) => {
                        this.saveCompanies(data)
                            .then(() => {
                                resolve(bookedEventsData);
                            }).catch(reject);
                    },
                    error: (jqXHR, textStatus, errorThrown) => {
                        reject(errorThrown);
                    }
                });
            });
        }
        return Promise.resolve(bookedEventsData);
    }
    this.getCompanyFromOfflineData = (companyId, callback) => {
        return this.getOfflineData('companies', function (resp) {
            const company = _.find(resp.data, function (e) {
                return +e.company_id === +companyId;
            });
            if (typeof callback === 'function') {
                callback(company);
            }
        });
    }
    this.prepareData = () => {
        if (typeof userId === 'undefined'
            || typeof jwt === 'undefined'
            || typeof partnerId === 'undefined') {
            return console.error('Missing data to store offline data');
        }
        return this.getListForAsura()
            .then(this.getBookedEvents)
            .then(this.getCompanies)
            .then(this.getIsAsuraStudent)
            .then((resp) => {
                const asuraStudent = resp.data;
                if (asuraStudent.length > 0) {
                    const registrants = _.filter(asuraStudent, function (stu) {
                        return stu.user_id === parseInt(userId);
                    });
                    return this.getReserves(registrants);
                }
                return Promise.resolve(null);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    };
    this.cleanData = () => {
      return applicanWrapper
          .simpleStorage.remove('list_for_asura')
          .then(applicanWrapper.simpleStorage.remove('booked_events'))
          .then(applicanWrapper.simpleStorage.remove('companies'))
          .then(applicanWrapper.simpleStorage.remove('is_asura_student'))
          .then(applicanWrapper.simpleStorage.remove('get_reserves'))
          .catch((err) => {
              console.log('failed to remove: ', err);
          });
    };
    this.getOfflineData = (key, callback) => {
        applicanWrapper.simpleStorage.get(key).then((data) => {
            if (typeof callback === 'function') {
                callback(data);
            }
        });
    };
}

function adjustHeaderSpacing() {
    const $header = $('#header')
    $header.length > 0 && $header.height() > 0 && $('.app-contents').css('paddingTop', $header.height())
}

function checkNativeFooterStatus() {
    const tabList = [
        '',
    ];
    const url = window.location.pathname;
    const filename = url.substring(url.lastIndexOf('/')+1);

}
