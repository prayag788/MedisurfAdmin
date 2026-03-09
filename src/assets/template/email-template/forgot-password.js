export default `<body>
<div>
<p>Dear {{name}},</p>
<br/>
<p>I hope this email finds you well, We have received a request to reset your password for {{username}} account. </p>
<p>Please log in using the new credentials provided below:</p>
<br/>
<p><b>Username</b>: {{username}}</p>
<p><b>Temporary Password</b>: {{Password}}</p>
<br/>
<p><b>Note:</b> You must have to change the password after signing up.</p>
<p>If you did not initiate this password reset, please contact your administrator immediately.</p>
<br/>
<p>
    Thank You,<br/>
    ${process.env.REACT_APP_THANK_NAME}.<br/>
</p>
</div>
</body>`
