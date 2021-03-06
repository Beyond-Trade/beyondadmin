import { Button, Form, Modal, ProgressBar } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { Facebook } from "react-content-loader";
import Select from "react-select";
import firebase from "../../../configs/fbconfig";

// const options = [
//   { value: "chocolate", label: "Chocolate" },
//   { value: "strawberry", label: "Strawberry" },
//   { value: "vanilla", label: "Vanilla" },
// ];
const MyFacebookLoader = () => <Facebook />;

export function EditAlbum() {
  const history = useHistory();
  const params = useParams();
  const [album, setAlbum] = useState(undefined);
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const [artistsSelectedOption, setArtistsSelectedOption] = useState("");
  const [artistsOptios, setArtistsOptios] = useState(undefined);
  const [artists, setArtists] = useState();
  const [fileUrl, setFileUrl] = useState(undefined);
  const [isSubmit, setIsSubmit] = useState(false);
  const [progressBar, setProgressBar] = useState(undefined);
  const [fileToUpload, setFileToUpload] = useState(undefined);
  const [fileMetaData, setFileMetaData] = useState(undefined);
  const [songTitle, setSongTitle] = useState("");

  const handleAristOption = (selectedOption) => {
    setArtistsSelectedOption(selectedOption);
    console.log(`Option selected:`, selectedOption);
  };

  const uploadFile = async () => {
    console.log(
      `albums/${artistsSelectedOption.value}${"-"}${addHyphens(songTitle)}`
    );
    var storage = firebase.storage();
    const storageRef = storage.ref(
      `albums/${artistsSelectedOption.value}${"-"}${addHyphens(songTitle)}`
    );
    await storageRef.put(fileToUpload).on(
      "state_changed",
      function(snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setProgressBar(progress);
      },
      function(error) {
        // Handle unsuccessful uploads
      },
      function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        storageRef.getDownloadURL().then(function(downloadURL) {
          console.log("File available at", downloadURL);
          setFileUrl(downloadURL);
          storageRef
            .getMetadata()
            .then(function(metadata) {
              console.log(metadata);
              setFileMetaData(metadata);
            })
            .catch(function(error) {
              // Uh-oh, an error occurred!
              console.log("in cath");
            });
        });
      }
    );
  };

  console.log(fileUrl);
  const splitByLastDot = (text) => {
    var index = text.lastIndexOf(".");
    return [text.slice(0, index), text.slice(index + 1)];
  };
  const handleFileUpload = (e) => {
    if (e?.target?.files[0]) {
      const res = splitByLastDot(e.target.files[0].name);
      console.log(res[1]);
      if (res[1] === "jpeg" || res[1] === "jpg" || res[1] === "png") {
        setFileToUpload(e.target.files[0]);
        setFileErrorMessage("");
      } else {
        setFileToUpload(undefined);
        setFileErrorMessage(
          "* Please chose files with '.jpg','.jpeg' or '.png' ."
        );
      }
      console.log(e.target.files[0]);
    } else {
      setFileToUpload(undefined);
    }
  };

  useEffect(() => {
    const db = firebase.firestore();
    db.collection("albums")
      .doc(params.id)
      .get()
      .then((docRef) => {
        console.log(docRef.data());
        setAlbum(docRef.data());
        setSongTitle(docRef.data().title);
        setArtistsSelectedOption(docRef.data().author);
      })
      .catch((error) => {});
  }, []);
  useEffect(() => {}, [fileUrl, fileMetaData]);
  useEffect(() => {
    const db = firebase.firestore();
    return db.collection("artists").onSnapshot((snapshot) => {
      const artistsData = [];
      snapshot.forEach((doc) =>
        artistsData.push({ ...doc.data(), id: doc.id })
      );
      console.log(artistsData); // <------
      setArtists(artistsData);
    });
  }, []);
  const addHyphens = (toChange) => {
    return toChange.replace(/\s+/g, "-").toLowerCase();
  };
  const uploadDocument = async () => {
    setFileErrorMessage("");
    if (fileToUpload) {
      if (fileToUpload.size <= 2097152) {
        setIsSubmit(true);
        await uploadFile();
      } else {
        setFileErrorMessage("* File size should be 2Mb or less than 2MB.");
      }
    }
  };
  useEffect(() => {
    if (fileMetaData && fileUrl) {
      console.log("fileMetaData", fileMetaData);
      const allData = {
        imgUrl: fileUrl,
        updatedAt: new Date(),
      };
      firebase
        .firestore()
        .collection("artists")
        .doc(params.id)
        .set(allData, { merge: true })
        .then(() => {
          history.push("/artists");
        });
      console.log(allData);
    }
  }, [fileUrl, fileMetaData]);
  useEffect(() => {
    const options = [];
    if (artists) {
      artists.forEach((artist) =>
        options.push({
          label: `${artist.firstName}${" "}${artist.lastName}`,
          value: artist.id,
        })
      );
    }
    setArtistsOptios(options);
  }, [artists]);

  return (
    <>
      <div className={`card card-custom p-5 card-stretch gutter-b`}>
        {album ? (
          <>
            {/* Header */}
            <div
              className="card-header p-0 border-0 mb-5"
              style={{ minHeight: "0px" }}
            >
              <h3 className="card-title font-weight-bolder text-dark">
                Edit {songTitle} album
              </h3>

              {/* <button className="card-title btn btn-success p-0">Add Song</button> */}
            </div>
            {/* Body */}
            <div className="card-body p-0">
              <form>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={songTitle}
                    type="text"
                    className="form-control"
                    placeholder="Enter title"
                    disabled
                  />
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label>Artist</label>
                      <input
                        value={artistsSelectedOption}
                        type="text"
                        className="form-control"
                        placeholder="Enter Artist"
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="row">
                    <div className="col-sm-6">
                      <label>Current image</label>
                      <div
                        style={{
                          width: "50%",
                          height: "200px",
                          backgroundImage: `url(${album.imgUrl})`,
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "cover",
                          cursor: "pointer",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                {artistsSelectedOption ? (
                  <div className="form-group">
                    <div className="row">
                      <div className="col-sm-6">
                        <label>Upload artwork</label>
                        <input
                          type="file"
                          label="select"
                          className="form-control-file"
                          id="exampleFormControlFile1"
                          onChange={handleFileUpload}
                        />
                      </div>
                      {isSubmit ? (
                        <div
                          className="col"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                          }}
                        >
                          <ProgressBar
                            animated
                            now={progressBar}
                            label={`${progressBar}%`}
                          />
                        </div>
                      ) : null}
                    </div>
                    {fileErrorMessage ? (
                      <p className="text-danger mt-2">{fileErrorMessage}</p>
                    ) : null}
                  </div>
                ) : null}
              </form>
              <div className="float-right">
                <Button
                  variant="white"
                  type="submit"
                  onClick={() => history.push("/albums")}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={uploadDocument}
                  disabled={fileToUpload ? false : true}
                >
                  Update Album
                </Button>
              </div>
            </div>
          </>
        ) : (
          <MyFacebookLoader />
        )}
      </div>
    </>
  );
}
