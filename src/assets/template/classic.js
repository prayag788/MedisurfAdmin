export default `<table border="0" width="100%">
<tbody>
<tr>
<td width="100%"><img style="max-width: 100%; display: block; margin-left: auto; margin-right: auto;" src="${process.env.REACT_APP_URL}static/media/logo.38a61bee.png"></td>
</tr>
<tr>
<td width="100%">
<p style="font-size: 21px; text-align: center;">861 SW 8ST - Miami, FL 33130</p>
</td>
</tr>
<tr>
<td width="100%">&nbsp;</td>
</tr>
<tr>
<td width="100%">
<p style="text-align: center;"><strong style="font-size: 28px; font-weight: 900;">Radiology Report</strong></p>
</td>
</tr>
<tr>
<td width="100%">&nbsp;</td>
</tr>
</tbody>
</table>
<hr style="width: 100%; border: 2px solid black;">
<table border="0" width="100%">
<tbody>
<tr>
<td style="text-align: left;" width="100%">
<table border="0" width="100%">
<tbody>
<tr>
<td><strong>Name:</strong> {{patient_name}}</td>
<td><strong>Patient ID:</strong> {{patient_ID}}</td>
</tr>
<tr>
<td><strong>DOB:</strong> {{patient_DOB}} (age {{patient_age}})</td>
<td><strong>Study Date:</strong> {{study_date}}</td>
</tr>
<tr>
<td><strong>Sex:</strong> {{patient_sex}}</td>
<td><strong>Location:</strong> {{location}}</td>
</tr>
<tr>
<td><strong>Staff:</strong> Attendant: {{attendant}}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>Radiologist: {{radiologist}}</td>
<td valign="top"><strong>Referring:</strong> {{referring_physician}}</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<hr style="width: 100%; border: 2px solid black;">
<p><br><br></p>
<table border="0" width="100%">
<tbody>
<tr>
<td width="100%">{{title_of_report}}</td>
</tr>
</tbody>
</table>
<hr style="width: 90%; margin-right: 10%; border: 1px solid black;">
<table border="0" width="100%">
<tbody>
<tr>
<td width="100%">{{radiologist_diagnosis}}</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<table border="0" width="100%">
<tbody>
<tr>
<td width="100%">{{electronic_sign}}</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<table border="0" width="100%">
<tbody>
<tr>
<td width="100%">{{report_addendum}}</td>
</tr>
</tbody>
</table>`
