export namespace IoGameCommon {

    export class ExternalMessage {
        /** 请求命令类型: 0 心跳，1 业务 */
        cmdCode: number = 1;
        /** 协议开关，用于一些协议级别的开关控制，比如 安全加密校验等。 : 0 不校验 */
        protocolSwitch: number = 0;
        /** 业务路由（高16为主, 低16为子） */
        cmdMerge: number;
        /**
         * 响应码。
         * <pre>
         *     从字段精简的角度，我们不可能每次响应都带上完整的异常信息给客户端排查问题，
         *     因此，我们会定义一些响应码，通过编号进行网络传输，方便客户端定位问题。
         *
         *     0:成功
         *     !=0: 表示有错误
         * </pre>
         */
        responseStatus: number = 0;
        /** 验证信息（错误消息、异常消息） */
        validMsg: string = "";
        data?: number[];
        /** 消息标记号；由前端请求时设置，服务器响应时会携带上 */
        msgId: number = 0;

        constructor(cmdMerge: number) {
            this.cmdMerge = cmdMerge;
        }

        getCmdInfo(): CmdInfo {
            return CmdKit.of(this.cmdMerge);
        }
    }

    export class ExternalKit {
        static msgId: number = 1;

        static of(cmdMerge: number): ExternalMessage {
            ExternalKit.msgId++;

            let message = new ExternalMessage(cmdMerge)
            message.msgId = ExternalKit.msgId;

            return message;
        }

        static toUint8Array(message: ExternalMessage): Uint8Array {
            let json = JSON.stringify(message);
            return new TextEncoder().encode(json);
        }
    }

    export class CmdKit {
        static getCmd(cmdMerge: number): number {
            return cmdMerge >> 16;
        }

        static getSubCmd(cmdMerge: number): number {
            return cmdMerge & 0xFFFF;
        }

        static merge(cmd: number, subCmd: number): number {
            return (cmd << 16) + subCmd;
        }

        static of(cmdMerge: number): CmdInfo {
            let cmd = this.getCmd(cmdMerge);
            let subCmd = this.getSubCmd(cmdMerge);

            return new CmdInfo(cmd, subCmd, cmdMerge);
        }
    }

    export class CmdInfo {
        cmd: number;
        subCmd: number;

        constructor(cmd: number, subCmd: number, cmdMerge: number) {
            this.cmd = cmd;
            this.subCmd = subCmd;
        }
    }

    export interface Codec {
        encode(message: ExternalMessage): number[];

        decodeExternalMessage(data: any): ExternalMessage;

        decode<T>(data: any, dataInstance: T): T;
    }

    const lodash = require('lodash');

    export class JsonCodec implements Codec {

        decodeExternalMessage(data: any): ExternalMessage {
            let externalMessage = this.parseExternalMessage(data);
            return externalMessage as ExternalMessage;
        }

        encode(data: any): number[] {
            let stringify = JSON.stringify(data);
            let dataArray = new TextEncoder().encode(stringify);
            return Array.from(dataArray);
        }

        decode<T>(data: any, dataInstance: T): T {
            let json = DataCodecKit.binaryDataDecode(data);
            return lodash.assign(dataInstance, JSON.parse(json));
        }

        private parseExternalMessage(data: any) {
            let json = DataCodecKit.binaryDataDecode(data);
            // 解析JSON字符串并转换为 ExternalMessage 对象
            return lodash.assign(new ExternalMessage(0), JSON.parse(json));
        }
    }

    export class DataCodecKit {

        static codec: Codec = new JsonCodec();

        static encode(data: any): number[] {
            return this.codec.encode(data);
        }

        static decode<T>(data: any, dataInstance: T): T {
            return this.codec.decode(data, dataInstance);
        }

        static decodeExternalMessage(msg: Object): ExternalMessage {
            return this.codec.decodeExternalMessage(msg);
        }

        static binaryDataDecode(data: any): string {
            let uint8Array = new Uint8Array(data);
            let textDecoder = new TextDecoder("utf-8");
            return textDecoder.decode(uint8Array);
        }

    }

    export class ByteValueList {
        values?: number[][];

        toList<T>(dataInstance: T): T[] | undefined {
            return this.values?.map(data => {
                let copyDataInstance = Object.assign({}, dataInstance);
                return DataCodecKit.decode(data, copyDataInstance);
            })
        }

        static of(dataList: any[]): ByteValueList {
            let values = dataList.map(value => {
                return DataCodecKit.encode(value)
            })

            let byteValueList = new ByteValueList();
            byteValueList.values = values;

            return byteValueList;
        }
    }

    export class BoolValue {
        value?: boolean;
    }
}
