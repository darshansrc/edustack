"use client";
import { useState, useEffect } from "react";
import { Tabs, Table, Spin, message } from "antd";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import ReactPDF from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportDocument from "./ReportDocument";

const { TabPane } = Tabs;

const StudentList = ({ params }: { params: { slug: string } }) => {
  const [studentData, setStudentData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("2");
  const [activeTab, setActiveTab] = useState("CIE-1");

  // Function to fetch subjects
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

  // Function to fetch students
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
        testMarks: {}, // Initialize empty test marks object
      }));

      // Fetch test marks for each subject
      for (const subject of subjectData) {
        console.log("Fetching test marks for subject:", subject.code);
        const testMarksDocRef = doc(
          db,
          "database",
          params.slug,
          "internals",
          "2SEM",
          test,
          subject.code
        );

        const testMarksDoc = await getDoc(testMarksDocRef);

        if (testMarksDoc.exists()) {
          const data = testMarksDoc.data();

          // Log test marks data to identify any issues
          console.log(`Subject Code: ${subject.code}, Data:`, data);

          for (const studentId in data.studentMarks) {
            const studentIndex = fetchedStudentData.findIndex(
              (student) => student.id === studentId
            );

            if (studentIndex !== -1) {
              // Handle the map structure of studentMarks
              fetchedStudentData[studentIndex].testMarks[subject.code] = {
                obtainedTestMarks:
                  data.studentMarks[studentId].obtainedTestMarks,
                obtainedAssignmentMarks:
                  data.studentMarks[studentId].obtainedAssignmentMarks,
              };
            }
          }
        }
      }

      console.log("Fetched Student Data:", fetchedStudentData);

      setStudentData(fetchedStudentData);
      setDataFetched(true);
    } catch (error) {
      message.error("Error fetching students and test marks!");
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
            loading ? "Loading document..." : "Download Report"
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
