import zhCn from "./zh-cn.json"
import enGb from "./en-gb.json"
import config from "/config.json"

function i18nText(key: string): string {
    if (i18n[config.locale][key] === undefined || i18n[config.locale][key] === "") {
        return key
    }
    return i18n[config.locale][key]
}

function i18nTextF(key: string, val: string[]): string {
    if (i18n[config.locale][key] === undefined || i18n[config.locale][key] === "") {
        return key
    }

    let index = 0;
    let str = i18n[config.locale][key];
    return str.replace(/%s/g, function() {
        return val[index++];
    });
}

function i18nGroup(...s: string[]): string {
    let res = ""
    for (const v of s) {
        res += i18nText(v)
    }
    return res
}

function getDictionary() {
    let dict = {}
    dict["zh-cn"] = zhCn
    dict["en-gb"] = enGb
    return dict
}

let i18n = getDictionary()

export {i18nText, i18nGroup}
