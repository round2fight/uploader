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
  const serverUrl = "http://localhost:5000/api/upload"; // Replace with your actual server URL
  // const serverUrl = "https://meowsician.shop/api/upload";
  // const serverUrl = "http://meowsician.shop:8083/api/upload";
  // const serverUrl = "https://106.51.187.134:8085/api/upload";
  // const serverUrl = "https://meowsician.shop:8085/api/upload";

  // Handle drag-and-drop or selected files
  const onDrop = (acceptedFiles) => {
    processFiles(acceptedFiles);
  };

  const processFiles = (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      alert("No files detected. Please upload files or a folder.");
      return;
    }

    // Detect folder name if available
    const fileWithPath = acceptedFiles.find((file) => file.webkitRelativePath);
    let extractedFolderName = "";
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

  const CHUNK_SIZE = 90 * 1024 * 1024; // 100MB per chunk (adjustable)

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

    // ✅ Upload `user_info.txt` first
    const userInfoContent = `Company: ${companyName}\nDescription: ${description}\nJob_ID: ${pid}`;
    const userInfoBlob = new Blob([userInfoContent], { type: "text/plain" });
    const userInfoFile = new File([userInfoBlob], `user_info_${pid}.txt`, {
      type: "text/plain",
    });

    const userInfoFormData = new FormData();
    userInfoFormData.append("chunk", userInfoFile);
    userInfoFormData.append("filename", `user_info_${pid}.txt`);
    userInfoFormData.append("relativePath", `user_info_${pid}.txt`);
    userInfoFormData.append("chunkIndex", 0);
    userInfoFormData.append("totalChunks", 1);
    userInfoFormData.append("newFolderName", newFolderName);

    try {
      await axios.post(serverUrl, userInfoFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Error uploading user_info.txt", error);
      alert("Failed to upload user_info.txt");
      setIsUploadSuccess(false);
      setUploading(false);
      return;
    }

    console.log("user_info.txt uploaded successfully!");

    // ✅ Track total chunks (fixing wrong count)
    let totalChunks = 0;
    let uploadedChunks = 0;

    for (const file of files) {
      totalChunks += Math.ceil(file.size / CHUNK_SIZE);
    }

    const MAX_CONCURRENT_UPLOADS = 5; // Limit for rate control
    let allChunkPromises = [];

    for (const file of files) {
      const fileChunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < fileChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = start + CHUNK_SIZE;
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("filename", file.name);
        formData.append("relativePath", file.webkitRelativePath || file.name);
        formData.append("chunkIndex", i);
        formData.append("totalChunks", fileChunks);
        formData.append("newFolderName", newFolderName);

        // ✅ Track chunk progress with onUploadProgress (fixed)
        const chunkPromise = axios.post(serverUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.loaded === progressEvent.total) {
              uploadedChunks++;
              setUploadProgress(
                Math.min(100, Math.round((uploadedChunks / totalChunks) * 100))
              );
            }
          },
        });

        allChunkPromises.push(chunkPromise);

        // ✅ Control concurrency (Upload only 5 chunks at a time)
        if (allChunkPromises.length >= MAX_CONCURRENT_UPLOADS) {
          await Promise.all(allChunkPromises);
          allChunkPromises = [];
        }
      }
    }

    // ✅ Ensure remaining chunks are uploaded
    if (allChunkPromises.length > 0) {
      await Promise.all(allChunkPromises);
    }

    // alert("Upload complete!");
    setUploadProgress(100); // ✅ Ensure final state is 100%
    setUploading(false);
    setIsUploadSuccess(true);
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

    // window.location.reload(); // Refresh the page
  };

  return (
    // bg-opacity-75
    // <div className="bg-white dark:bg-zinc-700 p-8 rounded-xl shadow-lg w-full lg:min-w-md lg:max-w-lg md:min-w-md md:max-w-lg sm:min-w-sm sm:max-w-sm m-6">
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 mb-4 rounded-xl shadow-xl min-w-96">
      <h1 className="text-white text-xl font-extrabold flex justify-center mix-blend-difference">
        Get started
      </h1>

      <div className="flex items-center justify-center mb-4">
        {/* <Image src="/Uday4.png" alt="Logo" width={500} height={50} /> */}
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
            //   focus:ring-1 focus:ring-slate-500
            className="p-2 rounded-lg shadow-md w-full mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
          />
          <div className="mb-2">
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 rounded-lg shadow-md w-full border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
            />
          </div>

          <div className="col-span-2 flex justify-center mb-3">
            <label
              htmlFor="folder-upload"
              className="w-full h-full py-2 px-4 rounded-xl cursor-pointer border-2 text-center shadow-sm dark:bg-transparent dark:hover:bg-opacity-40 text-zinc-100 dark:border-zinc-600 dark:hover:border-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200 hover:bg-blue-100 hover:text-gray-600 "
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

          {/* Drag-and-Drop & File Selection */}
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-xl cursor-pointer transition border-1  shadow-md w-full min-h-60 ${
              isDragActive
                ? "bborder-dashed dark:border-zinc-300 dark:xbg-zinc-600 bg-transparent border-sky-200 bg-sky-50"
                : "bborder-dashed dark:xbg-zinc-800  bg-transparent border dark:border-zinc-600 border-zinc-300"
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
            <div className=" text-white dark:xtext-zinc-400 xtext-gray-400 text-sm text-center flex justify-center">
              Drag & drop your files here or&nbsp;<u>click here</u>
            </div>
            {/* <div>
          <button className="w-full m-1 py-2 px-4 rounded-xl cursor-pointer border-2 flex items-center justify-center gap-2 text-center shadow-sm border-gray-200 text-gray-500 hover:bg-sky-200 hover:text-gray-600">
            <span>Click here</span>
          </button>
        </div> */}
          </div>

          <div className="grid grid-cols-2 gap-1 mt-2">
            {/* <div className="col-span-2 flex justify-center">
              <label
                htmlFor="folder-upload"
                className="w-full h-full py-2 px-4 rounded-xl cursor-pointer border-2 text-center shadow-sm dark:bg-opacity-30 dark:hover:bg-opacity-50 dark:bg-zinc-800 dark:text-zinc-300  dark:border-zinc-600 dark:hover:border-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200 border-gray-200 text-gray-500 hover:bg-blue-100 hover:text-gray-600 "
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
            </div> */}

            {/* <div className="col-span-2  flex justify-center">
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

            <div className="col-span-2 ">
              {files.length > 0 && (
                <div className="my-1 space-y-2">
                  {Array.from(
                    new Set(
                      files
                        .filter((file) => file.webkitRelativePath)
                        .map((file) => file.webkitRelativePath.split("/")[0])
                    )
                  ).map((folderName, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 dark:bg-zinc-600 dark:text-amber-100 bg-amber-100 border border-amber-400 text-gray-600 rounded-lg shadow-md text-sm flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
                      className="px-4 py-2 dark:bg-zinc-600 dark:text-sky-100 bg-sky-100 border border-sky-300 text-gray-600 rounded-lg shadow-md text-sm flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
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

            <div className="col-span-1">
              {!uploading && (
                <button
                  className="w-full py-2 px-4 rounded-xl cursor-pointer border-2 text-center shadow-sm dark:bg-transparent  dark:hover:bg-opacity-50 dark:bg-zinc-800  dark:border-zinc-600 dark:hover:border-slate-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200 dark:text-zinc-100 border-gray-200 text-gray-500 hover:bg-zinc-200 hover:text-gray-600 "
                  onClick={cancelUpload}
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="col-span-1">
              <button
                className={`w-full py-2 px-4 rounded-xl text-white disabled:border-zinc-300 dark:disabled:border-zinc-500 disabled:bg-gray-200 dark:disabled:bg-zinc-500 dark:disabled:text-zinc-600 disabled:text-gray-400 ${
                  uploading
                    ? "bg-gray-500 dark:bg-zinc-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 border border-green-700 dark:border-green-400"
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
          {uploading && (
            <div className="w-full bg-gray-200 dark:bg-zinc-500 rounded-full mt-2">
              <div
                className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </>
      )}
      <div className="flex flex-col justify-center items-center">
        {/* Upload Status */}
        {isUploadSuccess !== null && (
          <div
            className={`border-2 border-b-gray-200 mt-2 w-full min-h-100 rounded-xl p-6 flex flex-col justify-center items-center ${
              isUploadSuccess
                ? "dark:bg-zinc-800 border dark:border-zinc-700 dark:text-sky-100 bg-white dark:bg-opacity-70 text-gray-800 "
                : "dark:bg-zinc-800 border dark:border-zinc-700 dark:text-sky-100 bg-white dark:bg-opacity-70 text-gray-800 "
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
                <div className="text-center text-white">
                  <div className="font-bold"> Upload Successful! </div>
                  <div>
                    {" "}
                    We&rsquo;ve received your files and will be in touch soon
                    with the next steps.{" "}
                  </div>
                  Thank you for choosing us!
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
                <div className="text-center text-white">
                  <div>Oops! Something went wrong.</div>
                  Please try again later. We apologize for the inconvenience.
                </div>
              </>
            )}
            <div>
              {!uploading && (
                <button
                  className="w-full py-2 px-4 rounded-xl cursor-pointer border-2 text-center shadow-sm dark:bg-zinc-800  dark:border-zinc-600 dark:hover:border-slate-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200 dark:text-zinc-300 border-gray-200 text-gray-500 hover:bg-zinc-200 hover:text-gray-600 "
                  onClick={cancelUpload}
                >
                  Go back
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
