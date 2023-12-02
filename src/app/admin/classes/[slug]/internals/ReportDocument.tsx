import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

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

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
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
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    flexGrow: 1,
    padding: 8,
  },
  tableHeader: {
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
  },
});

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
);

export default ReportDocument;
