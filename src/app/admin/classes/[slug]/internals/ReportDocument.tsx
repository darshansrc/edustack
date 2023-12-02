import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

interface Student {
  id: string;
  name: string;
  usn: string;
  testMarks: Record<
    string,
    { obtainedTestMarks?: number; obtainedAssignmentMarks?: number }
  >;
}

interface ReportDocumentProps {
  studentData: Student[];
}

Font.register({
  family: "Times-Roman",
  src: "/fonts/tnr.bold.ttf",
});

const styles = StyleSheet.create({
  title: {
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
    textDecoration: "underline",
    fontWeight: 500,
    fontFamily: "Times-Roman",
  },
  parentName: {
    fontSize: 10,
  },
  subtitle: {
    fontSize: 10,
  },
  text: {
    fontSize: 11,
    textAlign: "justify",
  },
  Timage: {
    marginVertical: 0,
    marginHorizontal: 0,
  },
  Bimage: {
    marginVertical: 0,
    marginHorizontal: 0,
    height: "140px",
  },
  fullPage: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  page: {
    fontFamily: "Times-Roman",
  },
  table: {
    display: "flex",
    width: "100%",
    borderLeft: "1px solid #000",
    borderBottom: "1px solid #000",
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    padding: 5,
    flex: 1,
    textAlign: "left",
    borderRight: "1px solid #000",
    margin: 0,
  },
  evenRow: {
    backgroundColor: "#fff",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
  tableCell: {
    flex: 1,
    width: "50px",
    fontSize: 10,
    margin: 0,
    padding: 5,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #000",
    borderTop: "1px solid #000",
  },

  // Not needed for report
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    textDecoration: "underline",
  },
  studentInfo: {
    marginBottom: 10,
  },
});

// const styles = StyleSheet.create({
//   page: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     flexGrow: 1,
//   },
//   header: {
//     fontSize: 18,
//     marginBottom: 10,
//     textAlign: "center",
//     textDecoration: "underline",
//   },
//   studentInfo: {
//     marginBottom: 10,
//   },
//   table: {
//     display: "flex",
//     width: "auto",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderRightWidth: 0,
//     borderBottomWidth: 0,
//   },
//   tableRow: {
//     flexDirection: "row",
//   },
//   tableCell: {
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderRightWidth: 0,
//     borderBottomWidth: 0,
//     flexGrow: 1,
//     padding: 8,
//   },
//   tableHeader: {
//     backgroundColor: "#f2f2f2",
//     fontWeight: "bold",
//   },
// });

