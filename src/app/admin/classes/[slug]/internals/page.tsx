"use client";
import { useState, useEffect } from "react";
import { Tabs, Table, Spin, message, Button } from "antd";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import ReactPDF, { BlobProvider, usePDF } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportDocument from "./ReportDocument";
import JSZip from "jszip"; // Import JSZip

const { TabPane } = Tabs;

const StudentList = ({ params }: { params: { slug: string } }) => {
  const [studentData, setStudentData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setActiveTab("CIE-1");
    fetchStudents("CIE-1");
  }, [selectedSemester, subjectData]);

  const fetchSubjects = async () => {
    try {
      setDataFetched(false);
      const subjectSnapshot = await getDocs(
        collection(db, "database", params.slug, "subjects")
      );

      const fetchedSubjectData = subjectSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          code: doc.data().code,
          compulsoryElective: doc.data().compulsoryElective,
          faculties: doc.data().faculties,
          name: doc.data().name,
          semester: doc.data().semester,
          theoryLab: doc.data().theoryLab,
        }))
        .filter((subject) => subject.semester.toString() === selectedSemester);

      setSubjectData(fetchedSubjectData);
      setDataFetched(true);
    } catch (error) {
      message.error("Error fetching subjects!");
    }
  };

  useEffect(() => {
    const fetchClassDetails = async () => {
      const classRef = doc(db, "database", params.slug);
      const classSnap = await getDoc(classRef);

      if (classSnap.exists()) {
        setSelectedSemester(classSnap.data().currentSemester.toString());
      }
    };
    fetchClassDetails();
  }, []);

  const fetchStudents = async (test) => {
    try {
      setDataFetched(false);

      const studentSnapshot = await getDocs(
        collection(db, "database", params.slug, "students")
      );

      const fetchedStudentData = studentSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        usn: doc.data().usn,
        email: doc.data().email,
        labBatch: doc.data().labBatch,
        phone: doc.data().phone,
        fatherName: doc.data().fatherName,
        fatherEmail: doc.data().fatherEmail,
        fatherPhone: doc.data().fatherPhone,
        motherName: doc.data().motherName,
        motherEmail: doc.data().motherEmail,
        motherPhone: doc.data().motherPhone,
        testMarks: {},
      }));

      for (const subject of subjectData) {
        // Initialize test marks and max marks properties
        fetchedStudentData.forEach((student) => {
          student.testMarks[subject.code] = {
            obtainedTestMarks: "-",
            obtainedAssignmentMarks: "-",
            subjectName: subject.name,
            maximumTestMarks: "-",
            maximumAssignmentMarks: "-",
            attendance: {
              totalClassesHeld: 0,
              totalClassesAttended: 0,
            },
          };
        });

        const testMarksDocRef = doc(
          db,
          "database",
          params.slug,
          "internals",
          selectedSemester + "SEM",
          test,
          subject.code
        );

        const attendanceCollectionRef = collection(
          db,
          "database",
          params.slug,
          "attendance",
          selectedSemester + "SEM",
          subject.code
        );

        const [testMarksDoc, attendanceSnapshot] = await Promise.all([
          getDoc(testMarksDocRef),
          getDocs(attendanceCollectionRef),
        ]);

        if (testMarksDoc.exists()) {
          const data = testMarksDoc.data();

          for (const studentId in data?.studentMarks) {
            const studentIndex = fetchedStudentData?.findIndex(
              (student) => student.usn === studentId
            );

            if (studentIndex !== -1) {
              // Handle the map structure of studentMarks
              fetchedStudentData[studentIndex].testMarks[subject.code] = {
                obtainedTestMarks:
                  data.studentMarks[studentId]?.obtainedTestMarks || "-",
                obtainedAssignmentMarks:
                  data.studentMarks[studentId]?.obtainedAssignmentMarks || "-",
                subjectName: subject.name,
                maximumTestMarks: data.maxTestMarks || "-",
                maximumAssignmentMarks: data.maxAssignmentMarks || "-",
                attendance: {
                  totalClassesHeld: 0,
                  totalClassesAttended: 0,
                },
              };
            }
          }
        }

        attendanceSnapshot?.forEach((doc) => {
          const studentsArray = doc.data()?.students || [];

          studentsArray?.forEach((student) => {
            const studentIndex = fetchedStudentData?.findIndex(
              (fetchedStudent) => fetchedStudent.usn === student.usn
            );

            if (studentIndex !== -1) {
              // Ensure that the attendance object exists before trying to update it
              const attendanceObject =
                fetchedStudentData[studentIndex]?.testMarks[subject.code]
                  ?.attendance;

              if (attendanceObject) {
                // Handle attendance data for each student
                if (student.Present) {
                  attendanceObject.totalClassesAttended += 1;
                }
                if (student.usn) {
                  attendanceObject.totalClassesHeld += 1;
                }
              }
            }
          });
        });
      }

      setStudentData(fetchedStudentData);
      console.log("Student Data:", fetchedStudentData);
      setDataFetched(true);
    } catch (error) {
      message.error("Error fetching students, test marks, and attendance!");
      console.error(error);
    }
  };

  // Handle semester change
  const handleSemesterChange = (key) => {
    setSelectedSemester(key);
    fetchSubjects();
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchStudents(key);
  };

  // Generate dynamic columns based on fetched subjects
  const generateColumns = () => {
    return subjectData.map((subject) => ({
      title: subject.name + " (" + subject.code + ")",
      dataIndex: subject.code,
      key: subject.code,
      children: [
        {
          title: "Test",
          dataIndex: `testMarks.${subject.code}.obtainedTestMarks`,
          key: `test_${subject.code}`,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks ? studentMarks.obtainedTestMarks : "-";
          },
        },
        {
          title: "Assignment",
          dataIndex: `testMarks.${subject.code}.obtainedAssignmentMarks`,
          key: `assignment_${subject.code}`,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks ? studentMarks.obtainedAssignmentMarks : "-";
          },
        },
        {
          title: "Classes held",
          dataIndex: `testMarks.${subject.code}.attendance.totalClassesHeld`,
          key: `totalClassesHeld_${subject.code}`,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks
              ? studentMarks.attendance.totalClassesHeld
              : "-";
          },
        },
        {
          title: "Classes attended",
          dataIndex: `testMarks.${subject.code}.attendance.totalClassesAttended`,
          key: `totalClassesAttended_${subject.code}`,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks
              ? studentMarks.attendance.totalClassesAttended
              : "-";
          },
        },
        {
          title: "Attendance Percentage",
          dataIndex: `testMarks.${subject.code}.attendance.totalClassesAttended`,
          key: `attendance_${subject.code}`,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks
              ? `${(
                  (studentMarks.attendance.totalClassesAttended /
                    studentMarks.attendance.totalClassesHeld) *
                  100
                ).toFixed(0)}%`
              : "-";
          },
        },
      ],
    }));
  };

  // Define static columns for basic student information
  const staticColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "USN", dataIndex: "usn", key: "usn" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Download Report",
      dataIndex: "downloadReport",
      key: "downloadReport",
      render: (_, record) => (
        <PDFDownloadLink
          document={<ReportDocument studentData={[record]} />}
          fileName={`StudentReport_${record.usn}.pdf`}
        >
          {({ blob, url, loading, error }) =>
            loading ? <Spin /> : "Download Report"
          }
        </PDFDownloadLink>
      ),
    },
    // Add more static columns based on your data
  ];

  // Combine static and dynamic columns
  const columns = [...staticColumns, ...generateColumns()];

  // Fetch subjects on initial load

  useEffect(() => {
    fetchSubjects();
  }, [selectedSemester]);

  // Fetch students when the active tab changes
  useEffect(() => {
    fetchStudents(activeTab);
  }, [activeTab]);

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="CIE 1" key="CIE-1" />
        <TabPane tab="CIE 2" key="CIE-2" />
        <TabPane tab="CIE 3" key="CIE-3" />
      </Tabs>

      {/* <Button onClick={handleDownloadAll}>Download All Reports (ZIP)</Button> */}

      {dataFetched ? (
        <Table
          dataSource={studentData}
          columns={columns}
          size="small"
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Spin tip="Loading..." />
      )}
    </div>
  );
};

export default StudentList;
