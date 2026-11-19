// A mock email service — in a real product this would call something
// like SendGrid, Resend, or AWS SES. For this project, we simulate
// sending by logging it clearly to the server console, so you can
// demonstrate the *flow* (register -> trigger email) without needing
// real email infrastructure.
function sendWelcomeEmail(toEmail, name) {
  console.log('\n📧 [MOCK EMAIL SERVICE] ---------------------------');
  console.log(`To: ${toEmail}`);
  console.log(`Subject: Welcome to SmartCDN, ${name}!`);
  console.log(`Body: Your account is ready. Start by adding a website and`);
  console.log(`      running your first simulated request in the dashboard.`);
  console.log('-------------------------------------------------------\n');
}

module.exports = { sendWelcomeEmail };