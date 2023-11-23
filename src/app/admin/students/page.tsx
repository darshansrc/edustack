"use client";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Skeleton,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { db } from "@/lib/firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from "@firebase/firestore";
import React, { useEffect, useState } from "react";

// Define the StudentData interface
interface StudentData {
  id: string;
  studentName: string;
  studentUSN: string;
  studentID: string;
  studentEmail: string;
  studentCourse: string;
  studentYearOfScheme: string;
  studentPhone?: string;
  fatherName?: string;
  fatherEmail?: string;
  fatherPhone?: string;
  motherName?: string;
  motherEmail?: string;
  motherPhone?: string;
}

const ManageStudents = () => {
  // State for managing student data
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(
    null
  );
  const [form] = Form.useForm();
  const [dataFetched, setDataFetched] = useState(false);

  // Message API for displaying notifications
  const [messageApi, contextHolder] = message.useMessage();

  // Function to show the modal
  const showModal = (student?: StudentData) => {
    setEditingStudent(student || null);
    form.setFieldsValue(student || {});
    setIsModalVisible(true);
  };

  // Function to handle modal cancel
  const handleCancel = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalVisible(false);
  };

  // Function to handle form submission
  const onFinish = async (values: any) => {
    try {
      if (editingStudent) {
        // Edit existing student
        const studentDocRef = doc(db, "students", editingStudent.id);
        await setDoc(studentDocRef, values);
        messageApi.success("Student updated successfully!");
        setStudentData((prevStudentData) =>
          prevStudentData.map((student) =>
            student.id === editingStudent.id
              ? { ...student, ...values }
              : student
          )
        );
      } else {
        messageApi.success("Studentttt not added !");
        const docRef = await addDoc(collection(db, "students"), values);
        messageApi.success("Student added successfully!");
        const newStudent: StudentData = { id: docRef.id, ...values };
        setStudentData((prevStudentData) => [...prevStudentData, newStudent]);
      }

      form.resetFields();
      setEditingStudent(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding/editing student:", error);
    }
  };

  // Function to handle student deletion
  const onDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "students", id));
      messageApi.success("Student deleted successfully!");
      setStudentData((prevStudentData) =>
        prevStudentData.filter((student) => student.id !== id)
      );
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Function to fetch student data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setDataFetched(false);
        const studentSnapshot = await getDocs(collection(db, "students"));
        const fetchedStudentData: StudentData[] = studentSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            studentName: doc.data().studentName,
            studentUSN: doc.data().studentUSN,
            studentID: doc.data().studentID,
            studentEmail: doc.data().studentEmail,
            studentCourse: doc.data().studentCourse,
            studentYearOfScheme: doc.data().studentYearOfScheme,
            studentPhone: doc.data().studentPhone,
            fatherName: doc.data().fatherName,
            fatherEmail: doc.data().fatherEmail,
            fatherPhone: doc.data().fatherPhone,
            motherName: doc.data().motherName,
            motherEmail: doc.data().motherEmail,
            motherPhone: doc.data().motherPhone,
          })
        );
        setStudentData(fetchedStudentData);
        setDataFetched(true);
      } catch (error) {
        messageApi.error("Error fetching students!");
      }
    };

    fetchStudents();
  }, []);

  // Columns for the student table
  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 100,
    },
    {
      title: "Email",
      dataIndex: "studentEmail",
      key: "studentEmail",
      width: 100,
    },
    {
      title: "Course",
      dataIndex: "studentCourse",
      key: "studentCourse",
      width: 100,
    },
    {
      title: "Year of Scheme",
      dataIndex: "studentYearOfScheme",
      key: "studentYearOfScheme",
      width: 100,
    },
    {
      title: "Action",
      key: "action",
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

  return (
    <div className="flex flex-col items-left mt-8 pl-4 pr-4 max-w-full">
      {contextHolder}
      <div className="mb-4 w-full flex items-center justify-between flex-row">
        <p className="pl-2 font-semibold text-xl text-gray-700">
          Manage Students
        </p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add New Student
        </Button>
      </div>
      <div className="border rounded-lg overflow-x-auto overflow-y-auto">
        {dataFetched ? (
          <Table
            columns={columns}
            dataSource={studentData}
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
          <Form.Item
            label="Student Name"
            name="studentName"
            className="mt-6"
            rules={[
              { required: true, message: "Please enter the student name!" },
            ]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>
          <Form.Item
            label="USN"
            name="studentUSN"
            rules={[
              { required: true, message: "Please enter the student USN!" },
            ]}
          >
            <Input placeholder="Enter student USN" />
          </Form.Item>
          <Form.Item
            label="Student ID"
            name="studentID"
            rules={[
              { required: true, message: "Please enter the student ID!" },
            ]}
          >
            <Input placeholder="Enter student ID" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="studentEmail"
            rules={[
              { required: true, message: "Please enter the student email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input placeholder="Enter student email address" />
          </Form.Item>
          <Form.Item
            label="Course"
            name="studentCourse"
            rules={[
              { required: true, message: "Please enter the student course!" },
            ]}
          >
            <Input placeholder="Enter student course" />
          </Form.Item>
          <Form.Item
            label="Branch"
            name="studentBranch"
            rules={[
              { required: true, message: "Please select the student branch!" },
            ]}
          >
            <Select placeholder="Select branch">
              <Select.Option value="CSE">CSE</Select.Option>
              <Select.Option value="ISE">ISE</Select.Option>
              <Select.Option value="ECE">ECE</Select.Option>
              <Select.Option value="ME">ME</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Year of Scheme"
            name="studentYearOfScheme"
            rules={[
              {
                required: true,
                message: "Please select the student year of scheme!",
              },
            ]}
          >
            {/* You can use a DatePicker or a Select based on your preference */}
            {/* Using Select */}
            <Select placeholder="Select year of scheme">
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                <Select.Option key={year} value={year.toString()}>
                  {year}
                </Select.Option>
              ))}
            </Select>

            {/* Using DatePicker */}
            {/* <DatePicker picker="year" placeholder="Select year of scheme" /> */}
          </Form.Item>

          <Form.Item
            label="Phone"
            name="studentPhone"
            rules={[
              {
                required: false,
                message: "Please enter the student phone number!",
              },
            ]}
          >
            <Input placeholder="Enter student phone number" />
          </Form.Item>
          <Form.Item
            label="Father's Name"
            name="fatherName"
            rules={[
              { required: false, message: "Please enter the father's name!" },
            ]}
          >
            <Input placeholder="Enter father's name" />
          </Form.Item>
          <Form.Item
            label="Father's Email"
            name="fatherEmail"
            rules={[
              { required: false, message: "Please enter the father's email!" },
              { type: "email", message: "Please enter a valid email address!" },
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
              { required: false, message: "Please enter the mother's name!" },
            ]}
          >
            <Input placeholder="Enter mother's name" />
          </Form.Item>
          <Form.Item
            label="Mother's Email"
            name="motherEmail"
            rules={[
              { required: false, message: "Please enter the mother's email!" },
              { type: "email", message: "Please enter a valid email address!" },
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
        </Form>
      </Modal>
    </div>
  );
};

export default ManageStudents;
