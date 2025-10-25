import React, { useContext } from "react";
import {
  ChevronDown,
  Upload,
  UserStar,
  UploadCloud,
  X,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Data } from "../../Context/Store";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import fileIcon from "../../assets/file_icon.svg";
const ServiceForm2 = ({ data, servicePoints }) => {
 const API = "http://localhost:5000"
  const token = localStorage.getItem("appraisal_token");
  const decoded = jwtDecode(token);
  const designation = decoded.designation;
  const employeeId = data?.employee._id;
  const username = decoded.facultyName;
  const { serviceMarks } = useContext(Data);
  // states
  const [selectedCheck, setSelectedCheck] = useState(data?.branding?.value);
  console.log("selectedCheck", selectedCheck);
  const [files, setFiles] = useState(data?.branding?.brandingFiles);
  const [mark, setMark] = useState(data?.branding?.marks);

  const name = data.employee.fullName;
  const userDesignation = data.employee.designation;

  const handleSubmit = async (value) => {
    setSelectedCheck(value);
    console.log("Branding :", value);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/branding/${designation}/`,
        {
          branding: value,

          facultyName: name,
          employeeId: employeeId,
          designation: userDesignation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response for form 3.2:", response.data);

      setMark(response.data.finalMarks);
    } catch (err) {
      console.error(err.message);
    }
  };
  async function handleFilePreview(fileName) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/file/${fileName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // 👈 file comes as binary blob
        }
      );

      // create a blob URL
      const fileURL = URL.createObjectURL(response.data);

      // open in new tab
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error("error:", err.message);
    }
  }

  return (
    <>
      <div className="input-container-2 border border-[#AAAAAA] p-4  bg-white  rounded-xl grid gap-4 grid-cols-12">
        <div className="first-container pr-3 border-r border-gray-400 col-span-10">
          {/* .heading / question  */}
          <div>
            <h1 className="text-lg font-medium">
              Branding of Institution <span className="text-red-500">*</span>
            </h1>
          </div>
          {/* input container  */}
          <div className="checkbox-container px-6 mt-4 space-y-2">
            <div className="container-1 flex gap-2 items-center">
              <input
                type="checkbox"
                className="scale-125 cursor-pointer accent-teal-500"
                checked={selectedCheck == "Yes" ? true : false}
                onChange={() => {
                  setSelectedCheck("Yes"), handleSubmit("Yes");
                }}
              />
              <label className="text-gray-400">Yes</label>
            </div>

            <div className="container-1 flex gap-2 items-center">
              <input
                type="checkbox"
                className="scale-125 cursor-pointer accent-teal-500"
                checked={selectedCheck == "Yes" ? false : true}
                onChange={() => {
                  setSelectedCheck("No"), handleSubmit("No");
                }}
              />
              <label className="text-gray-400">No</label>
            </div>
          </div>

          {/* .files container  */}
          <div className="file-container mt-4">
            {files.map((item, index) => {
              const normalizedPath = item.replace(/\\/g, "/");
              const fileName = normalizedPath.split("/").pop();
              return (
                <>
                  <div
                    onClick={() => handleFilePreview(fileName)}
                    className="file-card file-icon-container w-fit p-2 border border-gray-300 rounded-lg flex cursor-pointer gap-2"
                  >
                    <img src={fileIcon} className="w-6 h-6" alt="file icon" />
                    <h1 className="text-gray-800">{fileName.slice(0, 15)}</h1>
                  </div>
                </>
              );
            })}
          </div>
        </div>
        {/* marks container  */}
        <div className="second-container col-span-2 text-center">
          <h1 className="text-lg font-medium">Marks</h1>
          <div className="h-[80%] flex items-center justify-center">
            <h1 className="text-[#646464]  text-lg">
              <span className="font-semibold text-[#318179]">{mark || 0}</span>{" "}
              out of {servicePoints?.Branding}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceForm2;
