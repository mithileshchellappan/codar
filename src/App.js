import styles from "./Home.module.css";
import {  TextInput,Button } from "@mantine/core";
import React from "react";
import Editor from "@monaco-editor/react";
import cmprs from 'lzutf8'
import {useClipboard} from '@mantine/hooks'
import {useNotifications} from '@mantine/notifications'
const Home = () => {
  const [data, setData] = React.useState(false);
  const [toggle, setToggle] = React.useState(true);
  const notifications = useNotifications();
  const clipboard = useClipboard({timeout:3000})
  const emptyFile = [
    {
      name: "start.js",
      value: "//enter your code here"
    }
  ];

  const baseUrl =  process.env.APPLICATION_URL || "http://codar.notagodzilla.wtf"

  const [files, setFiles] = React.useState(emptyFile);
  const [currFile, setCurrFile] = React.useState(files[0]);
  const [tempName, setTempName] = React.useState(currFile.name);

  const buttonRef = React.useRef(null);
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    console.log(queryParams);
    var urlData = queryParams.get("code");
    console.log(urlData);
    if (urlData) {
      const parseData = JSON.parse(urlData);
      console.log(parseData);
      var newFiles = [];
      for (var dat in parseData) {
        console.log(dat);
        var content = cmprs.decompress(parseData[dat].value,{inputEncoding:'Base64'})
        newFiles.push({
          name: parseData[dat].name,
          value: content
        });
      }
      setData(true);
      setFiles(newFiles);
      setCurrFile(newFiles[0]);
    }
    console.log("finished");
  }, []);

  const FileButtons = () => {
    return (
      <div>
        {files.map((obj, i) => {
          console.log(currFile);
          return (
            <>
              <Button
                variant={obj === currFile ? "" : "outline"}
                onClick={() => {
                  setCurrFile(obj);
                }}
                style={{ marginRight: 10 }}
                ref={buttonRef}
              >
                {!data ? (
                  obj === currFile ? (
                    toggle ? (
                      <p
                        onDoubleClick={() => {
                          setToggle(false);
                        }}
                      >
                        {obj.name}
                      </p>
                    ) : (
                      <TextInput
                        style={{
                          maxWidth: 80,
                          height: 30,
                          alignSelf: "center",
                          justifySelf: "center"
                        }}
                        type="text"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === "Escape") {
                            setToggle(true);
                            setCurrFile({ name: tempName, value: obj.value });

                            event.preventDefault();
                            event.stopPropagation();
                          }
                        }}
                        onChange={(e) => {
                          obj.name = e.target.value;
                          setTempName(e.target.value);
                          // setCurrFile({ name: e.target.value, value: obj.value });
                        }}
                        value={tempName}
                      />
                    )
                  ) : (
                    obj.name
                  )
                ) : (
                  obj.name
                )}
              </Button>
            </>
          );
        })}

        {!data && <Button onClick={createNewFile}>+</Button>}
      </div>
    );
  };

  function createNewFile() {
    files.push({
      name: "newfile.js",
      value: "//enter your code here"
    });
    setFiles(files);
    console.log(files);
    setCurrFile(files[files.length - 1]);
    setToggle(false)
  }

  function handleEditorFileChange(value){
    var tempCurrFile = {name:currFile.name,value}
    setCurrFile(tempCurrFile)
    var fileIndex = files.findIndex((obj=>obj.name===tempCurrFile.name))

    files[fileIndex]=tempCurrFile
    setFiles(files)
    console.log(files)
  }

  async function getShareLink(){
    var shareArr = []

    for(var file in files){
      var compressedValue = cmprs.compress(files[file].value,{outputEncoding:'Base64'})
      var newObj={
        name:files[file].name,
        value:compressedValue
      }
      shareArr.push(newObj)
    }

    var jsonStringified = JSON.stringify(shareArr)
    let url = `${baseUrl}/?code=${jsonStringified}`
    // clipboard.copy(url)
    // navigator.clipboard.writeText(url).then(()=>{

    //   notifications.showNotification({
    //     title:`Copied to clipboard`,
    //     message:`Share URL is copied to clipboard`
    //   })
    // })
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(url).then(()=>{
        notifications.showNotification({
          title:`Copied to clipboard`,
          message:`Share URL is copied to clipboard`
        })
      });
    } else {
      return document.execCommand('copy', true, url).then(()=>{
        notifications.showNotification({
          title:`Copied to clipboard`,
          message:`Share URL is copied to clipboard`
        })
      });
    }
  }

  return (
    <div className={styles.container}>
      <div style={{ flex: 1 }}>
        <div>
          <h1 className={styles.title}>{"</> Codar"}</h1>
        </div>
        {FileButtons()}
        <Editor
          height="80%"
          width="150vh"
          defaultValue={
            files[0] === emptyFile ? "//enter your code here" : currFile.value
          }
          className={styles.codearea}
          theme="vs-dark"
          options={{
            readOnly: data
          }}
          onChange={handleEditorFileChange}
          path={files[0] === emptyFile ? "start.js" : currFile.name}
        />
      </div>
        {!data && <Button onClick={getShareLink}>Share</Button>}

      <footer className={styles.footer}>Made by notagodzilla 🤖 </footer>
    </div>
  );
};

export default Home;