const ReportDocument: React.FC<ReportDocumentProps> = ({ studentData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Student Report</Text>
        {studentData.map((student) => (
          <View key={student.id} style={styles.studentInfo}>
            <Text>{`Name: ${student.name}`}</Text>
            <Text>{`USN: ${student.usn}`}</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={[styles.tableCell, { flexGrow: 2 }]}>
                  <Text>Subject</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>Test Marks</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>Assignment Marks</Text>
                </View>
              </View>
              {Object.entries(student.testMarks).map(([subjectCode, marks]) => (
                <View key={subjectCode} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flexGrow: 2 }]}>
                    <Text>{subjectCode}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{(marks as any)?.obtainedTestMarks || "-"}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>
                      {(marks as any)?.obtainedAssignmentMarks || "-"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
  // <Document>
  //   <Page size="A4" style={styles.page}>
  //     <View
  //       style={{
  //         display: "flex",
  //         flexDirection: "row",
  //         padding: "12px",
  //         width: "100vw",
  //         paddingHorizontal: 80,
  //         paddingVertical: 10,
  //         position: "relative",
  //         fontFamily: "Times-Roman",
  //       }}
  //     >
  //       <View
  //         style={{
  //           maxWidth: "60px",
  //           maxHeight: "60px",
  //         }}
  //       >
  //         <Image src="/logorv.png" />
  //       </View>
  //       <View style={{ textAlign: "center", width: "100%" }}>
  //         <Text style={{ fontSize: "12px", textAlign: "center" }}>
  //           RV Educational Institutions
  //         </Text>
  //         <Text
  //           style={{
  //             display: "flex",
  //             flexDirection: "column",
  //             textAlign: "center",
  //             justifyContent: "center",
  //             alignItems: "center",
  //             fontWeight: "black",
  //             color: "red",
  //             fontSize: "16px",
  //           }}
  //         >
  //           RV Institute of Technology And Management
  //         </Text>
  //         <Text style={{ fontSize: "12px" }}>
  //           (Affiliated to Visvesvaraya Technological University, Belagavi){" "}
  //           {"\n"}
  //           BENGALURU - 560 076
  //         </Text>
  //       </View>
  //     </View>
  //     <View
  //       style={{
  //         borderBottom: "1.5px solid #000",
  //         marginHorizontal: 50,
  //         marginBottom: 5,
  //       }}
  //     ></View>
  //     <View style={styles.fullPage}>
  //       <Text style={styles.title}>{studentData.Branch}</Text>
  //       <Text style={styles.title}>
  //         PROGRESS REPORT-{studentData.ProgressReportNumber}
  //       </Text>
  //       <Text style={styles.text}>To,</Text>
  //       <Text style={styles.parentName}>
  //         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mr/Mrs. {studentData.parentName},
  //       </Text>
  //       <Text style={styles.subtitle}>
  //         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The progress report of
  //         your ward {studentData.Name}, {studentData.USN} studying in{" "}
  //         {studentData.Semester} is given below:
  //       </Text>
  //       <View style={styles.table}>
  //         <View style={styles.tableRow}>
  //           <Text style={[styles.text, styles.tableCell]}>Sl.No.</Text>
  //           <Text
  //             style={{
  //               width: "200px",
  //               fontSize: 10,
  //               margin: 0,
  //               padding: 5,
  //               borderRight: "1px solid #000",
  //               borderTop: "1px solid #000",
  //             }}
  //           >
  //             Subject
  //           </Text>
  //           <Text style={[styles.text, styles.tableCell]}>
  //             Classes{"\n"}Held
  //           </Text>
  //           <Text style={[styles.text, styles.tableCell]}>
  //             Classes{"\n"}Att.
  //           </Text>
  //           <Text style={[styles.text, styles.tableCell]}>Att. %</Text>
  //           <Text style={[styles.text, styles.tableCell]}>
  //             Test-III{"\n"}marks
  //           </Text>
  //           <Text style={[styles.text, styles.tableCell]}>Max{"\n"}Marks</Text>
  //           <Text style={[styles.text, styles.tableCell]}>
  //             Quiz{"\n"}or{"\n"}Assign.
  //           </Text>
  //           <Text style={[styles.text, styles.tableCell]}>Max{"\n"}Marks</Text>
  //         </View>
  //         {studentData.TableDatas?.map((data, index) => (
  //           <View
  //             key={index}
  //             style={[
  //               styles.tableRow,
  //               index % 2 === 0 ? styles.evenRow : styles.oddRow,
  //             ]}
  //           >
  //             <Text style={[styles.text, styles.tableCell]}>{index + 1}</Text>
  //             <Text
  //               style={{
  //                 width: "200px",
  //                 fontSize: 10,
  //                 margin: 0,
  //                 padding: 5,
  //                 height: "100%",
  //                 display: "flex",
  //                 justifyContent: "center",
  //                 alignItems: "center",
  //                 borderRight: "1px solid #000",
  //                 borderTop: "1px solid #000",
  //               }}
  //             >
  //               {data.SubjectName} {"\n"}
  //               {data.SubjectCode}
  //             </Text>
  //             <Text style={[styles.text, styles.tableCell]}>
  //               {data.classesHeld}
  //             </Text>
  //             <Text style={[styles.text, styles.tableCell]}>
  //               {data.classesAttended}
  //             </Text>
  //             <Text style={[styles.text, styles.tableCell]}>
  //               {data.attendancePercentage}
  //             </Text>
  //             <Text style={[styles.text, styles.tableCell]}>{data.Tmarks}</Text>
  //             <Text style={[styles.text, styles.tableCell]}>
  //               {data.maxMarks}
  //             </Text>
  //             <Text style={[styles.text, styles.tableCell]}>
  //               {data.assignmentOrQuizMarks}
  //             </Text>
  //             <Text style={[styles.text, styles.tableCell]}>
  //               {data.maxAssignmentOrQuizMarks}
  //             </Text>
  //           </View>
  //         ))}
  //       </View>
  //       <Text style={styles.text}>
  //         <Text style={{ fontWeight: "black" }}>Remarks:</Text>{" "}
  //         {studentData.Remarks}
  //       </Text>
  //       <Text style={styles.text}>
  //         Please download, sign and send the scanned copy of the report to “
  //         {studentData.councillorEmail}” .
  //       </Text>
  //     </View>
  //     <View
  //       style={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //         paddingHorizontal: 50,
  //         alignItems: "flex-end",
  //         flexDirection: "row",
  //         paddingTop: 20,
  //       }}
  //     >
  //       <View
  //         style={{
  //           display: "flex",
  //           flexDirection: "column",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           marginTop: 10,
  //         }}
  //       >
  //         <Text style={{ ...styles.text }}>Counsellor</Text>
  //       </View>
  //       <View
  //         style={{
  //           display: "flex",
  //           flexDirection: "column",
  //           justifyContent: "center",
  //           alignItems: "center",
  //         }}
  //       >
  //         {" "}
  //         <View
  //           style={{
  //             maxWidth: "50px",
  //             maxHeight: "50px",
  //           }}
  //         >
  //           <Image src="/logorv.png" />
  //         </View>
  //         <Text style={styles.text}>HOD </Text>{" "}
  //       </View>
  //       <View
  //         style={{
  //           display: "flex",
  //           flexDirection: "column",
  //           justifyContent: "center",
  //           alignItems: "center",
  //         }}
  //       >
  //         {" "}
  //         <View
  //           style={{
  //             maxWidth: "50px",
  //             maxHeight: "50px",
  //           }}
  //         >
  //           <Image src="/logorv.png" />
  //         </View>
  //         <Text style={styles.text}>Principal</Text>
  //       </View>
  //     </View>
  //     <View style={{ paddingHorizontal: 50, paddingTop: 5 }}>
  //       <Text style={styles.text}>Parent Remarks:</Text>
  //       <Text style={styles.text}>Parent Signature: </Text>
  //     </View>

  //     {/* <Image style={styles.Bimage} src={Bottombanner} /> */}
  //   </Page>
  // </Document>
);

export default ReportDocument;
