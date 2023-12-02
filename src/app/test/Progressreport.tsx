"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

import styles from "./Styles";

Font.register({
  family: "Times-Roman",
  src: "/fonts/tnr.bold.ttf",
});

const dummyData = {
  Branch: "COMPUTER SCIENCE & ENGINEERING",
  Semester: "IV Semester BE (CSE )",
  Name: "SIDDHANT KUMAR",
  USN: "1RF21CS101",
  parentName: "SANTOSH KUMAR",
  councillorEmail: "padmasree.rvitm@rvei.edu.in",
  ProgressReportNumber: "III",
  Remarks: "Good, Can improve in some subjects",
  TableDatas: [
    {
      SubjectCode: "(21MATCS41)",
      SubjectName: "Mathematical Foundations for Computing",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CS42)",
      SubjectName: "Design and Analysis of Algorithms",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CS43)",
      SubjectName: "Microcontroller and Embedded Systems",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CS44)",
      SubjectName: "Operating Systems",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21BE45)",
      SubjectName: "Biology for Engineers",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CS482)",
      SubjectName: "Unix Shell Programming",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CS482)",
      SubjectName: "Universal Human Values",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: " (21KBK47)/(21KSK47)",
      SubjectName: "Balake Kannada/SamskruthikaKannada",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CS43)lab",
      SubjectName: "Microcontroller and Embedded Systems lab",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CS42)lab",
      SubjectName: "Design and Analysis of Algorithms Lab",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CSL46)",
      SubjectName: "Python Programming Laboratory",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CSL46)",
      SubjectName: "Python Programming Laboratory",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CSL46)",
      SubjectName: "Python Programming Laboratory",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
    {
      SubjectCode: "(21CSL46)",
      SubjectName: "Python Programming Laboratory",
      classesHeld: "40",
      classesAttended: "37",
      attendancePercentage: "92.5",
      Tmarks: "30",
      maxMarks: "40",
      assignmentOrQuizMarks: "10",
      maxAssignmentOrQuizMarks: "10",
    },
  ],
};

function ProgressReport() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            padding: "12px",
            width: "100vw",
            paddingHorizontal: 80,
            paddingVertical: 10,
            position: "relative",
            fontFamily: "Times-Roman",
          }}
        >
          <View
            style={{
              maxWidth: "60px",
              maxHeight: "60px",
            }}
          >
            <Image src="/logorv.png" />
          </View>
          <View style={{ textAlign: "center", width: "100%" }}>
            <Text style={{ fontSize: "12px", textAlign: "center" }}>
              RV Educational Institutions
            </Text>
            <Text
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "black",
                color: "red",
                fontSize: "16px",
              }}
            >
              RV Institute of Technology And Management
            </Text>
            <Text style={{ fontSize: "12px" }}>
              (Affiliated to Visvesvaraya Technological University, Belagavi){" "}
              {"\n"}
              BENGALURU - 560 076
            </Text>
          </View>
        </View>
        <View
          style={{
            borderBottom: "1.5px solid #000",
            marginHorizontal: 50,
            marginBottom: 5,
          }}
        ></View>
        <View style={styles.fullPage}>
          <Text style={styles.title}>{dummyData.Branch}</Text>
          <Text style={styles.title}>
            PROGRESS REPORT-{dummyData.ProgressReportNumber}
          </Text>
          <Text style={styles.text}>To,</Text>
          <Text style={styles.parentName}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mr/Mrs. {dummyData.parentName},
          </Text>
          <Text style={styles.subtitle}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The progress report
            of your ward {dummyData.Name}, {dummyData.USN} studying in{" "}
            {dummyData.Semester} is given below:
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.text, styles.tableCell]}>Sl.No.</Text>
              <Text
                style={{
                  width: "200px",
                  fontSize: 10,
                  margin: 0,
                  padding: 5,
                  borderRight: "1px solid #000",
                  borderTop: "1px solid #000",
                }}
              >
                Subject
              </Text>
              <Text style={[styles.text, styles.tableCell]}>
                Classes{"\n"}Held
              </Text>
              <Text style={[styles.text, styles.tableCell]}>
                Classes{"\n"}Att.
              </Text>
              <Text style={[styles.text, styles.tableCell]}>Att. %</Text>
              <Text style={[styles.text, styles.tableCell]}>
                Test-III{"\n"}marks
              </Text>
              <Text style={[styles.text, styles.tableCell]}>
                Max{"\n"}Marks
              </Text>
              <Text style={[styles.text, styles.tableCell]}>
                Quiz{"\n"}or{"\n"}Assign.
              </Text>
              <Text style={[styles.text, styles.tableCell]}>
                Max{"\n"}Marks
              </Text>
            </View>
            {dummyData.TableDatas.map((data, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}
              >
                <Text style={[styles.text, styles.tableCell]}>{index + 1}</Text>
                <Text
                  style={{
                    width: "200px",
                    fontSize: 10,
                    margin: 0,
                    padding: 5,
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRight: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                >
                  {data.SubjectName} {"\n"}
                  {data.SubjectCode}
                </Text>
                <Text style={[styles.text, styles.tableCell]}>
                  {data.classesHeld}
                </Text>
                <Text style={[styles.text, styles.tableCell]}>
                  {data.classesAttended}
                </Text>
                <Text style={[styles.text, styles.tableCell]}>
                  {data.attendancePercentage}
                </Text>
                <Text style={[styles.text, styles.tableCell]}>
                  {data.Tmarks}
                </Text>
                <Text style={[styles.text, styles.tableCell]}>
                  {data.maxMarks}
                </Text>
                <Text style={[styles.text, styles.tableCell]}>
                  {data.assignmentOrQuizMarks}
                </Text>
                <Text style={[styles.text, styles.tableCell]}>
                  {data.maxAssignmentOrQuizMarks}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.text}>
            <Text style={{ fontWeight: "black" }}>Remarks:</Text>{" "}
            {dummyData.Remarks}
          </Text>
          <Text style={styles.text}>
            Please download, sign and send the scanned copy of the report to “
            {dummyData.councillorEmail}” .
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingHorizontal: 50,
            alignItems: "flex-end",
            flexDirection: "row",
            paddingTop: 20,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ ...styles.text }}>Counsellor</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {" "}
            <View
              style={{
                maxWidth: "50px",
                maxHeight: "50px",
              }}
            >
              <Image src="/logorv.png" />
            </View>
            <Text style={styles.text}>HOD </Text>{" "}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {" "}
            <View
              style={{
                maxWidth: "50px",
                maxHeight: "50px",
              }}
            >
              <Image src="/logorv.png" />
            </View>
            <Text style={styles.text}>Principal</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 50, paddingTop: 5 }}>
          <Text style={styles.text}>Parent's Remarks:</Text>
          <Text style={styles.text}>Parent's Signature: </Text>
        </View>

        {/* <Image style={styles.Bimage} src={Bottombanner} /> */}
      </Page>
    </Document>
  );
}

export default ProgressReport;
