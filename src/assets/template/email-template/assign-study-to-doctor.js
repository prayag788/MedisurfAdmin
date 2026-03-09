export default `<div>
<p>Hi Dr. {{doctor_name}},</p>
<p>Dicom study: "<b>{{study_id}}</b>", has been assigned to you in ${process.env.REACT_APP_INNER_NAME}.</p>
<p><b>Patient details:</b></p>
<p>
    Patient Name: {{Patient_name}}<br/>
    Patient DOB: {{Patient_DOB}}<br/>
    Patient ID: {{Patient_ID}}<br/>
    Patient sex: {{Patient_sex}}
</p>
<p>Log in here to view study : <a href="${process.env.REACT_APP_URL}"> ${process.env.REACT_APP_URL}</a> </p>
Thank You,<br/>
${process.env.REACT_APP_THANK_NAME}<br/>
</p>
</div>`
