import config from "/config.json"
import {chatGroup} from "@/api/api";
import {getRandomNum} from "@/utils/utils";
import {useGlobalStore} from "@/store/pinia";

const store = useGlobalStore()

class Message {
    id: Number
    senderID: Number
    receiverID: Number
    groupID: Number
    chatID: string
    type: Number
    media: Number
    content: string

    constructor({
                    id = 0,
                    senderID = 0,
                    receiverID = 0,
                    groupID = 0,
                    chatID = "",
                    type = MessageType.ping,
                    media = 0,
                    content = ""
                }) {
        this.id = id !== 0 ? id : getRandomNum(5)
        this.senderID = senderID !== 0 ? senderID : store["user"].id
        this.receiverID = receiverID !== 0 ? receiverID : store["user"].id
        this.chatID = senderID < receiverID ?
            `${senderID}-${receiverID}` : `${receiverID}-${senderID}`
        this.groupID = groupID
        this.type = type
        this.media = media
        this.content = content
    }
}

const MessageType = {
    error: 1,
    ping: 2,
    private: 3,
    group: 4,
}

class Chat {
    socket
    retry: Number
    connected: boolean
    timer: Number
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

export {Chat, Message, MessageType}