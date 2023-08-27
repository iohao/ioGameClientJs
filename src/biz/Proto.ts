export namespace Proto {
    /**
     * 用户信息类
     */
    export class UserInfo {
        /**
         * 用户ID
         */
        id: number = 0;

        /**
         * 用户昵称
         */
        nickname: string = '';
    }

    export class BagItemMessage {
        /** 背包物品 id */
        id?: string;
        /** 物品类型 id */
        itemTypeId?: string;
        /** 物品数量 */
        quantity?: number;
    }

    /** 显示的物品消息 */
    export class ShowItemMessage {
        /** 物品类型 id */
        itemTypeId?: string;
        /** 物品数量 */
        quantity?: number;
    }

    export interface MailAttachmentMessage {
        id: string;
        itemTypeId: string;
        quantity: number;
    }

    export enum MailStatusMessageEnum {
        /** 密封的邮件、未开封的邮件*/
        SEAL = "SEAL",
        /** 已开封的邮件、奖励已经被领取了 */
        OPEN = "OPEN",
    }

    export class MailMessage {
        id?: string;
        senderName?: string;
        senderUserId?: number;
        subject?: string;
        body?: string;
        milliseconds?: number;
        expiredMilliseconds?: number;
        mailStatus?: MailStatusMessageEnum;
        mailAttachments?: MailAttachmentMessage[];

        constructor() {

        }

        addMailAttachment(itemId: string, quantity: number): void {
            const mailAttachment: MailAttachmentMessage = {
                id: itemId,
                itemTypeId: itemId,
                quantity: quantity
            };

            if (!this.mailAttachments) {
                this.mailAttachments = [];
            }

            this.mailAttachments.push(mailAttachment);
        }
    }

}