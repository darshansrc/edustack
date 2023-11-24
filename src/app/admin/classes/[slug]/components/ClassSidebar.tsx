"use client";

import React, { useEffect, useState } from "react";
import { BsFillPeopleFill, BsPeople, BsStack } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import { IoCalendarNumber } from "react-icons/io5";
import {
  FaChalkboardUser,
  FaCircleUser,
  FaUserGraduate,
  FaUserGroup,
} from "react-icons/fa6";
import { AiFillHome } from "react-icons/ai";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { Layout, Menu, Popconfirm, theme } from "antd";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { MdLogout, MdSpaceDashboard } from "react-icons/md";

const { SubMenu } = Menu;
const { Sider } = Layout;

const ClassSidebar = ({ params }: { params: { slug: string } }) => {
  const pathname = usePathname() || "";

  const router = useRouter();

  const handleSignOut = async () => {
    signOut(auth);
    const response = await fetch(`${window.location.origin}/api/auth/signout`, {
      method: "POST",
    });
    if (response.status === 200) {
      router.push("/");
    }
  };

  return (
    <Layout className=" h-screen min-h-screen  z-[50] ">
      <Sider className="h-full " theme="light">
        <div className="min-h-[10px]"></div>

        <Menu
          mode="inline"
          className="w-full"
          theme="light"
          defaultSelectedKeys={[pathname]}
        >
          <Menu.Item
            key={`/admin/classes/${params.slug}/students`}
            icon={<MdSpaceDashboard />}
          >
            <Link href={`/admin/classes/${params.slug}/students`}>
              Students
            </Link>
          </Menu.Item>

          <Menu.Item
            key={`/admin/classes/${params.slug}/subjects`}
            icon={<MdSpaceDashboard />}
          >
            <Link href={`/admin/classes/${params.slug}/subjects`}>
              Subjects
            </Link>
          </Menu.Item>

          <Menu.Item
            key={`/admin/classes/${params.slug}/internals`}
            icon={<MdSpaceDashboard />}
          >
            <Link href={`/admin/classes/${params.slug}/subjects`}>
              Internals
            </Link>
          </Menu.Item>

          <Menu.Item
            key={`/admin/classes/${params.slug}/SEE`}
            icon={<MdSpaceDashboard />}
          >
            <Link href={`/admin/classes/${params.slug}/SEE`}>SEE</Link>
          </Menu.Item>
        </Menu>
      </Sider>
    </Layout>
  );
};

export default ClassSidebar;
