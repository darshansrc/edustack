"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message as antMessage,
  Popconfirm,
  Skeleton,
  Upload,
  Alert,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  InboxOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { db } from "@/lib/firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from "@firebase/firestore";
import Dragger from "antd/es/upload/Dragger";

interface StudentData {
  id: string;
  name: string;
  usn: string;
  email: string;
  labBatch: string;
  phone?: string;
  fatherName?: string;
  fatherEmail?: string;
  fatherPhone?: string;
  motherName?: string;
  motherEmail?: string;
  motherPhone?: string;
  counsellorEmail?: string;
}

const ManageStudents = ({ params }: { params: { slug: string } }) => {
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(
    null
  );
  const [uploadCSVModalVisible, setUploadCSVModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [dataFetched, setDataFetched] = useState(false);

  const [messageApi, contextHolder] = antMessage.useMessage();

  const showModal = (student?: StudentData) => {
    setEditingStudent(student || null);
    form.setFieldsValue(student || {});
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalVisible(false);
  };

  const onFinish = async (values: any) => {
    try {
      if (Array.isArray(values)) {
        // CSV data
        const isValid = validateCsvData(values);

        if (isValid) {
          processCsvData(values);
          antMessage.success("CSV data added successfully!");
        } else {
          antMessage.error("Invalid CSV file. Please check the format.");
        }
      } else {
        // Individual student data
        if (validateIndividualStudent(values)) {
          await handleIndividualStudent(values);
        } else {
          antMessage.error("Invalid student data. Please check the fields.");
        }
      }

      form.resetFields();
      setEditingStudent(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding/editing student:", error);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "database", params.slug, "students", id));
      messageApi.success("Student deleted successfully!");
      setStudentData((prevStudentData) =>
        prevStudentData.filter((student) => student.id !== id)
      );
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setDataFetched(false);
      const studentSnapshot = await getDocs(
        collection(db, "database", params.slug, "students")
      );
      const fetchedStudentData: StudentData[] = studentSnapshot.docs.map(
        (doc) => ({
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
          counsellorEmail: doc.data().counsellorEmail,
        })
      );
      setStudentData(fetchedStudentData);
      setDataFetched(true);
    } catch (error) {
      messageApi.error("Error fetching students!");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const validateCsvData = (csvData: any[]) => {
    const requiredFields = ["name", "usn", "labBatch"];

    for (const row of csvData) {
      // Check if any of the required fields are empty
      if (requiredFields.some((field) => !row[field])) {
        return false;
      }

      // Check if labBatch contains only numbers between 1, 2, and 3
      const labBatchValue = parseInt(row["labBatch"], 10);
      if (isNaN(labBatchValue) || labBatchValue < 1 || labBatchValue > 3) {
        return false;
      }

      // Check if counsellorEmail is a valid email address
    }

    return true;
  };

  const isValidEmail = (email: string) => {
    // Use a regex pattern for basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  const processCsvData = (csvData: any[]) => {
    for (const row of csvData) {
      handleIndividualStudent(row);
    }
    antMessage.success("All students added successfully!");
    setUploadCSVModalVisible(false);
  };

  const validateIndividualStudent = (values: any) => {
    const requiredFields = ["name", "usn", "labBatch"];

    return requiredFields.every((field) => values[field]);
  };

  const handleIndividualStudent = async (values: any) => {
    try {
      const sanitizedValues: StudentData = {
        id: values.usn,
        name: values.name || "",
        usn: values.usn || "",
        email: values.email || "",
        phone: values.phone || "",
        fatherName: values.fatherName || "",
        fatherEmail: values.fatherEmail || "",
        fatherPhone: values.fatherPhone || "",
        motherName: values.motherName || "",
        motherEmail: values.motherEmail || "",
        motherPhone: values.motherPhone || "",
        labBatch: values.labBatch || "",
        counsellorEmail: values.counsellorEmail || "",
      };

      const studentDocRef = doc(
        db,
        "database",
        params.slug,
        "students",
        values.usn
      );

      await setDoc(studentDocRef, sanitizedValues);

      messageApi.success("Student added successfully!");

      // const newStudent: StudentData = { id: values.usn, ...values };

      // setStudentData((prevStudentData) => [...prevStudentData, newStudent]);

      fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const columns = [
    {
      title: "Student USN",
      dataIndex: "usn",
      key: "usn",
      width: 100,
      className: "text-[12px]",
    },
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      width: 100,
      className: "text-[12px]",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 100,
      className: "text-[12px]",
    },
    {
      title: "Lab Batch",
      dataIndex: "labBatch",
      key: "labBatch",
      className: "text-[12px]",
      width: 100,
      render: (text: string) => <span>Batch {text}</span>,
    },
    {
      title: "Counsellor's Email",
      dataIndex: "counsellorEmail",
      key: "counsellorEmail",
      className: "text-[12px]",
      width: 100,
    },
    {
      title: "Parent Name",
      dataIndex: "fatherName",
      key: "fatherName",
      className: "text-[12px]",
      width: 100,
    },
    {
      title: "Parent Email",
      dataIndex: "fatherEmail",
      key: "fatherEmail",
      className: "text-[12px]",
      width: 100,
    },
    {
      title: "Action",
      key: "action",
      className: "text-[12px]",
      width: 100,
      render: (text: string, record: StudentData) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this Student?"
            description="Are you sure to delete this Student? Once you delete, it cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Function to parse CSV data into an array of objects
  const parseCsv = (csvText: string) => {
    const lines = csvText.split("\n");
    const headers = lines[0].split(",");
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const obj: { [key: string]: string } = {}; // Provide a type assertion here

      const currentLine = lines[i].split(",");

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j].trim()] = currentLine[j].trim();
      }

      result.push(obj);
    }

    return result;
  };
  // Function to handle CSV upload
  const handleCsvUpload = async (csvData: any[]) => {
    try {
      const isValid = validateCsvData(csvData);

      if (isValid) {
        processCsvData(csvData);
        antMessage.success("CSV data added successfully!");
        fetchStudents();
      } else {
        antMessage.error("Invalid CSV file. Please check the format.");
      }
    } catch (error) {
      console.error("Error handling CSV upload:", error);
      antMessage.error("Error handling CSV upload. Please try again.");
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isCSV = file.type === "text/csv";

      if (!isCSV) {
        antMessage.error(`${file.name} is not a CSV file`);
        return Upload.LIST_IGNORE; // Prevent default behavior for non-CSV files
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event?.target?.result as string;
          const csvData = parseCsv(text);
          handleCsvUpload(csvData);
        } catch (error) {
          antMessage.error("Error parsing CSV file. Please try again.");
        }
      };
      reader.readAsText(file);
      return false; // Prevent default behavior
    },
  };

  const showCSVModal = () => {
    setUploadCSVModalVisible(true);
  };

  const downloadCSV = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," + studentDataToCSV();
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "classData.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      antMessage.error("Error downloading CSV. Please try again.");
    }
  };

  const studentDataToCSV = () => {
    const csvHeader = [
      "name",
      "usn",
      "email",
      "labBatch",
      "counsellorEmail",
      "phone",
      "fatherName",
      "fatherEmail",
      "fatherPhone",
      "motherName",
      "motherEmail",
      "motherPhone",
    ].join(",");
    const csvRows = studentData.map((student) => {
      const {
        name,
        usn,
        email,
        labBatch,
        counsellorEmail,
        phone,
        fatherName,
        fatherEmail,
        fatherPhone,
        motherName,
        motherEmail,
        motherPhone,
      } = student;

      return `"${name}","${usn}","${email}","${labBatch}","${counsellorEmail}","${phone}","${fatherName}","${fatherEmail}","${fatherPhone}","${motherName}","${motherEmail}","${motherPhone}"`;
    });

    return `${csvHeader}\n${csvRows.join("\n")}`;
  };
  return (
    <div className="flex flex-col items-left mt-8 pl-4 pr-4 max-w-full">
      {contextHolder}
      <div className="mb-4 w-full flex items-center justify-between flex-row">
        <p className="pl-2 font-semibold text-xl text-gray-700">
          Manage Students
        </p>
        <div className="flex flex-row gap-4 justify-center items-center">
          <Button icon={<DownloadOutlined />} onClick={downloadCSV}>
            Download Class Data
          </Button>
          <Button icon={<InboxOutlined />} onClick={showCSVModal}>
            Upload CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add New Student
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto overflow-y-auto">
        {true ? (
          <Table
            columns={columns}
            dataSource={studentData}
            loading={!dataFetched}
            size="small"
            className="w-full min-w-full max-w-[calc(100%-200px)]"
          />
        ) : (
          <Skeleton active className="w-full p-10 max-w-[calc(100%-200px)]" />
        )}
      </div>

      <Modal
        title={editingStudent ? "Edit Student" : "Add New Student"}
        open={isModalVisible}
        onCancel={handleCancel}
        centered
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            {editingStudent ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10">
            <div>
              <Form.Item
                label="Student Name"
                name="name"
                className="mt-6"
                rules={[
                  { required: true, message: "Please enter the student name!" },
                ]}
              >
                <Input placeholder="Enter student name" />
              </Form.Item>
              <Form.Item
                label="USN"
                name="usn"
                rules={[
                  { required: true, message: "Please enter the student USN!" },
                ]}
              >
                <Input placeholder="Enter student USN" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter the student email!",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email address!",
                  },
                ]}
              >
                <Input placeholder="Enter student email address" />
              </Form.Item>
              <Form.Item
                label="Lab Batch"
                name="labBatch"
                rules={[
                  { required: true, message: "Please select the lab batch!" },
                ]}
              >
                <Select placeholder="Select lab batch">
                  <Select.Option value={"1"}>Batch 1</Select.Option>
                  <Select.Option value={"2"}>Batch 2</Select.Option>
                  <Select.Option value={"3"}>Batch 3</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Counsellor's Email"
                name="counsellorEmail"
                rules={[
                  {
                    required: false,
                    message: "Please enter the counsellor's email!",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email address!",
                  },
                ]}
              >
                <Input placeholder="Enter counsellor's email address" />
              </Form.Item>
            </div>

            <div>
              <Form.Item
                label="Father's Name"
                name="fatherName"
                rules={[
                  {
                    required: false,
                    message: "Please enter the father's name!",
                  },
                ]}
              >
                <Input placeholder="Enter father's name" />
              </Form.Item>
              <Form.Item
                label="Father's Email"
                name="fatherEmail"
                rules={[
                  {
                    required: false,
                    message: "Please enter the father's email!",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email address!",
                  },
                ]}
              >
                <Input placeholder="Enter father's email address" />
              </Form.Item>
              <Form.Item
                label="Father's Phone"
                name="fatherPhone"
                rules={[
                  {
                    required: false,
                    message: "Please enter the father's phone number!",
                  },
                ]}
              >
                <Input placeholder="Enter father's phone number" />
              </Form.Item>
              <Form.Item
                label="Mother's Name"
                name="motherName"
                rules={[
                  {
                    required: false,
                    message: "Please enter the mother's name!",
                  },
                ]}
              >
                <Input placeholder="Enter mother's name" />
              </Form.Item>
              <Form.Item
                label="Mother's Email"
                name="motherEmail"
                rules={[
                  {
                    required: false,
                    message: "Please enter the mother's email!",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email address!",
                  },
                ]}
              >
                <Input placeholder="Enter mother's email address" />
              </Form.Item>
              <Form.Item
                label="Mother's Phone"
                name="motherPhone"
                rules={[
                  {
                    required: false,
                    message: "Please enter the mother's phone number!",
                  },
                ]}
              >
                <Input placeholder="Enter mother's phone number" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
      <Modal
        open={uploadCSVModalVisible}
        onCancel={() => setUploadCSVModalVisible(false)}
        title="Add Students via CSV"
        footer={[]}
      >
        <Alert
          type="info"
          className="my-4 p-3"
          showIcon
          message={
            <div>
              <p>To add students using a CSV file, follow these steps:</p>
              <ol>
                <li>
                  {" "}
                  <strong>1.</strong> Download the template CSV file:
                </li>
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  href="/studentUploadTemplate.csv"
                  download="studentUploadTemplate.csv"
                >
                  Download Template
                </Button>
                <li>
                  {" "}
                  <strong>2.</strong> Add student details to the downloaded
                  file.
                </li>
                <li>
                  {" "}
                  <strong>3.</strong> Upload the modified CSV file using the
                  button below.
                </li>
              </ol>
              <p className="mt-2">
                <strong>Note:</strong> Please note that the fields{" "}
                <strong>name</strong>, <strong>usn</strong>,{" "}
                <strong>email</strong>, and <strong>labBatch</strong> are
                necessary for every student. Also labBatch should be a number
                either 1 ,2 or 3.
              </p>
            </div>
          }
        />
        <Upload {...uploadProps} className="w-full">
          <Button type="primary" icon={<UploadOutlined />}>
            Upload CSV
          </Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default ManageStudents;
