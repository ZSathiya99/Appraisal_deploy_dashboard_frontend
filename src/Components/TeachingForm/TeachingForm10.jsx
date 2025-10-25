import { useEffect, useRef, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Data } from "../../Context/Store";
import fileIcon from "../../assets/file_icon.svg";

const TeachingForm10 = ({ data }) => {
  const [yesNo, setYesNo] = useState("No");
  const [mouSignedmark, setMouSignedmark] = useState(0);
  const [industryFiles, setIndustryFiles] = useState([]);

  // user info
  const [designationuser, setDesignationuser] = useState();
  const [name, setName] = useState();
  const [id, setId] = useState();
  const [files, setFiles] = useState([
    data?.innovationProject.innovationProjectFiles || [],
  ]);

  // auth
  const token = localStorage.getItem("appraisal_token");
  const decoded = token ? jwtDecode(token) : {};
  const designation = decoded?.designation;
  const API = "https://appraisaltestingbackend-1.onrender.com";

  const { markData } = useContext(Data);
  const markdata = localStorage.getItem("appraisal_outofmark");
  // Parse the string into an object
  const parsedMarkData = JSON.parse(markdata);

  // track if default values are loaded
  const isDefaultLoaded = useRef(false);

  // ✅ Set default values from GET API response
  useEffect(() => {
    if (data?.industry) {
      setYesNo(data.industry.value || "No");
      setMouSignedmark(data.industry.marks ?? 0);

      setFiles(data.industry.industryFiles || []);

      setDesignationuser(data.designation);
      setName(data.facultyName);
      setId(data.employee?._id);

      // mark defaults loaded after first GET
      isDefaultLoaded.current = true;
    }
  }, [data]);

  // ✅ API call handler
  const handleLaboratoryTypeChange = async (selectedValue) => {
    try {
      const response = await axios.post(
        `${API}/api/industryInvolvement/${designation}`,
        {
          industryInvolvement: selectedValue,
          facultyName: name,
          employeeId: id,
          designation: designationuser,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMouSignedmark(response.data.finalMarks);
      console.log("✅ Industry involvement saved:", response.data);
    } catch (error) {
      console.error(
        "❌ Error submitting industry involvement:",
        error.response?.data || error.message
      );
    }
  };

  // ✅ Trigger POST only on user changes (not defaults)
  useEffect(() => {
    if (!isDefaultLoaded.current) return; // ⛔ skip until defaults loaded
    if (name && id && designationuser) {
      handleLaboratoryTypeChange(yesNo);
    }
  }, [yesNo]); // 👈 only run when user changes Yes/No
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
    <div className="main-container border p-5 border-[#AAAAAA] bg-white rounded-xl">
      <div className="input-container-3 grid gap-4 grid-cols-12">
        {/* Left section */}
        <div className="first-container pr-3 border-r border-gray-400 col-span-10">
          <h1 className="text-lg font-medium">
            MoU Signed with Industries / Establishment of a Laboratory in
            Collaboration with an Industry / Involvement in CoE activities.{" "}
            <span className="text-red-500">*</span>
          </h1>

          {/* Yes / No selection */}
          <div className="radio-button-container mt-2 text-[#646464] font-medium">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="industry"
                  className="accent-teal-600 scale-125"
                  checked={yesNo === "Yes"}
                  onChange={() => setYesNo("Yes")}
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="industry"
                  className="accent-teal-600 scale-125"
                  checked={yesNo === "No"}
                  onChange={() => setYesNo("No")}
                />
                No
              </label>
            </div>
          </div>
          {yesNo !== "No" && (
            <>
              {files?.map((fileItem, idx) => {
                // if it's a string path
                let normalizedPath = "";
                if (typeof fileItem === "string") {
                  normalizedPath = fileItem.replace(/\\/g, "/");
                }
                // if it's an object with path
                else if (fileItem?.path) {
                  normalizedPath = fileItem.path.replace(/\\/g, "/");
                }
                // if it's a File object (from input)
                else if (fileItem?.name) {
                  normalizedPath = `uploads/${fileItem.name}`;
                } else {
                  console.warn("Unexpected file format:", fileItem);
                  return null; // skip invalid item
                }

                const fileUrl = `${API}/${normalizedPath}`;
                const fileName = normalizedPath.split("/").pop();

                return (
                  <div
                    key={idx}
                    onClick={() => handleFilePreview(fileName)}
                    className="file-card w-fit p-2 file-icon-container rounded-lg flex cursor-pointer gap-2"
                  >
                    <div className="img-container file-icon-container p-2 rounded">
                      <img src={fileIcon} className="w-6 h-6" alt="file icon" />
                    </div>
                    <div className="content-container">
                      <h1 className="truncate max-w-xs">
                        {fileName.slice(0, 15)}
                      </h1>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Right section (Marks) */}
        <div className="second-container col-span-2 text-center">
          <h1 className="text-lg font-medium">Marks</h1>
          <div className="h-[80%] flex items-center justify-center">
            <h1 className="text-[#646464] text-lg">
              <span className="font-semibold text-[#318179]">
                {mouSignedmark}
              </span>{" "}
              out of {parsedMarkData?.points?.industryInvolvement || 0}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingForm10;
