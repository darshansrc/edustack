"use client";
import { PDFViewer } from "@react-pdf/renderer";
import ProgressReport from "./Progressreport";

function ReportPage() {
  return (
    <>
      <div className="h-[100vh] w-[100vw] flex justify-center items-center">
        <PDFViewer
          style={{
            width: "1000px",
            height: "900px",
            border: "1px solid black",
            padding: "10px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <ProgressReport />
        </PDFViewer>
      </div>
    </>
  );
}

export default ReportPage;
