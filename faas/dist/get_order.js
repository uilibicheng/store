exports.main=function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=152)}({1:function(e,t,r){const n={EXPORT_DATA:"export_data",CREATE_EXPORT_JOB_ID:"create_export_job_id",SEND_MESSAGE:"send_message"},o={ticket_bundle:73273,ticket:73277,ticket_inventory:73281,order:73271,settings:73289,prize:73286,prize_redemption_log:73288,user:73294,export_task:73299,redemption_log_assistance:72860,redemption_log_lottery:70522,lottery_winner:73301,lottery:70519,lottery_log:70520,message:74993,notification:76130},i=["Megumi.Honda@LEGOLAND.jp","Sarah.Shen@merlinentertainments.biz"],_={[o.ticket_inventory]:"Inventory list export",[o.order]:"Sales record list export",[o.prize_redemption_log]:"Redemption record list export"};e.exports={BAAS_TABLE_ID:o,BAAS_TABLE_ID_DEV:{ticket_bundle:73274,ticket:73278,ticket_inventory:73282,order:73272,settings:73292,prize:73290,prize_redemption_log:73291,user:73293,export_task:73299,redemption_log_assistance:70427,redemption_log_lottery:70529,lottery_winner:73300,lottery:70526,lottery_log:70527,message:74992,notification:76129},ORDER_STATUS:{NOT_PAID:"not_paid",PAID:"paid",CANCELLED:"cancelled",REFUNDED:"refunded",CLOSED:"closed"},REDEMPTION_LOG_STATUS:{PENDING:"pending",CLOSED:"closed",REDEEMED:"redeemed"},TIMEZONE:"Asia/Tokyo",PRIZE_TYPE:{NORMAL:"normal",PROMOTIONAL_BUNDLE:"promotional_bundle",AREA_LIMIT:"area_limit"},EXPORT_DATA_CATEGORY_ID:"5cd38981ad1b2436065092d0",API:"https://cloud.minapp.com/dserve/v1.8/schema",CLOUD_FUNCTION_NAME:n,EMAIL_TITLE_MAP:_,EMAIL_LIST:i,SPECIAL_TICKET_TYPE:{SHARE_DISCOUNT:"share_discount",PRIZE_BUY_ONE_GET_ONE_FREE:"prize_buy_one_get_one_free",PRIZE_DISCOUNT:"prize_discount",COMPLIMENTARY:"complimentary"},TICKET_UTM_SOURCE:{ASSISTANCE:"assistance",LOTTERY:"lottery",SHARE:"share"},HOURS_OFFSET_BEIJING:1,MESSAGE_STATUS:{UNSENT:"unsent",SENDING:"sending",SENT:"sent",FAIL:"fail"},MESSAGE_TEMPLATE_ID:"ApmJv2esJcoKEvPHR6E-0jVeNMHl1T0AqGmPMBqpPjE"}},152:function(e,t,r){const n=r(1);e.exports=function(e,t){let{orderId:r}=e.data;(function(e,t){const r=n.BAAS_TABLE_ID.order;return new BaaS.TableObject(r).get(e).then(e=>{const r=e.data;if(r.created_by!==t)throw new Error("订单未找到");return r}).catch(e=>{throw console.log("获取订单时出错: ",e),e})})(r,e.request.user.id).then(e=>(function(e){return e.status===n.ORDER_STATUS.PAID&&(e.tickets=e.tickets_with_barcode),delete e.tickets_with_barcode,delete e.tickets_barcode_list,e})(e)).then(e=>{t(null,{message:"success",order:e})}).catch(e=>{console.log("获取订单失败",e),t(e)})}}});