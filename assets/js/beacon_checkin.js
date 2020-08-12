const contractTermId = globalInfo("contract_term_id");
const apiUrl = rootVariables.apiUrl;
const jwt = globalInfo('jwt_' + contractTermId);
const id = globalInfo('id_' + contractTermId);

function EventProcessor() {
    const beaconInfoStatus = {
        PROCESSING: 0,
        DONE: 1,
    };
    const NotificationType = {
        NOT_LOGGED_IN: 1,
        ALREADY_PARTICIPATED: 2,
        HOLD_DATA: 3,
    };
    const minimumAccuracy = 1;
    const throttleRequestTime = 60; // seconds
    const applicanWrapper = new ApplicanWrapper();
    this.getObjectData = function (key) {
        return applicanWrapper.simpleStorage.get(key).then((resp) => {
            return new Promise((resolve, reject) => {
                resolve(!_.isEmpty(resp) ? JSON.parse(resp + '') : {});
            });
        });
    }
    this.saveObjectData = function (key, value) {
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
        //     status: beaconInfoStatus // 0: did nothing, 1: processed but not finish, 2: done
        // }
        // if receive incorrect accuracy, do nothing
        if (beaconInfo.accuracy === -1 || beaconInfo > minimumAccuracy) return false;
        //
        const oldBeaconInfo = await this.getObjectData(storeKey);
        if (oldBeaconInfo !== null) {
            const newLastCall = new Date(oldBeaconInfo.last_call + throttleRequestTime * 1000).getTime();
            // if status is done or just call, nothing to do
            if (oldBeaconInfo.status === beaconInfoStatus.DONE || newLastCall > new Date().getTime()) return false;
            await this.saveObjectData(storeKey, {...beaconInfo, last_call: new Date().getTime(), status: beaconInfo.status || beaconInfoStatus.PROCESSING});
            return true;
        }
        await this.saveObjectData(storeKey, {...beaconInfo, last_call: new Date().getTime(), status: beaconInfoStatus.PROCESSING});
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
        await this.saveObjectData('offlineInfoMap', offlineInfoMap);
        await this.saveObjectData('offlineInfo', {...offlineInfo, save_date: new Date().getTime()});
    };
    this.preRegister = async function (beaconInfo) {
        if (!await this.filterBeaconInfo(beaconInfo)) return;
        // display when user didn't login
        if (!isUserLoggedIn()) {
            this.displayLocalNotification(new Date().getTime() / 1000 + 5, false, 'ログイン後にイベント受付が可能です', NotificationType.NOT_LOGGED_IN);
            await this.saveBeaconInfoForRegister(beaconInfo);
            return;
        }
        // display local notification when offline
        if (!isOnline()) {
            this.displayLocalNotification(new Date().getTime() / 1000 + 5, false,'参加を受け付けましたが、完了しませんでした。電波状況の良い場所で再度アプリを起動することで再度参加処理が行われます。');
            await this.saveBeaconInfoForRegister({...beaconInfo, user_id: id});
            return;
        }
        console.log('register ', beaconInfo.uuid, beaconInfo.major);
        await this.register(beaconInfo);
    };
    this.register = async function (beaconInfo) {
        const storeKey = this.generateStoreKey(beaconInfo);
        const oldBeaconInfo = await this.getObjectData(storeKey);
        await this.saveObjectData(storeKey, {oldBeaconInfo, status: beaconInfoStatus.DONE});
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
