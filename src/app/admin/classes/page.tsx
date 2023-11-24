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
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { db } from "@/lib/firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  updateDoc,
} from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ClassroomData {
  id: string;
  branch: string;
  classroomSection: string;
  currentSemester: number;
  year: number;
  classroomStatus: string;
}

const ManageClassrooms = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [classroomData, setClassroomData] = useState<ClassroomData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClassroom, setEditingClassroom] =
    useState<ClassroomData | null>(null);
  const [form] = Form.useForm();
  const [dataFetched, setDataFetched] = useState(false);

  const showModal = (classroom?: ClassroomData) => {
    setEditingClassroom(classroom || null);
    form.setFieldsValue(classroom || {});
    setIsModalVisible(true);
  };

  const router = useRouter();

  const handleCancel = () => {
    setEditingClassroom(null);
    form.resetFields();
    setIsModalVisible(false);
  };

  const onFinish = async (values: any) => {
    try {
      if (editingClassroom) {
        // Edit existing classroom
        const classroomDocRef = doc(db, "database", editingClassroom.id);

        // Filter out falsy values
        const filteredValues: Partial<ClassroomData> = Object.fromEntries(
          Object.entries(values).filter(
            ([key, value]) => value !== undefined && value !== null
          )
        );

        // Use updateDoc to update only specified fields
        await updateDoc(classroomDocRef, filteredValues);

        messageApi.success("Classroom updated successfully!");

        setClassroomData((prevClassroomData) =>
          prevClassroomData.map((classroom) =>
            classroom.id === editingClassroom.id
              ? { ...classroom, ...values }
              : classroom
          )
        );
      } else {
        // Add new classroom
        // Generate the ID based on specified conditions
        const classroomId = values.classroomSection
          ? `${values.year}-${values.branch}-${values.classroomSection}`
          : `${values.year}-${values.branch}`;

        // Use setDoc to set a document with the generated ID

        const docRef = doc(db, "database", classroomId);
        await setDoc(docRef, { ...values, id: classroomId });

        messageApi.success("Classroom added successfully!");

        const newClassroom: ClassroomData = { id: docRef.id, ...values };
        setClassroomData((prevClassroomData) => [
          ...prevClassroomData,
          newClassroom,
        ]);
      }

      form.resetFields();
      setEditingClassroom(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding/editing classroom:", error);
    }
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setDataFetched(false);
        const classroomSnapshot = await getDocs(collection(db, "database"));
        const fetchedClassroomData: ClassroomData[] =
          classroomSnapshot.docs.map((doc) => ({
            id: doc.id,
            branch: doc.data().branch,
            classroomSection: doc.data().classroomSection,
            currentSemester: doc.data().currentSemester,
            year: doc.data().year,
            classroomStatus: doc.data().classroomStatus,
          }));
        setClassroomData(fetchedClassroomData);
        setDataFetched(true);
      } catch (error) {
        messageApi.error("Error fetching classrooms!");
      }
    };

    fetchClassrooms();
  }, []);

  const columns = [
    {
      title: "Class ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 100,
    },
    {
      title: "Classroom Section",
      dataIndex: "classroomSection",
      key: "classroomSection",
      width: 100,
    },
    {
      title: "Current Semester",
      dataIndex: "currentSemester",
      key: "currentSemester",
      width: 100,
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      width: 100,
    },
    {
      title: "Classroom Status",
      dataIndex: "classroomStatus",
      key: "classroomStatus",
      width: 100,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (text: string, record: ClassroomData) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            onClick={() => router.push(`/admin/classes/${record.id}/students`)}
          >
            Go to Class
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-left mt-8 pl-4 pr-4 max-w-full">
      {contextHolder}
      <div className="mb-4 w-full flex items-center justify-between flex-row">
        <p className="pl-2 font-semibold text-xl text-gray-700">
          Manage Classrooms
        </p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add New Classroom
        </Button>
      </div>
      <div className="border rounded-lg overflow-x-auto overflow-y-auto">
        {dataFetched ? (
          <Table
            columns={columns}
            dataSource={classroomData}
            size="small"
            className="w-full min-w-full max-w-[calc(100%-200px)]"
          />
        ) : (
          <Skeleton active className="w-full p-10 max-w-[calc(100%-200px)]" />
        )}
      </div>

      <Modal
        title={editingClassroom ? "Edit Classroom" : "Add New Classroom"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            {editingClassroom ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Branch"
            name="branch"
            rules={[
              {
                required: editingClassroom ? false : true,
                message: "Please select the branch!",
              },
            ]}
          >
            <Select placeholder="Select branch" disabled={!!editingClassroom}>
              <Select.Option value="CSE">CSE</Select.Option>
              <Select.Option value="ISE">ISE</Select.Option>
              <Select.Option value="ECE">ECE</Select.Option>
              <Select.Option value="ME">ME</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Classroom Section"
            name="classroomSection"
            // rules={[
            //   {
            //     required: editingClassroom ? false : true,
            //     message: "Please select the classroom section!",
            //   },
            // ]}
          >
            <Select
              placeholder="Select classroom section"
              disabled={!!editingClassroom}
            >
              <Select.Option value="">No Section</Select.Option>
              <Select.Option value="A">A</Select.Option>
              <Select.Option value="B">B</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Current Semester"
            name="currentSemester"
            rules={[
              {
                required: true,
                message: "Please select the current semester!",
              },
            ]}
          >
            <Select placeholder="Select current semester">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                <Select.Option key={semester} value={semester}>
                  {semester}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Year"
            name="year"
            rules={[
              {
                required: editingClassroom ? false : true,
                message: "Please select the year!",
              },
            ]}
            shouldUpdate
          >
            <Select
              placeholder="Select year of scheme"
              disabled={!!editingClassroom}
            >
              {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Classroom Status"
            name="classroomStatus"
            rules={[
              {
                required: true,
                message: "Please select the classroom status!",
              },
            ]}
          >
            <Select placeholder="Select classroom status">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageClassrooms;
