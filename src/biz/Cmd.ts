import {IoGameCommon} from "../common/Common";

export namespace IoGameBiz {

    import CmdKit = IoGameCommon.CmdKit;

    export enum CmdModule {
        /** 相对通用的模块 */
        commandCmd = 0,
        /** 大厅 - 登录 */
        loginCmd = 1,
        /** 人物 */
        personCmd = 2,
        /** 地图 */
        mapCmd = 3,
        /** 英雄 */
        heroCmd = 4,
        /** 等级 */
        levelCmd = 5,
        /** 物品 */
        itemCmd = 6,
        /** 背包 */
        bagCmd = 7,
        /** 邮件 */
        mailCmd = 8,
        /** 装备 */
        equipCmd = 10,
    }

    export enum CommonCmd {
        cmd = CmdModule.commandCmd,
        /** 获得新物品通知 */
        broadcastShowItem = CmdKit.merge(cmd, 100)
    }

    export enum LoginCmd {
        cmd = CmdModule.loginCmd,
        loginVerify = CmdKit.merge(cmd, 1),
        userIp = CmdKit.merge(cmd, 2),
    }

    /**
     * Bag command enumeration.
     */
    export enum BagCmd {
        /** Command value for bag */
        cmd = CmdModule.bagCmd,
        /** Bag list */
        bag = CmdKit.merge(cmd, 1),
        /** Add item */
        incrementItem = CmdKit.merge(cmd, 2),
        /** Decrease item */
        decrementItem = CmdKit.merge(cmd, 3),
        /** Use item */
        use = CmdKit.merge(cmd, 5),
        /** Craft equipment */
        useBuildEquip = CmdKit.merge(cmd, 6),
        /** Broadcast item changes */
        broadcastChangeItems = CmdKit.merge(cmd, 50),
    }

    /** 邮件 */
    export enum MailCmd {
        cmd = CmdModule.mailCmd,
        /** 查看玩家邮件列表 */
        listMail = CmdKit.merge(cmd, 1),
        /** 添加邮件 */
        addMail = CmdKit.merge(cmd, 2),
        /** 删除单个邮件-指定邮件 */
        deleteMail = CmdKit.merge(cmd, 3),
        /** 一键删除多个邮件，删除所有已开封和过期的邮件 */
        deleteMails = CmdKit.merge(cmd, 4),
        /** 打开单个邮件-指定邮件 */
        openMail = CmdKit.merge(cmd, 5),
        /** 打开多个邮件-所有未开封的邮件 */
        openMails = CmdKit.merge(cmd, 6),
        /** 新邮件 - 邮服务器推送 */
        broadcastNewMail = CmdKit.merge(cmd, 100)
    }
}