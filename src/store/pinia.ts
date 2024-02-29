import {defineStore} from "pinia";

export const useGlobalStore = defineStore('main', {
    state: () => ({
        user: {
            "id": 1,
            "createdAt": "2024-02-19T11:41:52.698+08:00",
            "updatedAt": "2024-02-19T11:41:52.698+08:00",
            "deletedAt": {
                "Time": "0001-01-01T00:00:00Z",
                "Valid": false
            },
            "username": "1",
            "nickname": "",
            "password": "1",
            "phone": "",
            "email": "",
            "identity": 1,
            "birth": "2024-02-19T11:41:52.697+08:00",
            "description": "",
            "avatar": "/2024-02-26/userAvatar__1/2022华南赛区小程序大赛二等奖.jpg",
            "skills": "[{\"label\":\"前端\",\"value\":4,\"children\":[{\"label\":\"JavaScript\",\"value\":1,\"children\":[]},{\"label\":\"Vue\",\"value\":2,\"children\":[]},{\"label\":\"React\",\"value\":3,\"children\":[]},{\"label\":\"Angular\",\"value\":4,\"children\":[]},{\"label\":\"Android\",\"value\":5,\"children\":[]},{\"label\":\"IOS\",\"value\":6,\"children\":[]},{\"label\":\"其他前端开发\",\"value\":7,\"children\":[]}]},{\"label\":\"后端\",\"value\":3,\"children\":[{\"label\":\"Java\",\"value\":1,\"children\":[]},{\"label\":\"C/C++\",\"value\":2,\"children\":[]},{\"label\":\"PHP\",\"value\":3,\"children\":[]},{\"label\":\"Python\",\"value\":4,\"children\":[]},{\"label\":\"C#\",\"value\":5,\"children\":[]},{\"label\":\"Golang\",\"value\":6,\"children\":[]},{\"label\":\".Net\",\"value\":7,\"children\":[]},{\"label\":\"Node.js\",\"value\":8,\"children\":[]},{\"label\":\"Hadoop\",\"value\":9,\"children\":[]},{\"label\":\"其他后端开发\",\"value\":10,\"children\":[]}]}]",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVaWQiOjF9.FE_jHtqtU369K48P-EDB8xGHb6Njcnn0oOyeQF0lu5w"
        },
    }),
    persist: true,
    actions: {
        updateUser(user) {
            this.user = user
        }
    },
})