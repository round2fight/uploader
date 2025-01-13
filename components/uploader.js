import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [currentJobID, setCurrentJobID] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isUploadSuccess, setIsUploadSuccess] = useState(false);

  const [username, setUsername] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);

  // http://127.0.0.1:5000/upload
  const serverUrl = process.env.NEXT_PUBLIC_API_SERVER_URL + "upload"; // Replace with your server URL

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      alert("No files detected. Please upload a folder.");
      return;
    }
    if (acceptedFiles.length > 0) {
      let extractedFolderName = "";

      // Check if files contain webkitRelativePath (drag-and-drop folder)
      const fileWithPath = acceptedFiles.find(
        (file) => file.webkitRelativePath
      );
      if (fileWithPath) {
        const filePath = fileWithPath.webkitRelativePath;
        extractedFolderName = filePath.split("/")[0]; // Extract folder name
      } else {
        // Handle cases where files are uploaded via click (no folder info)
        const firstFile = acceptedFiles[0];
        extractedFolderName = firstFile.path?.split("/")[1] || "Unknown Folder"; // Try extracting based on path
      }

      setFolderName(extractedFolderName);
    }
    console.log("Accepted Files:", acceptedFiles);
    setFiles(acceptedFiles);
  };

  const uploadFiles = async () => {
    if (!username || !companyName) {
      alert("Please enter both name and company name.");
      setUploading(false);
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
    // Combine the date, time, and folder name
    const newFolderName = `${formattedDate}/${formattedTime}_${pid}_${folderName}`;

    const formData = new FormData();

    // Append files with the new folder structure
    files.forEach((file) => {
      const relativePath = file.webkitRelativePath || file.path;

      const newPath = `${newFolderName}/${relativePath
        .split("/")
        .slice(1)
        .join("/")}`;

      // Append the file to the FormData with the desired folder path
      formData.append("files", file, newPath);
    });

    setCurrentJobID(pid);

    // Add user_info.txt to files
    const userInfoContent = `Username: ${username}\nCompany: ${companyName}\nJob_ID: ${pid}`;
    const userInfoBlob = new Blob([userInfoContent], { type: "text/plain" });

    const userInfoFilename = `user_info_${pid}.txt`;

    const userInfoFile = new File([userInfoBlob], userInfoFilename, {
      type: "text/plain",
    });
    formData.append(
      "files",
      userInfoFile,
      `${newFolderName}/${userInfoFilename}`
    );

    // console.log("Folder Name:", newFolderName);
    // console.log("FormData:", formData);
    // console.log("Files:", files);

    // for (let pair of formData.entries()) {
    //   console.log("meow", pair[0] + ": " + pair[1]);
    // }

    // for (let [key, value] of formData.entries()) {
    //   console.log(`isse` + `${key}:`, value);
    // }

    // setUploading(false);

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
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again leter.");
      setIsUploadSuccess(false);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const cancelUpload = () => {
    setFiles([]);
    setFolderName("");
    setUsername("");
    setCompanyName("");
    setUploading(false);
    setUploadProgress(0);
    setIsUploadSuccess(false);
    setCurrentJobID("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "text/plain": [],
      "application/msword": [], // .doc files
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [], // .docx files
    },
    directory: true,
  });

  useEffect(() => {
    console.log(folderName);
  }, [folderName]);

  return (
    <div className="bg-gray-700 bg-opacity-75 dark:bg-gray-300 dark:bg-opacity-90 m-4 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-4">
        <Image
          src="/UdayDigital.png" // Path to your logo in the public folder
          alt="Logo"
          width={300} // Set the width of your logo
          height={50} // Set the height of your logo
        />
      </div>

      {!!files && files.length > 0 ? (
        <>
          {!!isUploadSuccess ? (
            <>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-100 border border-green-400 shadow-lg">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-700 font-semibold text-lg">
                    Upload Successful!
                  </span>
                </div>

                <div className="mt-2 text-gray-700 text-center">
                  <div>
                    {" "}
                    We’ve received your photos and will start printing them
                    right away.
                  </div>
                  We’ll contact you via email or phone if we need additional
                  information.
                </div>
                <p className="mt-2 font-medium text-gray-800">
                  Your Job ID:{" "}
                  <span className="text-blue-600">{currentJobID}</span>
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Please keep this Job ID handy for future reference.
                </p>
              </div>
              <div className="flex justify-center ">
                <button
                  onClick={cancelUpload}
                  disabled={uploading}
                  className={`mt-4 px-4 py-2 rounded bg-gray-500 text-white font-semibold ${
                    uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-400"
                  }`}
                >
                  Go Back
                </button>
              </div>
            </>
          ) : (
            <>
              {!!folderName && (
                <div className="mt-2 text-gray-600">
                  {/* Selected Folder:{" "} */}
                  <div className="font-semibold text-gray-600">
                    {folderName}
                  </div>
                </div>
              )}
              <div className="mt-1 text-gray-600">
                {/* Selected Files:{" "} */}
                <ul className="list-disc list-inside text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <label className="block text-gray-600">
                  {/* Username: */}
                  <input
                    placeholder="Name"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full p-2 rounded bg-gray-200"
                  />
                </label>
                <label className="block text-gray-600 mt-4">
                  {/* Company Name: */}
                  <input
                    placeholder="Company Name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full p-2 rounded bg-gray-200"
                  />
                </label>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={uploadFiles}
                  disabled={files.length === 0 || uploading}
                  className={`px-4 py-2 rounded bg-emerald-700 text-white font-semibold ${
                    files.length === 0 || uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-emerald-600"
                  }`}
                >
                  Upload Files
                </button>

                <button
                  onClick={cancelUpload}
                  disabled={uploading}
                  className={`px-4 py-2 rounded bg-gray-500 text-white font-semibold ${
                    uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-400"
                  }`}
                >
                  Cancel Upload
                </button>
              </div>
              {uploading && (
                <div className="w-full bg-gray-300 mt-4 rounded-full">
                  <div
                    className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-1 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}{" "}
            </>
          )}
        </>
      ) : (
        <>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-md p-3 cursor-pointer transition border-2 ${
              isDragActive
                ? "border-dashed border-blue-500 bg-blue-200"
                : "border-dashed border-gray-400 bg-gray-300"
            }`}
          >
            <input {...getInputProps()} webkitdirectory="" />
            <div className="text-gray-600 text-center">
              {isDragActive ? (
                <>
                  <div>.</div>
                  <div>Drag the folder here</div>
                  <div>.</div>
                </>
              ) : (
                <>
                  <div>Drag & drop a folder here</div>
                  <div>or</div>
                  <div> click to select one</div>
                </>
              )}
            </div>
          </div>

          <div className=" text-gray-600 text-center mt-2">
            By uploading images, you agree that these images will be used for
            printing purposes.
          </div>
          <div className="text-gray-600 text-center">
            <a href="/terms-and-conditions" className="text-blue-400 underline">
              Read our Terms and Conditions
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;
