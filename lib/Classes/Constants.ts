export default class Constants {
    static readonly defaultPorts = {
        webSocket: 7712,
        http: 8080
    }
    static readonly nodeHandleTypes = {
        invalid: 0,
        activate: 100,
        text: 200,
        number: 201,
        audio: 300,
        image: 400,
        video: 500
    }
}