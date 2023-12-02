"use client";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import ProgressReport from "./Progressreport";

function ReportPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <div className="h-[100vh] w-[100vw] flex justify-center items-center">
        {isClient && (
          <div>
            <PDFDownloadLink
              document={<ProgressReport />}
              fileName="somename.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? "Loading document..." : "Download now!"
              }
            </PDFDownloadLink>
          </div>
        )}
      </div>
    </>
  );
}

export default ReportPage;
