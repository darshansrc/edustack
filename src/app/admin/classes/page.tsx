"use client";
import { db } from "@/lib/firebase-config";
import { collection, getDocs, DocumentData } from "@firebase/firestore";
import React, { useState, useEffect } from "react";

interface ClassData {
  id: string;
  data: {
    // Define the structure of your class data here
    // Example:
    className: string;
    classCode: string;
    // ... other properties
  };
}

const ManageClasses = () => {
  const [classesData, setClassesData] = useState<ClassData[]>([]);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "database"));
      const fetchedClassesData: ClassData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: {
          className: doc.data().className,
          classCode: doc.data().classCode,
          // Add other properties as needed
        },
      }));
      setClassesData(fetchedClassesData);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []); // Fetch classes on component mount

  return (
    <div>
      <h1>Manage Classes</h1>
      {/* Render your classesData here */}
      {classesData.map((classItem) => (
        <div key={classItem.id}>
          {/* Render class details here */}
          <p>Class id: {classItem.id}</p>
          <p>Class Name: {classItem.data.className}</p>
          <p>Class Code: {classItem.data.classCode}</p>
          {/* Add other property renderings as needed */}
        </div>
      ))}
    </div>
  );
};

export default ManageClasses;
