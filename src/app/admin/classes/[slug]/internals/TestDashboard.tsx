"use client";
import { db } from "@/lib/firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Input, Checkbox, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface SubjectData {
  id: string;
  code: string;
  compulsoryElective: string;
  faculties: string[];
  name: string;
  semester: string;
  theoryLab: string;
}

const TestDashboard = ({ params }: { params: { slug: string } }) => {
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [currentSemester, setCurrentSemester] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>(
    currentSemester.toString()
  );
  const [testData, setTestData] = useState<any[]>([]);
  const [isCreateTestModalVisible, setCreateTestModalVisible] = useState(false);
  const [testName, setTestName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
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
          .filter(
            (subject) => subject.semester.toString() === selectedSemester
          );

        setSubjectData(fetchedSubjectData);
      } catch (error) {
        console.error("Error fetching subjects!");
      }
    };

    fetchSubjects();
  }, [selectedSemester]);

  const fetchTests = async () => {
    try {
      const testSnapshot = await getDocs(
        collection(db, "database", params.slug, "tests")
      );

      setTestData(
        testSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          subjects: doc.data().subjects,
        }))
      );
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleCreateTest = () => {
    setCreateTestModalVisible(true);
  };

  const handleCreateTestSubmit = async () => {
    try {
      const testDocRef = await addDoc(
        collection(db, "database", params.slug, "tests"),
        {
          name: testName,
          subjects: selectedSubjects,
        }
      );

      const testPath = `/database/${params.slug}/internals/${selectedSemester}SEM/${testName}`;

      await setDoc(doc(db, testPath), { subjects: {} });

      setCreateTestModalVisible(false);
      setTestName("");
      setSelectedSubjects([]);

      fetchTests();
    } catch (error) {
      console.error("Error creating test:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Test Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      key: "subjects",
      render: (subjects: string[]) => subjects.join(", "),
    },
    // Add your other columns as needed
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTest}>
        Create New Test
      </Button>

      {/* Create/Edit Test Modal */}
      <Modal
        title="Create New Test"
        visible={isCreateTestModalVisible}
        onOk={handleCreateTestSubmit}
        onCancel={() => setCreateTestModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Test Name">
            <Input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Select Subjects">
            <Checkbox.Group
              options={subjectData.map((subject) => subject.name)}
              value={selectedSubjects}
              onChange={(values) => setSelectedSubjects(values as string[])}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Table columns={columns} dataSource={testData} />
    </div>
  );
};

export default TestDashboard;
