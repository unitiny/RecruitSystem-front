import {global} from "@/static/static";

function errorText(error, defaultError: string = ""): string {
    if (error["error"] !== undefined && error["error"] !== "") {
        return error["error"]
    }
    return defaultError
}

function diffDay(start: string, end: string): number {
    if (start === "" || end === "") {
        return 0
    }

    let startDay = new Date(start)
    let endDay = new Date(end)
    const diffTime = Math.abs(endDay - startDay);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getAvatar(store) {
    return "D:/GOPATH/src/ItemArea/PersonProject/RecruitSystem/store/avatar/avatar.jpg"
    if(store && store["user"].avatar) {
        return store["user"].avatar
    }
    return global.path.static + '/img/avatar.jpg'
}

function getDateTime(inputDate) {
    // 创建一个新的 Date 对象
    let date = new Date(inputDate);

    // 获取年份、月份和日期
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从 0 开始，所以要加 1
    let day = date.getDate().toString().padStart(2, '0');

    // 获取小时和分钟
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');

    // 格式化日期和时间字符串
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
}


function getDate(s: string): string {
    let date = new Date();

    let year = date.getFullYear();
    let month = date.getMonth() + 1; // 月份从0开始，所以需要加1
    let day = date.getDate();

    // 将月份和日期补零
    month = (month < 10 ? '0' : '') + month;
    day = (day < 10 ? '0' : '') + day;

    return year + s + month + s + day
}

function getTime(): string {
    let currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();

    let hoursString = hours < 10 ? "0" + hours : hours.toString();
    let minutesString = minutes < 10 ? "0" + minutes : minutes.toString();

    return hoursString + ":" + minutesString;
}

function getBackTime(t: string): string {
    if (!t) {
        return getTime()
    }
    let time = t.toString()
    const timeRegex = /(\d{2}:\d{2})/;
    const match = time.match(timeRegex);
    return match ? match[1] : getTime();
}

function getPaymentWay(p) {
    switch (p) {
        case 1:
            return "分期付款"
        case 2:
            return "结项付款"
    }
    return ""
}

function getTags(tags) {
    if (!tags) {
        return []
    }
    return tags.split(',')
}

function getMoney(fee) {
    return (fee / 100).toFixed(0)
}

function setMoney(fee) {
    return fee.toFixed(2) * 100
}

function formatMoney(fee: number): string {
    return `${fee}.00`
}

function getAliasArr(num: number): string[] {
    const alias = ["甲", "乙", "丙", "丁", "戊", "己"]
    if (num > alias.length) {
        return alias
    }
    return alias.slice(0, num)
}

function getAlias(index: number): string {
    let aliasArr = getAliasArr(10);
    return aliasArr[index]
}

function getSkills(root, index, topTags, tags) {
    for (let i = 0; i < root.length; i++) {
        if (index === 0) {
            topTags.push(root[i].label)
        } else {
            tags.push(root[i].label)
        }
        getSkills(root[i].children, index + 1, topTags, tags)
    }
}

function getRandomNum(n) {
    let rdmNum = "";
    for (let i = 0; i < n; i++) {
        rdmNum += Math.floor(Math.random() * 10); // [0,10)的整数
    }
    return parseInt(rdmNum);
}

function copy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function deepJSONParse(text) {
    if (typeof text !== "string") {
        return text
    }
    if (text && text !== "") {
        let res = JSON.parse(text)
        if (typeof res === "string") {
            return deepJSONParse(res)
        }
        return res
    }
    return []
}

function getRandomID(prefix: string) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}_${id}`;
}

function checkIfImage(file) {
    // 获取文件的 MIME 类型
    const mimeType = file.type;

    // 判断 MIME 类型是否以 "image/" 开头
    return mimeType && mimeType.startsWith('image/')
}

function checkIfZip(file) {
    // 获取文件的扩展名
    const fileName = file.name;
    const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);

    // 获取文件的 MIME 类型
    const mimeType = file.type;

    // 判断文件扩展名是否为.zip，或者 MIME 类型是否为 application/zip
    return (fileExtension && fileExtension.toLowerCase() === 'zip') ||
        (mimeType && mimeType.toLowerCase() === 'application/zip')
}

function elMsgOption(msg: string, type?: string) {
    return {
        showClose: true,
        message: msg,
        type: type ? type : "success"
    }
}

function getChatID(a: number, b: number, did: number) {
    if (a < b) {
        return `${a}-${b}-${did}`
    }
    return `${b}-${a}-${did}`
}

function getFileName(path: string) {
    if (path) {
        let parts = path.split("/");
        return parts[parts.length - 1]
    }
    return ""
}

function checkValue(...values) {
    for (let i = 0; i < values.length; i++) {
        let type = typeof values[i]
        if(type === "number" && !values[i]) {
            return false
        } else if(type === "string" && !values[i]) {
            return false
        } else if(type === "object" && JSON.stringify(values[i]) === "{}") {
            return false
        }
    }
    return true
}

export {
    errorText, diffDay, getPaymentWay,
    getTags, getMoney, setMoney, formatMoney, getSkills,
    getDateTime, getDate, getTime, getRandomNum,
    getAliasArr, getAlias, copy, deepJSONParse,
    getBackTime, getRandomID, checkIfImage,
    checkIfZip, elMsgOption, getChatID, getFileName,
    getAvatar, checkValue
}
