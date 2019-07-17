#!/bin/bash

cd /home/node/main
git config --global credential.helper '!aws codecommit credential-helper $@'
git config --global credential.UseHttpPath true
# Clear and reinstall node modules
rm -rf node_modules
npm install --production