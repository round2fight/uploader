import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadSuccess, setIsUploadSuccess] = useState(null);
  // const serverUrl = "http://localhost:5000/api/upload"; // Replace with your actual server URL
  const serverUrl = "https://meowsician.shop/api/upload";

  // Handle drag-and-drop or selected files
  const onDrop = (acceptedFiles) => {
    processFiles(acceptedFiles);
  };

  const processFiles = (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      alert("No files detected. Please upload files or a folder.");
      return;
    }

    let extractedFolderName = "Uploaded_Files"; // Default folder name

    // Detect folder name if available
    const fileWithPath = acceptedFiles.find((file) => file.webkitRelativePath);
    if (fileWithPath) {
      extractedFolderName = fileWithPath.webkitRelativePath.split("/")[0];
    }

    setFolderName(extractedFolderName);
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]); // Append accepted files
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "text/plain": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
    },
    multiple: true,
  });

  // Handle manual file selection
  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);

    // Filter only valid files (images, text, and word documents)
    const validFiles = selectedFiles.filter(isValidFile);

    if (validFiles.length === 0) {
      alert(
        "No valid files found. Only images (.png, .jpg, .jpeg, .gif), text files (.txt), and Word files (.doc, .docx) are allowed."
      );
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]); // Append only valid files
  };

  // Handle manual folder selection
  const handleFolderUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);

    // Filter only valid files (images, text, and word documents)
    const validFiles = selectedFiles.filter(isValidFile);

    if (validFiles.length === 0) {
      alert(
        "No valid files found in the folder. Only images (.png, .jpg, .jpeg, .gif), text files (.txt), and Word files (.doc, .docx) are allowed."
      );
      return;
    }

    // Update the files state and maintain folder structure
    setFiles((prevFiles) => [...prevFiles, ...validFiles]); // Append valid files
  };
  // Validate file type
  const isValidFile = (file) => {
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return validTypes.includes(file.type);
  };

  // Upload files to server
  const uploadFiles = async () => {
    if (!description || !companyName) {
      alert("Please enter both description and company name.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const timestamp = new Date();
    const formattedDate = `${String(timestamp.getDate()).padStart(
      2,
      "0"
    )}-${String(timestamp.getMonth() + 1).padStart(
      2,
      "0"
    )}-${timestamp.getFullYear()}`;
    const formattedTime = `${String(timestamp.getHours()).padStart(
      2,
      "0"
    )}_${String(timestamp.getMinutes()).padStart(2, "0")}`;

    const pid = `job_${Date.now()}`;
    const newFolderName = `${formattedDate}/${formattedTime}_${companyName}_${pid}`;

    const formData = new FormData();
    formData.append("newFolderName", newFolderName); // Send folder name

    files.forEach((file) => {
      const relativePath = file.webkitRelativePath || file.name; // Preserve folder structure
      formData.append("files", file, relativePath);
    });

    // Generate user_info.txt
    const userInfoContent = `Company: ${companyName}\nDescription: ${description}\nJob_ID: ${pid}`;
    const userInfoBlob = new Blob([userInfoContent], { type: "text/plain" });
    const userInfoFile = new File([userInfoBlob], `user_info_${pid}.txt`, {
      type: "text/plain",
    });

    formData.append("files", userInfoFile, `user_info_${pid}.txt`);

    try {
      const response = await axios.post(serverUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      console.log("Upload successful:", response.data);
      setIsUploadSuccess(true);
    } catch (error) {
      if (error.message === "Network Error") {
        console.error("Network Error - Server might be down");
        // alert("The server is currently unavailable. Please try again later.");
      } else {
        console.error("Error uploading files:", error);
        // alert("Error uploading files. Please try again later.");
      }
      setIsUploadSuccess(false);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    console.log("Files", files);
  }, [files]);

  const cancelUpload = () => {
    setFiles([]); // Clear the files array
    setDescription(""); // Clear the description
    setCompanyName(""); // Clear the company name
    setUploading(false); // Reset uploading state
    setUploadProgress(0); // Reset upload progress
    setIsUploadSuccess(null); // Reset success/failure status
    window.location.reload(); // Refresh the page
  };

  return (
    // bg-opacity-75
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl">
      <div className="flex items-center justify-center mb-4">
        <Image src="/Uday4.png" alt="Logo" width={300} height={50} />
      </div>
      {isUploadSuccess !== null ? (
        <></>
      ) : (
        <>
          {/* Username & Company Name Input */}
          <input
            type="text"
            placeholder="Enter Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="p-2 rounded-lg shadow-md w-full mb-2 dark:bg-slate-800 border dark:border-slate-700 border-gray-300 focus:border-slate-200  focus:ring-1 focus:ring-slate-500 outline-none"
          />
          <div className="mb-2">
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 rounded-lg shadow-md w-full dark:bg-slate-800 border dark:border-slate-700 focus:border-slate-200 focus:ring-1 focus:ring-slate-500 outline-none"
            />
          </div>

          {/* Drag-and-Drop & File Selection */}
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-xl cursor-pointer transition border-2  shadow-md w-full min-h-60 ${
              isDragActive
                ? "border-dashed dark:border-slate-400 dark:bg-slate-700 border-sky-500 bg-violet-50"
                : "border-dashed dark:bg-slate-800 border dark:border-slate-700 border-sky-400 bg-white"
            }`}
          >
            <input {...getInputProps()} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 100 100"
            >
              <path
                fill="#c9dcf4"
                d="m71.99,88.11c-14.66,1.19-29.31,1.19-43.97,0-3.67-.3-6.52-3.29-6.71-6.96-1.04-20.43-1.04-40.86,0-61.3.19-3.68,3.05-6.66,6.72-6.96,9.87-.8,19.74-1.06,29.62-.78,2.13.06,4.14.98,5.62,2.52,4.46,4.66,9.01,9.34,13.6,13.94,1.47,1.47,2.33,3.45,2.39,5.53.43,15.69.24,31.37-.55,47.06-.19,3.67-3.04,6.66-6.71,6.96Z"
              ></path>
              <path
                fill="#4a254b"
                d="m50,73c2.57,0,4.68-1.94,4.97-4.43.03-.3-.19-.57-.49-.57-1.73,0-7.22,0-8.95,0-.3,0-.53.27-.49.57.28,2.49,2.4,4.43,4.97,4.43Z"
              ></path>
              <circle cx="39.5" cy="61.5" r="5.5" fill="#fff"></circle>
              <circle cx="39.5" cy="61.5" r="2.5" fill="#4a254b"></circle>
              <circle cx="60.5" cy="61.5" r="5.5" fill="#fff"></circle>
              <circle cx="60.5" cy="61.5" r="2.5" fill="#4a254b"></circle>
              <path
                fill="#6b96d6"
                d="m68.63,31.42h10.08c-.41-1.06-1.03-2.04-1.85-2.87-4.58-4.6-9.13-9.28-13.6-13.94-.9-.94-2-1.64-3.21-2.07l.02,10.32c.01,4.72,3.84,8.54,8.56,8.54Z"
              ></path>
            </svg>
            <div className="text-gray-400 text-sm text-center flex justify-center">
              Drag & drop your files here or&nbsp;<u>click here</u>
            </div>
            {/* <div>
          <button className="w-full m-1 py-2 px-4 rounded-xl cursor-pointer border-2 flex items-center justify-center gap-2 text-center shadow-sm border-gray-200 text-gray-500 hover:bg-sky-200 hover:text-gray-600">
            <span>Click here</span>
          </button>
        </div> */}
          </div>

          <div class="grid grid-cols-2 gap-2 mt-4">
            <div class="col-span-2 flex justify-center">
              <label
                htmlFor="folder-upload"
                className="w-full h-full py-2 px-4 rounded-xl cursor-pointer border-2  text-center shadow-sm dark:bg-slate-800  dark:border-slate-700 border-gray-200 text-gray-500 hover:bg-sky-200 hover:text-gray-600 dark:hover:border-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                Attach Folder
              </label>
              <input
                id="folder-upload"
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderUpload}
                className="hidden"
              />
            </div>

            {/* <div class="col-span-2  flex justify-center">
          <label
            htmlFor="file-upload"
            className="w-full h-full py-2 px-4 rounded-xl cursor-pointer border-2 flex items-center justify-center gap-2 text-center shadow-sm border-gray-200 text-gray-500 hover:bg-sky-200 hover:text-gray-600"
          >
            <span>Attach Files</span>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.gif,.txt,.doc,.docx" // Restrict to allowed file types
            onChange={handleFileUpload}
            className="hidden"
          />
        </div> */}

            <div class="col-span-2">
              {files.length > 0 && (
                <div className="mt-1 space-y-2">
                  {Array.from(
                    new Set(
                      files
                        .filter((file) => file.webkitRelativePath)
                        .map((file) => file.webkitRelativePath.split("/")[0])
                    )
                  ).map((folderName, index) => (
                    <div
                      key={index}
                      className=" dark:bg-amber-600 dark:text-amber-100 bg-amber-100 border border-amber-400 text-gray-600 px-4 py-2 rounded-md shadow-md text-sm flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#FFA000"
                          d="M40,12H22l-4-4H8c-2.2,0-4,1.8-4,4v8h40v-4C44,13.8,42.2,12,40,12z"
                        ></path>
                        <path
                          fill="#FFCA28"
                          d="M40,12H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z"
                        ></path>
                      </svg>
                      <span>{folderName}</span>
                    </div>
                  ))}

                  {Array.from(
                    new Set(
                      files
                        .filter((file) => !file.webkitRelativePath)
                        .map((file) => file.name)
                    )
                  ).map((fileName, index) => (
                    <div
                      key={index}
                      className="dark:bg-sky-700 dark:text-sky-100 bg-sky-100 border border-sky-300 text-gray-600 px-4 py-2 rounded-md shadow-md text-sm flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="20"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#90CAF9"
                          d="M40 45L8 45 8 3 30 3 40 13z"
                        ></path>
                        <path fill="#E1F5FE" d="M38.5 14L29 14 29 4.5z"></path>
                      </svg>
                      <span>{fileName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              {!uploading && (
                <button
                  className="w-full h-full py-2 px-4 rounded-xl cursor-pointer border-2  text-center shadow-sm dark:bg-slate-800  dark:border-slate-700 border-gray-200 text-gray-500 hover:bg-sky-200 hover:text-gray-600 dark:hover:border-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  onClick={cancelUpload}
                >
                  Cancel
                </button>
              )}
            </div>
            <div>
              <button
                className={`px-4 py-3 rounded-xl text-white w-full disabled:bg-gray-200 dark:disabled:bg-slate-500 dark:disabled:text-gray-00 disabled:text-gray-400 ${
                  uploading
                    ? "bg-gray-500 dark:bg-slate-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={uploadFiles}
                disabled={
                  uploading ||
                  files.length === 0 ||
                  !description ||
                  !companyName
                }
              >
                {uploading
                  ? `Uploading (${uploadProgress}%)...`
                  : "Upload Files"}
              </button>
            </div>
          </div>
        </>
      )}
      <div className="mt-4  flex flex-col justify-center items-center">
        {/* Upload Status */}
        {isUploadSuccess !== null && (
          <div
            className={`border-2 border-b-gray-200 mt-2 w-full min-h-100 rounded-3xl p-6 flex flex-col justify-center items-center ${
              isUploadSuccess
                ? "dark:bg-slate-800 border dark:border-slate-700 dark:text-sky-100 bg-white text-gray-800"
                : "dark:bg-slate-800 border dark:border-slate-700 dark:text-sky-100 bg-white text-gray-800"
            } text-white`}
          >
            {isUploadSuccess ? (
              <>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#4caf50"
                      d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
                    ></path>
                    <path
                      fill="#ccff90"
                      d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z"
                    ></path>
                  </svg>
                </div>
                <div className="font-bold"> Upload Successful! </div>
                <div>
                  {" "}
                  We&rsquo;ve received your files and will be in touch soon with
                  the next steps.{" "}
                </div>
                Thank you for choosing us!
                <div>
                  {!uploading && (
                    <button
                      className="mt-4 w-full h-full py-2 px-4 rounded-xl cursor-pointer border-2  text-center shadow-sm dark:bg-slate-700  dark:border-slate-600 dark:text-gray-400 border-gray-200 text-gray-500 hover:bg-sky-200 hover:text-gray-600 dark:hover:border-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      onClick={cancelUpload}
                    >
                      Go back
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#f44336"
                      d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
                    ></path>
                    <path
                      fill="#fff"
                      d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"
                    ></path>
                    <path
                      fill="#fff"
                      d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="text-center">Oops! Something went wrong.</div>
                  Please try again later. We apologize for the inconvenience.
                </div>
                <div>
                  {!uploading && (
                    <button
                      className="mt-4 w-full h-full py-2 px-4 rounded-xl cursor-pointer border-2  text-center shadow-sm dark:bg-slate-700  dark:border-slate-600 dark:text-gray-400 border-gray-200 text-gray-500 hover:bg-sky-200 hover:text-gray-600 dark:hover:border-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      onClick={cancelUpload}
                    >
                      Go back
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
