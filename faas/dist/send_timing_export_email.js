exports.main=function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=167)}({1:function(e,t,r){const n={EXPORT_DATA:"export_data",CREATE_EXPORT_JOB_ID:"create_export_job_id",SEND_MESSAGE:"send_message"},o={ticket_bundle:73273,ticket:73277,ticket_inventory:73281,order:73271,settings:73289,prize:73286,prize_redemption_log:73288,user:73294,export_task:73299,redemption_log_assistance:72860,redemption_log_lottery:70522,lottery_winner:73301,lottery:70519,lottery_log:70520,message:74993,notification:76130},i=["Megumi.Honda@LEGOLAND.jp","Sarah.Shen@merlinentertainments.biz"],a={[o.ticket_inventory]:"Inventory list export",[o.order]:"Sales record list export",[o.prize_redemption_log]:"Redemption record list export"};e.exports={BAAS_TABLE_ID:o,BAAS_TABLE_ID_DEV:{ticket_bundle:73274,ticket:73278,ticket_inventory:73282,order:73272,settings:73292,prize:73290,prize_redemption_log:73291,user:73293,export_task:73299,redemption_log_assistance:70427,redemption_log_lottery:70529,lottery_winner:73300,lottery:70526,lottery_log:70527,message:74992,notification:76129},ORDER_STATUS:{NOT_PAID:"not_paid",PAID:"paid",CANCELLED:"cancelled",REFUNDED:"refunded",CLOSED:"closed"},REDEMPTION_LOG_STATUS:{PENDING:"pending",CLOSED:"closed",REDEEMED:"redeemed"},TIMEZONE:"Asia/Tokyo",PRIZE_TYPE:{NORMAL:"normal",PROMOTIONAL_BUNDLE:"promotional_bundle",AREA_LIMIT:"area_limit"},EXPORT_DATA_CATEGORY_ID:"5cd38981ad1b2436065092d0",API:"https://cloud.minapp.com/dserve/v1.8/schema",CLOUD_FUNCTION_NAME:n,EMAIL_TITLE_MAP:a,EMAIL_LIST:i,SPECIAL_TICKET_TYPE:{SHARE_DISCOUNT:"share_discount",PRIZE_BUY_ONE_GET_ONE_FREE:"prize_buy_one_get_one_free",PRIZE_DISCOUNT:"prize_discount",COMPLIMENTARY:"complimentary"},TICKET_UTM_SOURCE:{ASSISTANCE:"assistance",LOTTERY:"lottery",SHARE:"share"},HOURS_OFFSET_BEIJING:1,MESSAGE_STATUS:{UNSENT:"unsent",SENDING:"sending",SENT:"sent",FAIL:"fail"},MESSAGE_TEMPLATE_ID:"ApmJv2esJcoKEvPHR6E-0jVeNMHl1T0AqGmPMBqpPjE"}},167:function(e,t,r){const n=r(1),{BAAS_TABLE_ID:o,CLOUD_FUNCTION_NAME:i}=n,a=new Date((new Date).setHours(0,0,0,0)).getTime()/1e3,_={$gt:a-604800,$lt:a},d={where:{created_at:_},timestampConvertKeys:["closed_at","redeemed_at","created_at"],scientificNotationConvertKeys:["redemption_code"],includeKeys:["status","english_name","type","redemption_code","point","created_at","redeemed_at","closed_at","operator"],customizeHeaders:{status:"Status",english_name:"English name",type:"Prize category",redemption_code:"Redemption code",point:"Points",created_at:"Redemption time",redeemed_at:"Write-off time",closed_at:"Expire date",operator:"Operator"}},s={where:{created_at:_},expand:"tickets_with_barcode",timestampConvertKeys:["created_at","paid_at","refunded_at","reservation_date"],scientificNotationConvertKeys:["barcode"],splitRowKeys:["bundle_english_name","ticket_type_english_name","barcode","price","order_number","accesso_product_id"],splitRow:"tickets_with_barcode",includeKeys:["order_id","status","payment_method","pickup_person","phone","bundle_english_name","ticket_type_english_name","order_number","barcode","utm_source","utm_medium","quantity","price","trade_no","refund_no","created_at","paid_at","reservation_date","refund_operator","refund_memo","refunded_at","accesso_product_id"],customizeHeaders:{status:"Order status",pickup_person:"Contact person",phone:"Mobile number",order_id:"Wechat order number",bundle_english_name:"Ticket name",ticket_type_english_name:"Ticket category",order_number:"Ticketing system order number",barcode:"QR code",utm_source:"Ticket purchase method",utm_medium:"Associated coupon",quantity:"Quantity",price:"Price",payment_method:"Payment method",paid_at:"Payment time",created_at:"Order time",trade_no:"Payment transaction number",refund_no:"Refund transaction number",refunded_at:"Refund time",refund_memo:"Refund note",refund_operator:"Operator",reservation_date:"Visit time",accesso_product_id:"Accesso Product ID"}},c={where:{is_deleted:!1,sold:{$ne:0},order_time:_},scientificNotationConvertKeys:["barcode"],includeKeys:["order_number","package_name","origin_type","barcode","sold","order_id","trade_no","generated_at","expires_at","status","is_refunded"],customizeHeaders:{order_number:"Ticketing system order number",order_id:"Wechat order number",trade_no:"Payment transaction number",package_name:"Ticket name",origin_type:"Ticket category",barcode:"QR code",sold:"Whether it is sold(1:true/0:false)",status:"Status",generated_at:"Start of validity period",expires_at:"End of validity period",is_refunded:"Refunded"}},u=Object.assign({},c);u.where={is_deleted:!1,sold:{$eq:0}},u.expand="ticket",u.includeKeys=["order_number","package_name","origin_type","ticket","barcode","sold","order_id","trade_no","generated_at","expires_at","status","is_refunded"],u.customizeHeaders.ticket="Unit Price",e.exports=async function(e,t){const r=BaaS.invoke(i.CREATE_EXPORT_JOB_ID,{timing_email:!0,tableId:o.order,...s},!1),n=BaaS.invoke(i.CREATE_EXPORT_JOB_ID,{timing_email:!0,tableId:o.prize_redemption_log,...d},!1),a=BaaS.invoke(i.CREATE_EXPORT_JOB_ID,{timing_email:!0,tableId:o.ticket_inventory,...c},!1),_=BaaS.invoke(i.CREATE_EXPORT_JOB_ID,{timing_email:!0,tableId:o.ticket_inventory,...u},!1);Promise.all([r,n,a,_]).then(()=>{t(null,{message:"success"})}).catch(e=>{console.log("定时导出数据表失败:",e),t(e)})}}});