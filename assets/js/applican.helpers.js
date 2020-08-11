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
    } else if(typeof applican !== "undefined") {
        this.applican = applican;
        this.beacon = new BeaconWrapper(applican.beacon);
        this.simpleStorage = new SimpleStorageWrapper(applican.simpleStorage);
    } else {
        throw new Error('Missing applican instance!');
    }
}
