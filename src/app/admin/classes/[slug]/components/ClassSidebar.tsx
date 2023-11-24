"use client";

import React, { useEffect, useState } from "react";
import { BsFillPeopleFill, BsPeople, BsStack } from "react-icons/bs";
import { HiDocumentReport, HiDocumentText } from "react-icons/hi";
import { RiGraduationCapFill } from "react-icons/ri";
import {
  FaBook,
  FaChalkboardUser,
  FaCircleUser,
  FaUserGraduate,
  FaUserGroup,
} from "react-icons/fa6";
import { AiFillHome } from "react-icons/ai";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { Card, Layout, Menu, Popconfirm, theme } from "antd";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase-config";
import { doc, getDoc } from "@firebase/firestore";

const { SubMenu } = Menu;
const { Sider } = Layout;

const ClassSidebar = ({ params }: { params: { slug: string } }) => {
  const pathname = usePathname() || "";
  const [ongoingSemester, setOngoingSemester] = useState<string>("");
  const [classStatus, setClassStatus] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchClassDetails = async () => {
      const classRef = doc(db, "database", params.slug);
      const classSnap = await getDoc(classRef);

      if (classSnap.exists()) {
        console.log(classSnap.data());
        setOngoingSemester(classSnap.data().currentSemester);
        setClassStatus(classSnap.data().classroomStatus);
      }
    };
    fetchClassDetails();
  }, []);

  return (
    <Layout className=" h-screen min-h-screen  z-[48] ">
      <Sider className="h-full " theme="light">
        <Menu
          mode="inline"
          className="w-full h-full"
          theme="light"
          defaultSelectedKeys={[pathname]}
        >
          <div className="min-h-[10px]"></div>

          <div className="w-full flex items-center">
            <Card
              title="Class Details"
              className="max-w-11/12 rounded-none text-[12px]"
              size="small"
              bordered={false}
              style={{ width: 300 }}
            >
              <p className="text-[12px]">Classroom ID: {params.slug}</p>
              <p className="text-[12px]">
                Ongoing Semester: {ongoingSemester}-SEM
              </p>
              <p className="text-[12px]">Class Staus: {classStatus}</p>
            </Card>
          </div>

          <div className="min-h-[10px]"></div>

          <Menu.Item
            key={`/admin/classes/${params.slug}/students`}
            icon={<FaUserGroup />}
          >
            <Link href={`/admin/classes/${params.slug}/students`}>
              Students
            </Link>
          </Menu.Item>

          <Menu.Item
            key={`/admin/classes/${params.slug}/subjects`}
            icon={<FaBook />}
          >
            <Link href={`/admin/classes/${params.slug}/subjects`}>
              Subjects
            </Link>
          </Menu.Item>

          <Menu.Item
            key={`/admin/classes/${params.slug}/internals`}
            icon={<HiDocumentReport />}
          >
            <Link href={`/admin/classes/${params.slug}/subjects`}>
              Internals
            </Link>
          </Menu.Item>

          <Menu.Item
            key={`/admin/classes/${params.slug}/SEE`}
            icon={<RiGraduationCapFill />}
          >
            <Link href={`/admin/classes/${params.slug}/SEE`}>SEE</Link>
          </Menu.Item>
        </Menu>
      </Sider>
    </Layout>
  );
};

export default ClassSidebar;
