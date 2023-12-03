"use client";
import { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Table,
  Spin,
  message,
  Button,
  Skeleton,
  Breadcrumb,
  Input,
  InputRef,
  Space,
  Modal,
} from "antd";

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
import Highlighter from "react-highlight-words";
import {
  DownloadOutlined,
  SendOutlined,
  SettingOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { HiOutlineMail } from "react-icons/hi";
import { BsPlus } from "react-icons/bs";
import { ColumnType, FilterConfirmProps } from "antd/es/table/interface";
import ReportSettings from "../components/ReportSettings";

const { TabPane } = Tabs;

interface DataType {
  key: string;
  name: string;
  usn: number;
}

type DataIndex = keyof DataType;

const StudentList = ({ params }: { params: { slug: string } }) => {
  const [studentData, setStudentData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [activeTab, setActiveTab] = useState("");

  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isReportGenerating, setIsReportGenerating] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [branch, setBranch] = useState("");
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const storage = getStorage(); // Initialize Firebase Storage
  const SignStorageRef = ref(storage, "signature");
  const [principalPhotoUrl, setPrincipalPhotoUrl] = useState<string>("");
  const [branchPhotoUrl, setBranchPhotoUrl] = useState<string>("");

  useEffect(() => {
    const fetchPrincipalSignature = async () => {
      try {
        const url = await getDownloadURL(
          ref(storage, `signature/principal-ISE.jpg`)
        );
        setPrincipalPhotoUrl(url);
      } catch (error) {
        console.log(error);
      }

      try {
        const url = await getDownloadURL(
          ref(storage, `signature/branch-ISE.jpg`)
        );
        setBranchPhotoUrl(url);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPrincipalSignature();
  }, [studentData]);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search `}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

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
          setBranch(data.branch);
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
      width: 250,

      render: (text, record) => {
        return <div className="min-w-[250px]">{record.name}</div>;
      },
      ...getColumnSearchProps("name"),
    },
    {
      title: "USN",
      dataIndex: "usn",
      key: "usn",
      width: 100,
      ...getColumnSearchProps("usn"),
    },
    { title: "Email", dataIndex: "email", key: "email", width: 140 },
    {
      title: "Download Report",
      dataIndex: "downloadReport",
      key: "downloadReport",
      width: 200,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadReport(record)}
        >
          Download Report
        </Button>
      ),
    },
  ];

  const columns = [...staticColumns, ...generateColumns()];

  const handleDownloadReport = async (student) => {
    const blob = await pdf(
      <ReportDocument
        studentData={[student]}
        branchPhotoUrl={branchPhotoUrl}
        principalPhotoUrl={principalPhotoUrl}
      />
    ).toBlob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `StudentReport_${student.usn}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href); // Clean up the URL.createObjectURL
  };

  const handleDownloadAllReports = async () => {
    setIsReportGenerating(true);
    const zip = new JSZip();

    for (const student of studentData) {
      const blob = await pdf(
        <ReportDocument
          studentData={[student]}
          branchPhotoUrl={branchPhotoUrl}
          principalPhotoUrl={principalPhotoUrl}
        />
      ).toBlob();
      zip.file(`StudentReport_${activeTab}_${student.usn}.pdf`, blob);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "AllStudentReports.zip";
      link.click();
    });
    setIsReportGenerating(false);
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
        <ReportDocument
          studentData={[student]}
          branchPhotoUrl={branchPhotoUrl}
          principalPhotoUrl={principalPhotoUrl}
        />
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
    <>
      <div className="max-w-full px-4 overflow-x-auto overflow-y-auto">
        <div className="flex justify-between gap-2  py-4">
          <Breadcrumb>
            <Breadcrumb.Item>{params.slug}</Breadcrumb.Item>
            <Breadcrumb.Item>Internals</Breadcrumb.Item>
          </Breadcrumb>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setSettingsModalVisible(true)}
              icon={<SettingOutlined />}
              type="dashed"
            >
              Progress Report Settings
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={isEmailSending}
            >
              Create New Test
            </Button>
          </div>
        </div>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="CIE 1" key="CIE-1" />
          <TabPane tab="CIE 2" key="CIE-2" />
          <TabPane tab="CIE 3" key="CIE-3" />
        </Tabs>

        {true ? (
          <>
            <div className="flex justify-end gap-2  py-4">
              <Button
                onClick={() => handleDownloadAllReports()}
                icon={<DownloadOutlined />}
                loading={isReportGenerating}
              >
                {isReportGenerating ? "Preparing..." : "Download All Reports"}
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
                bordered
                loading={!dataFetched}
                tableLayout="fixed"
              />
            </div>
          </>
        ) : (
          <div className="border rounded mt-20 border-gray-200">
            <Skeleton active className="w-full p-10 max-w-[calc(100%-200px)]" />
          </div>
        )}
      </div>

      <Modal
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={null}
        title="Progress Report Settings"
      >
        <ReportSettings branch={branch} />
      </Modal>
    </>
  );
};

export default StudentList;
