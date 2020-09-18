const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = function(env, argv) {
  const isProd = argv.mode === 'production'
  return {
    entry: {
      create_order: './src/create_order.js',
      cancel_order: './src/cancel_order.js',
      order_ttl_check: './src/order_ttl_check.js',
      redemption_ttl_check: './src/redemption_ttl_check.js',
      check_ticket_inventory: './src/check_ticket_inventory.js',
      redeem_prize: './src/redeem_prize.js',
      get_order: './src/get_order.js',
      send_inventory_warning_email: './src/send_inventory_warning_email.js',
      reset_send_inventory_warning_email_record: './src/reset_send_inventory_warning_email_record.js',
      create_user: './src/create_user.js',
      get_ticket_inventory: './src/get_ticket_inventory.js',
      get_wx_qrcode: './src/get_wx_qrcode.js',
      export_data: './src/export_data.js',
      create_export_job_id: './src/create_export_job_id.js',
      send_timing_export_email: './src/send_timing_export_email.js',
      rollback_prize_redemption_log: './src/rollback_prize_redemption_log.js',
      set_lottery_redemption_log: './src/set_lottery_redemption_log.js',
      send_lottery_template_msg: './src/send_lottery_template_msg.js',
      send_lottery_started_msg: './src/send_lottery_started_msg.js',
      send_message: './src/send_message.js',
      send_notification: './src/send_notification.js',
      check_and_send_message: './src/check_and_send_message.js',
      reset_message_status: './src/reset_message_status.js',
      check_and_send_expired_warning_email: './src/check_and_send_expired_warning_email.js',
      check_expired_closed_times: './src/check_expired_closed_times.js',
    },
    output: {
      filename: isProd ? '[name].js' : 'dev_[name].js',
      library: 'exports.main',
      libraryTarget: 'assign',
    },
    target: 'node',
    plugins: [new CleanWebpackPlugin(['dist'])],
  }
}
