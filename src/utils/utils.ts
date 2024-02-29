function errorText(error, defaultError: string = ""): string {
    if (error["error"] !== undefined && error["error"] !== "") {
        return error["error"]
    }
    return defaultError
}

function diffDay(start: string, end: string) {
    if(start === "" || end === "") {
        return 0
    }

    let startDay = new Date(start)
    let endDay = new Date(end)
    const diffTime = Math.abs(endDay - startDay);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getTime() {
    let currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();

    let hoursString = hours < 10 ? "0" + hours : hours.toString();
    let minutesString = minutes < 10 ? "0" + minutes : minutes.toString();

    return hoursString + ":" + minutesString;
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
    if(!tags) {
        return []
    }
    return tags.split(',')
}

function getMoney(fee) {
    return fee/100
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
    let rdmNum= "";
    for (let i = 0; i < n; i++) {
        rdmNum+= Math.floor(Math.random() * 10); // [0,10)的整数
    }
    return parseInt(rdmNum);
}

export {errorText, diffDay, getPaymentWay,
    getTags, getMoney, getSkills, getTime, getRandomNum}