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
  ];

  // Function to parse CSV data into an array of objects
  return (
    <div className="flex flex-col items-left mt-8 pl-4 pr-4 max-w-full">
      {contextHolder}
      <div className="mb-4 w-full flex items-center justify-between flex-row">
        <p className="pl-2 font-semibold text-xl text-gray-700">
          View Students of Class {params.slug}
        </p>
        <div className="flex flex-row gap-4 justify-center items-center"></div>
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
    </div>
  );
};

export default ManageStudents;
