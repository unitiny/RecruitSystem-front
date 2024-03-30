function errorText(error, defaultError: string = ""): string {
    if (error["error"] !== undefined && error["error"] !== "") {
        return error["error"]
    }
    return defaultError
}

function diffDay(start: string, end: string) {
    if (start === "" || end === "") {
        return 0
    }

    let startDay = new Date(start)
    let endDay = new Date(end)
    const diffTime = Math.abs(endDay - startDay);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    return (fee / 100).toFixed(2)
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

function getDemandPlan(plan: string) {
    if (plan && plan !== "") {
        let res = JSON.parse(plan)
        if(typeof res === "string") {
            return getDemandPlan(res)
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

export {
    errorText, diffDay, getPaymentWay,
    getTags, getMoney, getSkills,
    getDate, getTime, getRandomNum,
    getAliasArr, getAlias, copy, getDemandPlan,
    getBackTime, getRandomID, checkIfImage,
    checkIfZip, elMsgOption
}