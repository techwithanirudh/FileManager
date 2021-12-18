const express = require("express");
const fs = require("fs");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.get('/', (req, res) => {
    return res.redirect("/folder/");
});

// Get a dynamic route
app.get("/*", (req, res) => {
  if (req.url.includes("browse")) {
    var file = req.url.split("/browse")[1];
    return res.send(`
    <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Monaco editor</title>
      <link
        rel="stylesheet"
        data-name="vs/editor/editor.main"
        href="https://unpkg.com/monaco-editor@latest/min/vs/editor/editor.main.css"
      />
      <style>
        html,
        body,
        #container {
          position: absolute;
          left: 0;
          /* Comment top zero to see top elements */
          /* top: 0; */
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
  
        .button {
          background-color: #4caf50;
          /* Green */
          border: none;
          color: white;
          padding: 16px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          transition-duration: 0.4s;
          border-radius: 12px;
          cursor: pointer;
        }
  
        .btnGreen {
          background-color: white;
          color: black;
          border: 2px solid #4caf50;
        }
  
        .btnGreen:hover {
          background-color: #4caf50;
          color: white;
        }
  
        .btnBlue {
          background-color: white;
          color: black;
          border: 2px solid #008cba;
        }
  
        .btnBlue:hover {
          background-color: #008cba;
          color: white;
        }
  
        .btnRed {
          background-color: white;
          color: black;
          border: 2px solid #f44336;
        }
  
        .btnRed:hover {
          background-color: #f44336;
          color: white;
        }
  
        .btnGray {
          background-color: white;
          color: black;
          border: 2px solid #e7e7e7;
        }
  
        .btnGray:hover {
          background-color: #e7e7e7;
        }
  
        .btnBlack {
          background-color: white;
          color: black;
          border: 2px solid #555555;
        }
  
        .btnBlack:hover {
          background-color: #555555;
          color: white;
        }
  
        .right {
          position: absolute;
          right: 0px;
        }
  
        .top {
          text-align: center;
        }
      </style>
    </head>
  
    <body>
      <div class="top">
        <h1>
          ${file}
          <a id="raw" class="button btnBlue right" href="${file}"
            >View Raw</a
          >
        </h1>
      </div>
      <div id="container" class="container"></div>
      <script>
        var language = "javascript";
        var require = {
          paths: {
            vs: "https://unpkg.com/monaco-editor@latest/min/vs",
          },
        };
      </script>
      <script src="https://unpkg.com/monaco-editor@latest/min/vs/loader.js"></script>
      <script src="https://unpkg.com/monaco-editor@latest/min/vs/editor/editor.main.nls.js"></script>
      <script src="https://unpkg.com/monaco-editor@latest/min/vs/editor/editor.main.js"></script>
  
      <script>
          async function setup() {
            var response = await fetch("${file}")
            var text = await response.text()
  
            window.editor = monaco.editor.create(
              document.getElementById("container"),
              {
                value: [
                    text
                ].join("\\n"),
                readOnly: true,
                language: language,
              }
            );
  
            monaco.languages.typescript.javascriptDefaults.addExtraLib(text)
          }
  
          setup();
  
        //   function exportFile() {
        //     var script =
        //       "data:text/" + language + "," + encodeURI(window.editor.getValue());
        //     document.getElementById("raw").setAttribute("href", script);
        //     return script;
        //   }
      </script>
    </body>
  </html>
  `);
  } else if (req.url.includes("folder")) {
    var path = req.url.split("folder/")[1];
    // If path is empty, return the root
    if (path === "") {
      path = "AppData";
    }
    if (fs.existsSync(path)) {
      var files = fs.statSync(path);
    } else {
      return res.status(404).send(`Path ${path} not found`);
    }

    var html = '<div id="hierarchy">';
    if (files.isDirectory()) {
      var files = fs.readdirSync(path);
      files.forEach((file) => {
        var filepath = path + "/" + file;
        var stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
          html += `<div class="foldercontainer">
            <span class="folder fa fa-folder-o" href="/folder/${filepath}" data-isexpanded="true">
                ${file}
            </span>
            <span class="foldercontainer">
                <iframe src="/folder/${filepath}" frameborder="0" scrolling="no"></iframe>
            </span>
            </div>`;
        } else {
          html += `<a class="file fa fa-file-o" href="/browse/${filepath}">${file}</a> `;
        }
      });
    }
    html += "</div>";
    return res.send(`
  <style>
    #hierarchy {
      font-family: FontAwesome;
      width: 300px;
    }
    .foldercontainer,
    .file,
    .noitems {
      display: block;
      padding: 5px 5px 5px 50px;
    }
    .folder {
      color: red;
    }
    .file {
      color: green;
    }
    .folder,
    .file {
      cursor: pointer;
    }
    .noitems {
      display: none;
      pointer-events: none;
    }
    .folder:hover,
    .file:hover {
      background: yellow;
    }
    .folder:before,
    .file:before {
      padding-right: 10px;
    }
  </style>
  
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    rel="stylesheet"
  />
  ${html}
  <script>
  var hierarchy = document.getElementById("hierarchy");
  hierarchy.addEventListener("click", function (event) {
    var elem = event.target;
    if (elem.tagName.toLowerCase() == "span" && elem !== event.currentTarget) {
      var type = elem.classList.contains("folder") ? "folder" : "file";
      if (type == "file") {
        alert("File accessed");
      }
      if (type == "folder") {
        var isexpanded = elem.dataset.isexpanded == "true";
        if (isexpanded) {
          elem.classList.remove("fa-folder-o");
          elem.classList.add("fa-folder");
        } else {
          elem.classList.remove("fa-folder");
          elem.classList.add("fa-folder-o");
        }
        elem.dataset.isexpanded = !isexpanded;
        var toggleelems = [].slice.call(elem.parentElement.children);
        var classnames = "file,foldercontainer,noitems".split(",");
        toggleelems.forEach(function (element) {
          if (
            classnames.some(function (val) {
              return element.classList.contains(val);
            })
          )
            element.style.display = isexpanded ? "none" : "block";
        });
      }
    }
  });

  // Set an interval to check if all the iframes have loaded

  function allIframesLoaded() {
    var iframes = document.getElementsByTagName("iframe");
    var iframesLoaded = 0;
    var iframesLength = iframes.length;
  
    for (var i = 0; i < iframesLength; i++) {
      if (iframes[i].contentDocument.body) {
        // Check the iframe's body to see if it's loaded
        if (iframes[i].contentDocument.body.innerHTML.length > 0) {
          iframesLoaded++;
        }
      }
    }
  
    return iframesLoaded == iframesLength;
  }
  
  var interval = setInterval(function () {
    if (allIframesLoaded()) {
      clearInterval(interval);
      document.querySelectorAll("iframe").forEach(function (iframe) {
        // Set the height of the iframe to the height of its content,
  
        iframe.style.height =
          iframe.contentWindow.document.body.offsetHeight + "px";
      });
    }
  }, 100);
</script>
    `);
  }
  // Read a file from the file system and send it to the client using text/plain
  var filepath = __dirname + req.url;

  fs.readFile(filepath, "utf8", function (err, data) {
    if (err) {
      res.status(404).send(`Path ${filepath} not found`);
    } else {
      //   Send with indentation WIthout html tags
      return res.send(data.split("\n").join("\n"));
    }
  });
});

app.listen(3000, () => {
  console.log("server started");
});
