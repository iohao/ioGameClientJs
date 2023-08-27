import {IoGameCommon} from "./Common";

export namespace IoGameNet {
    import ExternalMessage = IoGameCommon.ExternalMessage;
    import ExternalKit = IoGameCommon.ExternalKit;
    import DataCodecKit = IoGameCommon.DataCodecKit;

    export interface CommandRequestConfig {
        title?: string,
        cmdMerge?: number,
        supplierRequestData?: () => any,
        callback?: (result: CommandResult) => void | null,
    }

    export class CommandResult {
        data?: number[];
        message?: ExternalMessage;

        getValue<T>(obj: T): T {
            return DataCodecKit.decode(this.data, obj);
        }

        toJson() {
            // 如果懒得写协议类，又想看具体数据，可以尝试使用该方法
            return JSON.parse(DataCodecKit.binaryDataDecode(this.data));
        }
    }

    export class CommandRequest {
        title: string = ""
        msgId: number;
        cmdMerge: number;
        message: ExternalMessage;
        data?: Object;
        config?: CommandRequestConfig;
        callback?: (result: CommandResult) => void | null;

        constructor(message: IoGameCommon.ExternalMessage) {
            this.message = message;
            this.cmdMerge = message.cmdMerge;
            this.msgId = message.msgId;
        }
    }

    class CommandCallbacks {
        callbackMap: Map<number, CommandRequest> = new Map<number, CommandRequest>();

        add(command: CommandRequest) {

            let callback = command.callback;

            if (callback) {
                let msgId = command.msgId;
                this.callbackMap.set(msgId, command);
            }
        }

        has(msgId: number): boolean {
            return this.callbackMap.has(msgId);
        }

        consumer(message: ExternalMessage) {

            let msgId = message.msgId;
            let command = this.callbackMap.get(msgId);

            this.callbackMap.delete(msgId);

            let cmdInfo = message.getCmdInfo();
            console.log("接收[%s]响应 - [msgId:%s] %o",
                command?.title,
                message.msgId,
                cmdInfo
            );

            let commandResult = new CommandResult();
            commandResult.message = message;
            commandResult.data = message.data;

            if (command?.callback) {
                command?.callback(commandResult);
            }
        }
    }

    export interface CommandListenBroadcastConfig {
        title?: string,
        cmdMerge: number,
        callback: (result: CommandResult) => void,
    }

    class CommandListenBroadcast {
        cmdMerge: number = 0;
        callback?: (result: CommandResult) => void | null;
        config?: CommandListenBroadcastConfig;
    }

    export class ListenBroadcasts {
        listenMap: Map<number, CommandListenBroadcast> = new Map<number, CommandListenBroadcast>();

        add(commandListen: CommandListenBroadcast) {
            this.listenMap.set(commandListen.cmdMerge, commandListen);
        }

        consumer(message: ExternalMessage) {
            let cmdMerge = message.cmdMerge;

            if (this.listenMap.has(cmdMerge)) {
                let command = this.listenMap.get(cmdMerge);
                let config = command?.config;
                console.log("广播监听回调[%s]通知 %o", config?.title, message.getCmdInfo());

                let commandResult = new CommandResult();
                commandResult.message = message;
                commandResult.data = message.data;

                if (command?.callback) {
                    command.callback(commandResult);
                }
            }
        }
    }

    export class ClientChannel {

        socket: WebSocket;
        onOpen: Function;
        commandRequests = new CommandCallbacks();
        listenBroadcasts = new ListenBroadcasts();

        constructor(url: string) {
            this.onOpen = function () {
            };

            let me = this;

            this.socket = new WebSocket(url);
            this.socket.binaryType = 'arraybuffer';

            // 连接成功时触发
            this.socket.onopen = function () {
                console.log('WebSocket 连接已打开');
                me.onOpen();
            };

            // 接收到消息时触发
            this.socket.onmessage = function (event: any) {
                let externalMessage = DataCodecKit.decodeExternalMessage(event.data);
                me.read(externalMessage);
            };

            // 连接关闭时触发
            this.socket.onclose = function (event: any) {
                console.log('WebSocket 连接已关闭：', event.code, event.reason);
            };

            // 发生错误时触发
            this.socket.onerror = function (error: any) {
                console.error('WebSocket 连接错误：', error);
            };
        }

        requestCommand(command: CommandRequest) {

            this.commandRequests.add(command);

            let message = command.message;
            let cmdInfo = message.getCmdInfo();

            console.log("发起[%s]请求 - [msgId:%s] %o %o",
                command.title,
                message.msgId,
                cmdInfo,
                command.data ? command.data : "");

            if (command.data) {
                message.data = DataCodecKit.encode(command.data);
            }

            let uint8Array = ExternalKit.toUint8Array(message);
            this.socket.send(uint8Array);
        }

        /**
         * 主动请求游戏服务器
         * @param config config
         */
        request(config: CommandRequestConfig) {
            const {
                title = "",
                cmdMerge = 0,
                supplierRequestData = () => null,
                callback = null,
            } = config;

            let data = null;
            if (supplierRequestData) {
                data = supplierRequestData();
            }

            let message = ExternalKit.of(cmdMerge);

            let commandRequest = new CommandRequest(message);
            commandRequest.title = title;
            commandRequest.data = data;
            commandRequest.config = config;

            if (callback) {
                commandRequest.callback = callback;
            }

            this.requestCommand(commandRequest);
        }

        /**
         * 广播监听
         * @param config config
         */
        ofListen(config: CommandListenBroadcastConfig) {

            const {
                title = "接收广播",
                cmdMerge = 0,
                callback = null,
            } = config;

            if (!callback) {
                console.error("广播监听必需配置回调 callback");
                return;
            }

            let commandListenBroadcast = new CommandListenBroadcast();
            commandListenBroadcast.callback = callback;
            commandListenBroadcast.cmdMerge = cmdMerge;
            commandListenBroadcast.config = config;

            this.listenBroadcasts.add(commandListenBroadcast);
        }

        private read(message: ExternalMessage) {

            let responseStatus = message.responseStatus;
            let cmdInfo = message.getCmdInfo();

            if (responseStatus != 0) {
                console.error("[错误码:{}] - [消息:{}] - {}", responseStatus, message.validMsg, cmdInfo);
                return;
            }

            if (message.cmdCode == 0) {
                // 接收服务器心跳回调
                return;
            }

            let msgId = message.msgId;
            // 有回调的，交给回调处理
            if (msgId != 0) {
                if (this.commandRequests.has(msgId)) {
                    this.commandRequests.consumer(message);
                    return;
                }
            }

            // 广播
            this.listenBroadcasts.consumer(message);
        }
    }

    let url = 'ws://127.0.0.1:10100/websocket';
    export const clientChannel = new ClientChannel(url);
}