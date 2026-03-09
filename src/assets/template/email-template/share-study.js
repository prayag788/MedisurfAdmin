export default `<body>
<div>
    <p>Hi {{doctor_name/patient_name}},</p>
    <p>{{hospital_name}}{{username}} has shared a study list with you.</p>
    <p>You can access your exam by using the URL and password below:</p>
    <b>URL link:</b>
    <p><a href="{{Study_URL}}">{{Study_URL}}</a></p>
    <p><b>Password</b>: {{Password}}</p>
    <p>The URL, QR-code and password will be valid until <b>{{Study_URL_expiration_time}}</b></p>
    <p>{{QR_code}}</p>
    <p>
    Thank You,<br/>
    ${process.env.REACT_APP_THANK_NAME}.<br/>
    </p>
</div>
</body>`
