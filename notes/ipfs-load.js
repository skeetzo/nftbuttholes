// https://mraddon.blog/2018/07/15/how-to-push-load-image-file-from-to-ipfs-using-javascript-examples-part-iii/

function loadFile() {
        var input, file, fr;
 
        input = document.getElementById('fileinput');
 
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText();
         
 
        function receivedText() {
            fr = new FileReader();
            fr.readAsBinaryString(file);
             
            //IPFS START
            const repoPath = 'ipfs-1111' //+ Math.random()
            const ipfs = new Ipfs({ repo: repoPath })
 
            ipfs.on('ready', () => {
                const files = [
                {
                    path: 'image.png',
                    content: ipfs.types.Buffer.from(btoa(fr.result),"base64")
                }
                ]
 
                ipfs.files.add(files, function (err, files) {
                    let url = "https://ipfs.io/ipfs/"+files[0].hash;
                    log("Storing file on IPFS using Javascript. HASH: https://ipfs.io/ipfs/"+files[0].hash);
                    ipfsPath = files[0].hash
                    ipfs.files.cat(ipfsPath, function (err, file) {
                    if (err) {
                        throw err
                    }
                    img = file.toString("base64");
                    document.getElementById("design_display").src= "data:image/png;base64," + img;
                    })
                })
     
                const log = (line) => {
                    document.getElementById('output').appendChild(document.createTextNode(`${line}\r\n`))
                }
     
     
            })
        }
 
 
    }
     
     
    function loadImage() {
        var input, file, fr;
 
        input = document.getElementById('inputtext').value;
             
            //IPFS START
            const repoPath = 'ipfs-1111' //+ Math.random()
            const ipfs = new Ipfs({ repo: repoPath })
 
            ipfs.on('ready', () => {
 
                    ipfsPath = input
                    ipfs.files.cat(ipfsPath, function (err, file) {
                    if (err) {
                        throw err
                    }
                    img = file.toString("base64");
                    document.getElementById("design_display").src= "data:image/png;base64," + img;
                    })
     
                const log = (line) => {
                    document.getElementById('output').appendChild(document.createTextNode(`${line}\r\n`))
                }
     
     
            })
         
 
 
    }