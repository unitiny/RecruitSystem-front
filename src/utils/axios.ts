import axios from 'axios'

const baseURL = "http://127.0.0.1:9400/v1"

let request: axios.AxiosInstance = axios.create({
    baseURL: baseURL
})
request.defaults.withCredentials = false
request.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
// 允许跨域
request.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
request.defaults.headers.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVaWQiOjF9.FE_jHtqtU369K48P-EDB8xGHb6Njcnn0oOyeQF0lu5w"

// 添加请求拦截器
request.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response.data;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error.response.data);
});

export {request, baseURL}
