# https://docs.ipfs.io/how-to/command-line-quick-start/#take-your-node-online


ipfs cat /ipfs/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq > ~/Desktop/spaceship-launch.jpg

# Using the above command, IPFS searches the network for the CID QmSgv... and writes the data into a file called spaceship-launch.jpg on your Desktop.


# Next, try sending objects to the network, and then viewing it in your favorite browser. The example below uses curl as the browser, but you can open the IPFS URL in other browsers as well:

hash=`echo "I <3 IPFS -$(whoami)" | ipfs add -q`
curl "https://ipfs.io/ipfs/$hash"

# > I <3 IPFS -<your username>


# You can also check it out at your own local gateway:

curl "http://127.0.0.1:8080/ipfs/$hash"





QmSjRzpmYG8dbgThEP2kYn5cXtwgmqZqid5JBLhBWx5Rvz


http://127.0.0.1:8080/ipfs/QmSjRzpmYG8dbgThEP2kYn5cXtwgmqZqid5JBLhBWx5Rvz
