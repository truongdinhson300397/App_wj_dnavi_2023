const jwt = globalInfo('jwt_' + contractTermId);
const id = globalInfo('id_' + contractTermId);

function getCurrentTimestamp() {
    return new Date().getTime();
}

function EventProcessor() {
    const beaconInfoStatus = {
        JUST_INIT: 1,
        PROCESSING: 2,
        DONE: 3,
    };
    const NotificationType = {
        NOT_LOGGED_IN: 1,
        ALREADY_PARTICIPATED: 2,
        HOLD_DATA: 3,
    };
    const minimumAccuracy = 1;
    const throttleRequestTime = 60; // seconds
    const applicanWrapper = new ApplicanWrapper();
    this.getData = function (key) {
        return applicanWrapper.simpleStorage.get(key);
    }
    this.getObjectData = function (key) {
        return this.getData(key).then((resp) => {
            return new Promise((resolve, reject) => {
                resolve(!_.isEmpty(resp) ? JSON.parse(resp + '') : {});
            });
        });
    }
    this.getArraytData = function (key) {
        return this.getData(key).then((resp) => {
            return new Promise((resolve, reject) => {
                resolve(!_.isEmpty(resp) ? JSON.parse(resp + '') : []);
            });
        });
    }
    this.saveData = function (key, value) {
        return applicanWrapper.simpleStorage.set(key, value);
    }
    this.generateStoreKey = function (beaconInfo) {
        return beaconInfo.uuid + beaconInfo.major;
    }
    this.filterBeaconInfo = async function (beaconInfo) {
        const storeKey = this.generateStoreKey(beaconInfo);
        // beaconInfo {
        //     uuid: '',
        //     major: 0,
        //     last_call: datetime,
        //     status: beaconInfoStatus
        // }
        // if receive incorrect accuracy, do nothing
        if (beaconInfo.accuracy === -1 || beaconInfo > minimumAccuracy) return false;
        //
        const oldBeaconInfo = await this.getObjectData(storeKey);
        if (oldBeaconInfo !== null) {
            const newLastCall = new Date(oldBeaconInfo.last_call + throttleRequestTime * 1000).getTime();
            // if status is done or just call, nothing to do
            if (oldBeaconInfo.status === beaconInfoStatus.DONE
                || (oldBeaconInfo.status === beaconInfoStatus.PROCESSING && oldBeaconInfo.started_at + 30 * 1000 < getCurrentTimestamp())
                || newLastCall > getCurrentTimestamp()) return false;
            await this.saveData(storeKey, {...beaconInfo, last_call: getCurrentTimestamp(), status: beaconInfo.status || beaconInfoStatus.JUST_INIT});
            return true;
        }
        await this.saveData(storeKey, {...beaconInfo, last_call: getCurrentTimestamp(), status: beaconInfoStatus.JUST_INIT});
        return true;
    }
    this.displayLocalNotification = function (fireDateUnixTime, repeat, message, alertId, url) {
        const options = {
            alertBody: message,
            uri: url,
            fireDate: fireDateUnixTime,
            alertAction: "開く",				//iOSのみ
            applicationIconBadgeNumber: 1,			//iOSのみ
        };
        if (typeof alertId !== "undefined") {
            options.alertId = alertId;
        }
        if (typeof repeat !== "undefined" && repeat !== false) {
            options.repeatInterval = repeat; // "minute"
        }
        return applicanWrapper.localNotification.schedule(options);
    }
    this.saveBeaconInfoForRegister = async function (beaconInfo) {
        const saveKey = beaconInfo.uuid + beaconInfo.major;
        let offlineInfoMap = await this.getObjectData('offlineInfoMap') || [];
        let offlineInfo = await this.getObjectData('offlineInfo') || [];
        // if exists do not save again
        if (offlineInfoMap.findIndex(saveKey) === -1) return;
        offlineInfo.push(beaconInfo);
        offlineInfoMap.push(saveKey);
        await this.saveData('offlineInfoMap', offlineInfoMap);
        await this.saveData('offlineInfo', {...offlineInfo, save_date: getCurrentTimestamp()});
    };
    this.preRegister = async function (beaconInfo) {
        if (!await this.filterBeaconInfo(beaconInfo)) return;
        // display when user didn't login
        if (!isUserLoggedIn()) {
            this.displayLocalNotification(getCurrentTimestamp() / 1000 + 5, false, 'ログイン後にイベント受付が可能です', NotificationType.NOT_LOGGED_IN);
            await this.saveBeaconInfoForRegister(beaconInfo);
            return;
        }
        // display local notification when offline
        if (!isOnline()) {
            this.displayLocalNotification(getCurrentTimestamp() / 1000 + 5, false,'参加を受け付けましたが、完了しませんでした。電波状況の良い場所で再度アプリを起動することで再度参加処理が行われます。', NotificationType.HOLD_DATA);
            await this.saveBeaconInfoForRegister({...beaconInfo, user_id: id});
            return;
        }
        console.log('register ', beaconInfo.uuid, beaconInfo.major);
        await this.register(beaconInfo);
    };
    this.register = async function (beaconInfo) {
        const storeKey = this.generateStoreKey(beaconInfo);
        const oldBeaconInfo = await this.getObjectData(storeKey);
        await this.saveData(storeKey, {oldBeaconInfo, status: beaconInfoStatus.PROCESSING, started_at: getCurrentTimestamp()});
        await this.saveData(storeKey, {oldBeaconInfo, status: beaconInfoStatus.DONE});
    }
    this.process = function () {
        // check available to call

        // register if never call it before
        applicanWrapper.beacon.init().then(
            applicanWrapper.beacon.stopMonitoring
        ).then(
            applicanWrapper.beacon.startMonitoring
        ).then(
            () => {
                const beaconInfo = {
                    uuid: '00000000-0000-0000-0000-000000000000'
                };
                return applicanWrapper.beacon.watchBeacon(beaconInfo, async (beaconInfo) => {
                    // console.log('Received: ', beaconInfo);
                    await this.preRegister(beaconInfo);
                }, () => {
                    console.log('success to watch');
                });
            }
        ).then((newBeaconInfo) => {
            console.log('watch ID: ', newBeaconInfo);
        }).catch((err) => {
            console.log('Something went wrong!', err);
        });
    }
}

document.addEventListener('deviceready', function () {
    const eventProcessor = new EventProcessor();
    eventProcessor.process();
});
