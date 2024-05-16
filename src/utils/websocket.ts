import config from "/config.json"
import {chatGroup} from "@/api/api";
import {getRandomID, getChatID} from "@/utils/utils";

class Message {
    id: string
    did: number
    senderID: number
    receiverID: number
    groupID: number
    chatID: string
    type: number
    media: number
    errorContent: string
    pingContent: string
    privateContent: string
    groupContent: string
    systemContent: object
    applyContent: object
    tagContent: string
    hasRead: boolean
    time: string

    constructor({
                    id = "",
                    did = 0,
                    senderID = 0,
                    receiverID = 0,
                    groupID = 0,
                    chatID = "",
                    type = MessageType.ping,
                    media = 0,
                    content,
                    time = ""
                }) {
        this.id = id !== "" ? id : getRandomID("ws")
        this.did = did !== 0 ? did : 0
        this.senderID = senderID !== 0 ? senderID : 0
        this.receiverID = receiverID !== 0 ? receiverID : 0
        this.chatID = getChatID(senderID, receiverID, did)
        this.groupID = groupID
        this.media = media
        this.time = time
        this.hasRead = false
        this.type = type
        switch (type) {
            case MessageType.error:
                this.errorContent = content
                break
            case MessageType.ping:
                this.pingContent = content
                break
            case MessageType.private:
                switch (media) {
                    case MessageMedia.apply:
                        this.applyContent = content
                        break
                    case MessageMedia.tag:
                        this.tagContent = content
                        break
                    default:
                        this.privateContent = content
                }
                break
            case MessageType.group:
                this.groupContent = content
                break
            case MessageType.system:
                this.systemContent = content
                break
        }
    }
}

const MessageType = {
    error: 1,
    ping: 2,
    private: 3,
    group: 4,
    system: 5,
    apply: 6,
    tag: 7
}

const MessageMedia = {
    text: 1,
    picture: 2,
    zip: 3,
    apply: 4,
    tag: 5
}

const SystemType = {
    read: 1,
    agreeJoin: 2,
    agreeFinishPlan: 3,
    agreeFinishItem: 4,
}

class Chat {
    socket
    retry: number
    connected: boolean
    timer: number
    token: string

    connWebsocket(token) {
        try {
            this.token = token
            let url = config.baseWSURL + chatGroup.createConn + `?&token=${token}`
            this.socket = new WebSocket(url)

            this.socket.onopen = () => {
                console.log("ws conn success")
                this.retry = 0
                this.connected = true
                // this.ping()
            }

            // this.socket.onmessage = async (event) => {
            //     console.log(event)
            // };

            // 错误监听
            this.socket.onerror = (msg) => {
                console.log(msg)
                this.retry = 0
                this.connected = false
                clearInterval(this.timer)
            };

            // 关闭监听
            this.socket.onclose = (msg) => {
                console.log(msg)
                this.retry = 0
                this.connected = false
                clearInterval(this.timer)
                // this.reconnect()
            };
            return true
        } catch (e) {
            return false
        }
    }

    reconnect(retryCunt = 3) {
        for (let i = 0; i < retryCunt; i++) {
            if (this.connWebsocket(this.token)) {
                this.connected = true
                break
            }
        }
    }

    ping() {
        this.timer = setInterval(() => {
            this.send(new Message({id: 1, content: "ping"}))
        }, 10 * 1000);
    }

    send(msg: Message) {
        this.socket.send(JSON.stringify(msg))
    }
}

export {Chat, Message, MessageType, MessageMedia, SystemType}
