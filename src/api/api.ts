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
    uploadMaterial: "/demand/uploadFile"
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
    getEvaluates: "/userdemand/getEvaluates"
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
    if (dm.plan) {
        dm.plan = JSON.stringify(dm.plan)
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

export {
    loginGroup, demandGroup, userGroup,
    engineerGroup, userDemandGroup
    , chatGroup, payGroup, walletGroup, i18n, API,
    GetUser, GetDemand, PutDemand, GetEngineerParentSkills
}

