export default `<div>
<p>Hi {{name}},</p>
<p>Welcome to ${process.env.REACT_APP_WELCOME_NAME}. Please find your login details below.</p>
<p><b>Username:</b> {{username}}</p>
<p><b>Password:</b> {{password}}</p>
<p><b>Note:</b> You must have to change the password after sign up.</p>
<p>
Thank You,<br/>
${process.env.REACT_APP_THANK_NAME}<br/>
</p>
</div>`
