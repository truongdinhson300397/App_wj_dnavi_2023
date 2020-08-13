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
    var beaconInfo = { uuid: '00000000-0000-0000-0000-000000000000'};
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
function ApplicanWrapper(applicanInstance) {
    if (typeof applicanInstance !== "undefined") {
        this.applican = applicanInstance;
        this.beacon = new BeaconWrapper(this.applican.beacon);
        this.simpleStorage = new SimpleStorageWrapper(this.applican.simpleStorage);
        this.localNotification = new LocalNotificationWrapper(this.applican.localNotification)
    } else if(typeof applican !== "undefined") {
        this.applican = applican;
        this.beacon = new BeaconWrapper(applican.beacon);
        this.simpleStorage = new SimpleStorageWrapper(applican.simpleStorage);
        this.localNotification = new LocalNotificationWrapper(applican.localNotification);
    } else {
        throw new Error('Missing applican instance!');
    }
}
function OfflineData(userId, jwt, partnerId) {
    const applicanWrapper = new ApplicanWrapper();
    this.getListForAsura = async () => {
        const formDataOfCompany = {
            contract_term_id: contractTermId,
            partner_id: !(_.isEmpty(partnerId)) ? partnerId : 0,
            per_page: 9999,
            is_asura: true,
        };
        return await $.ajax({
            url: rootVariables.apiUrl + '/companies/list_for_asura',
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            accept: 'application/json',
            data: formDataOfCompany,
        }).then((data) => {
            return applicanWrapper.simpleStorage.set('list_for_asura', data).then(() => {
                return data;
            });
        })
    };
    this.getBookedEvents = () => {
        return $.ajax({
            url: apiUrl + '/students/' + userId + '/booked_events?contract_term_id=' + contractTermId + '&status=1&per_page=999999',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwt,
                'Content-Type': 'application/json'
            },
        }).then((data) => {
            return applicanWrapper.simpleStorage.set('booked_events', data).then(() => {
                return data;
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
    }
    this.getIsAsuraStudent = async () => {
        return await $.ajax({
            url: rootVariables.apiUrl + '/students/' + id + '/is_asura_student',
            dataType: 'json',
            type: 'GET',
            headers: {
                Authorization: 'Bearer ' + jwt,
                ContentType: 'application/json',
                Accept: 'application/json'
            }
        }).then((data) => {
            return applicanWrapper.simpleStorage.set('is_asura_student', data).then(() => {
                return data;
            });
        });
    };
    this.getIsAsuraStudentNew = async () => {
        return await $.ajax({
            url: rootVariables.apiUrl + '/students/' + id + '/is_asura_student_new',
            dataType: 'json',
            type: 'GET',
            headers: {
                Authorization: 'Bearer ' + jwt,
                ContentType: 'application/json',
                Accept: 'application/json'
            }
        }).then((data) => {
            return applicanWrapper.simpleStorage.set('is_asura_student_new', data).then(() => {
                return data;
            });
        });
    };
    this.getReserves = async (_registrantIds) => {
        return await $.ajax({
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
            processData: false
        }).then((data) => {
            return applicanWrapper.simpleStorage.set('get_reserves', data).then(() => {
                return data;
            });
        });
    };
    this.getCompanies = (bookedEventsData) => {
        if (!_.isEmpty(bookedEventsData.data)) {
            const eventIds = bookedEventsData.data.map((event) => {
                return event.event_id;
            })
            return $.ajax({
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
                }
            }).then((data) => {
                console.log(data);
                return applicanWrapper.simpleStorage.set('companies', data).then(() => {
                    return bookedEventsData;
                });
            });
        }

        return bookedEventsData;
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
        return this.getListForAsura()
            .then(this.getBookedEvents)
            .then(this.getCompanies)
            .then(this.getIsAsuraStudent)
            .then(this.getIsAsuraStudentNew)
            .then((resp) => {
                const asuraStudent = resp.data;
                if (asuraStudent.length > 0) {
                    const registrants = _.filter(asuraStudent, function (stu) {
                        return stu.user_id === parseInt(userId);
                    });
                    return this.getReserves(registrants);
                }
                return null;
            });
    };
    this.getOfflineData = (key, callback) => {
        applicanWrapper.simpleStorage.get(key).then((data) => {
            let newData = data;
            if (!_.isEmpty(data)) {
                newData = JSON.parse(data+'');
            }
            if (typeof callback === 'function') {
                callback(newData);
            }
        });
    };
}
