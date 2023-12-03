"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { message, Modal, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ReportSettings = ({ branch }) => {
  const storage = getStorage(); // Initialize Firebase Storage
  const SignStorageRef = ref(storage, "signature");
  const [selectedPhoto, setSelectedPhoto] = useState<File>();
  const [principalPhotoUrl, setPrincipalPhotoUrl] = useState<string>("");
  const [branchPhotoUrl, setBranchPhotoUrl] = useState<string>("");
  const [isPrincipalModalVisible, setIsPrincipalModalVisible] =
    useState<boolean>(false);
  const [isBranchModalVisible, setIsBranchModalVisible] =
    useState<boolean>(false);

  const showPrincipalEditModal = () => {
    setIsPrincipalModalVisible(true);
  };

  const showBranchEditModal = () => {
    setIsBranchModalVisible(true);
  };

  const handlePrincipalOk = () => {
    setIsPrincipalModalVisible(false);
  };

  const handleBranchOk = () => {
    setIsBranchModalVisible(false);
  };

  const handleCancel = () => {
    setIsPrincipalModalVisible(false);
    setIsBranchModalVisible(false);
    setSelectedPhoto(undefined);
  };

  const fetchSignature = async (signatureType, currentBranch = branch) => {
    try {
      const url = await getDownloadURL(
        ref(storage, `signature/${signatureType}-${currentBranch}.jpg`)
      );
      if (signatureType === "principal") {
        setPrincipalPhotoUrl(url);
      } else {
        setBranchPhotoUrl(url);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePhotoUpload = async (signatureType) => {
    if (selectedPhoto) {
      const photoRef = ref(SignStorageRef, `${signatureType}-${branch}.jpg`);

      try {
        await uploadBytes(photoRef, selectedPhoto);
        setSelectedPhoto(undefined);
        message.success("Photo uploaded successfully");
        fetchSignature(signatureType);
        setIsPrincipalModalVisible(false);
        setIsBranchModalVisible(false);
      } catch (error) {
        console.error("Error uploading the file:", error);
        // Handle the error (e.g., show an error message)
      }
    }
  };

  useEffect(() => {
    fetchSignature("principal");
    fetchSignature("branch");
  }, [branch]);

  return (
    <div>
      <div>
        <p className="pl-2 text-primary mt-4">Principal Signature</p>
        <div className="flex flex-row">
          <div className="w-full">
            <img
              src={principalPhotoUrl}
              alt=""
              className="rounded-xl border w-full h-full border-gray-200"
            />
          </div>
          <div className="flex flex-col w-3/12 gap-3 h-full items-center justify-center py-5">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={showPrincipalEditModal}
            >
              Edit
            </Button>
            <Button danger icon={<DeleteOutlined />} />
          </div>
        </div>
        <Modal
          title={`Edit Principal Signature`}
          open={isPrincipalModalVisible}
          onOk={() => handlePhotoUpload("principal")}
          onCancel={handleCancel}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (!event.target.files) return;
              setSelectedPhoto(event.target.files[0]);
            }}
          />
        </Modal>
      </div>
      <div>
        <p className="pl-2 text-primary mt-4">{`${branch} Signature`}</p>
        <div className="flex flex-row">
          <div className="w-full">
            <img
              src={branchPhotoUrl}
              alt=""
              className="rounded-xl border w-full h-full border-gray-200"
            />
          </div>
          <div className="flex flex-col w-3/12 gap-3 h-full items-center justify-center py-5">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={showBranchEditModal}
            >
              Edit
            </Button>
            <Button danger icon={<DeleteOutlined />} />
          </div>
        </div>
        <Modal
          title={`Edit ${branch} Signature`}
          open={isBranchModalVisible}
          onOk={() => handlePhotoUpload("branch")}
          onCancel={handleCancel}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (!event.target.files) return;
              setSelectedPhoto(event.target.files[0]);
            }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ReportSettings;
