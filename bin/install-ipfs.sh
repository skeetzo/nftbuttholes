#!/bin/bash
# https://docs.ipfs.io/install/command-line/#official-distributions
wget https://dist.ipfs.io/go-ipfs/v0.12.2/go-ipfs_v0.12.2_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.12.2_linux-amd64.tar.gz
cd go-ipfs
sudo bash install.sh
ipfs --version