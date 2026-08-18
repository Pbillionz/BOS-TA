const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - BOS-TA',
    html: `
      <h2>Welcome to BOS-TA!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
};

const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to BOS-TA Mentorship Platform',
    html: `
      <h2>Welcome ${firstName}!</h2>
      <p>Your account has been successfully created.</p>
      <p>You can now browse our mentor directory and apply for mentorship programs.</p>
      <a href="${process.env.FRONTEND_URL}/mentors">Browse Mentors</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send error:', err);
  }
};

const sendApplicationNotificationEmail = async (email, mentorName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Application - BOS-TA',
    html: `
      <h2>Application Received</h2>
      <p>Your application to ${mentorName} has been received.</p>
      <p>You will be notified when the mentor responds.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">Check Status</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send error:', err);
  }
};

const sendApplicationResponseEmail = async (email, status, mentorResponse) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Application ${status.toUpperCase()} - BOS-TA`,
    html: `
      <h2>Application ${status.toUpperCase()}</h2>
      <p>Your mentorship application has been ${status}.</p>
      ${mentorResponse ? `<p><strong>Mentor's Message:</strong> ${mentorResponse}</p>` : ''}
      <a href="${process.env.FRONTEND_URL}/dashboard">View Details</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send error:', err);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendApplicationNotificationEmail,
  sendApplicationResponseEmail,
};
