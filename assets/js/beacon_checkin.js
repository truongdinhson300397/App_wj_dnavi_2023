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
    const minimumAccuracy = 1;
    const throttleRequestTime = 60; // seconds
    const detectTimeLimit = 30; // seconds
    const delayTimeToShowMessage = 1; // seconds
    const applicanWrapper = new ApplicanWrapper();
    this.getData = function (key) {
        return applicanWrapper.simpleStorage.get(key);
    }
    this.getObjectData = function (key) {
        return this.getData(key).then((resp) => {
            return new Promise((resolve, reject) => {
                if (!_.isEmpty(resp)) {
                    if (typeof resp === 'string') {
                        resolve(JSON.parse(resp+''));
                    } else {
                        resolve(resp);
                    }
                } else {
                    resolve({});
                }
            });
        });
    }
    this.getArraytData = function (key) {
        return this.getData(key).then((resp) => {
            return new Promise((resolve, reject) => {
                if (!_.isEmpty(resp)) {
                    if (typeof resp === 'string') {
                        resolve(JSON.parse(resp+''));
                    } else {
                        resolve(resp);
                    }
                } else {
                    resolve([]);
                }
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
        if (beaconInfo.accuracy === -1 || beaconInfo.accuracy > minimumAccuracy) return false;
        //
        const oldBeaconInfo = await this.getObjectData(storeKey);
        if (oldBeaconInfo !== null) {
            // const newLastCall = new Date(oldBeaconInfo.last_call + throttleRequestTime * 1000).getTime();
            // if status is done or just call, nothing to do
            if (oldBeaconInfo.status === beaconInfoStatus.DONE
                || (
                    oldBeaconInfo.status === beaconInfoStatus.PROCESSING
                    && oldBeaconInfo.started_at + throttleRequestTime * 1000 > getCurrentTimestamp())) return false;
            await this.saveData(storeKey, {...oldBeaconInfo, ...beaconInfo, detected_at: getCurrentTimestamp(), status: beaconInfo.status || beaconInfoStatus.JUST_INIT});
            return true;
        }
        await this.saveData(storeKey, {...beaconInfo, detected_at: getCurrentTimestamp(), status: beaconInfoStatus.JUST_INIT});
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
            _.forEach(offlineInfo, async (beaconInfo) => {
                if (beaconInfo.status === beaconInfoStatus.JUST_INIT) {
                    console.log('offline data', beaconInfo);
                    await this.register({...beaconInfo, user_id: id}, async (newBeaconInfo) => {
                        console.log(newBeaconInfo);
                        await this.updateSingleOfflineInfo(newBeaconInfo);
                    });
                }
            });
        });
    }
    this.callApi = function (userId, eventDateId) {
        return new Promise(function (resolve, reject) {
            $.ajax({
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
                },
                success: function (data) {
                    resolve(data);
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    reject(jqXhr);
                    // What's next?
                }
            })
        });
    }
    this.preRegister = async function (beaconInfo) {
        const storeKey = this.generateStoreKey(beaconInfo);
        const checkResult = await this.checkBeaconInfo(beaconInfo);
        if (!checkResult) return;
        let oldBeaconInfo = await this.getObjectData(storeKey);
        // display when user didn't login
        if (!isUserLoggedIn()) {
            if (typeof oldBeaconInfo.last_detected_at !== 'undefined'
                && oldBeaconInfo.detected_at - oldBeaconInfo.last_detected_at < detectTimeLimit * 1000) {
                await this.saveData(storeKey, {...oldBeaconInfo, ...beaconInfo, last_detected_at: getCurrentTimestamp()})
                return;
            }
            this.displayLocalNotification(getCurrentTimestamp() / 1000 + delayTimeToShowMessage, false, '本イベントはスマートチェックインに対応しています。ログインすると、アプリでの参加受付が可能です。 ', NotificationType.NOT_LOGGED_IN);
            await this.saveBeaconInfoForRegister(beaconInfo);
            await this.saveData(storeKey, {...oldBeaconInfo, ...beaconInfo, last_detected_at: getCurrentTimestamp()})
            return;
        }
        // if user logged in, save it to simple store
        await this.saveData(storeKey, {...oldBeaconInfo, ...beaconInfo, user_id: id});
        // display local notification when offline
        if (!isOnline()) {
            if (typeof oldBeaconInfo.last_show_offline_message_at !== 'undefined') {
                return;
            }
            await this.saveData(storeKey, {...oldBeaconInfo, ...beaconInfo, last_show_offline_message_at: getCurrentTimestamp()})
            this.displayLocalNotification(getCurrentTimestamp() / 1000 + delayTimeToShowMessage, false,'参加受付は、完了しませんでした。電波状況の良い場所で再度アプリを起動してください。', NotificationType.HOLD_DATA);
            await this.saveBeaconInfoForRegister({...beaconInfo, user_id: id});
            return;
        }
        // if device is online, remove last_show_offline_message_at key
        await this.saveData(storeKey, {...oldBeaconInfo, ...beaconInfo, last_show_offline_message_at: undefined})
        oldBeaconInfo = await this.getObjectData(storeKey);
        // check throttle request time
        const newLastCall = new Date(oldBeaconInfo.last_call + throttleRequestTime * 1000).getTime();
        if (typeof oldBeaconInfo.last_call !== 'undefined' && newLastCall > getCurrentTimestamp()) {
            return;
        }
        console.log('register ', beaconInfo.uuid, beaconInfo.major);
        await this.saveData(storeKey, {...oldBeaconInfo, last_call: getCurrentTimestamp(), status: beaconInfoStatus.PROCESSING, started_at: getCurrentTimestamp()});
        await this.register({...oldBeaconInfo, user_id: id}, async () => {
            await this.saveData(storeKey, {...oldBeaconInfo, ...beaconInfo, status: beaconInfoStatus.DONE});
        });
    };
    this.register = async function (beaconInfo, callbackDone) {
        this.callApi(beaconInfo.user_id, beaconInfo.major).then(async (resp) => {
            console.log('content message', resp);
            if (resp.message === 'success') {
                this.displayLocalNotification(getCurrentTimestamp() / 1000 + delayTimeToShowMessage, false, `${resp.event_title}の参加受付を行いました。入場後に下記のOKをタップしてください。`, NotificationType.ALREADY_PARTICIPATED)
            }
            if (typeof callbackDone === "function") {
                await callbackDone({...beaconInfo, status: beaconInfoStatus.DONE});
            }
        }).catch((err) => {
            this.displayLocalNotification(getCurrentTimestamp() / 1000 + delayTimeToShowMessage, false, `イベント参加処理に失敗しました。この通知が表示された場合は、お近くのスタッフにお知らせください。`)
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
                    '11111111-1111-1111-1111-111111111111',
                ]
            };
        }).then(
            (resp) => {
                if (!_.isEmpty(resp.beacon_uuid)) {
                    _.forEach(resp.beacon_uuid, (uuid) => {
                        const beaconInfo = {
                            uuid: uuid
                        };
                        return applicanWrapper.beacon.watchBeacon(beaconInfo, async (beaconInfoResult) => {
                            console.log('detected', beaconInfoResult, getCurrentTimestamp());
                            await this.preRegister(beaconInfoResult);
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
    const eventProcessor = new EventProcessor();
    if(isOnline() && isUserLoggedIn()) {
        eventProcessor.processOfflineData();
    }
    window.addEventListener('online', function () {
        if(isOnline() && isUserLoggedIn()) {
            eventProcessor.processOfflineData();
        }
    });
    eventProcessor.process();
});
