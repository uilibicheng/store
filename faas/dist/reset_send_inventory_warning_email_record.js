exports.main=function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=154)}({1:function(e,t,n){const o={EXPORT_DATA:"export_data",CREATE_EXPORT_JOB_ID:"create_export_job_id",SEND_MESSAGE:"send_message"},r={ticket_bundle:73273,ticket:73277,ticket_inventory:73281,order:73271,settings:73289,prize:73286,prize_redemption_log:73288,user:73294,export_task:73299,redemption_log_assistance:72860,redemption_log_lottery:70522,lottery_winner:73301,lottery:70519,lottery_log:70520,message:74993,notification:76130},i=["Megumi.Honda@LEGOLAND.jp","Sarah.Shen@merlinentertainments.biz"],_={[r.ticket_inventory]:"Inventory list export",[r.order]:"Sales record list export",[r.prize_redemption_log]:"Redemption record list export"};e.exports={BAAS_TABLE_ID:r,BAAS_TABLE_ID_DEV:{ticket_bundle:73274,ticket:73278,ticket_inventory:73282,order:73272,settings:73292,prize:73290,prize_redemption_log:73291,user:73293,export_task:73299,redemption_log_assistance:70427,redemption_log_lottery:70529,lottery_winner:73300,lottery:70526,lottery_log:70527,message:74992,notification:76129},ORDER_STATUS:{NOT_PAID:"not_paid",PAID:"paid",CANCELLED:"cancelled",REFUNDED:"refunded",CLOSED:"closed"},REDEMPTION_LOG_STATUS:{PENDING:"pending",CLOSED:"closed",REDEEMED:"redeemed"},TIMEZONE:"Asia/Tokyo",PRIZE_TYPE:{NORMAL:"normal",PROMOTIONAL_BUNDLE:"promotional_bundle",AREA_LIMIT:"area_limit"},EXPORT_DATA_CATEGORY_ID:"5cd38981ad1b2436065092d0",API:"https://cloud.minapp.com/dserve/v1.8/schema",CLOUD_FUNCTION_NAME:o,EMAIL_TITLE_MAP:_,EMAIL_LIST:i,SPECIAL_TICKET_TYPE:{SHARE_DISCOUNT:"share_discount",PRIZE_BUY_ONE_GET_ONE_FREE:"prize_buy_one_get_one_free",PRIZE_DISCOUNT:"prize_discount",COMPLIMENTARY:"complimentary"},TICKET_UTM_SOURCE:{ASSISTANCE:"assistance",LOTTERY:"lottery",SHARE:"share"},HOURS_OFFSET_BEIJING:1,MESSAGE_STATUS:{UNSENT:"unsent",SENDING:"sending",SENT:"sent",FAIL:"fail"},MESSAGE_TEMPLATE_ID:"ApmJv2esJcoKEvPHR6E-0jVeNMHl1T0AqGmPMBqpPjE"}},154:function(e,t,n){const o=n(1).BAAS_TABLE_ID.settings,r=new BaaS.TableObject(o);e.exports=async function(e,t){try{console.log(e);const n=await function(){const e=new BaaS.Query;return e.compare("label","=","default"),r.limit(1).offset(0).setQuery(e).find().then(e=>e.data.objects[0]||[]).catch(e=>{throw console.log("获取库存预警出错"),e})}(),{id:o}=n;console.log(n),function(e=""){const t=r.getWithoutData(e);return t.set({has_send_email_list:[]}),t.update()}(o).then(e=>{if(200!==e.status)throw new Error("清空已发送邮件记录失败！");t(null,{status:"success",message:"reset success!"})}).catch(e=>{t(e)})}catch(e){t(e)}}}});