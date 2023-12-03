"use client";
import { useState, useEffect } from "react";
import { Tabs, Table, Spin, message, Button, Skeleton } from "antd";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import ReactPDF, { BlobProvider, pdf, usePDF } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportDocument from "./ReportDocument";
import JSZip from "jszip"; // Import JSZip
import ReactDOM from "react-dom";
import test from "node:test";
import emailjs from "emailjs-com";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { DownloadOutlined, SendOutlined } from "@ant-design/icons";
import { HiOutlineMail } from "react-icons/hi";

const { TabPane } = Tabs;

const StudentList = ({ params }: { params: { slug: string } }) => {
  const [studentData, setStudentData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [activeTab, setActiveTab] = useState("");

  const [isEmailSending, setIsEmailSending] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

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
      width: 100,
      children: [
        {
          title: "Test",
          dataIndex: `testMarks.${subject.code}.obtainedTestMarks`,
          key: `test_${subject.code}`,
          width: 100,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks ? studentMarks.obtainedTestMarks : "-";
          },
        },
        {
          title: "Assignment",
          dataIndex: `testMarks.${subject.code}.obtainedAssignmentMarks`,
          key: `assignment_${subject.code}`,
          width: 100,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks ? studentMarks.obtainedAssignmentMarks : "-";
          },
        },
        {
          title: "Classes held",
          dataIndex: `testMarks.${subject.code}.attendance.totalClassesHeld`,
          key: `totalClassesHeld_${subject.code}`,
          width: 100,
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
          width: 100,
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
          width: 100,
          render: (text, record) => {
            const studentMarks = record.testMarks[subject.code];
            return studentMarks.attendance.totalClassesHeld
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
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => {
        return <div className="min-w-[250px]">{record.name}</div>;
      },
    },
    { title: "USN", dataIndex: "usn", key: "usn", width: 100 },
    { title: "Email", dataIndex: "email", key: "email", width: 120 },
    {
      title: "Download Report",
      dataIndex: "downloadReport",
      key: "downloadReport",
      width: 200,
      render: (_, record) => (
        <PDFDownloadLink
          document={<ReportDocument studentData={[record]} />}
          fileName={`StudentReport_${record.usn}.pdf`}
        >
          {({ blob, url, loading, error }) => (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              loading={!isEmailSending && loading}
            >
              Download Report
            </Button>
          )}
        </PDFDownloadLink>
      ),
    },
  ];

  const columns = [...staticColumns, ...generateColumns()];

  const handleDownloadAllReports = async () => {
    const zip = new JSZip();

    for (const student of studentData) {
      const blob = await pdf(
        <ReportDocument studentData={[student]} />
      ).toBlob();
      zip.file(`StudentReport_${activeTab}_${student.usn}.pdf`, blob);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "AllStudentReports.zip";
      link.click();
    });
  };

  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const handleSendEmails = async () => {
    setIsEmailSending(true);
    for (const student of studentData) {
      const pdfBlob = await pdf(
        <ReportDocument studentData={[student]} />
      ).toBlob();
      const base64Pdf = await blobToBase64(pdfBlob);

      try {
        // const storage = getStorage();
        // const ReportStorageRef = ref(storage, "progress-report");
        // const ReportRef = ref(ReportStorageRef, `${student.fatherEmail}.pdf`);

        // // Convert base64 to Uint8Array
        // const arrayBuffer = base64ToArrayBuffer(base64Pdf);
        // const uint8Array = new Uint8Array(arrayBuffer);

        // try {
        //   // Upload Uint8Array to Google Cloud Storage
        //   await uploadBytes(ReportRef, uint8Array);
        // } catch (error) {
        //   console.error("Error uploading the file:", error);
        // }

        // const url = await getDownloadURL(
        //   ref(storage, `progress-report/${student.fatherEmail}.pdf`)
        // );
        const key = student.name;
        message.loading({
          key,
          content: `Sending Progress report for ${student.name}...`,
        });

        const response = await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: student.fatherEmail,
            from: "admin@edu-stack.com",
            subject: `Report for ${student.name}`,
            text: `Here is the report for ${student.name}`,
            attachment: base64Pdf,
            phone: student.fatherPhone,
          }),
        });

        if (response.ok) {
          message.success({
            key,
            content: "Progress report sent successfully for " + student.name,
            duration: 2,
          });
        }

        if (!response.ok) {
          message.error({
            key,
            content: "Failed to sned Progress report for " + student.name,
            duration: 2,
          });
          throw new Error("Error sending email");
        }

        console.log("Email sent");
      } catch (error) {
        console.error(error);
      }
    }
    setIsEmailSending(false);
    message.success({
      content: "Emails sent successfully",
      duration: 5,
    });
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        // Explicitly cast reader.result to string
        const resultString = reader.result as string;
        resolve(resultString.split(",")[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="max-w-full px-4 overflow-x-auto overflow-y-auto">
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="CIE 1" key="CIE-1" />
        <TabPane tab="CIE 2" key="CIE-2" />
        <TabPane tab="CIE 3" key="CIE-3" />
      </Tabs>

      {dataFetched ? (
        <>
          <div className="flex justify-end gap-2  py-4">
            <Button
              onClick={() => handleDownloadAllReports()}
              icon={<DownloadOutlined />}
            >
              Download All Reports
            </Button>
            <Button
              type="primary"
              onClick={handleSendEmails}
              icon={<SendOutlined />}
              loading={isEmailSending}
            >
              Send Email
            </Button>
          </div>
          <div className=" w-[calc(100vw-312px)] border border-gray-200 rounded flex items-center justify-center flex-row overflow-x-auto overflow-y-auto">
            <Table
              dataSource={studentData}
              columns={columns}
              size="small"
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className="-z-1"
              scroll={{ x: "80vw" }}
            />
          </div>
        </>
      ) : (
        <div className="border rounded mt-20 border-gray-200">
          <Skeleton active className="w-full p-10 max-w-[calc(100%-200px)]" />
        </div>
      )}
    </div>
  );
};

export default StudentList;
