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
  where,
  setDoc,
  getDoc,
} from "@firebase/firestore";
import React, { useEffect, useState } from "react";

interface SubjectData {
  id: string;
  code: string;
  compulsoryElective: string;
  faculties: string[];
  name: string;
  semester: string;
  theoryLab: string;
}

const ManageSubjects = ({ params }: { params: { slug: string } }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(
    null
  );
  const [form] = Form.useForm();
  const [dataFetched, setDataFetched] = useState(false);

  const [facultyData, setFacultyData] = useState<any[]>([]);

  const [currentSemester, setCurrentSemester] = useState<string>("");

  useEffect(() => {
    const fetchClassDetails = async () => {
      const classRef = doc(db, "database", params.slug);
      const classSnap = await getDoc(classRef);

      if (classSnap.exists()) {
        setCurrentSemester(classSnap.data().currentSemester.toString());
        setSelectedSemester(classSnap.data().currentSemester.toString());
      }
    };
    fetchClassDetails();
  }, []);

  const [selectedSemester, setSelectedSemester] = useState<string>(
    currentSemester.toString()
  );

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setDataFetched(false);
        const facultySnapshot = await getDocs(collection(db, "faculty"));
        const fetchedFacultyData: any[] = facultySnapshot.docs.map((doc) => ({
          id: doc.id,
          facultyName: doc.data().facultyName,
          facultyEmail: doc.data().facultyEmail,
          facultyDesignation: doc.data().facultyDesignation,
          facultyDepartment: doc.data().facultyDepartment,
        }));
        setFacultyData(fetchedFacultyData);
        setDataFetched(true);
      } catch (error) {
        messageApi.error("Error fetching faculty!");
      }
    };

    fetchFaculty();
  }, []);

  const showModal = (subject?: SubjectData) => {
    setEditingSubject(subject || null);
    form.setFieldsValue(subject || {});
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalVisible(false);
  };

  const onFinish = async (values: any) => {
    try {
      if (editingSubject) {
        // Edit existing subject
        const subjectDocRef = doc(
          db,
          "database",
          params.slug,
          "subjects",
          editingSubject.id
        );
        await setDoc(subjectDocRef, { ...values, semester: selectedSemester });
        messageApi.success("Subject updated successfully!");
        setSubjectData((prevSubjectData) =>
          prevSubjectData.map((subject) =>
            subject.id === editingSubject.id
              ? { ...subject, ...values }
              : subject
          )
        );
      } else {
        // Add new subject
        const docRef = await setDoc(
          doc(db, "database", params.slug, "subjects", values.code),
          { ...values, semester: selectedSemester }
        );
        messageApi.success("Subject added successfully!");
        const newSubject: SubjectData = { id: values.code, ...values };
        setSubjectData((prevSubjectData) => [...prevSubjectData, newSubject]);
      }

      form.resetFields();
      setEditingSubject(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding/editing subject:", error);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "database", params.slug, "subjects", id));
      messageApi.success("Subject deleted successfully!");
      setSubjectData((prevSubjectData) =>
        prevSubjectData.filter((subject) => subject.id !== id)
      );
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setDataFetched(false);
        const subjectSnapshot = await getDocs(
          collection(db, "database", params.slug, "subjects")
        );

        const fetchedSubjectData: SubjectData[] = subjectSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            code: doc.data().code,
            compulsoryElective: doc.data().compulsoryElective,
            faculties: doc.data().faculties,
            name: doc.data().name,
            semester: doc.data().semester,
            theoryLab: doc.data().theoryLab,
          }))
          .filter((subject) => subject.semester === selectedSemester);

        setSubjectData(fetchedSubjectData);
        setDataFetched(true);
      } catch (error) {
        messageApi.error("Error fetching subjects!");
      }
    };

    fetchSubjects();
  }, [selectedSemester]);

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Compulsory/Elective",
      dataIndex: "compulsoryElective",
      key: "compulsoryElective",
      width: 150,
    },
    {
      title: "Faculties",
      dataIndex: "faculties",
      key: "faculties",
      width: 150,
      render: (faculties: string[]) => faculties.join(", "),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      width: 100,
    },
    {
      title: "Theory/Lab",
      dataIndex: "theoryLab",
      key: "theoryLab",
      width: 100,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (text: string, record: SubjectData) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this Subject?"
            description="Are you sure to delete this Subject? Once you delete, it cannot be undone."
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

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
  };

  return (
    <div className="flex flex-col items-left mt-8 pl-4 pr-4 max-w-full">
      {contextHolder}
      <div className="mb-4 w-full flex items-center justify-between flex-row">
        <p className="pl-2 font-semibold text-xl text-gray-700">
          Manage Subjects
        </p>
        <div className="flex flex-row items-center justify-center gap-4">
          <Select
            placeholder="Select Semester"
            onChange={handleSemesterChange}
            value={selectedSemester || undefined}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8"].map((semester) => (
              <Select.Option key={semester} value={semester}>
                Semester {semester}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add New Subject
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto overflow-y-auto">
        {dataFetched ? (
          <Table
            columns={columns}
            dataSource={subjectData}
            size="small"
            className="w-full min-w-full max-w-[calc(100%-200px)]"
          />
        ) : (
          <Skeleton active className="w-full p-10 max-w-[calc(100%-200px)]" />
        )}
      </div>

      <Modal
        title={
          editingSubject
            ? "Edit Subject"
            : "Add New Subject to " + selectedSemester + "-SEM"
        }
        open={isModalVisible}
        centered
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            {editingSubject ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Code"
            name="code"
            className="mt-6"
            rules={[
              {
                required: editingSubject ? false : true,
                message: "Please enter the subject code!",
              },
            ]}
          >
            <Input
              disabled={editingSubject ? true : false}
              placeholder="Enter subject code"
            />
          </Form.Item>
          <Form.Item
            label="Compulsory/Elective"
            name="compulsoryElective"
            rules={[
              { required: true, message: "Please select Compulsory/Elective!" },
            ]}
          >
            <Select placeholder="Select Compulsory/Elective">
              <Select.Option value="compulsory">Compulsory</Select.Option>
              <Select.Option value="elective">Elective</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Faculties"
            name="faculties"
            rules={[{ required: true, message: "Please select faculties!" }]}
          >
            <Select mode="multiple" placeholder="Select faculties">
              {/* Add options based on faculty data */}
              {facultyData.map((faculty) => (
                <Select.Option key={faculty.id} value={faculty.facultyEmail}>
                  {faculty.facultyName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the subject name!" },
            ]}
          >
            <Input placeholder="Enter subject name" />
          </Form.Item>

          <Form.Item
            label="Theory/Lab"
            name="theoryLab"
            rules={[{ required: true, message: "Please select Theory/Lab!" }]}
          >
            <Select placeholder="Select Theory/Lab">
              <Select.Option value="theory">Theory</Select.Option>
              <Select.Option value="lab">Lab</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSubjects;
