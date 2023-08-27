import {IoGameBiz} from "./biz/Cmd";


import LoginCmd = IoGameBiz.LoginCmd;
import {IoGameNet} from "./common/Net";
import clientChannel = IoGameNet.clientChannel;
import UserInfo = Proto.UserInfo;
import BagCmd = IoGameBiz.BagCmd;
import MailCmd = IoGameBiz.MailCmd;
import MailMessage = Proto.MailMessage;
import MailStatusMessageEnum = Proto.MailStatusMessageEnum;
import ByteValueList = IoGameCommon.ByteValueList;
import {IoGameCommon} from "./common/Common";
import BoolValue = IoGameCommon.BoolValue;
import BagItemMessage = Proto.BagItemMessage;
import CommonCmd = IoGameBiz.CommonCmd;
import {Proto} from "./biz/Proto";
import ShowItemMessage = Proto.ShowItemMessage;

/**
 * 广播监听 - 配置
 */
(() => {

    clientChannel.ofListen({
        title: "新邮件",
        cmdMerge: MailCmd.broadcastNewMail,
        callback: result => {
            let value = result.getValue(new MailMessage());
            console.log("新邮件", value);
        }
    })

    clientChannel.ofListen({
        title: "物品变更",
        cmdMerge: BagCmd.broadcastChangeItems,
        callback: result => {
            let byteValueList = result.getValue(new ByteValueList());
            let toList = byteValueList.toList(new BagItemMessage());

            console.log("物品变更", toList);
        }
    })

    clientChannel.ofListen({
        title: "获得新物品",
        cmdMerge: CommonCmd.broadcastShowItem,
        callback: result => {
            let byteValueList = result.getValue(new ByteValueList());
            let toList = byteValueList.toList(new ShowItemMessage());

            console.log("获得新物品", toList);
        }
    })

})();

/**
 * 自动登录
 */
(() => {
    clientChannel.onOpen = function () {
        clientChannel.request({
            title: "登录",
            cmdMerge: LoginCmd.loginVerify,
            supplierRequestData: () => {
                return {jwt: "1"}
            },
            callback: result => {
                let userInfo = result.getValue(new UserInfo());
                console.log("登录成功", userInfo);
            }
        });
    }
})();

/**
 * 点击事件，主动发起请求 - 配置
 */
function extractedClick() {
    document.getElementById("7-1")?.addEventListener("click", (event) => {
        clientChannel.request({
            title: "查询背包",
            cmdMerge: BagCmd.bag,
            callback: result => {
                let toJson = result.toJson();

                console.log("查询背包响应", toJson)
            }
        });
    });

    document.getElementById("8-1")?.addEventListener("click", (event) => {
        clientChannel.request({
            title: "查看玩家邮件列表",
            cmdMerge: MailCmd.listMail,
            callback: result => {
                let byteValueList = result.getValue(new ByteValueList());
                let toList = byteValueList.toList(new MailMessage());
                console.log("玩家邮件列表", toList)
            }
        });
    });

    document.getElementById("8-2")?.addEventListener("click", (event) => {
        clientChannel.request({
            title: "添加邮件",
            cmdMerge: MailCmd.addMail,
            supplierRequestData: () => {
                const mail: MailMessage = new MailMessage();
                mail.senderName = "系统";
                mail.senderUserId = 0;
                mail.subject = "系统邮件";
                mail.body = "系统感觉你今天很弱鸡，特意送你一些物品";
                mail.milliseconds = Date.now();
                mail.expiredMilliseconds = Date.now() + 86400000;
                mail.mailStatus = MailStatusMessageEnum.SEAL;
                mail.addMailAttachment("exp", 2);
                mail.addMailAttachment("equip_weapon_book_10", 1);
                mail.addMailAttachment("iron_10", 1);

                return ByteValueList.of([mail]);
            }
        });
    });

    document.getElementById("8-4")?.addEventListener("click", (event) => {
        clientChannel.request({
            title: "一键删除所有已开封和过期的邮件",
            cmdMerge: MailCmd.deleteMails,
            callback: result => {
                let value = result.getValue(new BoolValue());
                console.info("删除", value.value ? "成功" : "失败", value);
            }
        });
    });

    document.getElementById("8-6")?.addEventListener("click", (event) => {
        clientChannel.request({
            title: "一键领取所有未开封的邮件",
            cmdMerge: MailCmd.openMails
        });
    });
}

extractedClick();


// function writeToScreen(message: any) {
//     var div = "<div>" + message + "</div>";
//     var d = $("#output");
//     var d = d[0];
//     var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
//     $("#output").append(div);
//     if (doScroll) {
//         d.scrollTop = d.scrollHeight - d.clientHeight;
//     }
// }