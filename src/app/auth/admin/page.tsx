"use client";

import React from "react";
import { BsStack } from "react-icons/bs";
import { Button, Checkbox, Form, Input } from "antd";

const onFinish = (values: any) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

type FieldType = {
  username: string;
  password: string;
};

const AdminAuthPage = () => {
  return (
    <>
      <div className="min-w-screen min-h-screen flex flex-col items-center justify-center">
        <div className="w-11/12 max-w-md flex flex-col items-center justify-center text-center bg-white rounded-xl border border-solid border-gray-100">
          <h4 className="font-poppins flex flex-row  my-4 font-semibold  text-[22px] text-gray-700 mt-3">
            <BsStack className="w-8 h-8 text-primary pr-2" /> Edustack
          </h4>
          <h5 className="font-semibold ">Login as Administrator</h5>

          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            className="w-full"
          >
            <Form.Item<FieldType>
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <script> </script>
    </>
  );
};

export default AdminAuthPage;
