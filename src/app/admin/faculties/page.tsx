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
  DocumentData,
} from "@firebase/firestore";
import React, { useEffect, useState } from "react";

interface FacultyData {
  id: string;
  facultyName: string;
  facultyEmail: string;
  facultyDesignation: string;
  facultyDepartment: string;
}

const ManageFaculties = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [facultyData, setFacultyData] = useState<FacultyData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyData | null>(
    null
  );
  const [form] = Form.useForm();
  const [dataFetched, setDataFetched] = useState(false);

  const showModal = (faculty?: FacultyData) => {
    setEditingFaculty(faculty || null);
    form.setFieldsValue(faculty || {});
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setEditingFaculty(null);
    form.resetFields();
    setIsModalVisible(false);
  };

  const onFinish = async (values: any) => {
    try {
      if (editingFaculty) {
        // Edit existing faculty
        const facultyDocRef = doc(db, "faculty", editingFaculty.id);
        await setDoc(facultyDocRef, values);
        messageApi.success("Faculty updated successfully!");
        setFacultyData((prevFacultyData) =>
          prevFacultyData.map((faculty) =>
            faculty.id === editingFaculty.id
              ? { ...faculty, ...values }
              : faculty
          )
        );
      } else {
        // Add new faculty
        const docRef = await addDoc(collection(db, "faculty"), values);
        messageApi.success("Faculty added successfully!");
        const newFaculty: FacultyData = { id: docRef.id, ...values };
        setFacultyData((prevFacultyData) => [...prevFacultyData, newFaculty]);
      }

      form.resetFields();
      setEditingFaculty(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding/editing faculty:", error);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "faculty", id));
      messageApi.success("Faculty deleted successfully!");
      setFacultyData((prevFacultyData) =>
        prevFacultyData.filter((faculty) => faculty.id !== id)
      );
    } catch (error) {
      console.error("Error deleting faculty:", error);
    }
  };

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setDataFetched(false);
        const facultySnapshot = await getDocs(collection(db, "faculty"));
        const fetchedFacultyData: FacultyData[] = facultySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            facultyName: doc.data().facultyName,
            facultyEmail: doc.data().facultyEmail,
            facultyDesignation: doc.data().facultyDesignation,
            facultyDepartment: doc.data().facultyDepartment,
          })
        );
        setFacultyData(fetchedFacultyData);
        setDataFetched(true);
      } catch (error) {
        messageApi.error("Error fetching faculty!");
      }
    };

    fetchFaculty();
  }, []);

  const columns = [
    {
      title: "Faculty Name",
      dataIndex: "facultyName",
      key: "facultyName",
    },
    {
      title: "Email",
      dataIndex: "facultyEmail",
      key: "facultyEmail",
    },
    {
      title: "Designation",
      dataIndex: "facultyDesignation",
      key: "facultyDesignation",
    },
    {
      title: "Department",
      dataIndex: "facultyDepartment",
      key: "facultyDepartment",
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: FacultyData) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this Faculty?"
            description="Are you sure to delete this Faculty? Once you delete, it cannot be undone."
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
          Manage Faculty
        </p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add New Faculty
        </Button>
      </div>
      <div className="border rounded-lg overflow-x-auto overflow-y-auto">
        {dataFetched ? (
          <Table
            columns={columns}
            dataSource={facultyData}
            size="small"
            className="w-full min-w-full max-w-[calc(100%-200px)]"
          />
        ) : (
          <Skeleton active className="w-full p-10 max-w-[calc(100%-200px)]" />
        )}
      </div>

      <Modal
        title={editingFaculty ? "Edit Faculty" : "Add New Faculty"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            {editingFaculty ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Faculty Name"
            name="facultyName"
            className="mt-6"
            rules={[
              { required: true, message: "Please enter the faculty name!" },
            ]}
          >
            <Input placeholder="Enter faculty name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="facultyEmail"
            rules={[
              { required: true, message: "Please enter the faculty email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input placeholder="Enter faculty email address" />
          </Form.Item>
          <Form.Item
            label="Designation"
            name="facultyDesignation"
            rules={[
              {
                required: true,
                message: "Please enter the faculty designation!",
              },
            ]}
          >
            <Input placeholder="Enter faculty Designation (Ex: Associate Professor)" />
          </Form.Item>
          <Form.Item
            label="Department"
            name="facultyDepartment"
            rules={[
              {
                required: true,
                message: "Please select the faculty department!",
              },
            ]}
          >
            <Select placeholder="Select department">
              <Select.Option value="CSE">CSE</Select.Option>
              <Select.Option value="ISE">ISE</Select.Option>
              <Select.Option value="ECE">ECE</Select.Option>
              <Select.Option value="ME">ME</Select.Option>
              <Select.Option value="MATHS">MATHS</Select.Option>
              <Select.Option value="PHYSICS">PHYSICS</Select.Option>
              <Select.Option value="CHEMISTRY">CHEMISTRY</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageFaculties;
