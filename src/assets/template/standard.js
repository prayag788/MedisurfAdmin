export default `<body>
<table border="0" width="100%">
<tbody>
<tr>
<td style="border: 2px solid rgb(192, 192, 192); width: 33.6644%; text-align: center;" width="23%">10421 NW 28th St. Ste D102<br>Doral, FL 33172<br>Tel: 1-305-463-9447</td>
<td style="width: 2.55401%;" width="3%">&nbsp;</td>
<td style="border: 2px solid rgb(192, 192, 192); text-align: center; width: 63.7816%;" width="74%"><img src="${process.env.REACT_APP_URL}static/media/logo.38a61bee.png" alt="" width="294" height="72"></td>
</tr>
</tbody>
</table>
<p><br><br></p>
<table border="0" width="100%">
<tbody>
<tr>
<td style="border: 2px solid #C0C0C0;" width="100%">
<table border="0" width="100%">
<tbody>
<tr>
<td colspan="4">Patient Information</td>
</tr>
<tr>
<td>Patient Name:</td>
<td style="text-align: left;">{{patient_name}}</td>
<td>Patient ID:</td>
<td>{{patient_ID}}</td>
</tr>
<tr>
<td>Patient D.O.B:</td>
<td>{{patient_DOB}}</td>
<td>Study Type:</td>
<td>{{study_type}}</td>
</tr>
<tr>
<td>Referring Phy:</td>
<td>{{referring_physician}}</td>
<td>Service Date:</td>
<td>{{service_date}}</td>
</tr>
<tr>
<td>Exam Description:</td>
<td colspan="3">{{exam_description}}</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<p><br><br></p>
<table border="0" width="100%">
<tbody>
<tr>
<td style="border: 2px solid #C0C0C0;" width="100%">
<table border="0" width="100%">
<tbody>
<tr>
<td>Reason for Exam:-</td>
</tr>
<tr>
<td>{{title_of_report}}</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<p><br><br></p>
<table border="0" width="100%">
<tbody>
<tr>
<td style="border: 2px solid #C0C0C0;" width="100%">{{dicom_images}}</td>
</tr>
</tbody>
</table>
<p><br><br></p>
<table border="0" width="100%">
<tbody>
<tr>
<td style="border: 2px solid #C0C0C0;" width="100%">{{radiologist_diagnosis}}</td>
</tr>
</tbody>
</table>
<p><br><br></p>
<table border="0" width="100%">
<tbody>
<tr>
<td style="border: 2px solid #C0C0C0;" width="100%">{{electronic_sign}}</td>
</tr>
</tbody>
</table>
<p><br><br></p>
<table border="0" width="100%">
<tbody>
<tr>
<td style="border: 2px solid #C0C0C0;" width="100%">{{report_addendum}}</td>
</tr>
</tbody>
</table>
</body>`
