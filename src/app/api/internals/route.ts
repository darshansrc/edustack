import { auth } from "firebase-admin";
import { customInitApp } from "@/lib/firebase-admin-config";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase-config";

customInitApp();

export async function POST(request: NextRequest) {
  const res = await request.json();
  console.log(res + "res data");

  const classId = res.classId;
  const test = res.activeTab;
  let StudentData: any[] = [];
  let subjectData: any[] = [];
  let selectedSemester: string = "";

  if (classId) {
    const classRef = doc(db, "database", classId);
    const classSnap = await getDoc(classRef);

    if (classSnap.exists()) {
      selectedSemester = classSnap.data().currentSemester.toString();
    }

    const subjectSnapshot = await getDocs(
      collection(db, "database", classId, "subjects")
    );

    const fetchedSubjectData = subjectSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        code: doc.data().code,
        compulsoryElective: doc.data().compulsoryElective,
        faculties: doc.data().faculties,
        name: doc.data().name,
        semester: doc.data().semester,
        theoryLab: doc.data().theoryLab,
      }))
      .filter((subject) => subject.semester.toString() === selectedSemester);

    subjectData = fetchedSubjectData;

    if (fetchedSubjectData.length > 0 && selectedSemester !== "") {
      const studentSnapshot = await getDocs(
        collection(db, "database", classId, "students")
      );

      const fetchedStudentData = studentSnapshot.docs.map((doc) => ({
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
        testMarks: {},
      }));

      for (const subject of subjectData) {
        // Initialize test marks and max marks properties
        fetchedStudentData.forEach((student) => {
          student.testMarks[subject.code] = {
            obtainedTestMarks: "-",
            obtainedAssignmentMarks: "-",
            subjectName: subject.name,
            maximumTestMarks: "-",
            maximumAssignmentMarks: "-",
            attendance: {
              totalClassesHeld: 0,
              totalClassesAttended: 0,
            },
          };
        });

        const testMarksDocRef = doc(
          db,
          "database",
          classId,
          "internals",
          selectedSemester + "SEM",
          test,
          subject.code
        );

        const attendanceCollectionRef = collection(
          db,
          "database",
          classId,
          "attendance",
          selectedSemester + "SEM",
          subject.code
        );

        const [testMarksDoc, attendanceSnapshot] = await Promise.all([
          getDoc(testMarksDocRef),
          getDocs(attendanceCollectionRef),
        ]);

        if (testMarksDoc.exists()) {
          const data = testMarksDoc.data();

          for (const studentId in data?.studentMarks) {
            const studentIndex = fetchedStudentData?.findIndex(
              (student) => student.usn === studentId
            );

            if (studentIndex !== -1) {
              // Handle the map structure of studentMarks
              fetchedStudentData[studentIndex].testMarks[subject.code] = {
                obtainedTestMarks:
                  data.studentMarks[studentId]?.obtainedTestMarks || "-",
                obtainedAssignmentMarks:
                  data.studentMarks[studentId]?.obtainedAssignmentMarks || "-",
                subjectName: subject.name,
                maximumTestMarks: data.maxTestMarks || "-",
                maximumAssignmentMarks: data.maxAssignmentMarks || "-",
                attendance: {
                  totalClassesHeld: 0,
                  totalClassesAttended: 0,
                },
              };
            }
          }
        }

        attendanceSnapshot?.forEach((doc) => {
          const studentsArray = doc.data()?.students || [];

          studentsArray?.forEach((student) => {
            const studentIndex = fetchedStudentData?.findIndex(
              (fetchedStudent) => fetchedStudent.usn === student.usn
            );

            if (studentIndex !== -1) {
              // Ensure that the attendance object exists before trying to update it
              const attendanceObject =
                fetchedStudentData[studentIndex]?.testMarks[subject.code]
                  ?.attendance;

              if (attendanceObject) {
                // Handle attendance data for each student
                if (student.Present) {
                  attendanceObject.totalClassesAttended += 1;
                }
                if (student.usn) {
                  attendanceObject.totalClassesHeld += 1;
                }
              }
            }
          });
        });
      }

      StudentData = fetchedStudentData;
    }
  }

  return NextResponse.json({ StudentData, subjectData }, { status: 200 });
}
