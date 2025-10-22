const emailConfig = {
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USERNAME || 'manhng132@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'rqisoolrehrwayum', // App Password
    },
  },
  from: process.env.SMTP_FROM || 'manhng132@gmail.com',
};

export default emailConfig;
