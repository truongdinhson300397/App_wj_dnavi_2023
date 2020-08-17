if (typeof jwt === 'undefined') {
    var jwt = globalInfo('jwt_' + contractTermId);
}
if (typeof id === 'undefined') {
    var id = globalInfo('id_' + contractTermId);
}
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
    const minimumAccuracy = 10;
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
    this.checkBeaconInfo = async function (beaconInfo) {
        const storeKey = this.generateStoreKey(beaconInfo);
        // beaconInfo {
        //     uuid: '',
        //     major: 0,
        //     last_call: datetime,
        //     started_at: datetime,
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
                || (
                    oldBeaconInfo.status === beaconInfoStatus.PROCESSING
                    && oldBeaconInfo.started_at + 30 * 1000 > getCurrentTimestamp())
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
        const saveKey = this.generateStoreKey(beaconInfo);
        let offlineInfoMap = await this.getArraytData('offlineInfoMap') || [];
        let offlineInfo = await this.getArraytData('offlineInfo') || [];
        // if exists do not save again
        if (offlineInfoMap.indexOf(saveKey) !== -1) return;
        offlineInfo.push({...beaconInfo, save_date: getCurrentTimestamp(), status: beaconInfoStatus.JUST_INIT});
        offlineInfoMap.push(saveKey);
        await this.saveData('offlineInfoMap', offlineInfoMap);
        await this.saveData('offlineInfo', offlineInfo);
    };
    this.updateSingleOfflineInfo = async function (beaconInfo) {
        const offlineInfo = await this.getArraytData('offlineInfo');
        for (let i = 0; i < offlineInfo.length; i++) {
            if (offlineInfo[i].uuid === beaconInfo.uuid
                && offlineInfo[i].major === beaconInfo.major
                && offlineInfo[i].minor === beaconInfo.minor) {
                offlineInfo[i] = beaconInfo;
            }
        }
        await this.saveData('offlineInfo', offlineInfo);
    }
    this.processOfflineData = function () {
        this.getArraytData('offlineInfo').then((offlineInfo) => {
            _.forEach(offlineInfo, (beaconInfo) => {
                if (beaconInfo.status === beaconInfoStatus.JUST_INIT) {
                    this.register(beaconInfo, async (newBeaconInfo) => {
                        console.log(newBeaconInfo);
                        await this.updateSingleOfflineInfo(newBeaconInfo);
                    });
                }
            });
        });
    }
    this.callApi = async function (userId, eventDateId) {
        return await $.ajax({
            url: rootVariables.apiUrl + '/smart_checkin/checkin',
            dataType: 'json',
            type: 'POST',
            headers: {
                contentType: 'application/json',
                accept: 'application/json'
            },
            data: {
                student_id: userId,
                event_date_id: eventDateId,
            }
        })
    }
    this.preRegister = async function (beaconInfo) {
        const storeKey = this.generateStoreKey(beaconInfo);
        const checkResult = await this.checkBeaconInfo(beaconInfo);
        if (!checkResult) return;
        // display when user didn't login
        if (!isUserLoggedIn()) {
            this.displayLocalNotification(getCurrentTimestamp() / 1000 + 5, false, 'ログイン後にイベント受付が可能です', NotificationType.NOT_LOGGED_IN);
            await this.saveBeaconInfoForRegister(beaconInfo);
            return;
        } else {
            // if user logged in, save it to simple store
            await this.saveData(storeKey, {...beaconInfo, user_id: id});
        }
        // display local notification when offline
        if (!isOnline()) {
            this.displayLocalNotification(getCurrentTimestamp() / 1000 + 5, false,'参加を受け付けましたが、完了しませんでした。電波状況の良い場所で再度アプリを起動することで再度参加処理が行われます。', NotificationType.HOLD_DATA);
            await this.saveBeaconInfoForRegister({...beaconInfo, user_id: id});
            return;
        }
        console.log('register ', beaconInfo.uuid, beaconInfo.major);
        const oldBeaconInfo = await this.getObjectData(storeKey);
        await this.saveData(storeKey, {...oldBeaconInfo, status: beaconInfoStatus.PROCESSING, started_at: getCurrentTimestamp()});
        await this.register(beaconInfo, async () => {
            await this.saveData(storeKey, {...oldBeaconInfo, status: beaconInfoStatus.DONE});
        });
    };
    this.register = async function (beaconInfo, callbackDone) {
        this.callApi(beaconInfo.user_id, beaconInfo.major).then(async (resp) => {
            if (resp.message === 'success') {
                this.displayLocalNotification(getCurrentTimestamp() + 5 * 1000, false, `${resp.event_title}に参加しました`, NotificationType.ALREADY_PARTICIPATED)
            }
            if (typeof callbackDone === "function") {
                await callbackDone({...beaconInfo, status: beaconInfoStatus.DONE});
            }
        });
    }
    this.process = function () {
        // register if never call it before
        applicanWrapper.beacon.init().then(
            applicanWrapper.beacon.stopMonitoring
        ).then(
            applicanWrapper.beacon.startMonitoring
        ).then(() => {
            // default uuid
            return {
                'beacon_uuid': [
                    '2F8018F2-5725-4B06-B197-7BE925ACE9A3',
                    '00000000-0000-0000-0000-000000000000',
                ]
            };
        }).then(
            (resp) => {
                if (!_.isEmpty(resp.beacon_uuid)) {
                    _.forEach(resp.beacon_uuid, (uuid) => {
                        const beaconInfo = {
                            uuid: uuid
                        };
                        return applicanWrapper.beacon.watchBeacon(beaconInfo, async (beaconInfo) => {
                            await this.preRegister(beaconInfo);
                        }, () => {
                            console.log('success to watch');
                        });
                    });
                }
            }
        ).catch((err) => {
            console.log('Something went wrong!', err);
        });
    }
}

document.addEventListener('deviceready', function () {
    if(isOnline() && isUserLoggedIn()) {
        const eventProcessor = new EventProcessor();
        eventProcessor.processOfflineData();
        eventProcessor.process();
    }
});
