import {request} from "@/utils/axios";
import {ElMessage} from "element-plus";
import {copy} from "@/utils/utils";

const API = {
    POST: "POST",
    GET: "GET",
    DELETE: "DELETE",
    PUT: "PUT"
}

const loginGroup = {
    registerCode: "/login/registerCode",
    loginCode: "/login/loginCode",
    login: "/login/",
    register: "/login/register"
}

const demandGroup = {
    get: "/demand/get",
    list: "/demand/list",
    pub: "/demand/pub",
    put: "/demand/put",
    del: "/demand/del",
    delList: "/demand/delList",
    uploadMaterial: "/demand/uploadFile",
    downloadFile: "/demand/downloadFile",
}

const userGroup = {
    getUser: "/user/getUser",
    getUsers: "/user/getUsers",
    updateUser: "/user/updateUser",
    uploadAvatar: "/user/uploadAvatar"
}

const engineerGroup = {
    getSkills: "/engineer/getSkills",
}

const userDemandGroup = {
    get: "/userdemand/get",
    getUserDemand: "/userdemand/getUserDemand",
    list: "/userdemand/list",
    pub: "/userdemand/pub",
    put: "/userdemand/put",
    del: "/userdemand/del",
    finishUserDemand: "/userdemand/finishUserDemand",
    finishUserDemandPlan: "/userdemand/finishUserDemandPlan",
    getEvaluates: "/userdemand/getEvaluates",
    getRates: "/userdemand/getUserRates",
    getJoinNum: "/userdemand/getJoinNum",
    agreeJoin: "/userdemand/agreeJoin",
}

const chatGroup = {
    createConn: "/chat/createConn",
    getRooms: "/chat/getRooms",
    createRoom: "/chat/createRoom"
}

const payGroup = {
    paymentIntend: "/pay/paymentIntend",
    payment: "/pay/payment",
    checkPayStatus: "/pay/checkPayStatus"
}

const walletGroup = {
    list: "/wallet/list",
    getBasicData: "/wallet/getBasicData",
    draw: "/wallet/draw"
}

const systemMessageGroup = {
    list: "/systemMessage/list",
}

const i18n = "/i18n"

function GetUser(uid) {
    return request({
        url: userGroup.getUser,
        params: {
            uid: uid
        }
    })
}

function GetDemand(did) {
    return request({
        url: demandGroup.get,
        params: {
            did: did
        }
    })
}

function PutDemand(demand) {
    let dm = copy(demand)
    if (dm.plan && typeof dm.plan !== "string") {
        dm.plan = JSON.stringify(dm.plan)
    }
    if (dm.requires && typeof dm.requires !== "string") {
        dm.requires = JSON.stringify(dm.requires)
    }
    return request({
        url: demandGroup.put,
        method: API.PUT,
        data: dm
    })
}

async function GetEngineerParentSkills(): Promise<Object[]> {
    let res = await request({
        url: engineerGroup.getSkills,
    })
    let skillArr = []
    for (const s of res) {
        skillArr.push({
            label: s.label,
            value: s.value
        })
    }
    return skillArr
}

function GetJoinNum(did, publisherID) {
    return request({
        url: userDemandGroup.getJoinNum,
        params: {
            did: did,
            publisherID: publisherID
        }
    })
}

function DownloadFile(filePath) {
    return request({
        url: demandGroup.downloadFile,
        method: 'GET',
        params: {
            filePath: filePath
        },
        responseType: 'blob', // 响应类型为二进制数据
    }).then((response: any) => {
        // 创建一个URL对象
        const url = window.URL.createObjectURL(new Blob([response]));
        // 创建一个<a>标签
        const link = document.createElement('a');
        link.href = url;
        // 设置文件下载时的文件名
        link.setAttribute('download', filePath.split('/').pop());
        // 将<a>标签添加到DOM中
        document.body.appendChild(link);
        // 触发点击事件开始下载
        link.click();
        // 移除<a>标签
        link.parentNode.removeChild(link);
    });
}

export {
    loginGroup, demandGroup, userGroup,
    engineerGroup, userDemandGroup
    , chatGroup, payGroup, walletGroup, i18n, API,
    systemMessageGroup,
    GetUser, GetDemand, PutDemand, GetEngineerParentSkills,
    GetJoinNum, DownloadFile
}

