import {request} from "@/utils/axios";

const API = {
    POST: "POST",
    GET: "GET",
    DELETE: "DELETE",
    PUT: "PUT"
}

const loginGroup = {
    code: "/login/code",
    login: "/login/",
    register: "/login/register"
}

const demandGroup = {
    get: "/demand/get",
    list: "/demand/list",
    pub: "/demand/pub",
    put: "/demand/put",
    del: "/demand/del",
    uploadMaterial: "/demand/uploadFile"
}

const userGroup = {
    getUser: "/user/getUser",
    getUsers: "/user/getUsers",
    updateUser: "/user/updateUser",
    uploadAvatar: "/user/uploadAvatar"
}

const chatGroup = {
    createConn: "/chat/createConn"
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

export {loginGroup, demandGroup, userGroup, chatGroup, i18n, API, GetUser, GetDemand}

