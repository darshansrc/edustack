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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classId = params.slug;
        setDataFetched(false);
        const res = await fetch(`${window.location.origin}/api/internals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ classId, activeTab }),
          cache: "no-cache",
        });

        if (res.ok) {
          const data = await res.json();
          setStudentData(data.StudentData);
          setSubjectData(data.subjectData);
          setDataFetched(true);
        }

        if (!res.ok) {
          setDataFetched(true);
          message.error("Unable to fetch data");
        }
      } catch (error) {
        console.log("Unable to save changes");
      }
    };

    fetchData();
  }, [activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

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
            loading ? "Generating Report..." : "Download Report"
          }
        </PDFDownloadLink>
      ),
    },
  ];

  const columns = [...staticColumns, ...generateColumns()];

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
        <div className="w-full flex flex-row items-center justify-center h-48">
          <Spin tip="Loading..." />
        </div>
      )}
    </div>
  );
};

export default StudentList;
